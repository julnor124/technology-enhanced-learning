"use client";
import { useEffect, useMemo, useState } from "react";
import { getVariant } from "@/lib/ab";
import { PromptWidget } from "@/components/PromptWidget";
import { track } from "@/lib/track";

export default function Home() {
  // A/B/n assignment (sticky per browser via localStorage)
  const variant = useMemo(() => getVariant("prompt-placement", ["sidebar", "floating", "inline", "footer"]), []);

  useEffect(() => {
    track("experiment_assigned", { experiment: "prompt-placement", variant });
  }, [variant]);

  return (
    <main className="relative mx-auto max-w-6xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Prompt Placement A/B Test</h1>
        <p className="text-sm text-neutral-600">Variant: <span className="font-mono">{variant}</span></p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Content area (pretend this is your real app) */}
        <article className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Your page content</h2>
          <p>
            Put real page content here (editor, product page, analytics dashboard…). The test checks whether the prompt
            performs better as a sidebar helper, inline composer, floating button, or sticky footer.
          </p>
          {/* Inline variant renders inside content flow */}
          {variant === "inline" && (
            <div className="mt-4 rounded-xl border bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-medium text-neutral-700">Inline assistant</h3>
              <PromptWidget placement="inline" />
            </div>
          )}

          <p>
            Measure: focus rate, prompt submissions, time-to-first-token, response rating, and downstream task success.
          </p>
        </article>

        {/* Sidebar variant renders in the right rail */}
        <aside className="lg:col-span-1">
          {variant === "sidebar" && (
            <div className="sticky top-6 rounded-xl border bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-medium text-neutral-700">Sidebar assistant</h3>
              <PromptWidget placement="sidebar" />
            </div>
          )}
        </aside>
      </div>

      {/* Floating & footer variants mount globally */}
      {variant === "floating" && (
        <div className="fixed bottom-6 right-6">
          <div className="rounded-full shadow-lg">
            <PromptWidget placement="floating" />
          </div>
        </div>
      )}

      {variant === "footer" && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-5xl p-4">
            <PromptWidget placement="footer" />
          </div>
        </div>
      )}
    </main>
  );
}

