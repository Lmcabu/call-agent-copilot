import { Intent, KBDoc, SessionMemory, ToolCall } from "./types";
import { CheckCallStatusResult } from "../tools/checkCallStatus";
import { GetAgentConfigResult } from "../tools/getAgentConfig";
import { CheckPlanFeaturesResult } from "../tools/checkPlanFeatures";
import { CreateSupportTicketResult } from "../tools/createSupportTicket";

interface GenerateResponseOptions {
  message: string;
  intent: Intent;
  toolCalls: ToolCall[];
  kbDocs: KBDoc[];
  memory: SessionMemory;
  needsClarification: boolean;
  clarificationQuestion?: string;
}

function formatCallStatus(result: CheckCallStatusResult): string {
  if (!result.found || !result.data) return result.error || "Call not found.";
  const d = result.data;
  const statusIcon = d.status === "completed" ? "✓" : "✗";
  let out = `**Call ${d.callId}** — Status: **${d.status.toUpperCase()}** ${statusIcon}\n`;
  out += `- Latency: ${d.latencyMs}ms\n`;
  out += `- Agent: ${d.agentId}\n`;
  if (d.failureReason) out += `- Failure reason: ${d.failureReason}\n`;
  out += `- Recommendation: ${d.recommendation}`;
  return out;
}

function formatAgentConfig(result: GetAgentConfigResult): string {
  if (!result.found || !result.data) return result.error || "Agent not found.";
  const d = result.data;
  return [
    `**Agent ${d.agentId}** — ${d.name}`,
    `- Voice: ${d.voice}`,
    `- Interruption sensitivity: ${d.interruptionSensitivity}`,
    `- End-of-turn delay: ${d.endOfTurnDelayMs}ms`,
    `- Human handoff: ${d.handoffEnabled ? "Enabled" : "Disabled"}`,
    `- Fallback message: "${d.fallbackMessage}"`,
    `- Integrations: ${d.integrations.join(", ")}`,
  ].join("\n");
}

function formatPlanFeatures(result: CheckPlanFeaturesResult): string {
  if (!result.found || !result.data) return result.error || "Plan not found.";
  const d = result.data;
  let out = `**${d.planName} Plan**\n\n`;
  out += `**Included features:**\n`;
  out += d.features.map((f) => `- ${f}`).join("\n");
  if (d.missing.length > 0) {
    out += `\n\n**Not included:**\n`;
    out += d.missing.map((f) => `- ${f}`).join("\n");
  } else {
    out += `\n\n**All features included** — no restrictions.`;
  }
  return out;
}

function formatTicket(result: CreateSupportTicketResult): string {
  return [
    `**Support ticket created: ${result.ticketId}**`,
    `- Priority: ${result.priority}`,
    `- Status: ${result.status}`,
    `- Next step: ${result.nextStep}`,
  ].join("\n");
}

export function generateResponse(opts: GenerateResponseOptions): string {
  const { message, intent, toolCalls, kbDocs, memory, needsClarification, clarificationQuestion } = opts;

  if (needsClarification && clarificationQuestion) {
    return clarificationQuestion;
  }

  const sections: string[] = [];

  // Process tool call results first
  const callStatusCall = toolCalls.find((t) => t.name === "checkCallStatus");
  const agentConfigCall = toolCalls.find((t) => t.name === "getAgentConfig");
  const planFeaturesCall = toolCalls.find((t) => t.name === "checkPlanFeatures");
  const ticketCall = toolCalls.find((t) => t.name === "createSupportTicket");

  if (callStatusCall) {
    const result = callStatusCall.output as CheckCallStatusResult;
    sections.push(formatCallStatus(result));

    if (result.found && result.data) {
      const d = result.data;
      if (d.status === "failed") {
        if (d.failureReason?.includes("Webhook timeout")) {
          sections.push(
            `**Recommended steps:**\n1. Check your webhook endpoint's response time — it should respond in < 300ms.\n2. Review your webhook server logs around the call time.\n3. Enable retry policies in Agent Settings > Webhook.\n4. Consider adding a timeout fallback message to your agent.`
          );
        } else if (d.failureReason?.includes("handoff destination")) {
          sections.push(
            `**Recommended steps:**\n1. Go to Agent Settings > Handoff and verify the destination phone number.\n2. Test the handoff number is active and reachable.\n3. Set a fallback route in case the primary destination is busy.\n4. Check if your business hours restrict handoff availability.`
          );
        }
      }
    }
  }

  if (agentConfigCall) {
    const result = agentConfigCall.output as GetAgentConfigResult;
    const configSection = formatAgentConfig(result);
    sections.push(configSection);

    // If we have context about interruption issue, add targeted advice
    const isInterruptionContext =
      memory.lastIntent === "interruption_issue" ||
      /interrupt|cut(ting)? off/i.test(memory.lastIssueSummary || "") ||
      /interrupt|cut(ting)? off/i.test(message);

    if (isInterruptionContext && result.found && result.data) {
      const d = result.data;
      const recs: string[] = [];

      if (d.interruptionSensitivity === "high") {
        recs.push(
          "Your agent's **interruption sensitivity is set to High** — this means callers can easily cut off the agent mid-sentence."
        );
        recs.push(
          `**Recommended fix:** Lower interruption sensitivity to **Medium** in Agent Settings > Voice & Turn-Taking.`
        );
      }

      if (d.endOfTurnDelayMs < 500) {
        recs.push(
          `**End-of-turn delay is ${d.endOfTurnDelayMs}ms** — this is low and may cause the agent to speak before the caller finishes.`
        );
        recs.push(
          `**Recommended fix:** Increase end-of-turn delay to **600–800ms** to give callers more time to complete their thought.`
        );
      }

      if (recs.length > 0) {
        sections.push(`**Interruption diagnosis for ${d.name}:**\n${recs.join("\n")}`);
      } else {
        sections.push(
          `The configuration looks reasonable. The issue may be related to background noise or a specific caller behavior. Consider enabling **noise suppression** in Audio Settings.`
        );
      }
    }
  }

  if (planFeaturesCall) {
    const result = planFeaturesCall.output as CheckPlanFeaturesResult;
    sections.push(formatPlanFeatures(result));

    // Add context about the specific question
    if (/handoff/i.test(message) && result.found && result.data) {
      const hasHandoff = result.data.features.some((f) =>
        /handoff/i.test(f)
      );
      const planName = result.data.planName;
      if (hasHandoff) {
        sections.push(
          `**Yes**, the **${planName} plan includes human handoff.** You can configure it in Agent Settings > Handoff.`
        );
      } else {
        sections.push(
          `**No**, the **${planName} plan does not include human handoff.** You would need to upgrade to the **Growth or Enterprise plan** to access this feature.`
        );
      }
    }
  }

  if (ticketCall) {
    const result = ticketCall.output as CreateSupportTicketResult;
    sections.push(formatTicket(result));

    // Add empathetic context
    if (/refund/i.test(message)) {
      sections.push(
        `I understand how frustrating it is when things don't work as expected. Our billing team will review your case and reach out directly. In the meantime, I'm happy to help troubleshoot any technical issues on my end.`
      );
    } else if (/human|speak to|live agent/i.test(message)) {
      sections.push(
        `A human support specialist will reach out at the contact info on your account. Is there anything I can help clarify while you wait?`
      );
    }
  }

  // Add KB-sourced context
  if (kbDocs.length > 0 && sections.length === 0) {
    // Use KB docs to answer
    const topDoc = kbDocs[0];
    sections.push(buildKBAnswer(message, intent, topDoc, kbDocs));
  } else if (kbDocs.length > 0 && sections.length > 0) {
    // KB docs supplement tool results — add a brief tip
    const supplementalDoc = kbDocs.find((d) =>
      isDocRelevantForSupplement(d, intent)
    );
    if (supplementalDoc) {
      const tip = extractTip(supplementalDoc);
      if (tip) sections.push(tip);
    }
  }

  // Fallback
  if (sections.length === 0) {
    sections.push(buildFallback(message, intent));
  }

  // Append next step
  sections.push(buildNextStep(intent, toolCalls, memory));

  return sections.join("\n\n");
}

function isDocRelevantForSupplement(doc: KBDoc, intent: Intent): boolean {
  const intentDocMap: Record<string, string[]> = {
    call_debugging: ["kb-003", "kb-004"],
    latency_issue: ["kb-003"],
    interruption_issue: ["kb-004"],
    handoff_issue: ["kb-005"],
    integration_question: ["kb-006"],
    billing_question: ["kb-007", "kb-009"],
    security_or_compliance: ["kb-008"],
    setup_help: ["kb-001", "kb-002"],
  };
  return (intentDocMap[intent] || []).includes(doc.id);
}

function extractTip(doc: KBDoc): string | null {
  // Extract the first bullet point or sentence as a tip
  const lines = doc.content.split("\n").filter((l) => l.trim().startsWith("-"));
  if (lines.length > 0) {
    return `**Tip from "${doc.title}":** ${lines[0].trim().replace(/^-\s*/, "")}`;
  }
  return null;
}

function buildKBAnswer(message: string, intent: Intent, topDoc: KBDoc, allDocs: KBDoc[]): string {
  const intro = getIntentIntro(intent);

  // For setup_help, give a structured answer
  if (intent === "setup_help") {
    return `${intro}\n\n${topDoc.content}`;
  }

  // For other intents, give a more focused excerpt
  const relevantContent = topDoc.content.trim();
  return `${intro}\n\n${relevantContent}`;
}

function getIntentIntro(intent: Intent): string {
  const intros: Partial<Record<Intent, string>> = {
    setup_help: "Here's how to get started with your first voice agent:",
    latency_issue: "Here's how to diagnose and fix latency issues:",
    interruption_issue: "Here's how to address interruption behavior:",
    handoff_issue: "Here's how to troubleshoot human handoff:",
    integration_question: "Here's information about CallPilot integrations:",
    billing_question: "Here's what our documentation says about pricing and billing:",
    security_or_compliance: "Here's our security and compliance overview:",
    general_question: "Here's what I found in our documentation:",
    bug_report: "I understand you're experiencing an issue.",
  };
  return intros[intent] || "Here's what I found:";
}

function buildFallback(message: string, intent: Intent): string {
  return `I want to make sure I give you accurate information. Based on your question, I'd recommend checking our documentation, or I can connect you with our support team for a definitive answer.\n\nCould you share more details about what you're trying to accomplish? For example, your agent ID or the specific behavior you're seeing would help me give more targeted advice.`;
}

function buildNextStep(
  intent: Intent,
  toolCalls: ToolCall[],
  memory: SessionMemory
): string {
  const hasTicket = toolCalls.some((t) => t.name === "createSupportTicket");
  if (hasTicket) {
    return `**What would you like to do next?** I can help you troubleshoot further, check another call or agent, or answer any other questions.`;
  }

  const nextSteps: Partial<Record<Intent, string>> = {
    setup_help:
      "**Next step:** Head to your [CallPilot dashboard](/) and click **Agents > New Agent** to get started. Feel free to ask if you get stuck on any step.",
    call_debugging:
      "**Next step:** Review the webhook logs on your server and compare timestamps with the call event. Let me know if you'd like help checking another call.",
    latency_issue:
      "**Next step:** Check your webhook endpoint response times and try lowering the end-of-turn delay to 500ms. Would you like me to look up a specific call or agent?",
    interruption_issue:
      "**Next step:** Apply the configuration changes in Agent Settings and run a test call to verify. Would you like to check another agent?",
    handoff_issue:
      "**Next step:** Verify the handoff destination number and re-enable handoff in your agent settings. Let me know if you need help with a specific agent.",
    billing_question:
      "**Next step:** If you have a specific billing question or need to make a change, I can create a support ticket or you can visit Settings > Billing in your dashboard.",
    integration_question:
      "**Next step:** Go to **Agent Settings > Integrations** and click **Add Integration** to connect your service. Let me know if you hit any issues.",
    security_or_compliance:
      "**Next step:** For SOC2 reports or compliance documentation, please contact sales@callpilot.ai. Our team will assist you within 1 business day.",
    human_handoff_request:
      "**Next step:** Our team will be in touch shortly. Is there anything else I can help with in the meantime?",
  };

  return (
    nextSteps[intent] ||
    "**What else can I help you with?** Feel free to ask about setup, troubleshooting, pricing, integrations, or anything else related to CallPilot."
  );
}
