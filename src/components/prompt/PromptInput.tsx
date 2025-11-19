"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { Send, Sparkles } from "lucide-react";

import { ModeSelector } from "@/components/prompt/ModeSelector";
import { HighlightedTextarea } from "@/components/prompt/HighlightedTextarea";
import type { ModeType } from "@/components/prompt/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  selectedMode: ModeType;
  onModeChange: (mode: ModeType) => void;
  uploadedTask: string;
}

export function PromptInput({ value, onChange, selectedMode, onModeChange, uploadedTask }: PromptInputProps) {
  const [shouldBlink, setShouldBlink] = useState(false);

  const handleSubmit = () => {
    if (value.trim() && selectedMode) {
      console.log("Submitting prompt:", value, "Mode:", selectedMode);
      // Placeholder for future integration
    } else {
      triggerBlink();
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

  const suggestedPrompts = selectedMode ? generateSuggestedPrompts(selectedMode, uploadedTask) : [];

  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl border bg-white p-6 shadow-sm">
        <div onClick={handleTextareaClick}>
          <HighlightedTextarea
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
          <ModeSelector selectedMode={selectedMode} onModeChange={onModeChange} shouldBlink={shouldBlink} />
          <Button onClick={handleSubmit} disabled={!value.trim() || !selectedMode} className="gap-2">
            <Send className="h-4 w-4" />
            Submit
          </Button>
        </div>
      </div>

      {suggestedPrompts.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Suggested prompts for {selectedMode} mode</span>
          </div>
          <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
            {suggestedPrompts.map((suggestion, index) => (
              <Card
                key={`${suggestion}-${index}`}
                className="min-w-[320px] flex-shrink-0 cursor-pointer border-muted/50 p-4 transition-colors hover:bg-muted/30"
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

function generateSuggestedPrompts(mode: ModeType, task: string): string[] {
  const hasTask = Boolean(task?.trim());
  const taskPreview = hasTask ? `${task.substring(0, 100)}${task.length > 100 ? "…" : ""}` : "";

  if (mode === "debugging") {
    if (hasTask) {
      return [
        `Help me debug this issue: ${taskPreview}`,
        "What's causing the error in this task and how can I fix it?",
        "Walk me through debugging this step by step",
      ];
    }
    return ["Help me identify the bug in my code", "Explain why this error is occurring", "What debugging steps should I follow?"];
  }

  if (mode === "theory") {
    if (hasTask) {
      return [
        `Explain the theory behind: ${taskPreview}`,
        "What are the core concepts I need to understand for this task?",
        "Break down the theoretical principles involved",
      ];
    }
    return ["Explain the fundamental concepts behind this topic", "What are the theoretical principles I should know?", "Help me understand the underlying theory"];
  }

  if (mode === "coding help") {
    if (hasTask) {
      return [
        `Help me implement: ${taskPreview}`,
        "What's the best approach to code this task?",
        "Show me how to write code for this requirement",
      ];
    }
    return ["Help me write code for this feature", "What's the best way to implement this?", "Show me example code for this problem"];
  }

  return [];
}

