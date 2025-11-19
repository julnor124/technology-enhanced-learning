"use client";

import { useState } from "react";

import { PromptInput } from "@/components/prompt/PromptInput";
import { RealTimeSuggestions } from "@/components/prompt/RealTimeSuggestions";
import { TaskUpload } from "@/components/prompt/TaskUpload";
import type { ModeType } from "@/components/prompt/types";

export default function Home() {
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [selectedMode, setSelectedMode] = useState<ModeType>(null);
  const [uploadedTask, setUploadedTask] = useState("");

  return (
    <main className="flex min-h-screen bg-muted/30">
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-white px-8 py-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Technology Enhanced Learning</p>
            <h1 className="text-2xl font-semibold text-foreground">PromptMaster AI Workspace</h1>
          </div>
          <TaskUpload onTaskUpload={setUploadedTask} />
        </header>

        <section className="flex flex-1 flex-col justify-end px-8 py-10">
          <div className="mx-auto w-full max-w-4xl">
            <PromptInput
              value={currentPrompt}
              onChange={setCurrentPrompt}
              selectedMode={selectedMode}
              onModeChange={setSelectedMode}
              uploadedTask={uploadedTask}
            />
          </div>
        </section>
      </div>

      <RealTimeSuggestions currentPrompt={currentPrompt} uploadedTask={uploadedTask} />
    </main>
  );
}

