import { KBDoc } from "../agent/types";

export const kbDocs: KBDoc[] = [
  {
    id: "kb-001",
    title: "Getting Started with CallPilot AI",
    category: "Onboarding",
    content: `Welcome to CallPilot AI. To set up your first voice agent, follow these steps:

1. **Create an account** at app.callpilot.ai and verify your email.
2. **Go to Agents** in the dashboard and click "New Agent."
3. **Choose a template** (Receptionist, Appointment Booking, Lead Qualification, or Custom).
4. **Configure your agent**: Set the agent name, select a voice, write your system prompt, and define the conversation flow.
5. **Set up your phone number**: Purchase or bring your own number in the Phone Numbers section.
6. **Connect integrations**: Link your CRM, calendar, or webhook in the Integrations tab.
7. **Test your agent**: Use the built-in Test Call feature to simulate an inbound call.
8. **Go live**: Enable the agent and point your phone number to it.

Tips:
- Keep your system prompt concise and focused on the agent's role.
- Start with a template and iterate.
- Use the test call feature before going live.`,
    keywords: ["setup", "getting started", "first agent", "create agent", "onboarding", "new agent", "configure"],
  },
  {
    id: "kb-002",
    title: "Voice Agent Configuration",
    category: "Configuration",
    content: `CallPilot voice agents are highly configurable. Key settings include:

**Voice & Personality**
- Voice: Choose from 12 voices (Maya, Leo, Ava, etc.) across different accents and genders.
- Speaking rate: Adjust how fast the agent speaks (0.8x–1.4x).
- System prompt: The core instructions for your agent's behavior and personality.

**Turn-Taking Settings**
- End-of-turn delay: How long the agent waits after the caller stops speaking before responding (default: 700ms). Lower values feel more responsive; higher values reduce false triggers.
- Interruption sensitivity: Controls how easily callers can interrupt the agent. High sensitivity allows quick interruptions; low sensitivity prevents accidental cutoffs.

**Fallback Behavior**
- Fallback message: What the agent says when it doesn't understand the caller.
- Max retries: Number of times the agent re-prompts before escalating.
- Escalation target: Where to route the call after max retries.

**Human Handoff**
- Enable/disable handoff globally.
- Set handoff trigger phrases (e.g., "speak to a human").
- Configure handoff destination (phone number or SIP address).
- Set fallback if handoff destination is unavailable.

**Integrations**
- Webhook: Send call events and transcripts to your server.
- CRM: Sync caller data to HubSpot, Salesforce, or Zoho.
- Calendar: Book appointments via Google Calendar or Calendly.`,
    keywords: ["configuration", "voice", "settings", "turn", "interruption", "fallback", "handoff", "configure", "system prompt"],
  },
  {
    id: "kb-003",
    title: "Latency Troubleshooting",
    category: "Troubleshooting",
    content: `High latency can cause awkward pauses in voice conversations. Here is how to diagnose and fix it.

**Symptoms**
- Long pauses before agent responds (> 1500ms feels unnatural).
- Callers hanging up before the agent replies.
- Call logs showing high latencyMs values.

**Common Causes and Fixes**

1. **Webhook latency**: If your agent calls a webhook for data, slow server response times add to overall latency.
   - Fix: Optimize your webhook endpoint. Target < 300ms response time.
   - Fix: Enable caching for frequently requested data.
   - Fix: Check your server's geographic region — place it close to the caller region.

2. **LLM response time**: The AI model takes time to generate a reply.
   - Fix: Shorten your system prompt. Fewer tokens = faster inference.
   - Fix: Use simpler conversation flows with pre-defined responses for common paths.

3. **High end-of-turn delay**: A high endOfTurnDelayMs adds perceived latency.
   - Fix: Lower the end-of-turn delay to 400–600ms for more responsive feel.
   - Warning: Too low (< 300ms) may cause the agent to cut off callers.

4. **TTS generation**: Text-to-speech synthesis adds time.
   - Fix: Use shorter sentences in your agent responses.

**Diagnosis Steps**
1. Check call logs for latencyMs values.
2. If latencyMs > 2000ms, check webhook response times first.
3. Review your system prompt length.
4. Test with a minimal agent config to isolate the variable.`,
    keywords: ["latency", "slow", "delay", "pause", "response time", "webhook", "performance", "lag"],
  },
  {
    id: "kb-004",
    title: "Interruption Handling",
    category: "Configuration",
    content: `Interruption handling controls how your agent responds when a caller speaks while the agent is talking.

**Settings**
- **High sensitivity**: Agent stops speaking almost immediately when the caller speaks. Best for conversational, back-and-forth interactions.
- **Medium sensitivity**: Agent pauses after a short delay. Balances responsiveness with stability.
- **Low sensitivity**: Agent finishes its sentence before yielding. Best for structured scripts where you don't want background noise to trigger interruptions.

**Common Issues**

*Agent keeps interrupting callers*
- The agent is cutting off callers before they finish speaking.
- Cause: End-of-turn delay is too low (< 400ms) — the agent thinks the caller is done.
- Fix: Increase endOfTurnDelayMs to 700–1000ms.
- Fix: If using high interruption sensitivity, consider switching to medium.

*Callers cannot interrupt the agent*
- The agent keeps talking even when the caller speaks.
- Cause: Interruption sensitivity is set to low.
- Fix: Switch interruption sensitivity to medium or high.
- Fix: Check if "barge-in" is enabled in your agent settings.

*Background noise causing false interruptions*
- Noise in the caller's environment is triggering interruptions.
- Fix: Enable noise suppression in the audio settings.
- Fix: Raise the interruption sensitivity threshold.

**Recommended Settings**
- Receptionist agents: High sensitivity, 500ms end-of-turn delay.
- Information delivery agents: Low sensitivity, 800ms end-of-turn delay.
- Lead qualification: Medium sensitivity, 700ms end-of-turn delay.`,
    keywords: ["interruption", "barge-in", "sensitivity", "cut off", "interrupt", "speaking", "end of turn", "delay"],
  },
  {
    id: "kb-005",
    title: "Human Handoff",
    category: "Configuration",
    content: `Human handoff allows your voice agent to transfer a call to a live person when needed.

**How It Works**
1. The caller says a trigger phrase (e.g., "talk to a human", "speak to someone").
2. The agent acknowledges and initiates a call transfer.
3. The call is routed to your configured handoff destination (phone number or SIP).
4. If the destination is unavailable, the fallback behavior activates.

**Setup**
1. Go to Agent Settings > Handoff.
2. Enable "Human Handoff."
3. Enter the handoff phone number or SIP address.
4. Set trigger phrases.
5. Configure fallback: voicemail, callback request, or ticket creation.

**Troubleshooting Handoff Issues**

*Handoff destination unavailable*
- Error: "Human handoff destination unavailable"
- Fix: Verify the handoff phone number is correct and the line is active.
- Fix: Check your business hours settings — handoff may be restricted outside hours.
- Fix: Add a fallback route (secondary number or voicemail).

*Caller is stuck after requesting handoff*
- The agent acknowledged handoff but the call did not transfer.
- Fix: Check if "handoffEnabled" is true in your agent config.
- Fix: Verify your telephony provider supports call transfer (SIP REFER or bridge transfer).

**Plan Requirements**
Human handoff is available on Growth and Enterprise plans. Starter plan does not include this feature.`,
    keywords: ["handoff", "human", "transfer", "live agent", "escalate", "destination", "routing", "barge"],
  },
  {
    id: "kb-006",
    title: "Integrations",
    category: "Integrations",
    content: `CallPilot supports integrations with popular business tools.

**CRM Integrations**
- **HubSpot**: Sync caller contact data, log call activities, and trigger workflows. Go to Integrations > HubSpot > Connect and authorize.
- **Salesforce**: Create leads and log calls. Available on Growth and Enterprise.
- **Zoho CRM**: Contact sync and call logging.

**Calendar Integrations**
- **Google Calendar**: Let your agent book appointments directly. Connect via Integrations > Google Calendar.
- **Calendly**: Use your Calendly link for appointment booking. The agent can check availability and confirm slots.

**Communication**
- **Slack**: Receive call summaries and alerts in a Slack channel.

**Help Desk**
- **Zendesk**: Create support tickets from call outcomes.

**Custom Webhooks**
- Send call events (started, ended, handoff, transcript) to any HTTPS endpoint.
- Configure in Integrations > Webhooks.
- Events: call.started, call.ended, call.handoff, call.transcript.
- Response must be < 300ms to avoid latency issues.

**Connecting an Integration**
1. Go to your Agent settings > Integrations tab.
2. Click "Add Integration."
3. Select the service and follow the OAuth or API key flow.
4. Map the data fields as needed.
5. Test with a test call.

**Common Integration Issues**
- OAuth token expired: Re-authorize the integration.
- Webhook 4xx errors: Check your endpoint URL and authentication headers.
- Data not syncing: Confirm the correct agent is linked to the integration.`,
    keywords: ["integration", "HubSpot", "Salesforce", "Slack", "Zendesk", "webhook", "Google Calendar", "Calendly", "CRM", "connect"],
  },
  {
    id: "kb-007",
    title: "Pricing and Plans",
    category: "Billing",
    content: `CallPilot AI offers three plans designed for different business sizes.

**Starter Plan**
- Price: $49/month
- Includes: 250 call minutes/month, 1 voice agent, basic setup guide
- Not included: Human handoff, CRM integrations, advanced analytics, SOC2 report access
- Best for: Solo operators and small businesses just getting started.

**Growth Plan**
- Price: $199/month
- Includes: 1,000 call minutes/month, 5 voice agents, CRM integrations (HubSpot, Salesforce), human handoff, basic analytics
- Not included: SOC2 report access, custom data retention, dedicated support
- Best for: Growing businesses with multiple locations or team members.

**Enterprise Plan**
- Price: Custom (contact sales)
- Includes: Custom call volume, unlimited voice agents, advanced analytics, SOC2 report access, custom data retention, dedicated support
- Not included: Nothing — all features included.
- Best for: Large organizations with compliance, security, or volume requirements.

**Overage**
- Minutes beyond plan limit are billed at $0.08/minute (Starter/Growth) or custom rate (Enterprise).

**Annual Discount**
- Pay annually and save 20% on Starter and Growth plans.

**Free Trial**
- 14-day free trial on Starter and Growth. No credit card required.
- Enterprise: Contact sales for a proof-of-concept engagement.`,
    keywords: ["pricing", "plan", "starter", "growth", "enterprise", "cost", "price", "features", "minutes", "billing"],
  },
  {
    id: "kb-008",
    title: "Security and Compliance",
    category: "Security",
    content: `CallPilot AI is designed with enterprise-grade security and privacy in mind.

**Data Security**
- All data is encrypted in transit (TLS 1.3) and at rest (AES-256).
- Call recordings and transcripts are stored in isolated, tenant-specific buckets.
- API keys are hashed and never stored in plaintext.

**Compliance**
- SOC 2 Type II: CallPilot is SOC 2 Type II certified. Reports available to Enterprise customers under NDA.
- HIPAA: Not currently HIPAA certified. Do not use CallPilot for PHI (protected health information) unless your Enterprise contract includes a BAA.
- GDPR: CallPilot supports GDPR compliance for EU customers, including data residency options (EU-West region) and data subject access requests.

**Data Retention**
- Default: Call transcripts and recordings retained for 90 days.
- Growth: 90 days (default).
- Enterprise: Custom retention policies (1 day–7 years).
- Data deletion requests are processed within 30 days.

**Access Control**
- Role-based access control (RBAC): Admin, Editor, Viewer roles.
- Two-factor authentication (2FA) available for all accounts.
- Audit logs available on Enterprise.

**Penetration Testing**
- CallPilot undergoes annual third-party penetration testing.
- Results are available to Enterprise customers under NDA.

**Reporting a Security Issue**
- Email security@callpilot.ai for responsible disclosure.
- Do not share vulnerability details publicly before coordination.`,
    keywords: ["security", "compliance", "SOC2", "HIPAA", "GDPR", "encryption", "privacy", "data", "retention", "audit"],
  },
  {
    id: "kb-009",
    title: "Billing and Refunds",
    category: "Billing",
    content: `Information about billing, invoices, and refund policies.

**Billing Cycle**
- Subscriptions are billed monthly on the anniversary of your signup date.
- Annual plans are billed upfront for the full year.
- Invoices are emailed to the billing contact and available in Settings > Billing.

**Payment Methods**
- Credit/debit cards (Visa, Mastercard, Amex) via Stripe.
- ACH bank transfer available for Enterprise annual plans.
- Invoicing (net-30) available for Enterprise customers.

**Refund Policy**
- Free trial: No charges during the 14-day trial. Cancel anytime.
- Monthly subscriptions: No refunds for partial months. Cancel before next billing date to avoid the next charge.
- Annual subscriptions: Refunds are handled case-by-case. Contact support within 30 days of payment for consideration.
- Overages: Overage charges are non-refundable unless due to a verified platform error.

**Cancellations**
- Cancel anytime in Settings > Billing > Cancel Plan.
- Access continues until the end of the current billing period.
- Data is retained for 30 days after cancellation, then deleted.

**Billing Disputes**
- For billing disputes or suspected incorrect charges, contact billing@callpilot.ai.
- Our team will review within 2 business days.
- For urgent billing issues, open a high-severity support ticket.

**Upgrading or Downgrading**
- Upgrades take effect immediately (prorated).
- Downgrades take effect at the next billing cycle.`,
    keywords: ["billing", "refund", "invoice", "cancel", "cancellation", "charge", "payment", "subscription", "money", "dispute"],
  },
];
