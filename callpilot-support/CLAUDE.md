@AGENTS.md
# CLAUDE.md — CallPilot Support Agent

## Project Context

This is a take-home assignment for an Agentic Engineer role.

We are building a working customer-facing AI support agent for a fictional AI voice-agent SaaS called **CallPilot AI**.

The product is NOT a real voice-calling system.  
The deliverable is a **customer support agent** that helps CallPilot customers troubleshoot and configure their AI voice agents.

The agent should feel like a realistic B2B SaaS support experience, not a generic AI chatbot demo.

## Core Assignment Requirements

The project must include:

1. A business/product context.
2. A web-based chat UI.
3. A knowledge base that the agent retrieves from.
4. Clear agent persona, tone, and behavior rules.
5. Graceful boundaries when the agent cannot answer.
6. README with setup instructions, tech stack, decisions, what was built, and next steps.
7. Demo-ready UX for a 3–5 minute walkthrough.

Optional but strongly preferred:

- Mock tool calling.
- Conversation memory.
- Multi-turn reasoning.
- Human handoff / ticket creation.
- Admin/config view.
- Analytics or logging.
- Mobile-friendly design.

## Product Context

Product: **CallPilot AI**

CallPilot AI helps businesses create AI voice agents for customer phone calls.

Example use cases:
- Answer inbound calls.
- Qualify leads.
- Book appointments.
- Collect intake information.
- Transfer calls to humans.
- Integrate with CRM and support tools.

Support agent: **CallPilot Support Agent**

It helps customers:
- Set up voice agents.
- Diagnose failed calls.
- Tune interruption / latency behavior.
- Check mock call status.
- Review mock agent configuration.
- Compare plan features.
- Understand integrations.
- Create support tickets for sensitive or unresolved issues.

## Important Positioning

This is a **customer-facing support agent**, not an internal support copilot.

Correct:
> A customer asks the CallPilot Support Agent for help.

Incorrect:
> A human support rep uses an internal copilot to answer customers.

## Tech Stack

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Next.js API routes for backend logic
- Local mock data
- In-memory/session state
- Optional LLM support using `OPENAI_API_KEY`

Do NOT add:

- Separate Express backend
- FastAPI backend
- Database
- Required external services
- Required API key for the MVP

The app must run with:

```bash
npm install
npm run dev