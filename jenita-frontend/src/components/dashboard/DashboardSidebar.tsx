import Link from "next/link";
import {
  Bell,
  Calendar,
  LayoutDashboard,
  Receipt,
  Settings,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { LiveVoiceWidget } from "@/components/dashboard/LiveVoiceWidget";
import { QUICK_ACTIONS, SUGGESTIONS } from "@/components/dashboard/dashboardData";
import { SectionCard } from "@/components/dashboard/SectionCard";

const NAV_ITEMS: { label: string; icon: LucideIcon; active: boolean }[] = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Calendar", icon: Calendar, active: false },
  { label: "Alerts", icon: Bell, active: false },
  { label: "Settings", icon: Settings, active: false },
];

export function DashboardSidebar() {
  return (
    <aside className="xl:sticky xl:top-24 self-start">
      <div className="bg-white rounded-2xl border border-pink-200/80 p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#828282]">Workspace</p>
        <nav className="mt-3 space-y-1">
          {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
            <Link
              key={label}
              href="#"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-pink-50 text-pink-700 border border-pink-200"
                  : "text-[#454545] hover:bg-pink-50 hover:text-pink-700"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <SectionCard title="Quick actions">
          <div className="flex flex-col gap-1">
            {QUICK_ACTIONS.map(({ label, icon }) => {
              const Icon = {
                Calendar,
                Receipt,
                Wifi,
              }[icon];

              return (
                <Link
                  key={label}
                  href="#"
                  className="flex items-center gap-2.5 text-sm text-black/80 hover:text-pink-600 py-2 px-2.5 rounded-lg hover:bg-pink-50 transition-colors"
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Voice assistant">
          <LiveVoiceWidget />
        </SectionCard>

        <SectionCard title="Suggestions">
          <ul className="flex flex-col gap-2.5">
            {SUGGESTIONS.map((s) => (
              <li key={s} className="flex items-center gap-2.5 text-sm text-[#454545]">
                <Zap size={13} className="text-pink-400 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </aside>
  );
}
