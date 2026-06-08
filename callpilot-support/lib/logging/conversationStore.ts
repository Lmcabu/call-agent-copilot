import { Message, Intent } from "../agent/types";

export interface ConversationLog {
  sessionId: string;
  startedAt: number;
  messages: Message[];
  intents: Intent[];
  toolCallCount: number;
  ticketIds: string[];
  handoffRequested: boolean;
}

// Server-side in-memory store (resets on restart)
const conversationLogs: ConversationLog[] = [];

// Seed with example logs for demonstration
const seedLogs: ConversationLog[] = [
  {
    sessionId: "session-demo-1",
    startedAt: Date.now() - 3600000 * 2,
    messages: [
      {
        id: "m1",
        role: "user",
        content: "How do I set up my first voice agent?",
        timestamp: Date.now() - 3600000 * 2,
      },
      {
        id: "m2",
        role: "assistant",
        content: "Here's how to get started with your first voice agent...",
        kbSources: ["Getting Started with CallPilot AI"],
        timestamp: Date.now() - 3600000 * 2 + 1000,
      },
    ],
    intents: ["setup_help"],
    toolCallCount: 0,
    ticketIds: [],
    handoffRequested: false,
  },
  {
    sessionId: "session-demo-2",
    startedAt: Date.now() - 3600000,
    messages: [
      {
        id: "m3",
        role: "user",
        content: "Can you check why CALL-1029 failed?",
        timestamp: Date.now() - 3600000,
      },
      {
        id: "m4",
        role: "assistant",
        content: "CALL-1029 failed due to webhook timeout...",
        toolCalls: [
          {
            name: "checkCallStatus",
            input: { callId: "CALL-1029" },
            output: { found: true },
          },
        ],
        timestamp: Date.now() - 3600000 + 1000,
      },
    ],
    intents: ["call_debugging"],
    toolCallCount: 1,
    ticketIds: [],
    handoffRequested: false,
  },
  {
    sessionId: "session-demo-3",
    startedAt: Date.now() - 1800000,
    messages: [
      {
        id: "m5",
        role: "user",
        content: "I want a refund. Your AI broke our customer calls.",
        timestamp: Date.now() - 1800000,
      },
      {
        id: "m6",
        role: "assistant",
        content: "I've created a support ticket for you...",
        toolCalls: [
          {
            name: "createSupportTicket",
            input: { issueType: "billing_refund", severity: "high" },
            output: { ticketId: "TICKET-4821", status: "created" },
          },
        ],
        timestamp: Date.now() - 1800000 + 1000,
      },
    ],
    intents: ["billing_question"],
    toolCallCount: 1,
    ticketIds: ["TICKET-4821"],
    handoffRequested: false,
  },
];

// Initialize with seed data
conversationLogs.push(...seedLogs);

export function saveConversationLog(log: ConversationLog): void {
  const existingIndex = conversationLogs.findIndex(
    (l) => l.sessionId === log.sessionId
  );
  if (existingIndex >= 0) {
    conversationLogs[existingIndex] = log;
  } else {
    conversationLogs.push(log);
  }
  // Keep last 100 logs
  if (conversationLogs.length > 100) {
    conversationLogs.splice(0, conversationLogs.length - 100);
  }
}

export function getRecentLogs(limit = 20): ConversationLog[] {
  return conversationLogs
    .slice()
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, limit);
}

export function getAllLogs(): ConversationLog[] {
  return conversationLogs;
}
