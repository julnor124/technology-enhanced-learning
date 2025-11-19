"use client";

import { useState } from "react";
import { Info } from "lucide-react";

import { PromptInput } from "@/components/prompt/PromptInput";
import { RealTimeSuggestions } from "@/components/prompt/RealTimeSuggestions";
import { TaskUpload } from "@/components/prompt/TaskUpload";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ModeType, LevelType } from "@/components/prompt/types";

export default function Home() {
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [selectedMode, setSelectedMode] = useState<ModeType>(null);
  const [selectedLevel, setSelectedLevel] = useState<LevelType>(null);
  const [uploadedTask, setUploadedTask] = useState("");

  return (
    <main className="flex min-h-screen bg-muted/30 dark:bg-muted/20">
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-white dark:bg-gray-900 px-8 py-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Technology Enhanced Learning</p>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground">PromptMaster AI Workspace</h1>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="inline-flex items-center justify-center rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Information about PromptMaster AI Workspace"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>About PromptMaster AI Workspace</DialogTitle>
                    <DialogDescription className="pt-4 space-y-3">
                      <p>
                        PromptMaster AI Workspace is an AI-powered coding tutor designed to help you learn programming
                        concepts through guided explanations and personalized assistance.
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold text-foreground">How it works:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>
                            <strong>Choose a Mode:</strong> Select from Debugging, Theory, or Coding Help to get
                            tailored guidance
                          </li>
                          <li>
                            <strong>Select Your Level:</strong> Pick Beginner, Intermediate, Advanced, or Expert to
                            match your experience
                          </li>
                          <li>
                            <strong>Upload Your Assignment:</strong> Optionally upload your task file (PDF or text) to get
                            context-aware help
                          </li>
                          <li>
                            <strong>Ask Questions:</strong> Get explanations, hints, and guidance without receiving
                            complete solutions
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="font-semibold text-foreground">Additional features:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>
                            <strong>Suggested Prompts:</strong> Get AI-generated question suggestions tailored to your mode and assignment
                          </li>
                          <li>
                            <strong>Writing Tips:</strong> Real-time guidance on how to formulate better questions as you type
                          </li>
                          <li>
                            <strong>Conversation History:</strong> View all your previous questions and answers in a scrollable history
                          </li>
                        </ul>
                      </div>
                      <p className="text-sm">
                        The AI tutor encourages self-discovery by providing hints, explaining concepts, and guiding you
                        through the learning process step by step.
                      </p>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <TaskUpload onTaskUpload={setUploadedTask} />
            <ThemeToggle />
          </div>
        </header>

        <section className="flex flex-1 flex-col justify-end px-8 py-10">
          <div className="mx-auto w-full max-w-4xl">
            <PromptInput
              value={currentPrompt}
              onChange={setCurrentPrompt}
              selectedMode={selectedMode}
              onModeChange={setSelectedMode}
              selectedLevel={selectedLevel}
              onLevelChange={setSelectedLevel}
              uploadedTask={uploadedTask}
            />
          </div>
        </section>
      </div>

      <RealTimeSuggestions currentPrompt={currentPrompt} uploadedTask={uploadedTask} selectedMode={selectedMode} />
    </main>
  );
}

