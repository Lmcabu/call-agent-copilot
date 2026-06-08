"use client";

const prompts = [
  { label: "How do I set up my first voice agent?", icon: "🚀" },
  { label: "Can you check why CALL-1029 failed?", icon: "📞" },
  { label: "My agent keeps interrupting customers.", icon: "🔇" },
  { label: "Does the Growth plan support human handoff?", icon: "📋" },
  { label: "How do I connect HubSpot?", icon: "🔗" },
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export default function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center px-4">
      {prompts.map((p) => (
        <button
          key={p.label}
          onClick={() => onSelect(p.label)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors shadow-sm"
        >
          <span>{p.icon}</span>
          <span>{p.label}</span>
        </button>
      ))}
    </div>
  );
}
