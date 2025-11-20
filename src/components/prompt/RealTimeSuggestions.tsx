"use client";

import { useEffect, useState } from "react";
import { Lightbulb, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

import { Card } from "@/components/ui/card";

import type { ModeType } from "@/components/prompt/types";

interface RealTimeSuggestionsProps {
  currentPrompt: string;
  uploadedTask: string;
  selectedMode: ModeType;
  lastSubmittedPrompt: string | null;
  sessionId: string;
  onApplySuggestion: (value: string) => void;
}

interface Suggestion {
  text: string;
}

export function RealTimeSuggestions({
  currentPrompt,
  uploadedTask,
  selectedMode,
  lastSubmittedPrompt,
  sessionId,
  onApplySuggestion,
}: RealTimeSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isTaskExpanded, setIsTaskExpanded] = useState(false);
  const [followupTips, setFollowupTips] = useState<string[]>([]);
  const [isLoadingFollowups, setIsLoadingFollowups] = useState(false);
  const [followupError, setFollowupError] = useState<string | null>(null);
  const [tipsLocked, setTipsLocked] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [followupFetchTrigger, setFollowupFetchTrigger] = useState(0);

  useEffect(() => {
    const trimmed = currentPrompt.trim();

    if (followupTips.length > 0) {
      setSuggestions(followupTips.map((text) => ({ text })));
      return;
    }

    if (hasSubmitted) {
      if (isLoadingFollowups) {
        setSuggestions([{ text: "Generating next prompt ideas..." }]);
      } else if (followupError) {
        setSuggestions([{ text: followupError }]);
      } else {
        setSuggestions([]);
      }
      return;
    }

    if (tipsLocked) {
      return;
    }

    if (trimmed.length > 2 && selectedMode) {
      setSuggestions(generateTypingSuggestions(trimmed, selectedMode, uploadedTask));
    } else {
      setSuggestions([]);
    }
  }, [
    currentPrompt,
    selectedMode,
    uploadedTask,
    followupTips,
    isLoadingFollowups,
    followupError,
    tipsLocked,
    hasSubmitted,
  ]);

  useEffect(() => {
    if (lastSubmittedPrompt) {
      setTipsLocked(false);
      setHasSubmitted(true);
    }
  }, [lastSubmittedPrompt]);

  useEffect(() => {
    if (!selectedMode || !lastSubmittedPrompt) {
      setFollowupTips([]);
      setFollowupError(null);
      return;
    }

    const controller = new AbortController();
    const fetchFollowups = async () => {
      try {
        setIsLoadingFollowups(true);
        setFollowupError(null);
        const response = await fetch("/api/followups", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            mode: selectedMode,
            uploadedTask: uploadedTask || undefined,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load follow-up tips");
        }

        const data = await response.json();
        if (Array.isArray(data.tips) && data.tips.length > 0) {
          setFollowupTips(data.tips.slice(0, 3));
        } else {
          setFollowupTips([]);
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch follow-up tips:", error);
          setFollowupError("Unable to fetch follow-up suggestions right now.");
          setFollowupTips([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingFollowups(false);
        }
      }
    };

    fetchFollowups();
    return () => controller.abort();
  }, [selectedMode, lastSubmittedPrompt, uploadedTask, sessionId, followupFetchTrigger]);

  const taskPreview = uploadedTask ? uploadedTask.substring(0, 100) : "";
  const hasMoreContent = uploadedTask && uploadedTask.length > 100;

  const handleSuggestionClick = (text: string, index: number) => {
    onApplySuggestion(text);
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
    setFollowupTips((prev) => prev.filter((_, i) => i !== index));
    setTipsLocked(true);
  };

  const handleRefreshFollowups = () => {
    if (!selectedMode || !lastSubmittedPrompt) return;
    setTipsLocked(false);
    setFollowupTips([]);
    setFollowupError(null);
    setFollowupFetchTrigger((prev) => prev + 1);
  };

  return (
    <aside className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-8">
      {uploadedTask && (
        <div className="mb-8">
          <button
            onClick={() => setIsTaskExpanded(!isTaskExpanded)}
            className="w-full flex items-center justify-between mb-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Active Task</span>
            {hasMoreContent && (
              isTaskExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )
            )}
          </button>
          <div className="rounded-lg border border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10 p-3 text-sm text-muted-foreground">
            {isTaskExpanded ? (
              <div className="max-h-64 overflow-y-auto">
                <p className="whitespace-pre-wrap">{uploadedTask}</p>
              </div>
            ) : (
              <p className="whitespace-pre-wrap line-clamp-3">
                {taskPreview}
                {hasMoreContent && "..."}
              </p>
            )}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div>
          <div className="mb-4 text-muted-foreground">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                <span className="text-sm font-medium">Next prompt ideas</span>
              </div>
              <button
                type="button"
                onClick={handleRefreshFollowups}
                disabled={!lastSubmittedPrompt || isLoadingFollowups}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingFollowups ? "animate-spin" : ""}`} />
                <span>New ideas</span>
              </button>
            </div>
            <p className="mt-1 text-xs">
              Follow-up questions generated from your last prompt. Click to paste one directly into the input.
            </p>
          </div>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.text}-${index}`}
                className="w-full text-left"
                onClick={() => handleSuggestionClick(suggestion.text, index)}
              >
                <Card className="relative overflow-hidden border-muted-foreground/20 dark:border-gray-700 p-3 hover:border-primary">
                  <p className="text-sm text-foreground/80">{suggestion.text}</p>
                </Card>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

function generateTypingSuggestions(prompt: string, mode: ModeType, task: string): Suggestion[] {
  const lower = prompt.toLowerCase();
  const suggestions: Suggestion[] = [];

  const add = (...items: string[]) => {
    items.forEach((text) => {
      if (!suggestions.find((s) => s.text === text)) {
        suggestions.push({ text });
      }
    });
  };

  const hasTask = Boolean(task?.trim());

  if (mode === "theory") {
    if (lower.includes("explain") || lower.includes("what") || lower.includes("how") || lower.includes("why")) {
      add(
        "Could you specify the exact concept or step you want explained?",
        "Can you point out which part is confusing so we can target it?",
        "Would an example or analogy help illustrate this concept?",
      );
    } else if (lower.includes("difference") || lower.includes("compare") || lower.includes("vs")) {
      add(
        "Which two things should we compare, and along what dimension?",
        "Why do you need this comparison so the tutor can tailor the answer?",
        "Can you ask for trade-offs, not just pros and cons?",
      );
    } else {
      add(
        "Could you start with 'Explain', 'What', or 'How' plus the exact topic?",
        "What background knowledge do you already have that we should build on?",
        "Can you ask one clear question at a time for a sharper answer?",
      );
    }
  } else if (mode === "coding help") {
    if (lower.includes("how") || lower.includes("implement") || lower.includes("create")) {
      add(
        "Which language or framework should this implementation use?",
        "Can you describe the inputs, outputs, and constraints for this feature?",
        "What patterns or requirements do you need to follow?",
      );
    } else if (lower.includes("pseudocode") || lower.includes("pseudo")) {
      add(
        "Could you outline the steps in plain language before asking for pseudocode?",
        "What is the goal of the function/class so the tutor can structure it?",
        "Would you like numbered steps or a high-level plan first?",
      );
    } else if (lower.includes("optimize") || lower.includes("improve")) {
      add(
        "What exactly do you want to optimize (speed, memory, readability)?",
        "Can you share your current approach or bottleneck?",
        "Are there constraints like time complexity targets or environment limits?",
      );
    } else {
      add(
        "Could you start with 'How do I implement...' followed by the exact feature?",
        "What context from the assignment or app should we consider?",
        "Do you want guidance on the next logical step rather than the full solution?",
      );
    }
  } else if (mode === "debugging") {
    if (lower.includes("error") || lower.includes("bug") || lower.includes("not working")) {
      add(
        "Can you include the exact error message or unexpected output?",
        "What did you expect to happen versus what actually happened?",
        "Could you share a small snippet that reproduces the issue?",
      );
    } else if (lower.includes("crash") || lower.includes("failed") || lower.includes("issue")) {
      add(
        "What steps lead to the crash or failure?",
        "Have there been any recent changes or refactors worth mentioning?",
        "Do you have logs, console warnings, or stack traces to share?",
      );
    } else {
      add(
        "Can you explain what isn't working and what you've tried so far?",
        "Would you like suggestions for debugging strategies instead of the fix?",
        "Which file, component, or function contains the issue?",
      );
    }
  }

  if (hasTask && !lower.includes("task") && !lower.includes("assignment")) {
    add("Could you reference the uploaded task so the tutor can connect the answer?");
  }

  if (suggestions.length === 0) {
    add(
      "Could you describe what you're trying to achieve in this step?",
      "Can you share what you've already attempted?",
      "Would asking one focused question help get a sharper answer?",
    );
  }

  return suggestions.slice(0, 3);
}

