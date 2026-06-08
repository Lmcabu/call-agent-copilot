import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatRequest, ChatResponse, ToolCall } from "@/lib/agent/types";
import { classifyIntent } from "@/lib/agent/intentClassifier";
import { updateMemory } from "@/lib/agent/memory";
import { retrieveDocs } from "@/lib/kb/retriever";
import { saveConversationLog } from "@/lib/logging/conversationStore";
import { SYSTEM_PROMPT } from "@/lib/agent/systemPrompt";
import { checkCallStatus } from "@/lib/tools/checkCallStatus";
import { getAgentConfig } from "@/lib/tools/getAgentConfig";
import { checkPlanFeatures } from "@/lib/tools/checkPlanFeatures";
import { createSupportTicket, CreateSupportTicketInput } from "@/lib/tools/createSupportTicket";

const client = new OpenAI();

const TOOLS: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "checkCallStatus",
      description:
        "Look up the status, failure reason, latency, and recommendation for a specific call by its ID (format: CALL-XXXX). Use this whenever the user mentions a call ID.",
      parameters: {
        type: "object",
        properties: {
          callId: { type: "string", description: "The call ID, e.g. CALL-1029" },
        },
        required: ["callId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getAgentConfig",
      description:
        "Retrieve the full configuration of a voice agent by its ID (format: AGENT-XXXX), including voice, interruption sensitivity, end-of-turn delay, handoff settings, and integrations. Use this when troubleshooting agent behavior.",
      parameters: {
        type: "object",
        properties: {
          agentId: { type: "string", description: "The agent ID, e.g. AGENT-4521" },
        },
        required: ["agentId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "checkPlanFeatures",
      description:
        "Return the features included and excluded for a given plan (Starter, Growth, or Enterprise). Use this when the user asks about pricing, plan capabilities, or whether a feature is available.",
      parameters: {
        type: "object",
        properties: {
          planName: {
            type: "string",
            description: "The plan name: Starter, Growth, or Enterprise",
          },
        },
        required: ["planName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "createSupportTicket",
      description:
        "Create a support ticket for billing issues, refunds, cancellation requests, security concerns, or unresolved technical problems that require human follow-up.",
      parameters: {
        type: "object",
        properties: {
          issueType: {
            type: "string",
            description:
              "Type of issue: billing_refund, cancellation, security, platform_issue, human_escalation, billing_dispute, general_escalation",
          },
          summary: {
            type: "string",
            description: "Brief summary of the issue (max 200 chars)",
          },
          severity: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Severity level based on urgency and impact",
          },
        },
        required: ["issueType", "summary", "severity"],
      },
    },
  },
];

function executeTool(name: string, input: Record<string, unknown>): unknown {
  switch (name) {
    case "checkCallStatus":
      return checkCallStatus(input.callId as string);
    case "getAgentConfig":
      return getAgentConfig(input.agentId as string);
    case "checkPlanFeatures":
      return checkPlanFeatures(input.planName as string);
    case "createSupportTicket":
      return createSupportTicket(input as unknown as CreateSupportTicketInput);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequest;
    const { message, history, memory } = body;

    // Retrieve relevant KB docs and inject into system prompt
    const kbDocs = retrieveDocs(message, 3);
    const kbContext =
      kbDocs.length > 0
        ? `\n\n## Relevant Knowledge Base Articles\n${kbDocs
            .map((d) => `### ${d.title}\n${d.content}`)
            .join("\n\n")}`
        : "";

    // Build conversation messages
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT + kbContext },
      ...history.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // Agentic loop: call the model, execute tools, get final response
    const toolCalls: ToolCall[] = [];
    let currentMessages = messages;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: currentMessages,
        tools: TOOLS,
      });

      const choice = response.choices[0];

      if (choice.finish_reason === "stop") {
        const reply = choice.message.content ?? "I'm sorry, I couldn't generate a response. Please try again.";

        const intent = classifyIntent(message);
        const updatedMemory = updateMemory(memory, intent, message, reply.slice(0, 100));

        const sessionId = req.headers.get("x-session-id") || `session-${Date.now()}`;
        const ticketIds = toolCalls
          .filter((t) => t.name === "createSupportTicket")
          .map((t) => {
            const o = t.output as { ticketId?: string };
            return o?.ticketId || "";
          })
          .filter(Boolean);

        saveConversationLog({
          sessionId,
          startedAt: history.length === 0 ? Date.now() : history[0]?.timestamp || Date.now(),
          messages: [
            ...history,
            { id: `msg-${Date.now()}`, role: "user", content: message, timestamp: Date.now() },
            {
              id: `msg-${Date.now() + 1}`,
              role: "assistant",
              content: reply,
              toolCalls,
              kbSources: kbDocs.map((d) => d.title),
              timestamp: Date.now() + 1,
            },
          ],
          intents: [intent],
          toolCallCount: toolCalls.length,
          ticketIds,
          handoffRequested: intent === "human_handoff_request",
        });

        const chatResponse: ChatResponse = {
          reply,
          toolCalls,
          kbSources: kbDocs.map((d) => d.title),
          kbDocs,
          updatedMemory,
          intent,
        };

        return NextResponse.json(chatResponse);
      }

      if (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
        const toolResultMessages: OpenAI.ChatCompletionToolMessageParam[] = [];

        for (const tc of choice.message.tool_calls) {
          if (tc.type !== "function") continue;
          const input = JSON.parse(tc.function.arguments) as Record<string, unknown>;
          const output = executeTool(tc.function.name, input);
          toolCalls.push({ name: tc.function.name, input, output });
          toolResultMessages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(output),
          });
        }

        currentMessages = [
          ...currentMessages,
          choice.message,
          ...toolResultMessages,
        ];
      }
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
