import { SessionMemory, Intent } from "./types";

export function createInitialMemory(): SessionMemory {
  return {
    previousRecommendations: [],
  };
}

export function updateMemory(
  memory: SessionMemory,
  intent: Intent,
  issueSummary?: string,
  recommendation?: string
): SessionMemory {
  const updated: SessionMemory = { ...memory };
  updated.lastIntent = intent;

  if (issueSummary) {
    updated.lastIssueSummary = issueSummary;
  }

  if (recommendation) {
    updated.previousRecommendations = [
      ...memory.previousRecommendations.slice(-4), // keep last 5
      recommendation,
    ];
  }

  return updated;
}
