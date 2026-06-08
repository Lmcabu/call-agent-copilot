import { NextResponse } from "next/server";
import { SYSTEM_PROMPT, TOOL_DESCRIPTIONS } from "@/lib/agent/systemPrompt";
import { kbDocs } from "@/lib/kb/docs";
import { getRecentLogs } from "@/lib/logging/conversationStore";
import { computeAnalytics } from "@/lib/logging/analytics";

export async function GET() {
  const logs = getRecentLogs(20);
  const analytics = computeAnalytics();

  return NextResponse.json({
    systemPrompt: SYSTEM_PROMPT,
    tools: TOOL_DESCRIPTIONS,
    kbDocs: kbDocs.map((d) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      keywords: d.keywords,
    })),
    recentLogs: logs.map((log) => ({
      sessionId: log.sessionId,
      startedAt: log.startedAt,
      messageCount: log.messages.length,
      intents: log.intents,
      toolCallCount: log.toolCallCount,
      ticketIds: log.ticketIds,
      handoffRequested: log.handoffRequested,
      preview:
        log.messages.find((m) => m.role === "user")?.content?.slice(0, 80) ||
        "—",
    })),
    analytics,
  });
}
