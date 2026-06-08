"use client";

interface SourceBadgeProps {
  title: string;
}

export default function SourceBadge({ title }: SourceBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      <span>📄</span>
      <span>Source: {title}</span>
    </span>
  );
}
