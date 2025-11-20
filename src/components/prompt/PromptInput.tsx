"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Send, Sparkles, RefreshCw } from "lucide-react";

import { ModeSelector } from "@/components/prompt/ModeSelector";
import { LevelSelector } from "@/components/prompt/LevelSelector";
import { HighlightedTextarea } from "@/components/prompt/HighlightedTextarea";
import type { ModeType, LevelType } from "@/components/prompt/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  selectedMode: ModeType;
  onModeChange: (mode: ModeType) => void;
  selectedLevel: LevelType;
  onLevelChange: (level: LevelType) => void;
  uploadedTask: string;
  sessionId: string;
  onPromptSubmit?: (question: string) => void;
}

type TutorResult = {
  conceptSummary: string;
  misconceptionCheck: string;
  hints: string[];
  nextStepQuestion: string;
};

type TutorHistoryItem = {
  id: string;
  question: string;
  response: TutorResult;
  timestamp: Date;
};

export function PromptInput({
  value,
  onChange,
  selectedMode,
  onModeChange,
  selectedLevel,
  onLevelChange,
  uploadedTask,
  sessionId,
  onPromptSubmit,
}: PromptInputProps) {
  const [shouldBlink, setShouldBlink] = useState(false);
  const [tutorHistory, setTutorHistory] = useState<TutorHistoryItem[]>([]);
  const [tutorError, setTutorError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promptRefreshKey, setPromptRefreshKey] = useState(0);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const latestEntryRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (value.trim() && selectedMode && sessionId) {
      console.log("Submitting prompt:", value, "Mode:", selectedMode, "Level:", selectedLevel);

      setTutorError(null);
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/tutor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: value,
            mode: selectedMode,
            level: selectedLevel,
            topic: selectedMode === "coding help" ? "Programming" : selectedMode === "theory" ? "Computer Science Theory" : "Debugging",
            language: "General",
            uploadedTask: uploadedTask || undefined,
            sessionId,
          }),
        });

        console.log("Tutor API response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Tutor API error:", errorData);
          if (errorData.details) {
            console.error("Error details:", errorData.details);
            setTutorError(errorData.details);
          } else {
            setTutorError(errorData.error ?? "Tutor is unavailable right now.");
          }
          return;
        }

        const data = await response.json();
        console.log("Tutor API success:", data);
        
        // Add to history
        const historyItem: TutorHistoryItem = {
          id: Date.now().toString(),
          question: value,
          response: data.result,
          timestamp: new Date(),
        };
        setTutorHistory((prev) => [...prev, historyItem]);
        
        onPromptSubmit?.(value);

        // Clear the input field after successful submission and place caret at the start
        onChange("");
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(0, 0);
          }
        });
      } catch (error) {
        console.error("Failed to call tutor API:", error);
        setTutorError("Failed to reach the tutor service. Check your connection and try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!selectedMode) {
        triggerBlink();
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!selectedMode) {
      triggerBlink();
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaClick = () => {
    if (!selectedMode) triggerBlink();
  };

  const triggerBlink = () => {
    setShouldBlink(true);
    setTimeout(() => setShouldBlink(false), 1000);
  };

  useEffect(() => {
    if (!selectedMode && value) triggerBlink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, selectedMode]);

  useEffect(() => {
    if (latestEntryRef.current) {
      latestEntryRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [tutorHistory]);

  // Load initial suggestions when mode changes
  useEffect(() => {
    if (selectedMode) {
      loadSuggestions();
    } else {
      setSuggestedPrompts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMode, uploadedTask]);

  const loadSuggestions = async () => {
    if (!selectedMode) return;

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: selectedMode,
          uploadedTask: uploadedTask || undefined,
        }),
      });

      if (!response.ok) {
        console.error("Failed to load suggestions, using fallback");
        // Fallback to static suggestions
        setSuggestedPrompts(generateSuggestedPrompts(selectedMode, uploadedTask, promptRefreshKey));
        return;
      }

      const data = await response.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestedPrompts(data.suggestions);
      } else {
        // Fallback to static suggestions
        setSuggestedPrompts(generateSuggestedPrompts(selectedMode, uploadedTask, promptRefreshKey));
      }
    } catch (error) {
      console.error("Error loading suggestions, using fallback:", error);
      // Fallback to static suggestions
      setSuggestedPrompts(generateSuggestedPrompts(selectedMode, uploadedTask, promptRefreshKey));
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleRefreshPrompts = () => {
    setPromptRefreshKey((prev) => prev + 1);
    loadSuggestions();
  };

  return (
    <div className="space-y-6">
      {tutorError && (
        <Card className="border-destructive/30 dark:border-destructive/40 bg-destructive/5 dark:bg-destructive/10 p-4 text-sm text-destructive">
          {tutorError}
        </Card>
      )}

      {/* History Section - Scrollable */}
      {tutorHistory.length > 0 && (
        <div
          ref={historyRef}
          className="max-h-[400px] overflow-y-auto rounded-lg"
        >
          <div className="space-y-5">
            {tutorHistory.map((item, index) => {
              const isLatest = index === tutorHistory.length - 1;
              return (
                <div
                  key={item.id}
                  ref={isLatest ? latestEntryRef : undefined}
                  className="space-y-4 rounded-2xl border border-border/60 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80"
                >
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 dark:border-primary/40 dark:bg-primary/10">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-primary/70">
                    <span>Student Question</span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">{item.question}</p>
                </div>

                <div className="space-y-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 dark:border-emerald-500/40 dark:bg-emerald-500/10">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
                    Tutor Response
                  </h3>
                  <div className="space-y-3">
                    <section>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Concept Summary</p>
                      <p className="mt-1 text-sm text-foreground/80">{item.response.conceptSummary}</p>
                    </section>
                    <section>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Misconception Check</p>
                      <p className="mt-1 text-sm text-foreground/80">{item.response.misconceptionCheck}</p>
                    </section>
                    <section>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Hints</p>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-foreground/80">
                        {item.response.hints.map((hint, index) => (
                          <li key={`${hint}-${index}`}>{hint}</li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Next Step</p>
                      <p className="mt-1 text-sm text-foreground/80">{item.response.nextStepQuestion}</p>
                    </section>
                  </div>
                </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <div onClick={handleTextareaClick}>
          <HighlightedTextarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedMode
                ? `Ask anything about your sources (${selectedMode} mode)...`
                : "Please select a mode to continue..."
            }
            disabled={!selectedMode}
          />
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-3">
            <ModeSelector selectedMode={selectedMode} onModeChange={onModeChange} shouldBlink={shouldBlink && !selectedMode} />
            <LevelSelector selectedLevel={selectedLevel} onLevelChange={onLevelChange} shouldBlink={false} />
          </div>
          <Button onClick={handleSubmit} disabled={!sessionId || !value.trim() || !selectedMode || isSubmitting} className="gap-2">
            <Send className={`h-4 w-4 ${isSubmitting ? "animate-pulse" : ""}`} />
            {isSubmitting ? (
              <span className="flex items-center gap-1">
                <span>Thinking</span>
                <span className="flex gap-0.5">
                  <span className="inline-block animate-bounce [animation-delay:-0.2s]">.</span>
                  <span className="inline-block animate-bounce [animation-delay:-0.1s]">.</span>
                  <span className="inline-block animate-bounce">.</span>
                </span>
              </span>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </div>

      {suggestedPrompts.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {uploadedTask ? "Task starter prompts" : "Starter prompts"}
                </span>
              </div>
              <p className="mt-1 text-xs">
                {uploadedTask
                  ? "Quick questions tailored to your uploaded assignment to kick off a new conversation quickly."
                  : "Use these to kick off a new conversation quickly."}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshPrompts}
              disabled={isLoadingSuggestions}
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingSuggestions ? "animate-spin" : ""}`} />
              <span>{isLoadingSuggestions ? "Loading..." : "New suggestions"}</span>
            </Button>
          </div>
          <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
            {suggestedPrompts.map((suggestion, index) => (
              <Card
                key={`${suggestion}-${index}`}
                className="min-w-[320px] flex-shrink-0 cursor-pointer border-muted/50 dark:border-gray-700 p-4 transition-colors hover:bg-muted/30 dark:hover:bg-gray-800"
                onClick={() => onChange(suggestion)}
              >
                <p className="text-sm text-foreground/80">{suggestion}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function generateSuggestedPrompts(mode: ModeType, task: string, refreshKey: number = 0): string[] {
  const hasTask = Boolean(task?.trim());
  const taskPreview = hasTask ? `${task.substring(0, 100)}${task.length > 100 ? "…" : ""}` : "";

  // Use refreshKey as a seed to select different prompt variations
  const seed = refreshKey % 3;

  if (mode === "debugging") {
    if (hasTask) {
      const variations = [
        [
          `Help me debug this issue: ${taskPreview}`,
          "What's causing the error in this task and how can I fix it?",
          "Walk me through debugging this step by step",
        ],
        [
          `I'm stuck debugging: ${taskPreview}`,
          "Can you help me understand what's wrong with this task?",
          "Guide me through finding and fixing the bug",
        ],
        [
          `Debugging help needed for: ${taskPreview}`,
          "What error patterns should I look for in this code?",
          "Help me systematically troubleshoot this issue",
        ],
      ];
      return variations[seed] || variations[0];
    }
    const variations = [
      ["Help me identify the bug in my code", "Explain why this error is occurring", "What debugging steps should I follow?"],
      ["What's wrong with my code?", "How do I find the source of this error?", "Can you guide me through debugging this?"],
      ["I need help debugging", "What tools and techniques should I use?", "Walk me through the debugging process"],
    ];
    return variations[seed] || variations[0];
  }

  if (mode === "theory") {
    if (hasTask) {
      const variations = [
        [
          `Explain the theory behind: ${taskPreview}`,
          "What are the core concepts I need to understand for this task?",
          "Break down the theoretical principles involved",
        ],
        [
          `What theory applies to: ${taskPreview}`,
          "Help me understand the fundamental concepts needed",
          "Explain the underlying principles for this task",
        ],
        [
          `Theoretical explanation for: ${taskPreview}`,
          "What concepts should I study to understand this?",
          "Break down the theory step by step",
        ],
      ];
      return variations[seed] || variations[0];
    }
    const variations = [
      ["Explain the fundamental concepts behind this topic", "What are the theoretical principles I should know?", "Help me understand the underlying theory"],
      ["What's the theory behind this?", "Explain the core concepts", "Help me grasp the fundamental principles"],
      ["I want to understand the theory", "What concepts are important here?", "Break down the theoretical foundation"],
    ];
    return variations[seed] || variations[0];
  }

  if (mode === "coding help") {
    if (hasTask) {
      const variations = [
        [
          `Help me implement: ${taskPreview}`,
          "What's the best approach to code this task?",
          "Show me how to write code for this requirement",
        ],
        [
          `How do I code: ${taskPreview}`,
          "What's the best way to implement this task?",
          "Guide me through writing the code for this",
        ],
        [
          `I need to code: ${taskPreview}`,
          "What coding patterns should I use for this?",
          "Help me structure the code for this requirement",
        ],
      ];
      return variations[seed] || variations[0];
    }
    const variations = [
      ["Help me write code for this feature", "What's the best way to implement this?", "Show me example code for this problem"],
      ["How should I code this?", "What's the best implementation approach?", "Guide me through writing this code"],
      ["I need coding help", "What's the right way to implement this?", "Help me write the code step by step"],
    ];
    return variations[seed] || variations[0];
  }

  return [];
}

