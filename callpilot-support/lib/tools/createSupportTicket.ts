export interface CreateSupportTicketInput {
  issueType: string;
  summary: string;
  severity: "low" | "medium" | "high";
  customerEmail?: string;
}

export interface CreateSupportTicketResult {
  ticketId: string;
  status: "created";
  priority: "low" | "medium" | "high";
  nextStep: string;
}

function generateTicketId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `TICKET-${num}`;
}

export function createSupportTicket(
  input: CreateSupportTicketInput
): CreateSupportTicketResult {
  const ticketId = generateTicketId();
  const nextStepMap: Record<string, string> = {
    high: "Our team will contact you within 1 business hour.",
    medium: "Our team will follow up within 4 business hours.",
    low: "Our team will respond within 1 business day.",
  };

  return {
    ticketId,
    status: "created",
    priority: input.severity,
    nextStep: nextStepMap[input.severity],
  };
}
