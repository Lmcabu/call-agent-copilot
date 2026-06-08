export interface PlanInfo {
  planName: string;
  features: string[];
  missing: string[];
}

export const mockPlans: Record<string, PlanInfo> = {
  starter: {
    planName: "Starter",
    features: [
      "250 monthly call minutes",
      "1 voice agent",
      "Basic setup guide",
    ],
    missing: [
      "Human handoff",
      "CRM integrations",
      "Advanced analytics",
      "SOC2 report access",
    ],
  },
  growth: {
    planName: "Growth",
    features: [
      "1000 monthly call minutes",
      "5 voice agents",
      "CRM integrations",
      "Human handoff",
      "Basic analytics",
    ],
    missing: [
      "SOC2 report access",
      "Custom data retention",
      "Dedicated support",
    ],
  },
  enterprise: {
    planName: "Enterprise",
    features: [
      "Custom call volume",
      "Unlimited voice agents",
      "Advanced analytics",
      "SOC2 report access",
      "Custom data retention",
      "Dedicated support",
    ],
    missing: [],
  },
};
