"use client";

import { useState, type ChangeEvent } from "react";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TaskUploadProps {
  onTaskUpload: (task: string) => void;
}

export function TaskUpload({ onTaskUpload }: TaskUploadProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [task, setTask] = useState("");

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const content = (loadEvent.target?.result as string) ?? "";
      setTask(content);
      onTaskUpload(content);
      setIsExpanded(true);
    };
    reader.readAsText(file);
  };

  const clearTask = () => {
    setTask("");
    onTaskUpload("");
    setIsExpanded(false);
  };

  if (!task) {
    return (
      <label htmlFor="task-upload">
        <Button variant="outline" className="gap-2 cursor-pointer" asChild>
          <span>
            <Upload className="h-4 w-4" />
            Upload Task
          </span>
        </Button>
        <input
          id="task-upload"
          type="file"
          accept=".txt,.md"
          className="hidden"
          onChange={handleFileUpload}
        />
      </label>
    );
  }

  return (
    <div className="relative">
      <Button variant="outline" className="gap-2" onClick={() => setIsExpanded((prev) => !prev)}>
        <Upload className="h-4 w-4" />
        Task Uploaded
      </Button>

      {isExpanded && (
        <Card className="absolute right-0 top-12 z-10 w-80 max-h-96 overflow-y-auto p-4 shadow-lg">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="text-sm text-muted-foreground">Uploaded Task</h3>
            <button
              onClick={clearTask}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear uploaded task"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="text-sm text-foreground/80 whitespace-pre-wrap">{task}</div>
        </Card>
      )}
    </div>
  );
}

