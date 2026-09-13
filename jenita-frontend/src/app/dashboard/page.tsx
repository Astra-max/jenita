"use client";

import { CalendarCheck, Mail, Sparkles, Clock } from "lucide-react";
import { AgendaList } from "@/components/dashboard/AgendaList";
import { LiveVoiceWidget } from "@/components/dashboard/LiveVoiceWidget";
import { ReminderEscalationCard } from "@/components/dashboard/ReminderEscalationCard";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { stats, refresh } = useTasks();
  const { user } = useAuth();

  const userName = user?.full_name?.split(" ")[0] || "Sarah";

  const glanceCards = [
    {
      icon: CalendarCheck,
      label: "Tasks completed",
      value: stats ? `${stats.completed_count} of ${stats.total_count}` : "2 of 5",
    },
    {
      icon: Sparkles,
      label: "Focus time left",
      value: stats?.focus_hours_left || "3.5 hrs",
    },
    {
      icon: Clock,
      label: "Next scheduled",
      value: stats ? `${stats.next_reminder_time}` : "2:00 PM",
    },
  ];

  return (
    <div className="bg-bloom-50 py-10 md:py-16">
      <div className="section-shell">
        {/* Welcome Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-bloom-600">
              Live Productivity Hub
            </p>
            <h1 className="mt-1 font-display text-display-md font-bold text-ink">
              Good to see you, {userName}.
            </h1>
          </div>
        </div>

        {/* Glance Stats Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {glanceCards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-bloom-100 bg-white p-5 shadow-sm">
              <Icon className="h-5 w-5 text-bloom-500" />
              <p className="mt-3 text-xl font-bold text-ink">{value}</p>
              <p className="text-xs text-ink-soft">{label}</p>
            </div>
          ))}
        </div>

        {/* Main Dashboard Layout */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Agenda & Tasks Column */}
          <div className="flex flex-col gap-6">
            <AgendaList />
          </div>

          {/* Voice Assistant & Escalation Column */}
          <div className="flex flex-col gap-6">
            {/* Gemini Live Voice Stream Widget */}
            <LiveVoiceWidget onTaskUpdated={refresh} />

            {/* Voice Reminder Escalation Card */}
            <ReminderEscalationCard
              nextReminderTitle={stats?.next_reminder_title}
              nextReminderTime={stats?.next_reminder_time}
              onActionComplete={refresh}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
