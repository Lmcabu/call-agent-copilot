"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 148)}px`;
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const hasValue = value.trim().length > 0;

  return (
    <div className={`flex items-end gap-2 rounded-md border px-3.5 py-2.5 transition-all duration-150
      bg-[#FAF8F5] dark:bg-[#251E15]
      ${disabled
        ? "border-[#E5DDD3] dark:border-[#2E2418] opacity-60 cursor-not-allowed"
        : hasValue
          ? "border-[#8B6F47] dark:border-[#8B6F47] ring-2 ring-[#E5DDD3] dark:ring-[#8B6F47]/20 shadow-sm"
          : "border-[#D4C9BC] dark:border-[#3A2F24] hover:border-[#B8A99A] dark:hover:border-[#4A3E30] shadow-sm"
      }`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about setup, troubleshooting, pricing…"
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none bg-transparent outline-none text-sm
          text-[#1A1510] dark:text-[#F0E8DC]
          placeholder-[#9C8B7A] dark:placeholder-[#4A3E30]
          max-h-36 leading-relaxed py-0.5"
      />
      <div className="flex items-center gap-2 flex-shrink-0 pb-0.5">
        {hasValue && (
          <span className="hidden sm:inline text-[11px] text-[#9C8B7A] dark:text-[#4A3E30] select-none">
            ⏎ send
          </span>
        )}
        <button
          onClick={handleSend}
          disabled={!hasValue || disabled}
          aria-label="Send message"
          className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-all ${
            hasValue && !disabled
              ? "bg-[#8B6F47] text-white hover:bg-[#7A6040] shadow-sm hover:shadow-md"
              : "bg-[#E5DDD3] dark:bg-[#2E2418] text-[#9C8B7A] dark:text-[#4A3E30] cursor-not-allowed"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
