import { SessionMemory, ToolCall } from "./types";
import { checkCallStatus } from "../tools/checkCallStatus";
import { getAgentConfig } from "../tools/getAgentConfig";
import { checkPlanFeatures } from "../tools/checkPlanFeatures";
import {
  createSupportTicket,
  CreateSupportTicketInput,
} from "../tools/createSupportTicket";

export interface ToolRoutingResult {
  toolCalls: ToolCall[];
  updatedMemory: SessionMemory;
  needsClarification: boolean;
  clarificationQuestion?: string;
}

const CALL_ID_REGEX = /\b(CALL-\d+)\b/i;
const AGENT_ID_REGEX = /\b(AGENT-\d+)\b/i;

const PLAN_KEYWORDS =
  /\b(starter|growth|enterprise|pricing|plan|features|cost|tier|minutes)\b/i;

const ESCALATION_KEYWORDS =
  /\b(refund|cancel|cancellation|billing (complaint|dispute|issue)|security issue|outage|broken|human|speak to|talk to|live agent|urgent|emergency|legal)\b/i;

function detectSeverity(
  message: string
): CreateSupportTicketInput["severity"] {
  if (
    /\b(urgent|outage|broken|emergency|critical|down|legal)\b/i.test(message)
  )
    return "high";
  if (/\b(billing|refund|cancel|security)\b/i.test(message)) return "medium";
  return "low";
}

function detectIssueType(message: string): string {
  if (/refund/i.test(message)) return "billing_refund";
  if (/cancel/i.test(message)) return "cancellation";
  if (/security|compliance/i.test(message)) return "security";
  if (/outage|down|broken/i.test(message)) return "platform_issue";
  if (/human|speak to|live agent/i.test(message)) return "human_escalation";
  if (/billing/i.test(message)) return "billing_dispute";
  return "general_escalation";
}

export function routeTools(
  message: string,
  memory: SessionMemory
): ToolRoutingResult {
  const toolCalls: ToolCall[] = [];
  const updatedMemory: SessionMemory = { ...memory };

  // Check for call ID
  const callMatch = message.match(CALL_ID_REGEX);
  if (callMatch) {
    const callId = callMatch[1].toUpperCase();
    updatedMemory.currentCallId = callId;

    const result = checkCallStatus(callId);
    toolCalls.push({
      name: "checkCallStatus",
      input: { callId },
      output: result,
    });

    // If call result has an agent ID, auto-fetch agent config
    if (result.found && result.data?.agentId && !AGENT_ID_REGEX.test(message)) {
      const agentId = result.data.agentId;
      updatedMemory.currentAgentId = agentId;
      const agentResult = getAgentConfig(agentId);
      toolCalls.push({
        name: "getAgentConfig",
        input: { agentId },
        output: agentResult,
      });
    }
  }

  // Check for agent ID (direct mention)
  const agentMatch = message.match(AGENT_ID_REGEX);
  if (agentMatch) {
    const agentId = agentMatch[1].toUpperCase();
    updatedMemory.currentAgentId = agentId;

    const result = getAgentConfig(agentId);
    toolCalls.push({
      name: "getAgentConfig",
      input: { agentId },
      output: result,
    });
  }

  // Check for plan features query
  if (PLAN_KEYWORDS.test(message) && toolCalls.length === 0) {
    const planMatch = message.match(/\b(starter|growth|enterprise)\b/i);
    if (planMatch) {
      const planName = planMatch[1];
      const result = checkPlanFeatures(planName);
      toolCalls.push({
        name: "checkPlanFeatures",
        input: { planName },
        output: result,
      });
    }
  }

  // Check for interruption issue without agent ID — ask for clarification
  const isInterruptionIssue =
    /interrupt|cut(ting)? off|barge.?in/i.test(message);
  if (
    isInterruptionIssue &&
    !agentMatch &&
    !updatedMemory.currentAgentId &&
    toolCalls.length === 0
  ) {
    return {
      toolCalls: [],
      updatedMemory,
      needsClarification: true,
      clarificationQuestion:
        "I can help troubleshoot the interruption issue. Could you share your **Agent ID** (format: AGENT-XXXX)? I'll pull up the configuration to give you specific recommendations.",
    };
  }

  // If we now have an agent ID and the last issue was interruption, proceed
  if (
    agentMatch &&
    (memory.lastIntent === "interruption_issue" ||
      /interrupt|cut(ting)? off/i.test(memory.lastIssueSummary || "")) &&
    toolCalls.some((t) => t.name === "getAgentConfig")
  ) {
    // Already fetched agent config above; memory context will be used in response
  }

  // Check for escalation triggers
  if (ESCALATION_KEYWORDS.test(message) && toolCalls.length === 0) {
    const severity = detectSeverity(message);
    const issueType = detectIssueType(message);
    const input: CreateSupportTicketInput = {
      issueType,
      summary: message.slice(0, 200),
      severity,
    };
    const result = createSupportTicket(input);
    toolCalls.push({
      name: "createSupportTicket",
      input: input as unknown as Record<string, unknown>,
      output: result,
    });
  }

  return {
    toolCalls,
    updatedMemory,
    needsClarification: false,
  };
}
