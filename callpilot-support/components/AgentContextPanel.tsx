"use client";

import { SessionMemory, ToolCall, Intent } from "@/lib/agent/types";

export interface ContextUpdate {
  memory: SessionMemory;
  lastIntent: Intent | "";
  lastToolCalls: ToolCall[];
  lastKbSources: string[];
  lastTicketIds: string[];
  messageCount: number;
}

interface AgentContextPanelProps {
  context: ContextUpdate;
  isLoading: boolean;
}

const intentMeta: Record<string, { label: string; color: string; nextStep: string }> = {
  setup_help:            { label: "Setup & Onboarding",    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",         nextStep: "Follow the Getting Started guide to configure your first agent." },
  call_debugging:        { label: "Call Diagnostics",      color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",             nextStep: "Review the call log details and verify your webhook endpoint is reachable." },
  latency_issue:         { label: "Latency Issue",         color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800", nextStep: "Switch to a lower-latency voice model in your agent settings." },
  interruption_issue:    { label: "Voice Interruption",    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",   nextStep: "Increase the end-of-utterance delay in your agent configuration." },
  handoff_issue:         { label: "Transfer Issue",        color: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800", nextStep: "Verify your human handoff destination number and transfer rules." },
  billing_question:      { label: "Billing & Plan",        color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800", nextStep: "Review your Growth plan usage in the Account > Billing section." },
  integration_question:  { label: "Integration Setup",     color: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",         nextStep: "Use our step-by-step integration guide in the documentation." },
  security_or_compliance:{ label: "Security & Compliance", color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800", nextStep: "Contact our security team for compliance documentation and SOC 2 reports." },
  bug_report:            { label: "Bug Report",            color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",             nextStep: "A support ticket has been created and escalated to our engineering team." },
  human_handoff_request: { label: "Escalation Requested",  color: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800", nextStep: "A senior support agent will be assigned to your case shortly." },
  general_question:      { label: "General Support",       color: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",  nextStep: "Browse our help center for detailed guides and tutorials." },
  unknown:               { label: "Support Request",       color: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",  nextStep: "Describe your issue in more detail and I'll help you find the fastest resolution." },
};

const toolMeta: Record<string, { icon: string; label: string; pill: string }> = {
  checkCallStatus:     { icon: "📞", label: "Checked call log",        pill: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300" },
  getAgentConfig:      { icon: "⚙️", label: "Reviewed agent settings", pill: "bg-violet-50 border-violet-200 text-violet-800 dark:bg-violet-950 dark:border-violet-800 dark:text-violet-300" },
  checkPlanFeatures:   { icon: "📋", label: "Compared plan features",  pill: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300" },
  createSupportTicket: { icon: "🎫", label: "Created support ticket",  pill: "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300" },
};

function Section({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="relative pl-3">
      <span className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-full ${accent}`} />
      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}

function Pill({ text, className }: { text: string; className: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${className}`}>
      {text}
    </span>
  );
}

function EmptyDash() {
  return <span className="text-xs text-slate-400 dark:text-slate-600 italic">—</span>;
}

export default function AgentContextPanel({ context, isLoading }: AgentContextPanelProps) {
  const { memory, lastIntent, lastToolCalls, lastKbSources, lastTicketIds, messageCount } = context;

  const hasActivity = messageCount > 1;
  const intentInfo = intentMeta[lastIntent] ?? intentMeta.unknown;

  const caseStatus = lastTicketIds.length > 0
    ? { label: "Escalated",   color: "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300", dot: "bg-orange-400" }
    : isLoading
    ? { label: "In Progress", color: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300",   dot: "bg-amber-400 animate-pulse" }
    : { label: "Open",        color: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300",         dot: "bg-blue-400" };

  return (
    <aside className="w-72 flex-shrink-0 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Case Details</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {hasActivity ? "Active support case" : "No case open"}
          </p>
        </div>
        {hasActivity && (
          <div className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full border transition-colors ${caseStatus.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${caseStatus.dot}`} />
            {caseStatus.label}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

        {/* Empty state */}
        {!hasActivity && (
          <div className="flex flex-col items-center text-center px-2 pt-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-3 shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6 text-slate-400 dark:text-slate-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">No active case yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Start a support conversation and I&apos;ll create a case summary here.
            </p>
          </div>
        )}

        {hasActivity && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Messages", value: messageCount },
                { label: "Tickets",  value: lastTicketIds.length },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-center shadow-sm"
                >
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Detected Issue */}
            <Section label="Detected Issue" accent="bg-blue-400">
              {lastIntent ? (
                <Pill text={intentInfo.label} className={intentInfo.color} />
              ) : (
                <EmptyDash />
              )}
            </Section>

            {/* Case Context */}
            <Section label="Case Context" accent="bg-violet-400">
              <dl className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <dt className="text-[11px] text-slate-400 dark:text-slate-500 w-16 flex-shrink-0">Call ID</dt>
                  <dd>
                    {memory.currentCallId ? (
                      <span className="font-mono text-[11px] font-semibold bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                        {memory.currentCallId}
                      </span>
                    ) : (
                      <EmptyDash />
                    )}
                  </dd>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="text-[11px] text-slate-400 dark:text-slate-500 w-16 flex-shrink-0">Agent ID</dt>
                  <dd>
                    {memory.currentAgentId ? (
                      <span className="font-mono text-[11px] font-semibold bg-violet-50 text-violet-800 px-1.5 py-0.5 rounded border border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800">
                        {memory.currentAgentId}
                      </span>
                    ) : (
                      <EmptyDash />
                    )}
                  </dd>
                </div>
                <div className="flex items-start gap-2">
                  <dt className="text-[11px] text-slate-400 dark:text-slate-500 w-16 flex-shrink-0 pt-0.5">Summary</dt>
                  <dd className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {memory.lastIssueSummary ? (
                      <>
                        {memory.lastIssueSummary.slice(0, 72)}
                        {memory.lastIssueSummary.length > 72 ? "…" : ""}
                      </>
                    ) : (
                      <EmptyDash />
                    )}
                  </dd>
                </div>
              </dl>
            </Section>

            {/* Account Checks */}
            <Section label="Account Checks" accent="bg-orange-400">
              {lastToolCalls.length === 0 ? (
                <EmptyDash />
              ) : (
                <div className="space-y-1.5">
                  {lastToolCalls.map((tool, i) => {
                    const m = toolMeta[tool.name] ?? {
                      icon: "🔍",
                      label: "Checked account",
                      pill: "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300",
                    };
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-[11px] font-medium ${m.pill}`}
                      >
                        <span className="text-[13px] leading-none">{m.icon}</span>
                        <span>{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>

            {/* Help Articles */}
            <Section label="Help Articles" accent="bg-slate-400">
              {lastKbSources.length === 0 ? (
                <EmptyDash />
              ) : (
                <div className="space-y-1.5">
                  {lastKbSources.map((src, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-2 border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                      <span className="text-slate-400 text-[13px] leading-none">📄</span>
                      <span className="truncate">{src}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Open Tickets */}
            {lastTicketIds.length > 0 && (
              <Section label="Open Tickets" accent="bg-orange-500">
                <div className="space-y-1.5">
                  {lastTicketIds.map((tid) => (
                    <div
                      key={tid}
                      className="flex items-center gap-2.5 px-2.5 py-2.5 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-xl shadow-sm"
                    >
                      <span className="text-lg leading-none flex-shrink-0">🎫</span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-mono font-bold text-orange-800 dark:text-orange-300 truncate">{tid}</p>
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 mt-0.5">Created · In queue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Suggested Next Step */}
            {lastIntent && (
              <Section label="Suggested Next Step" accent="bg-emerald-400">
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {intentInfo.nextStep}
                </p>
              </Section>
            )}
          </>
        )}
      </div>

      {/* Footer — Human Support */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="px-4 py-3">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border
            border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800
            text-slate-600 dark:text-slate-400
            hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200
            transition-colors text-xs font-medium">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
            </svg>
            Request human support
          </button>
          <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center mt-2">
            Powered by AI · Demo data only
          </p>
        </div>
      </div>
    </aside>
  );
}
