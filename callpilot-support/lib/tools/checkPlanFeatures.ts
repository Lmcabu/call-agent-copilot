import { mockPlans, PlanInfo } from "../mockData/plans";

export interface CheckPlanFeaturesResult {
  found: boolean;
  data?: PlanInfo;
  error?: string;
}

export function checkPlanFeatures(planName: string): CheckPlanFeaturesResult {
  const key = planName.toLowerCase();
  const record = mockPlans[key];
  if (!record) {
    return {
      found: false,
      error: `Plan "${planName}" not recognized. Available plans: Starter, Growth, Enterprise.`,
    };
  }
  return { found: true, data: record };
}
