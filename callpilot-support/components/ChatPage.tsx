"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import AgentContextPanel, { ContextUpdate } from "./AgentContextPanel";

const initialContext: ContextUpdate = {
  memory: { previousRecommendations: [] },
  lastIntent: "",
  lastToolCalls: [],
  lastKbSources: [],
  lastKbDocs: [],
  lastTicketIds: [],
  messageCount: 0,
};

type MobileTab = "chat" | "context";

export default function ChatPage() {
  const [context, setContext] = useState<ContextUpdate>(initialContext);
  const [isLoading, setIsLoadingCtx] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");

  const handleContextUpdate = (ctx: ContextUpdate) => {
    setContext(ctx);
    setIsLoadingCtx(false);
  };

  const hasActivity = context.messageCount > 1;

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F5] dark:bg-[#1C1710]">
      {/* Left sidebar — desktop only (lg+) */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Center chat */}
      <main className={`flex-1 overflow-hidden min-w-0 flex flex-col
        ${mobileTab === "context" ? "hidden lg:flex" : "flex"}`}
      >
        <ChatWindow
          onContextUpdate={handleContextUpdate}
        />
      </main>

      {/* Right context panel — xl+ desktop, or mobile context tab */}
      <div className={`flex-shrink-0 flex flex-col
        ${mobileTab === "context" ? "flex flex-1 lg:flex-none" : "hidden"}
        xl:flex`}
      >
        <AgentContextPanel context={context} isLoading={isLoading} />
      </div>

      {/* Mobile bottom tab bar — hidden lg+ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50
        bg-[#FAF8F5] dark:bg-[#1C1710] border-t border-[#E5DDD3] dark:border-[#2E2418] flex">
        <button
          onClick={() => setMobileTab("chat")}
          className={`relative flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
            mobileTab === "chat"
              ? "text-[#8B6F47] dark:text-[#C4A06A]"
              : "text-[#9C8B7A] dark:text-[#7A6A5A] hover:text-[#6B5E52] dark:hover:text-[#D4C9BC]"
          }`}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd"
              d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd" />
          </svg>
          Chat
          {mobileTab === "chat" && (
            <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#8B6F47] dark:bg-[#C4A06A] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setMobileTab("context")}
          className={`relative flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
            mobileTab === "context"
              ? "text-[#8B6F47] dark:text-[#C4A06A]"
              : "text-[#9C8B7A] dark:text-[#7A6A5A] hover:text-[#6B5E52] dark:hover:text-[#D4C9BC]"
          }`}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
              clipRule="evenodd" />
          </svg>
          Context
          {hasActivity && mobileTab !== "context" && (
            <span className="absolute top-2 right-[calc(25%_-_6px)] w-2 h-2 bg-[#8B6F47] rounded-full border-2 border-[#FAF8F5] dark:border-[#1C1710]" />
          )}
          {mobileTab === "context" && (
            <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#8B6F47] dark:bg-[#C4A06A] rounded-full" />
          )}
        </button>
      </nav>
    </div>
  );
}
