export interface AgentConfig {
  agentId: string;
  name: string;
  voice: string;
  interruptionSensitivity: "low" | "medium" | "high";
  endOfTurnDelayMs: number;
  handoffEnabled: boolean;
  fallbackMessage: string;
  integrations: string[];
}

export const mockAgents: Record<string, AgentConfig> = {
  "AGENT-203": {
    agentId: "AGENT-203",
    name: "Dental Office Receptionist",
    voice: "Maya",
    interruptionSensitivity: "high",
    endOfTurnDelayMs: 300,
    handoffEnabled: true,
    fallbackMessage: "Sorry, I did not get that.",
    integrations: ["HubSpot", "Webhook"],
  },
  "AGENT-101": {
    agentId: "AGENT-101",
    name: "Restaurant Reservation Agent",
    voice: "Leo",
    interruptionSensitivity: "medium",
    endOfTurnDelayMs: 900,
    handoffEnabled: true,
    fallbackMessage: "Let me connect you with our team.",
    integrations: ["Google Calendar", "Slack"],
  },
  "AGENT-302": {
    agentId: "AGENT-302",
    name: "SaaS Support Triage Agent",
    voice: "Ava",
    interruptionSensitivity: "medium",
    endOfTurnDelayMs: 800,
    handoffEnabled: false,
    fallbackMessage: "I can create a ticket for this.",
    integrations: ["Zendesk"],
  },
};
