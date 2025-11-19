"use client";

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getHighlightColor } from "@/components/prompt/utils/highlightColors";

interface RealTimeSuggestionsProps {
  currentPrompt: string;
  uploadedTask: string;
}

interface Suggestion {
  text: string;
  colorIndex: number;
}

export function RealTimeSuggestions({ currentPrompt, uploadedTask }: RealTimeSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    if (currentPrompt.trim().length > 3) {
      setSuggestions(generateSuggestions(currentPrompt));
    } else {
      setSuggestions([]);
    }
  }, [currentPrompt]);

  return (
    <aside className="w-80 border-l bg-white px-6 py-8">
      {uploadedTask && (
        <div className="mb-8">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Active Task</h3>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
            <p className="whitespace-pre-wrap">{uploadedTask}</p>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2 text-muted-foreground">
            <Lightbulb className="h-4 w-4" />
            <span className="text-sm font-medium">Real-time suggestions</span>
          </div>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <Card key={`${suggestion.text}-${index}`} className="relative overflow-hidden border-muted-foreground/20 p-3">
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
        </div>
      )}
    </aside>
  );
}

function generateSuggestions(prompt: string): Suggestion[] {
  const lower = prompt.toLowerCase();
  const suggestions: Suggestion[] = [];

  if (lower.includes("summarize") || lower.includes("summary")) {
    suggestions.push(
      { text: "Include specific dates and statistics", colorIndex: 0 },
      { text: "Focus on the most recent information", colorIndex: 0 },
      { text: "Compare different perspectives", colorIndex: 0 },
    );
  }

  if (lower.includes("explain") || lower.includes("what") || lower.includes("why") || lower.includes("how")) {
    suggestions.push(
      { text: "Use simple language for clarity", colorIndex: 1 },
      { text: "Include relevant examples", colorIndex: 1 },
      { text: "Break down into steps", colorIndex: 1 },
    );
  }

  if (lower.includes("create") || lower.includes("generate") || lower.includes("make")) {
    suggestions.push(
      { text: "Specify the desired format", colorIndex: 2 },
      { text: "Add length requirements", colorIndex: 2 },
      { text: "Include target audience", colorIndex: 2 },
    );
  }

  if (lower.includes("essay") || lower.includes("write") || lower.includes("article")) {
    suggestions.push(
      { text: "Define the essay structure", colorIndex: 3 },
      { text: "Specify word count", colorIndex: 3 },
      { text: "Include citation style", colorIndex: 3 },
    );
  }

  if (lower.includes("study guide") || lower.includes("outline")) {
    suggestions.push(
      { text: "Organize by topic or chapter", colorIndex: 4 },
      { text: "Include practice questions", colorIndex: 4 },
      { text: "Add key terminology", colorIndex: 4 },
    );
  }

  if (lower.includes("key points") || lower.includes("main") || lower.includes("important")) {
    suggestions.push(
      { text: "Limit to top 5 points", colorIndex: 5 },
      { text: "Prioritize by relevance", colorIndex: 5 },
      { text: "Add supporting evidence", colorIndex: 5 },
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(
      { text: "Be more specific about your goal", colorIndex: -1 },
      { text: "Add context from your sources", colorIndex: -1 },
      { text: "Specify the output format you need", colorIndex: -1 },
    );
  }

  return suggestions;
}

