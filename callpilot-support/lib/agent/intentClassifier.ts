import { Intent } from "./types";

const intentPatterns: Array<{ intent: Intent; patterns: RegExp[] }> = [
  {
    intent: "human_handoff_request",
    patterns: [
      /speak.*(human|person|agent|someone|representative)/i,
      /talk.*(human|person|agent|someone|representative)/i,
      /connect me.*(human|person|agent)/i,
      /live (agent|person|support|human)/i,
      /real person/i,
      /transfer me/i,
    ],
  },
  {
    intent: "call_debugging",
    patterns: [
      /CALL-\d+/i,
      /call (failed|dropped|error|issue|problem)/i,
      /why did (my|the) call/i,
      /call not working/i,
      /check (the |my )?call/i,
    ],
  },
  {
    intent: "latency_issue",
    patterns: [
      /latency/i,
      /slow response/i,
      /long pause/i,
      /too slow/i,
      /delay/i,
      /response time/i,
    ],
  },
  {
    intent: "interruption_issue",
    patterns: [
      /interrupt/i,
      /cut(ting)? off/i,
      /barge.?in/i,
      /talking over/i,
      /not let(ting)? (me|caller|customer)/i,
      /keeps? (talking|speaking|going)/i,
    ],
  },
  {
    intent: "handoff_issue",
    patterns: [
      /handoff (not working|fail|issue|problem)/i,
      /transfer (fail|not working|issue)/i,
      /human handoff/i,
      /handoff destination/i,
    ],
  },
  {
    intent: "billing_question",
    patterns: [
      /refund/i,
      /cancel(lation)?/i,
      /billing/i,
      /invoice/i,
      /charge/i,
      /payment/i,
      /subscription/i,
      /overage/i,
      /credit/i,
    ],
  },
  {
    intent: "integration_question",
    patterns: [
      /integrat/i,
      /hubspot/i,
      /salesforce/i,
      /slack/i,
      /zendesk/i,
      /webhook/i,
      /google calendar/i,
      /calendly/i,
      /connect (to|with)/i,
      /crm/i,
    ],
  },
  {
    intent: "security_or_compliance",
    patterns: [
      /security/i,
      /compliance/i,
      /soc2/i,
      /hipaa/i,
      /gdpr/i,
      /data retention/i,
      /encryption/i,
      /privacy/i,
    ],
  },
  {
    intent: "billing_question",
    patterns: [
      /pricing/i,
      /price/i,
      /plan/i,
      /starter/i,
      /growth/i,
      /enterprise/i,
      /features/i,
      /cost/i,
      /tier/i,
    ],
  },
  {
    intent: "setup_help",
    patterns: [
      /set ?up/i,
      /getting started/i,
      /first (agent|voice agent)/i,
      /create (an?|my) agent/i,
      /configure/i,
      /onboard/i,
    ],
  },
  {
    intent: "bug_report",
    patterns: [
      /bug/i,
      /broken/i,
      /outage/i,
      /down/i,
      /not working/i,
      /error/i,
    ],
  },
];

export function classifyIntent(message: string): Intent {
  for (const { intent, patterns } of intentPatterns) {
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        return intent;
      }
    }
  }
  return "general_question";
}
