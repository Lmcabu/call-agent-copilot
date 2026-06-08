import { Intent } from "../agent/types";
import { getAllLogs } from "./conversationStore";

export interface Analytics {
  totalMessages: number;
  totalToolCalls: number;
  ticketsCreated: number;
  handoffCount: number;
  topIntents: Array<{ intent: Intent; count: number }>;
  totalSessions: number;
}

export function computeAnalytics(): Analytics {
  const logs = getAllLogs();

  let totalMessages = 0;
  let totalToolCalls = 0;
  let ticketsCreated = 0;
  let handoffCount = 0;
  const intentCounts: Partial<Record<Intent, number>> = {};

  for (const log of logs) {
    totalMessages += log.messages.length;
    totalToolCalls += log.toolCallCount;
    ticketsCreated += log.ticketIds.length;
    if (log.handoffRequested) handoffCount++;

    for (const intent of log.intents) {
      intentCounts[intent] = (intentCounts[intent] || 0) + 1;
    }
  }

  const topIntents = (Object.entries(intentCounts) as Array<[Intent, number]>)
    .map(([intent, count]) => ({ intent, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalMessages,
    totalToolCalls,
    ticketsCreated,
    handoffCount,
    topIntents,
    totalSessions: logs.length,
  };
}
