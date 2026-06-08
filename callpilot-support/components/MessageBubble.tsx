"use client";

import { useState, useRef } from "react";
import { Message } from "@/lib/agent/types";
import ReactMarkdown from "react-markdown";

const toolMeta: Record<string, { label: string; icon: string; pill: string }> = {
  checkCallStatus:     { label: "Checked call log",        icon: "📞", pill: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300" },
  getAgentConfig:      { label: "Reviewed agent settings", icon: "⚙️", pill: "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-950 dark:border-violet-800 dark:text-violet-300" },
  checkPlanFeatures:   { label: "Compared plan features",  icon: "📋", pill: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300" },
  createSupportTicket: { label: "Created support ticket",  icon: "🎫", pill: "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300" },
};

type AudioState = "idle" | "loading" | "playing";

function PlayButton({ text }: { text: string }) {
  const [audioState, setAudioState] = useState<AudioState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cachedUrlRef = useRef<string | null>(null);

  const handleClick = async () => {
    if (audioState === "playing") {
      audioRef.current?.pause();
      audioRef.current = null;
      setAudioState("idle");
      return;
    }

    if (cachedUrlRef.current) {
      const audio = new Audio(cachedUrlRef.current);
      audioRef.current = audio;
      audio.onended = () => setAudioState("idle");
      audio.onerror = () => setAudioState("idle");
      await audio.play();
      setAudioState("playing");
      return;
    }

    setAudioState("loading");
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      cachedUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setAudioState("idle");
      audio.onerror = () => setAudioState("idle");
      await audio.play();
      setAudioState("playing");
    } catch {
      setAudioState("idle");
    }
  };

  return (
    <button
      onClick={handleClick}
      title={audioState === "playing" ? "Stop" : "Listen to response"}
      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium transition-colors
        ${audioState === "playing"
          ? "text-[#8B6F47] dark:text-[#C4A06A] bg-[#F2EDE6] dark:bg-[#251E15]"
          : "text-[#9C8B7A] dark:text-[#7A6A5A] hover:text-[#6B5E52] dark:hover:text-[#D4C9BC] hover:bg-[#F2EDE6] dark:hover:bg-[#251E15]"
        }`}
    >
      {audioState === "loading" ? (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 animate-spin">
          <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
        </svg>
      ) : audioState === "playing" ? (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
          <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm5-2.25A.75.75 0 017.75 7h.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-.5a.75.75 0 01-.75-.75v-4.5zm3.25 0A.75.75 0 0111 7h.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75H11a.75.75 0 01-.75-.75v-4.5z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
      )}
      <span>{audioState === "loading" ? "Generating…" : audioState === "playing" ? "Stop" : "Listen"}</span>
    </button>
  );
}

interface MessageBubbleProps {
  message: Message;
  grouped?: boolean;
}

export default function MessageBubble({ message, grouped = false }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const hasMetadata =
    !isUser &&
    ((message.toolCalls?.length ?? 0) > 0 || (message.kbSources?.length ?? 0) > 0);

  return (
    <div className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"} ${grouped ? "mt-1" : "mt-5"}`}>
      {/* Avatar */}
      <div className="w-7 flex-shrink-0 flex items-end justify-center mb-0.5">
        {!grouped && !isUser && (
          <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-[#8B6F47] to-[#7A6040] flex items-center justify-center shadow-sm flex-shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
              <path fillRule="evenodd"
                d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v11.75A2.75 2.75 0 0016.75 18h-12A2.75 2.75 0 012 15.25V3.5zm3.75 7a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zm0 3a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zM5.75 8a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3A.75.75 0 015.75 8z"
                clipRule="evenodd" />
            </svg>
          </div>
        )}
        {!grouped && isUser && (
          <div className="w-7 h-7 rounded-[8px] bg-[#E5DDD3] dark:bg-[#3A2F24] flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-[#6B5E52] dark:text-[#9C8B7A]">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Bubble + metadata */}
      <div className={`flex flex-col gap-1.5 max-w-[78%] sm:max-w-[72%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-[#8B6F47] text-white rounded-[10px] rounded-br-[3px] shadow-sm"
            : "bg-[#F2EDE6] dark:bg-[#251E15] text-[#1A1510] dark:text-[#F0E8DC] border border-[#E5DDD3] dark:border-[#2E2418] rounded-[10px] rounded-bl-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="chat-prose prose prose-sm max-w-none
              prose-headings:font-semibold prose-headings:text-[#1A1510] dark:prose-headings:text-[#F0E8DC] prose-headings:tracking-tight
              prose-strong:font-semibold prose-strong:text-[#1A1510] dark:prose-strong:text-[#F0E8DC]
              prose-p:text-[#3A2F24] dark:prose-p:text-[#D4C9BC] prose-p:leading-relaxed
              prose-li:text-[#3A2F24] dark:prose-li:text-[#D4C9BC] prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
              prose-code:text-[0.8em] prose-code:font-mono
              prose-code:bg-[#FAF8F5] dark:prose-code:bg-[#1C1710]
              prose-code:text-[#8B6F47] dark:prose-code:text-[#C4A06A]
              prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-code:border prose-code:border-[#E5DDD3] dark:prose-code:border-[#2E2418]
              prose-code:before:content-none prose-code:after:content-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Badges */}
        {hasMetadata && (
          <div className="flex flex-wrap gap-1.5 px-0.5">
            {message.toolCalls?.map((tool, i) => {
              const m = toolMeta[tool.name] ?? {
                label: tool.name, icon: "🔧",
                pill: "bg-[#F2EDE6] border-[#E5DDD3] text-[#6B5E52] dark:bg-[#251E15] dark:border-[#2E2418] dark:text-[#9C8B7A]",
              };
              return (
                <span key={i}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${m.pill}`}>
                  <span className="text-[10px]">{m.icon}</span>
                  {m.label}
                </span>
              );
            })}
            {message.kbSources?.map((src, i) => (
              <span key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium
                  bg-[#F2EDE6] dark:bg-[#251E15] border border-[#E5DDD3] dark:border-[#2E2418] text-[#6B5E52] dark:text-[#9C8B7A]">
                <span className="text-[10px]">📄</span>
                {src}
              </span>
            ))}
          </div>
        )}

        {/* Timestamp + listen button */}
        <div className={`flex items-center gap-2 px-0.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-[#9C8B7A] dark:text-[#4A3E30]">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {!isUser && <PlayButton text={message.content} />}
        </div>
      </div>
    </div>
  );
}
