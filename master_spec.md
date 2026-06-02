# SPEC.md — CallPilot AI Support Agent

## 0. Assignment Interpretation

This project is a working prototype of a customer-facing AI support agent for a fictional AI voice-agent SaaS product called **CallPilot AI**.

The assignment asks us to build an AI-powered customer support agent for a product/business/service of our choice. The agent must:
- Provide a web-based chat interface.
- Answer customer questions using a knowledge base.
- Have a clear persona, tone, and behavioral instructions.
- Handle unknown or unsupported situations gracefully.
- Demonstrate product thinking, technical execution, communication clarity, and creativity.

This project intentionally focuses on a **customer-facing support agent**, not an internal support copilot.

---

# 1. Product Context

## 1.1 Product Name

**CallPilot AI**

## 1.2 Product Description

CallPilot AI is a fictional SaaS platform that allows businesses to create AI voice agents for customer calls.

Businesses can use CallPilot AI to:
- Answer inbound customer questions.
- Qualify sales leads.
- Book appointments.
- Collect intake information.
- Escalate calls to human staff.
- Integrate voice agents with CRM and support tools.

## 1.3 Support Agent Name

**CallPilot Support Agent**

## 1.4 What the Support Agent Does

CallPilot Support Agent helps business users troubleshoot and operate their AI voice agents.

It can:
- Answer setup and product questions from a knowledge base.
- Explain how to configure AI voice agents.
- Troubleshoot latency, failed calls, interruption behavior, and handoff issues.
- Use mock tools to check call status, inspect agent configuration, check plan features, and create support tickets.
- Ask clarifying questions when the user’s issue is ambiguous.
- Escalate billing, security, legal, account-specific, or unresolved issues to a human support team.

---

# 2. User Personas

## 2.1 Small Business Owner

Example:
- Owns a dental clinic, salon, restaurant, or local service business.
- Wants to set up an AI receptionist.
- Needs simple, non-technical guidance.

Common questions:
- "How do I set up my first voice agent?"
- "Can the AI book appointments?"
- "How do I transfer calls to a human?"

## 2.2 Customer Support Manager

Example:
- Manages call center operations.
- Wants to reduce call volume and improve customer experience.

Common questions:
- "Why are calls failing?"
- "How do I make the AI stop interrupting customers?"
- "How do I route angry customers to humans?"

## 2.3 Developer / Technical Admin

Example:
- Configures webhooks, APIs, CRM integrations, and agent behavior.

Common questions:
- "Why did CALL-1029 fail?"
- "Does CallPilot support HubSpot?"
- "How do I configure webhook retries?"
- "Can I check AGENT-203's configuration?"

---

# 3. Core User Experience

## 3.1 Primary User Journey

1. User opens the CallPilot Support Agent chat interface.
2. User asks a question or describes a problem.
3. Agent identifies the intent.
4. Agent retrieves relevant knowledge base content.
5. Agent decides whether a mock tool is needed.
6. If necessary, agent asks a clarifying question.
7. Agent gives a clear answer with steps, evidence, or tool results.
8. Agent offers a next action.
9. If the issue is sensitive, unresolved, or account-specific, agent offers human handoff.

## 3.2 Example Conversation 1 — Knowledge Base Answer

User:
> How do I set up my first voice agent?

Agent:
> To set up your first CallPilot voice agent, start by creating a new agent, choosing a voice, writing its instructions, configuring human handoff, testing with a sample call, and then publishing it. I recommend testing at least three realistic call scenarios before going live.

Agent may include:
- Step-by-step checklist.
- Link-like references to KB sections.
- Follow-up question: "What type of business are you setting this up for?"

## 3.3 Example Conversation 2 — Tool Calling

User:
> Can you check why CALL-1029 failed?

Agent behavior:
- Detects call ID.
- Calls `checkCallStatus("CALL-1029")`.
- Returns specific mock result.

Agent:
> I checked CALL-1029. The call failed because the webhook timed out after 4.2 seconds. This usually happens when the connected endpoint takes too long to respond. I recommend checking the webhook server response time, enabling retries, or temporarily disabling the webhook to confirm the root cause.

## 3.4 Example Conversation 3 — Multi-Turn Troubleshooting

User:
> My agent keeps interrupting customers.

Agent:
> I can help troubleshoot that. Which agent ID is this happening with?

User:
> AGENT-203.

Agent behavior:
- Calls `getAgentConfig("AGENT-203")`.
- Finds interruption sensitivity high and end-of-turn delay too low.

Agent:
> I found two likely causes in AGENT-203's configuration: interruption sensitivity is set to high, and end-of-turn delay is only 300ms. I recommend changing sensitivity to medium and increasing end-of-turn delay to around 900ms. That gives callers more time to finish speaking before the AI responds.

## 3.5 Example Conversation 4 — Graceful Handoff

User:
> I want a refund. Your product broke our customer calls.

Agent:
> I’m sorry that happened. I can summarize the billing policy and create a support ticket, but I cannot issue refunds directly from chat. I’ll include the call reliability concern and mark it as billing-impacting so the support team can review it.

Agent behavior:
- Calls `createSupportTicket`.
- Returns ticket ID.

---

# 4. Agentic Behavior Design

## 4.1 Agent Loop

The agent should follow this loop:

```text
Receive user message
↓
Update session memory
↓
Classify intent
↓
Retrieve relevant KB docs
↓
Check whether tool is needed
↓
If missing required info, ask a clarifying question
↓
Call mock tool if appropriate
↓
Generate final response using:
  - user message
  - chat history
  - retrieved KB snippets
  - tool results
  - system instructions
↓
Offer next step or escalation
↓
Log conversation event