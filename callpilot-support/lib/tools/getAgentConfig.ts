import { mockAgents, AgentConfig } from "../mockData/agents";

export interface GetAgentConfigResult {
  found: boolean;
  data?: AgentConfig;
  error?: string;
}

export function getAgentConfig(agentId: string): GetAgentConfigResult {
  const record = mockAgents[agentId.toUpperCase()];
  if (!record) {
    return {
      found: false,
      error: `Agent ID ${agentId} was not found in the demo dataset.`,
    };
  }
  return { found: true, data: record };
}
