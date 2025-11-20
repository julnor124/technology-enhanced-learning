"use client";

import { useState } from "react";
import { Check, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { LevelType } from "@/components/prompt/types";

interface LevelSelectorProps {
  selectedLevel: LevelType;
  onLevelChange: (level: LevelType) => void;
  shouldBlink: boolean;
}

const levels: Array<{ value: LevelType; label: string; description: string }> = [
  { 
    value: "beginner", 
    label: "Beginner", 
    description: "Very simple, step-by-step, analogies, no assumptions" 
  },
  { 
    value: "intermediate", 
    label: "Intermediate", 
    description: "Some technical terms allowed, explain why" 
  },
  { 
    value: "advanced", 
    label: "Advanced", 
    description: "Deeper theory, edge cases, compare approaches" 
  },
  { 
    value: "expert", 
    label: "Expert", 
    description: "High-level abstracts, trade-offs, references to patterns" 
  },
];

export function LevelSelector({ selectedLevel, onLevelChange, shouldBlink }: LevelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLevelSelect = (level: LevelType) => {
    if (selectedLevel === level) {
      onLevelChange(null);
    } else {
      onLevelChange(level);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {isOpen && (
        <Card className="absolute bottom-full left-0 z-10 mb-2 w-72 p-2 shadow-lg dark:bg-gray-900">
          <div className="space-y-1">
            {levels.map((level) => (
              <button
                key={level.value ?? "none"}
                onClick={() => handleLevelSelect(level.value)}
                className="flex w-full items-start gap-2 rounded px-3 py-2 text-left transition-colors hover:bg-muted dark:hover:bg-gray-800"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{level.label}</span>
                    {selectedLevel === level.value && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{level.description}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Button
        variant={selectedLevel ? "outline" : "default"}
        className={`gap-2 ${shouldBlink ? "animate-blink" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <ChevronUp className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        {selectedLevel ? levels.find((level) => level.value === selectedLevel)?.label : "Select Level"}
      </Button>
    </div>
  );
}

