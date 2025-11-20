"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type KeyboardEvent,
} from "react";

interface HighlightedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  disabled?: boolean;
}

export const HighlightedTextarea = forwardRef<HTMLTextAreaElement | null, HighlightedTextareaProps>(
  ({ value, onChange, onKeyDown, placeholder, disabled = false }: HighlightedTextareaProps, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => textareaRef.current, []);

    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => {
          if (!disabled) {
            onChange(event.target.value);
          }
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full resize-none rounded-lg border border-transparent bg-transparent px-3 py-2 text-foreground focus:border-primary focus:outline-none ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        style={{
          minHeight: "88px",
        }}
      />
    );
  },
);

HighlightedTextarea.displayName = "HighlightedTextarea";

