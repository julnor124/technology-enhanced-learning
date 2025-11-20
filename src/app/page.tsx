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
  const [lastSubmittedPrompt, setLastSubmittedPrompt] = useState<string | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());

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
                        PromptMaster is your coaching layer for coding assignments. It keeps the conversation focused on
                        learning by guiding you with prompts, hints, and follow-up ideas instead of full solutions.
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold text-foreground">How it works:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>
                            <strong>Pick a mode & level:</strong> Debugging, Theory, or Coding Help + Beginner–Expert to tune the tutor’s tone.
                          </li>
                          <li>
                            <strong>Upload your assignment:</strong> Add a PDF/text brief so every answer references your task.
                          </li>
                          <li>
                            <strong>Use starter prompts:</strong> Quick “Starter” or “Task Starter” questions to kick off the chat in the right context.
                          </li>
                          <li>
                            <strong>Ask & iterate:</strong> The tutor replies in structured steps—concept summary, misconception check, hints, next question.
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="font-semibold text-foreground">Why it’s different:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>
                            <strong>Next prompt ideas:</strong> After every question, you get three AI follow-up questions tailored to your conversation. Click one to paste it instantly.
                          </li>
                          <li>
                            <strong>Conversation memory:</strong> The session remembers the last few exchanges (stored in Vercel Postgres) so the tutor keeps your context straight.
                          </li>
                          <li>
                            <strong>PDF-aware answers:</strong> If you upload a task, the assistant is instructed to reference that text every time.
                          </li>
                        </ul>
                      </div>
                      <p className="text-sm">
                        PromptMaster is here to help you reason about code, not just copy it. Use the prompts, follow-ups, and task context to build a deeper understanding one question at a time.
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
              sessionId={sessionId}
              onPromptSubmit={(question) => setLastSubmittedPrompt(question)}
            />
          </div>
        </section>
      </div>

      <RealTimeSuggestions
        currentPrompt={currentPrompt}
        uploadedTask={uploadedTask}
        selectedMode={selectedMode}
        lastSubmittedPrompt={lastSubmittedPrompt}
        sessionId={sessionId}
        onApplySuggestion={(text) => setCurrentPrompt(text)}
      />
    </main>
  );
}

