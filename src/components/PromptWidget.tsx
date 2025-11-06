"use client";

import { useEffect, useRef, useState } from "react";

import { track } from "@/lib/track";



type Placement = "sidebar" | "floating" | "inline" | "footer";



export function PromptWidget({ placement }: { placement: Placement }) {

  const [value, setValue] = useState("");

  const [answer, setAnswer] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const controllerRef = useRef<AbortController | null>(null);



  useEffect(() => {

    track("widget_viewed", { placement });

  }, [placement]);



  async function onSubmit(e: React.FormEvent) {

    e.preventDefault();

    if (!value.trim()) return;



    setAnswer("");

    setIsLoading(true);

    track("prompt_submitted", { placement, length: value.length });



    controllerRef.current?.abort();

    controllerRef.current = new AbortController();



    try {

      const res = await fetch("/api/ai", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ messages: [{ role: "user", content: value }] }),

        signal: controllerRef.current.signal,

      });



      if (!res.ok || !res.body) throw new Error("Request failed");



      const reader = res.body.getReader();

      const decoder = new TextDecoder();



      let totalChars = 0;

      const startedAt = performance.now();

      let firstTokenAt: number | null = null;



      while (true) {

        const { value: chunk, done } = await reader.read();

        if (done) break;

        const text = decoder.decode(chunk);

        if (text && firstTokenAt === null) {

          firstTokenAt = performance.now();

          track("first_token", { placement, ttfb_ms: firstTokenAt - startedAt });

        }

        totalChars += text.length;

        setAnswer((prev) => prev + text);

      }



      track("stream_complete", { placement, totalChars });

    } catch (err) {

      console.error(err);

      track("stream_error", { placement });

    } finally {

      setIsLoading(false);

    }

  }



  return (

    <div className="w-full">

      <form onSubmit={onSubmit} className="flex w-full items-end gap-2">

        <textarea

          placeholder="Ask anything…"

          className="min-h-[56px] flex-1 resize-y rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500"

          value={value}

          onChange={(e) => setValue(e.target.value)}

          onFocus={() => track("input_focus", { placement })}

        />

        <button

          type="submit"

          disabled={isLoading}

          className="rounded-xl border bg-blue-600 px-4 py-2 text-white shadow-sm disabled:opacity-50"

        >

          {isLoading ? "Stop" : "Send"}

        </button>

      </form>



      {answer && (

        <div className="prose mt-3 whitespace-pre-wrap rounded-xl border bg-neutral-50 p-3 text-sm">

          {answer}

        </div>

      )}

    </div>

  );

}
