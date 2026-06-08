export interface CallRecord {
  callId: string;
  status: "completed" | "failed" | "in-progress";
  failureReason?: string;
  latencyMs: number;
  agentId: string;
  recommendation: string;
}

export const mockCalls: Record<string, CallRecord> = {
  "CALL-1029": {
    callId: "CALL-1029",
    status: "failed",
    failureReason: "Webhook timeout",
    latencyMs: 4200,
    agentId: "AGENT-203",
    recommendation:
      "Check webhook endpoint response time and retry policy.",
  },
  "CALL-2044": {
    callId: "CALL-2044",
    status: "completed",
    latencyMs: 950,
    agentId: "AGENT-101",
    recommendation: "Call completed successfully. No action needed.",
  },
  "CALL-7788": {
    callId: "CALL-7788",
    status: "failed",
    failureReason: "Human handoff destination unavailable",
    latencyMs: 1300,
    agentId: "AGENT-302",
    recommendation:
      "Verify handoff phone number and fallback routing.",
  },
};
