"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

interface KBDocSummary {
  id: string;
  title: string;
  category: string;
  keywords: string[];
}

interface ToolDescription {
  name: string;
  description: string;
}

interface LogEntry {
  sessionId: string;
  startedAt: number;
  messageCount: number;
  intents: string[];
  toolCallCount: number;
  ticketIds: string[];
  handoffRequested: boolean;
  preview: string;
}

interface Analytics {
  totalMessages: number;
  totalToolCalls: number;
  ticketsCreated: number;
  handoffCount: number;
  topIntents: Array<{ intent: string; count: number }>;
  totalSessions: number;
}

interface AdminData {
  systemPrompt: string;
  tools: ToolDescription[];
  kbDocs: KBDocSummary[];
  recentLogs: LogEntry[];
  analytics: Analytics;
}

const intentLabel: Record<string, string> = {
  general_question:      "General Question",
  setup_help:            "Setup Help",
  call_debugging:        "Call Debugging",
  latency_issue:         "Latency Issue",
  interruption_issue:    "Interruption Issue",
  handoff_issue:         "Handoff Issue",
  billing_question:      "Billing",
  integration_question:  "Integration",
  security_or_compliance:"Security/Compliance",
  bug_report:            "Bug Report",
  human_handoff_request: "Handoff Request",
  unknown:               "Unknown",
};

const intentColor: Record<string, string> = {
  setup_help:            "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  call_debugging:        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  latency_issue:         "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  interruption_issue:    "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
  handoff_issue:         "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  billing_question:      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  integration_question:  "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
  security_or_compliance:"bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
  bug_report:            "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  human_handoff_request: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
  general_question:      "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  unknown:               "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
};

const toolMeta: Record<string, { icon: string; color: string; bg: string }> = {
  checkCallStatus:     { icon: "📞", color: "text-blue-700 dark:text-blue-300",     bg: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800" },
  getAgentConfig:      { icon: "⚙️", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800" },
  checkPlanFeatures:   { icon: "📋", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800" },
  createSupportTicket: { icon: "🎫", color: "text-orange-700 dark:text-orange-300", bg: "bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800" },
};

const kbCategoryColor: Record<string, string> = {
  Onboarding:      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  Configuration:   "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  Troubleshooting: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  Integrations:    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
  Billing:         "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  Security:        "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
};

function StatCard({
  label, value, icon, trend,
}: { label: string; value: number; icon: string; trend?: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1.5">{value}</p>
          {trend && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{trend}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

type Tab = "overview" | "persona" | "kb" | "tools" | "logs";

const tabs: Array<{ id: Tab; label: string; icon: string }> = [
  { id: "overview", label: "Overview",       icon: "📊" },
  { id: "persona",  label: "Agent Persona",  icon: "🤖" },
  { id: "kb",       label: "Knowledge Base", icon: "📚" },
  { id: "tools",    label: "Tools",          icon: "🔧" },
  { id: "logs",     label: "Logs",           icon: "🗒️" },
];

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load admin data."); setLoading(false); });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">Admin Dashboard</h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Agent configuration, knowledge base, tool registry, and analytics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                In-memory store
              </span>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
                Back to Chat
              </Link>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading admin data…</p>
          </div>
        )}

        {error && (
          <div className="m-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {data && (
          <div className="p-5">
            {/* Tab bar */}
            <div className="flex gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-1 mb-5 w-fit shadow-sm overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW ── */}
            {activeTab === "overview" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  <StatCard label="Sessions"       value={data.analytics.totalSessions}  icon="💬" />
                  <StatCard label="Messages"       value={data.analytics.totalMessages}  icon="📨" />
                  <StatCard label="Tool Calls"     value={data.analytics.totalToolCalls} icon="🔧" />
                  <StatCard label="Tickets"        value={data.analytics.ticketsCreated} icon="🎫" />
                  <StatCard label="Handoffs"       value={data.analytics.handoffCount}   icon="👤" />
                </div>

                {data.analytics.topIntents.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Top Intents</h3>
                    <div className="space-y-3">
                      {data.analytics.topIntents.map(({ intent, count }) => {
                        const maxCount = data.analytics.topIntents[0]?.count || 1;
                        const pct = Math.round((count / maxCount) * 100);
                        const color = intentColor[intent] || "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
                        return (
                          <div key={intent} className="flex items-center gap-3">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border w-44 text-center flex-shrink-0 ${color}`}>
                              {intentLabel[intent] || intent}
                            </span>
                            <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-blue-500 rounded-full h-2 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-5 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Agentic features summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Agentic Capabilities</h3>
                    <ul className="space-y-2">
                      {[
                        { icon: "🔍", label: "KB Retrieval", desc: "Keyword search across 9 documents" },
                        { icon: "🔧", label: "Tool Calling",  desc: "4 mock tools with structured output" },
                        { icon: "🧠", label: "Session Memory", desc: "Persists call/agent IDs and intent" },
                        { icon: "💬", label: "Clarification Flow", desc: "Asks for Agent ID before diagnosing" },
                        { icon: "🎫", label: "Ticket Escalation", desc: "Auto-creates tickets on escalation" },
                      ].map((item) => (
                        <li key={item.label} className="flex items-start gap-2.5">
                          <span className="text-base mt-0.5">{item.icon}</span>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.label}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Mock Data Summary</h3>
                    <ul className="space-y-2">
                      {[
                        { icon: "📞", label: "3 mock calls", desc: "CALL-1029, CALL-2044, CALL-7788" },
                        { icon: "⚙️", label: "3 mock agents", desc: "AGENT-101, AGENT-203, AGENT-302" },
                        { icon: "📋", label: "3 plans", desc: "Starter, Growth, Enterprise" },
                        { icon: "📚", label: `${data.kbDocs.length} KB documents`, desc: "Onboarding → Security & Compliance" },
                        { icon: "🔧", label: `${data.tools.length} mock tools`, desc: "Callable from any message" },
                      ].map((item) => (
                        <li key={item.label} className="flex items-start gap-2.5">
                          <span className="text-base mt-0.5">{item.icon}</span>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.label}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ── PERSONA ── */}
            {activeTab === "persona" && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xl">🤖</div>
                    <div>
                      <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Agent Persona</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">System prompt governing agent behavior and tone</p>
                    </div>
                    <span className="ml-auto text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full font-medium">
                      Active
                    </span>
                  </div>

                  <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-100 dark:border-slate-700">
                    {[
                      { label: "Tone",       value: "Professional, warm, concise" },
                      { label: "Escalation", value: "Billing, legal, security, outages" },
                      { label: "Boundaries", value: "No medical, legal, financial advice" },
                    ].map((item) => (
                      <div key={item.label} className="bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{item.label}</p>
                        <p className="text-sm text-slate-800 dark:text-slate-200">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Full System Prompt</p>
                    <pre className="whitespace-pre-wrap text-xs font-mono bg-slate-950 text-slate-200 rounded-xl p-4 leading-relaxed overflow-x-auto border border-slate-800">
                      {data.systemPrompt}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* ── KB ── */}
            {activeTab === "kb" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Knowledge Base</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Documents used for semantic keyword retrieval</p>
                  </div>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full font-medium">
                    {data.kbDocs.length} documents · top-3 retrieval
                  </span>
                </div>

                <div className="grid gap-3">
                  {data.kbDocs.map((doc) => {
                    const catColor = kbCategoryColor[doc.category] || "bg-slate-50 text-slate-600 border-slate-200";
                    return (
                      <div key={doc.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-base flex-shrink-0">
                              📄
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">{doc.title}</h3>
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-mono">{doc.id}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${catColor}`}>
                            {doc.category}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {doc.keywords.map((kw) => (
                            <span key={kw} className="text-xs bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg px-2 py-0.5 border border-slate-100 dark:border-slate-600 font-mono">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TOOLS ── */}
            {activeTab === "tools" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Mock Tool Registry</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tools the agent can invoke based on message content</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.tools.map((tool) => {
                    const meta = toolMeta[tool.name] ?? { icon: "🔧", color: "text-slate-700 dark:text-slate-300", bg: "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700" };
                    return (
                      <div
                        key={tool.name}
                        className={`rounded-2xl border p-4 shadow-sm ${meta.bg}`}
                      >
                        <div className="flex items-center gap-2.5 mb-2">
                          <span className="text-2xl">{meta.icon}</span>
                          <code className={`font-mono font-bold text-sm ${meta.color}`}>{tool.name}()</code>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{tool.description}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Tool Routing Logic</h3>
                  <div className="space-y-2">
                    {[
                      { trigger: "CALL-\\d+",           tool: "checkCallStatus",     icon: "📞", color: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950 dark:border-blue-800" },
                      { trigger: "AGENT-\\d+",          tool: "getAgentConfig",      icon: "⚙️", color: "text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950 dark:border-purple-800" },
                      { trigger: "starter/growth/enterprise/plan", tool: "checkPlanFeatures", icon: "📋", color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950 dark:border-emerald-800" },
                      { trigger: "refund/cancel/billing/security/human", tool: "createSupportTicket", icon: "🎫", color: "text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-950 dark:border-orange-800" },
                    ].map((row) => (
                      <div key={row.tool} className="flex items-center gap-3 text-xs">
                        <code className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg font-mono flex-shrink-0 min-w-0 truncate max-w-[200px]">
                          {row.trigger}
                        </code>
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-slate-400 flex-shrink-0">
                          <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                        </svg>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-lg border font-mono font-semibold flex-shrink-0 ${row.color}`}>
                          <span>{row.icon}</span> {row.tool}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <p>• Interruption issue without Agent ID → clarification question before tool call</p>
                    <p>• CALL-XXXX result includes agent ID → automatically chains getAgentConfig</p>
                    <p>• Memory persists agent/call ID across turns within session</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── LOGS ── */}
            {activeTab === "logs" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Conversation Logs</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">In-memory · resets on server restart</p>
                  </div>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full font-medium">
                    {data.recentLogs.length} sessions
                  </span>
                </div>

                {data.recentLogs.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl mx-auto mb-3">🗒️</div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No conversations yet</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start a chat to see logs here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.recentLogs.map((log) => (
                      <div key={log.sessionId} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0">
                            <p className="text-xs font-mono text-slate-400 dark:text-slate-500 truncate">{log.sessionId}</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 italic leading-snug">
                              &ldquo;{log.preview}&rdquo;
                            </p>
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">
                            {new Date(log.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg px-2 py-0.5 border border-slate-200 dark:border-slate-600 font-medium">
                            {log.messageCount} msgs
                          </span>
                          {log.intents.map((intent) => (
                            <span
                              key={intent}
                              className={`text-xs rounded-lg px-2 py-0.5 border font-medium ${intentColor[intent] || "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"}`}
                            >
                              {intentLabel[intent] || intent}
                            </span>
                          ))}
                          {log.toolCallCount > 0 && (
                            <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800 rounded-lg px-2 py-0.5 font-medium">
                              🔧 {log.toolCallCount} tool{log.toolCallCount !== 1 ? "s" : ""}
                            </span>
                          )}
                          {log.ticketIds.map((tid) => (
                            <span key={tid} className="text-xs bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800 rounded-lg px-2 py-0.5 font-mono font-medium">
                              🎫 {tid}
                            </span>
                          ))}
                          {log.handoffRequested && (
                            <span className="text-xs bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800 rounded-lg px-2 py-0.5 font-medium">
                              👤 handoff
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
