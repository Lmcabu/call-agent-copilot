"use client";

const toolColors: Record<string, string> = {
  checkCallStatus: "bg-blue-100 text-blue-800 border-blue-200",
  getAgentConfig: "bg-purple-100 text-purple-800 border-purple-200",
  checkPlanFeatures: "bg-green-100 text-green-800 border-green-200",
  createSupportTicket: "bg-orange-100 text-orange-800 border-orange-200",
};

const toolIcons: Record<string, string> = {
  checkCallStatus: "📞",
  getAgentConfig: "⚙️",
  checkPlanFeatures: "📋",
  createSupportTicket: "🎫",
};

interface ToolBadgeProps {
  toolName: string;
}

export default function ToolBadge({ toolName }: ToolBadgeProps) {
  const colorClass =
    toolColors[toolName] || "bg-gray-100 text-gray-800 border-gray-200";
  const icon = toolIcons[toolName] || "🔧";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
    >
      <span>{icon}</span>
      <span>Tool: {toolName}</span>
    </span>
  );
}
