# CallPilot Support Agent

A customer-facing AI support agent for **CallPilot AI** — a fictional B2B SaaS platform that lets businesses deploy AI voice agents for inbound phone calls. Built as a take-home assignment for an Agentic Engineer role.

The support agent helps CallPilot customers troubleshoot voice agents, diagnose failed calls, compare plan features, and escalate issues — all through a polished chat interface backed by GPT-4o with real tool calling.

---

## Demo Scenarios

Try these prompts to see the agent in action:

| Scenario | Example Prompt |
|---|---|
| Call debugging | `"Why did CALL-1029 fail?"` |
| Agent config review | `"Check the config for AGENT-4521"` |
| Interruption tuning | `"My agent keeps cutting off callers"` |
| Plan comparison | `"What's included in the Growth plan?"` |
| Human escalation | `"I want to speak to a real person"` |

---

## Features

- **GPT-4o powered chat** with a system prompt defining the CallPilot support persona
- **Agentic tool loop** — the model decides when to call tools and loops until it has a final answer
- **4 mock tools** wired into OpenAI function calling:
  - `checkCallStatus` — look up call status, failure reason, and latency by call ID
  - `getAgentConfig` — retrieve full agent configuration by agent ID
  - `checkPlanFeatures` — compare Starter / Growth / Enterprise plan features
  - `createSupportTicket` — create a ticket for billing, security, or unresolved issues
- **Knowledge base retrieval** — 9 KB articles with keyword scoring, injected into the system prompt per turn
- **Session memory** — customer name, company, active call/agent IDs, and last issue context carried across turns
- **Intent classification** — regex-based classifier for 11 intent types used for analytics
- **Admin panel** at `/admin` — live conversation logs, tool usage stats, ticket tracking, and KB/tool reference
- **Light / dark mode** toggle
- **Suggested prompts** to guide new users

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| LLM | OpenAI GPT-4o via `openai` SDK |
| State | React `useState` (client-side session memory) |
| Storage | In-memory (no database required) |

---

## Project Structure

```
callpilot-support/
├── app/
│   ├── page.tsx                  # Chat UI entry point
│   ├── admin/page.tsx            # Admin dashboard
│   └── api/
│       ├── chat/route.ts         # Main agentic loop — LLM + tool execution
│       ├── admin/route.ts        # Admin data endpoint
│       └── tts/route.ts          # (Optional) text-to-speech endpoint
├── components/
│   ├── ChatPage.tsx              # Top-level chat layout
│   ├── ChatWindow.tsx            # Message list
│   ├── ChatInput.tsx             # Input bar
│   ├── MessageBubble.tsx         # Per-message rendering
│   ├── SuggestedPrompts.tsx      # Starter prompt chips
│   ├── ToolBadge.tsx             # Tool call display
│   ├── SourceBadge.tsx           # KB source display
│   ├── Sidebar.tsx               # Navigation sidebar
│   ├── ThemeProvider.tsx         # Dark/light mode context
│   └── ThemeToggle.tsx           # Theme toggle button
├── lib/
│   ├── agent/
│   │   ├── types.ts              # Shared types (Intent, Message, ToolCall, etc.)
│   │   ├── intentClassifier.ts   # Regex intent classifier (11 intent types)
│   │   ├── memory.ts             # Session memory updater
│   │   ├── systemPrompt.ts       # GPT-4o system prompt
│   │   └── toolRouter.ts         # Deterministic tool router (fallback)
│   ├── kb/
│   │   ├── docs.ts               # 9 knowledge base articles
│   │   └── retriever.ts          # Keyword-scored KB retrieval
│   ├── tools/
│   │   ├── checkCallStatus.ts
│   │   ├── getAgentConfig.ts
│   │   ├── checkPlanFeatures.ts
│   │   └── createSupportTicket.ts
│   ├── mockData/
│   │   ├── calls.ts              # Mock call records
│   │   ├── agents.ts             # Mock agent configs
│   │   └── plans.ts              # Mock plan definitions
│   └── logging/
│       ├── conversationStore.ts  # In-memory conversation log (seeded with demo data)
│       └── analytics.ts          # Analytics aggregation
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- An OpenAI API key with access to `gpt-4o`

### Setup

```bash
cd callpilot-support
npm install
```

Create a `.env.local` file in the `callpilot-support` directory:

```env
OPENAI_API_KEY=sk-...
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the chat interface.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

### Build

```bash
npm run build
```

---

## How It Works

### Request Flow

```
User message
  -> KB retrieval (top 3 docs by keyword score, injected into system prompt)
  -> OpenAI chat completion (GPT-4o + 4 tool definitions)
  -> Tool loop: if model calls a tool, execute it and feed result back
  -> Final response returned with tool calls, KB sources, and updated memory
  -> Conversation logged to in-memory store
```

### Tool Calling

Tools are defined as OpenAI function schemas in `app/api/chat/route.ts`. The model decides autonomously when to call them. The agentic loop continues until `finish_reason === "stop"`, at which point the final reply is returned.

### Knowledge Base

The KB retriever scores each of the 9 articles against the user message using keyword overlap. The top 3 scoring docs are appended to the system prompt as context before each LLM call. Each response in the UI shows which KB articles were referenced.

### Session Memory

Memory is a plain object held in React state and passed in every request body. The server reads it for context, updates it (extracting call IDs, agent IDs, customer names from the conversation), and returns `updatedMemory` with each response. No server-side session storage required.

---

## Design Decisions

**GPT-4o with real tool calling** — The agentic loop with LLM-driven tool decisions produces more natural and contextually appropriate responses than a deterministic router. The model can chain tools (e.g., check a call, then look up the associated agent config) when it determines that's what the user needs.

**No database required** — All state is in-memory to keep setup to a single `npm install` + API key. The conversation store is seeded with demo data so the admin panel is useful from the first load.

**KB injection per turn** — Rather than a vector DB, a lightweight keyword scorer retrieves relevant articles. It's fast, transparent, and sufficient for a bounded support domain.

**Session memory in request body** — Avoids server-side session storage. The client holds memory state and sends it with each request, keeping the backend stateless and horizontally scalable.

**Graceful escalation boundaries** — The system prompt instructs the agent to redirect billing, security, and unresolved issues to `createSupportTicket` rather than attempting to answer, matching real B2B SaaS support behavior.

---

## Next Steps

- **Streaming responses** — Use `stream: true` with the OpenAI SDK to stream tokens incrementally and improve perceived latency.
- **Persistent storage** — Swap the in-memory store for Postgres or Redis to support multi-instance deployments and session recovery.
- **Vector search KB** — Replace keyword scoring with embeddings for better retrieval on paraphrased or semantically similar queries.
- **Admin authentication** — Add middleware auth to the `/admin` route before any production use.
- **Real phone integration** — Connect to Twilio or a SIP provider to make this a real support channel.
- **Evaluation harness** — Build a golden Q&A test set to regression-test agent behavior across prompt changes.
