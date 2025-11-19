"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";

import { getHighlightColor } from "@/components/prompt/utils/highlightColors";

interface HighlightedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  disabled?: boolean;
}

export function HighlightedTextarea({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled = false,
}: HighlightedTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const highlightText = (text: string): ReactNode => {
    if (!text) return null;

    const keywords = [
      { patterns: ["summarize", "summary"], color: getHighlightColor(0) },
      { patterns: ["explain", "what", "why", "how"], color: getHighlightColor(1) },
      { patterns: ["create", "generate", "make"], color: getHighlightColor(2) },
      { patterns: ["essay", "write", "article"], color: getHighlightColor(3) },
      { patterns: ["study guide", "outline"], color: getHighlightColor(4) },
      { patterns: ["key points", "main", "important"], color: getHighlightColor(5) },
    ];

    const lowerText = text.toLowerCase();
    const matches: { start: number; end: number; color: string }[] = [];

    keywords.forEach(({ patterns, color }) => {
      patterns.forEach((pattern) => {
        let index = lowerText.indexOf(pattern);
        while (index !== -1) {
          matches.push({ start: index, end: index + pattern.length, color });
          index = lowerText.indexOf(pattern, index + 1);
        }
      });
    });

    matches.sort((a, b) => a.start - b.start);

    const filteredMatches: typeof matches = [];
    matches.forEach((match) => {
      const overlaps = filteredMatches.some(
        (existing) => match.start < existing.end && match.end > existing.start,
      );
      if (!overlaps) filteredMatches.push(match);
    });

    let currentIndex = 0;
    const result: ReactNode[] = [];

    filteredMatches.forEach((match, index) => {
      if (currentIndex < match.start) {
        result.push(text.slice(currentIndex, match.start));
      }

      result.push(
        <span
          key={`highlight-${match.start}-${index}`}
          style={{ backgroundColor: match.color }}
          className="rounded px-0.5"
        >
          {text.slice(match.start, match.end)}
        </span>,
      );

      currentIndex = match.end;
    });

    if (currentIndex < text.length) {
      result.push(text.slice(currentIndex));
    }

    return result;
  };

  return (
    <div className="relative min-h-[88px]">
      <div
        className="pointer-events-none absolute inset-0 select-none whitespace-pre-wrap break-words px-3 py-2 text-transparent"
        style={{
          fontFamily: "inherit",
          fontSize: "inherit",
          lineHeight: "inherit",
          letterSpacing: "inherit",
        }}
        aria-hidden="true"
      >
        {highlightText(value)}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => !disabled && onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`relative w-full resize-none bg-transparent px-3 py-2 focus:outline-none ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        style={{
          caretColor: disabled ? "transparent" : "black",
          minHeight: "88px",
        }}
      />
    </div>
  );
}

