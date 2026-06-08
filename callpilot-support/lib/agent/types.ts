export type Intent =
  | "general_question"
  | "setup_help"
  | "call_debugging"
  | "latency_issue"
  | "interruption_issue"
  | "handoff_issue"
  | "billing_question"
  | "integration_question"
  | "security_or_compliance"
  | "bug_report"
  | "human_handoff_request"
  | "unknown";

export interface SessionMemory {
  customerName?: string;
  companyName?: string;
  currentCallId?: string;
  currentAgentId?: string;
  lastIntent?: Intent;
  lastIssueSummary?: string;
  previousRecommendations: string[];
}

export interface KBDoc {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
}

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  output: unknown;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  kbSources?: string[];
  timestamp: number;
}

export interface ChatRequest {
  message: string;
  history: Message[];
  memory: SessionMemory;
}

export interface ChatResponse {
  reply: string;
  toolCalls: ToolCall[];
  kbSources: string[];
  kbDocs: KBDoc[];
  updatedMemory: SessionMemory;
  intent: Intent;
}
