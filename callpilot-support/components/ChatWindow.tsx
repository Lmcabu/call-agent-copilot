"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Message, SessionMemory, ChatResponse, Intent } from "@/lib/agent/types";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { ContextUpdate } from "./AgentContextPanel";
import ThemeToggle from "./ThemeToggle";

export const SESSION_ID = `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function createInitialMemory(): SessionMemory {
  return { previousRecommendations: [] };
}

interface ChatWindowProps {
  onContextUpdate: (ctx: ContextUpdate) => void;
  externalPrompt?: string | null;
  onExternalPromptConsumed?: () => void;
}

const QUICK_PROMPTS = [
  { icon: "📞", label: "Diagnose a failed call",   prompt: "Can you check why CALL-1029 failed?" },
  { icon: "🔇", label: "Fix interruption issues",  prompt: "My agent keeps interrupting customers." },
  { icon: "📋", label: "Review plan features",     prompt: "Does the Growth plan support human handoff?" },
  { icon: "🔗", label: "Connect an integration",  prompt: "How do I connect HubSpot?" },
];

export default function ChatWindow({
  onContextUpdate,
  externalPrompt,
  onExternalPromptConsumed,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [memory, setMemory] = useState<SessionMemory>(createInitialMemory());
  const [isLoading, setIsLoading] = useState(false);
  const [allTicketIds, setAllTicketIds] = useState<string[]>([]);
  const [greetingAudio, setGreetingAudio] = useState<"idle" | "loading" | "playing">("idle");
  const greetingAudioRef = useRef<HTMLAudioElement | null>(null);
  const greetingCachedUrlRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (externalPrompt) {
      sendMessage(externalPrompt);
      onExternalPromptConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalPrompt]);

  const sendMessage = async (text: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-session-id": SESSION_ID },
        body: JSON.stringify({ message: text, history: messages, memory }),
      });
      if (!res.ok) throw new Error("Request failed");

      const data = (await res.json()) as ChatResponse;

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        toolCalls: data.toolCalls,
        kbSources: data.kbSources,
        timestamp: Date.now(),
      };

      const newTicketIds = data.toolCalls
        .filter((t) => t.name === "createSupportTicket")
        .map((t) => (t.output as { ticketId?: string })?.ticketId ?? "")
        .filter(Boolean);

      const updatedTicketIds = [...allTicketIds, ...newTicketIds];
      setAllTicketIds(updatedTicketIds);
      setMessages((prev) => [...prev, assistantMsg]);
      setMemory(data.updatedMemory);

      onContextUpdate({
        memory: data.updatedMemory,
        lastIntent: data.intent as Intent,
        lastToolCalls: data.toolCalls,
        lastKbSources: data.kbSources,
        lastTicketIds: updatedTicketIds,
        messageCount: messages.length + 2,
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `error-${Date.now()}`, role: "assistant",
          content: "I ran into an issue processing your request. Please try again.",
          timestamp: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const GREETING = "Hi! I can help you diagnose call issues, configure voice agents, review your plan, and escalate complex problems to our team.";

  const playGreeting = useCallback(async () => {
    if (greetingAudio === "playing") {
      greetingAudioRef.current?.pause();
      greetingAudioRef.current = null;
      setGreetingAudio("idle");
      return;
    }
    setGreetingAudio("loading");
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: GREETING }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      greetingAudioRef.current = audio;
      audio.onended = () => { setGreetingAudio("idle"); URL.revokeObjectURL(url); };
      audio.onerror = () => { setGreetingAudio("idle"); URL.revokeObjectURL(url); };
      await audio.play();
      setGreetingAudio("playing");
    } catch {
      setGreetingAudio("idle");
    }
  }, [greetingAudio]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Header */}
      <header className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
              className="w-[18px] h-[18px] text-white">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
            isLoading ? "bg-amber-400" : "bg-emerald-400"}`} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
            CallPilot Support Agent
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isLoading ? "Thinking…" : "Online · replies instantly"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium
            text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full
            border border-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Support workspace
          </span>
          {/* Theme toggle — visible on mobile where sidebar is hidden */}
          <div className="lg:hidden">
            <ThemeToggle
              variant="icon"
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            />
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6">
        {isEmpty && (
          <div className="flex flex-col min-h-full py-8">
            {/* Welcome card */}
            <div className="bg-blue-600 rounded-2xl p-4 mb-6 text-white shadow-lg shadow-blue-600/20">
              <div className="flex items-start gap-3.5">
                <button
                  onClick={playGreeting}
                  title={greetingAudio === "playing" ? "Stop" : "Hear the agent voice"}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
                    ${greetingAudio === "playing" ? "bg-white/30" : "bg-white/20 hover:bg-white/30"}`}
                >
                  {greetingAudio === "loading" ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-white animate-spin">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  ) : greetingAudio === "playing" ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM9 8.25a.75.75 0 00-.75.75v6c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75V9a.75.75 0 00-.75-.75H9zm5.25 0a.75.75 0 00-.75.75v6c0 .414.336.75.75.75H15a.75.75 0 00.75-.75V9a.75.75 0 00-.75-.75h-.75z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  )}
                </button>
                <div>
                  <p className="text-sm font-bold leading-tight">CallPilot Support</p>
                  <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                    Hi! I can help you diagnose call issues, configure voice agents, review your plan, and escalate complex problems to our team.
                  </p>
                </div>
              </div>
            </div>

            {/* Common support requests */}
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">
              Common support requests
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
              {QUICK_PROMPTS.map((item) => (
                <button key={item.prompt} onClick={() => sendMessage(item.prompt)}
                  className="group flex items-start gap-3 px-4 py-3.5 rounded-xl border
                    border-slate-200 dark:border-slate-700
                    bg-white dark:bg-slate-800
                    hover:border-blue-300 dark:hover:border-blue-600
                    hover:bg-blue-50/60 dark:hover:bg-blue-950/40
                    hover:shadow-sm transition-all shadow-sm text-left"
                >
                  <span className="text-lg leading-none mt-0.5 flex-shrink-0">{item.icon}</span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300
                    group-hover:text-blue-700 dark:group-hover:text-blue-400 leading-snug">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Support capabilities */}
            <div className="flex flex-wrap gap-1.5">
              {["Help articles", "Account checks", "Case history", "Human handoff"].map((f) => (
                <span key={f}
                  className="text-[11px] font-medium text-slate-500 dark:text-slate-500
                    bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                    px-2.5 py-1 rounded-full">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {!isEmpty && (
          <div className="py-6 space-y-2">
            {messages.map((msg, i) => {
              const prev = messages[i - 1];
              const isGrouped = prev?.role === msg.role;
              return <MessageBubble key={msg.id} message={msg} grouped={isGrouped} />;
            })}

            {isLoading && (
              <div className="flex items-end gap-3 pt-1">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700
                  flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                    <path fillRule="evenodd"
                      d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v11.75A2.75 2.75 0 0016.75 18h-12A2.75 2.75 0 012 15.25V3.5zm3.75 7a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zm0 3a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zM5.75 8a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3A.75.75 0 015.75 8z"
                      clipRule="evenodd" />
                  </svg>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input footer */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700
        px-4 sm:px-6 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <ChatInput onSend={sendMessage} disabled={isLoading} />
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-2">
          Demo data only — does not access real account information
        </p>
      </div>
    </div>
  );
}
