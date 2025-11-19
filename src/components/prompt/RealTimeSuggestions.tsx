"use client";

import { useEffect, useState } from "react";
import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getHighlightColor } from "@/components/prompt/utils/highlightColors";

import type { ModeType } from "@/components/prompt/types";

interface RealTimeSuggestionsProps {
  currentPrompt: string;
  uploadedTask: string;
  selectedMode: ModeType;
}

interface Suggestion {
  text: string;
  colorIndex: number;
}

export function RealTimeSuggestions({ currentPrompt, uploadedTask, selectedMode }: RealTimeSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isTaskExpanded, setIsTaskExpanded] = useState(false);

  useEffect(() => {
    if (currentPrompt.trim().length > 3 && selectedMode) {
      setSuggestions(generateSuggestions(currentPrompt, selectedMode, uploadedTask));
    } else {
      setSuggestions([]);
    }
  }, [currentPrompt, selectedMode, uploadedTask]);

  const taskPreview = uploadedTask ? uploadedTask.substring(0, 100) : "";
  const hasMoreContent = uploadedTask && uploadedTask.length > 100;

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

      <div>
        <div className="mb-4 flex items-center gap-2 text-muted-foreground">
          <Lightbulb className="h-4 w-4" />
          <span className="text-sm font-medium">Writing tips</span>
        </div>
        {suggestions.length > 0 ? (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <Card key={`${suggestion.text}-${index}`} className="relative overflow-hidden border-muted-foreground/20 dark:border-gray-700 p-3">
                <div
                  className="absolute inset-y-0 left-0 w-1"
                  style={{
                    backgroundColor:
                      suggestion.colorIndex >= 0 ? getHighlightColor(suggestion.colorIndex) : "rgba(0,0,0,0.1)",
                  }}
                />
                <p className="pl-4 text-sm text-foreground/80">{suggestion.text}</p>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground/60">Start typing to see writing tips...</p>
        )}
      </div>
    </aside>
  );
}

function generateSuggestions(prompt: string, mode: ModeType, task: string): Suggestion[] {
  const lower = prompt.toLowerCase();
  const suggestions: Suggestion[] = [];
  
  // Real-time suggestions focus on HOW to ask better questions, not WHAT to ask
  // They're writing tips and question formulation guidance

  if (mode === "theory") {
    if (lower.includes("explain") || lower.includes("what") || lower.includes("how") || lower.includes("why")) {
      suggestions.push(
        { text: "Be specific: Which concept do you want explained?", colorIndex: 0 },
        { text: "Add context: What part confuses you?", colorIndex: 0 },
        { text: "Ask for examples to make it clearer", colorIndex: 0 },
      );
    } else if (lower.includes("difference") || lower.includes("compare") || lower.includes("vs")) {
      suggestions.push(
        { text: "Specify exactly which two things to compare", colorIndex: 1 },
        { text: "Clarify what aspect you want compared", colorIndex: 1 },
        { text: "Ask about specific differences, not general ones", colorIndex: 1 },
      );
    } else if (lower.includes("when") || lower.includes("should")) {
      suggestions.push(
        { text: "Specify the situation or context", colorIndex: 2 },
        { text: "Clarify what decision you're trying to make", colorIndex: 2 },
        { text: "Ask about specific criteria for the decision", colorIndex: 2 },
      );
    } else {
      suggestions.push(
        { text: "Start with 'Explain', 'What', or 'How' for theory questions", colorIndex: 0 },
        { text: "Be specific about which concept you need help with", colorIndex: 1 },
        { text: "Ask one clear question at a time", colorIndex: 2 },
      );
    }
  } else if (mode === "coding help") {
    if (lower.includes("how") || lower.includes("implement") || lower.includes("create")) {
      suggestions.push(
        { text: "Specify the programming language you're using", colorIndex: 0 },
        { text: "Describe the specific problem you're trying to solve", colorIndex: 0 },
        { text: "Mention any constraints or requirements", colorIndex: 0 },
      );
    } else if (lower.includes("why") || lower.includes("should")) {
      suggestions.push(
        { text: "Clarify what you're comparing or deciding between", colorIndex: 1 },
        { text: "Specify the context or use case", colorIndex: 1 },
        { text: "Ask about trade-offs, not just pros/cons", colorIndex: 1 },
      );
    } else if (lower.includes("optimize") || lower.includes("improve") || lower.includes("better")) {
      suggestions.push(
        { text: "Specify what you want to optimize (speed, memory, etc.)", colorIndex: 2 },
        { text: "Describe the current approach you're using", colorIndex: 2 },
        { text: "Mention any constraints or limitations", colorIndex: 2 },
      );
    } else {
      suggestions.push(
        { text: "Start with 'How do I...' for implementation questions", colorIndex: 0 },
        { text: "Be specific about what you want to build or solve", colorIndex: 1 },
        { text: "Include relevant details about your approach", colorIndex: 2 },
      );
    }
  } else if (mode === "debugging") {
    if (lower.includes("error") || lower.includes("bug") || lower.includes("not working")) {
      suggestions.push(
        { text: "Include the exact error message you're seeing", colorIndex: 0 },
        { text: "Describe what you expected vs what actually happened", colorIndex: 0 },
        { text: "Mention what you've already tried", colorIndex: 0 },
      );
    } else if (lower.includes("why") || lower.includes("cause")) {
      suggestions.push(
        { text: "Be specific about which behavior or error you're asking about", colorIndex: 1 },
        { text: "Include relevant code snippets or context", colorIndex: 1 },
        { text: "Ask about the mechanism, not just the symptom", colorIndex: 1 },
      );
    } else if (lower.includes("fix") || lower.includes("solve")) {
      suggestions.push(
        { text: "Ask for guidance on debugging steps, not the solution", colorIndex: 2 },
        { text: "Describe what debugging tools you've used", colorIndex: 2 },
        { text: "Ask how to investigate, not how to fix", colorIndex: 2 },
      );
    } else {
      suggestions.push(
        { text: "Start with 'Why does...' or 'Help me debug...'", colorIndex: 0 },
        { text: "Include error messages or unexpected behavior", colorIndex: 1 },
        { text: "Describe the steps that lead to the problem", colorIndex: 2 },
      );
    }
  }

  if (suggestions.length === 0) {
    suggestions.push(
      { text: "Be more specific about what you need help with", colorIndex: -1 },
      { text: "Include relevant context or details", colorIndex: -1 },
      { text: "Ask one clear, focused question", colorIndex: -1 },
    );
  }

  return suggestions.slice(0, 3);
}


