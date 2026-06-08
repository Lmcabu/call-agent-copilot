import { mockCalls, CallRecord } from "../mockData/calls";

export interface CheckCallStatusResult {
  found: boolean;
  data?: CallRecord;
  error?: string;
}

export function checkCallStatus(callId: string): CheckCallStatusResult {
  const record = mockCalls[callId.toUpperCase()];
  if (!record) {
    return {
      found: false,
      error: `Call ID ${callId} was not found in the demo dataset.`,
    };
  }
  return { found: true, data: record };
}
