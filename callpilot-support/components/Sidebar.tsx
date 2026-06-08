"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const capabilities = [
  { icon: "📞", label: "Call diagnostics" },
  { icon: "⚙️", label: "Agent configuration" },
  { icon: "💳", label: "Plan & billing support" },
  { icon: "🔗", label: "Integration setup" },
  { icon: "🔒", label: "Security & compliance" },
  { icon: "🎫", label: "Ticket escalation" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[264px] flex-shrink-0 bg-[#1C1710] text-white flex flex-col h-full overflow-y-auto border-r border-white/5">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-[8px] bg-[#8B6F47] flex items-center justify-center shadow-lg shadow-[#8B6F47]/30 flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
              className="w-[18px] h-[18px] text-white">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-none tracking-tight">CallPilot AI</p>
            <p className="text-[11px] text-[#9C8B7A] mt-0.5">Support Center</p>
          </div>
          <ThemeToggle variant="icon" />
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] bg-white/5 border border-white/10 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="text-[11px] text-[#9C8B7A] font-medium">Agent online</span>
        </div>
      </div>

      {/* Account context */}
      <div className="px-4 pb-4 border-b border-white/5">
        <div className="bg-white/5 border border-white/[0.06] rounded-[10px] p-3.5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-[8px] bg-[#8B6F47]/20 border border-[#8B6F47]/20 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-[#C4A06A]">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate tracking-tight">Northstar Dental</p>
              <p className="text-[10px] text-[#7A6A5A]">Customer workspace</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {[
              { k: "Plan", v: "Growth" },
              { k: "Tier", v: "Standard" },
            ].map(({ k, v }) => (
              <div key={k}>
                <p className="text-[10px] text-[#7A6A5A]">{k}</p>
                <p className="text-[11px] font-semibold text-[#D4C9BC]">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-4 py-4 border-b border-white/5">
        {[
          {
            href: "/",
            label: "Support Chat",
            icon: (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd"
                  d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd" />
              </svg>
            ),
          },
          {
            href: "/admin",
            label: "Admin Panel",
            icon: (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd" />
              </svg>
            ),
          },
        ].map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all mt-1 ${
                active
                  ? "bg-[#8B6F47] text-white shadow-md shadow-[#1C1710]/60"
                  : "text-[#9C8B7A] hover:text-white hover:bg-white/5"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Capabilities */}
      <div className="px-5 py-5 mt-auto">
        <p className="text-[10px] font-semibold text-[#4A3E30] uppercase tracking-widest mb-3.5">
          Capabilities
        </p>
        <ul className="space-y-2.5">
          {capabilities.map((c) => (
            <li key={c.label} className="flex items-center gap-2.5 text-[12px] text-[#7A6A5A]">
              <span className="text-[14px] leading-none flex-shrink-0">{c.icon}</span>
              <span>{c.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/5">
        <p className="text-[10px] text-[#3A2F24] text-center">
          Demo environment · No real data
        </p>
      </div>
    </aside>
  );
}
