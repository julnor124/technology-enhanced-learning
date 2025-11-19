"use client";

import { useState, useRef, useEffect, type KeyboardEvent, type ReactNode } from "react";

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
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0, height: 0 });

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

  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const selectionStart = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, selectionStart);
    
    // Create a mirror div that exactly matches the textarea styling
    const mirror = document.createElement("div");
    const computedStyle = window.getComputedStyle(textarea);
    
    // Copy all relevant styles
    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.wordWrap = "break-word";
    mirror.style.width = `${textarea.offsetWidth}px`;
    mirror.style.padding = computedStyle.padding;
    mirror.style.margin = computedStyle.margin;
    mirror.style.border = computedStyle.border;
    mirror.style.font = computedStyle.font;
    mirror.style.fontSize = computedStyle.fontSize;
    mirror.style.fontFamily = computedStyle.fontFamily;
    mirror.style.fontWeight = computedStyle.fontWeight;
    mirror.style.lineHeight = computedStyle.lineHeight;
    mirror.style.letterSpacing = computedStyle.letterSpacing;
    mirror.style.textTransform = computedStyle.textTransform;
    mirror.style.boxSizing = computedStyle.boxSizing;
    
    // Split text into lines and measure the last line
    const lines = textBeforeCursor.split("\n");
    const lastLine = lines[lines.length - 1] || "";
    
    // Create a span to measure the width of text before cursor on the current line
    const span = document.createElement("span");
    span.textContent = lastLine;
    span.style.visibility = "hidden";
    span.style.position = "absolute";
    span.style.whiteSpace = "pre";
    span.style.font = computedStyle.font;
    span.style.fontSize = computedStyle.fontSize;
    span.style.fontFamily = computedStyle.fontFamily;
    span.style.fontWeight = computedStyle.fontWeight;
    span.style.letterSpacing = computedStyle.letterSpacing;
    
    document.body.appendChild(span);
    const spanWidth = span.offsetWidth;
    document.body.removeChild(span);
    
    // Calculate line height
    const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.2;
    const paddingTop = parseFloat(computedStyle.paddingTop) || 8;
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 12;
    
    // Calculate position
    const lineNumber = lines.length - 1;
    const top = lineNumber * lineHeight + paddingTop + textarea.scrollTop;
    const left = spanWidth + paddingLeft + textarea.scrollLeft;
    
    setCursorPosition({
      top,
      left,
      height: lineHeight,
    });
  };

  useEffect(() => {
    if (isFocused && textareaRef.current) {
      const update = () => updateCursorPosition();
      update();
      const interval = setInterval(update, 50);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    updateCursorPosition();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleSelectionChange = () => {
    if (isFocused) {
      updateCursorPosition();
    }
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

      {isFocused && !disabled && (
        <div
          className="pointer-events-none absolute animate-blink"
          style={{
            top: `${cursorPosition.top}px`,
            left: `${cursorPosition.left}px`,
            width: "1px",
            height: `${cursorPosition.height}px`,
            backgroundColor: "hsl(var(--foreground))",
            zIndex: 10,
          }}
        />
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => {
          if (!disabled) {
            onChange(event.target.value);
            setTimeout(updateCursorPosition, 0);
          }
        }}
        onKeyDown={onKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSelect={handleSelectionChange}
        onClick={handleSelectionChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`relative w-full resize-none bg-transparent px-3 py-2 text-foreground focus:outline-none ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        style={{
          caretColor: disabled ? "transparent" : "transparent", // Hide native caret, use custom one
          minHeight: "88px",
        }}
      />
    </div>
  );
}

