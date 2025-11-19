"use client";

import { useState } from "react";
import { Check, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ModeType } from "@/components/prompt/types";

interface ModeSelectorProps {
  selectedMode: ModeType;
  onModeChange: (mode: ModeType) => void;
  shouldBlink: boolean;
}

const modes: Array<{ value: ModeType; label: string; description: string }> = [
  { value: "debugging", label: "Debugging", description: "Fix errors and issues in code" },
  { value: "theory", label: "Theory", description: "Learn concepts and principles" },
  { value: "coding help", label: "Coding Help", description: "Get help writing code" },
];

export function ModeSelector({ selectedMode, onModeChange, shouldBlink }: ModeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleModeSelect = (mode: ModeType) => {
    onModeChange(mode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {isOpen && (
        <Card className="absolute bottom-full left-0 z-10 mb-2 w-64 p-2 shadow-lg">
          <div className="space-y-1">
            {modes.map((mode) => (
              <button
                key={mode.value ?? "none"}
                onClick={() => handleModeSelect(mode.value)}
                className="flex w-full items-start gap-2 rounded px-3 py-2 text-left transition-colors hover:bg-muted"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{mode.label}</span>
                    {selectedMode === mode.value && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{mode.description}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Button
        variant={selectedMode ? "outline" : "default"}
        className={`gap-2 ${shouldBlink ? "animate-blink" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <ChevronUp className="h-4 w-4" />
        {selectedMode ? modes.find((mode) => mode.value === selectedMode)?.label : "Select Mode"}
      </Button>
    </div>
  );
}

