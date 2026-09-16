"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Laptop,
  PlusCircle,
  Receipt,
  Smartphone,
  Tablet,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import {
  DEVICES,
  EVENTS,
  EVENT_STYLES,
  EXPENSES,
} from "@/components/dashboard/dashboardData";
import { SectionCard } from "@/components/dashboard/SectionCard";

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[110px]">
      <p className="text-2xl font-bold text-white leading-none mb-1">{value}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}

function EventRow({ event }: { event: (typeof EVENTS)[number] }) {
  const style = EVENT_STYLES[event.type];
  return (
    <li className="flex items-center justify-between gap-3 bg-pink-50/70 hover:bg-pink-50 transition-colors p-3 rounded-xl">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-black truncate">{event.title}</p>
          <p className="text-xs text-[#828282]">{event.when}</p>
        </div>
      </div>
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${style.badge}`}>
        {style.label}
      </span>
    </li>
  );
}

function ExpenseBar({ label, amount, max }: { label: string; amount: number; max: number }) {
  const pct = Math.min(100, Math.round((amount / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-black/80">{label}</span>
        <span className="font-medium text-black">${amount.toFixed(2)}</span>
      </div>
      <div className="h-2 rounded-full bg-pink-100 overflow-hidden">
        <div className="h-full rounded-full bg-black" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DeviceCard({ device }: { device: (typeof DEVICES)[number] }) {
  const { name, status, battery } = device;
  const Icon = device.id === "phone" ? Smartphone : device.id === "laptop" ? Laptop : Tablet;
  const statusColor =
    status === "Online" ? "text-green-600" : status === "Charging" ? "text-amber-600" : "text-gray-400";

  return (
    <div className="flex items-center justify-between p-3.5 bg-pink-50/70 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center shrink-0">
          <Icon size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-black">{name}</p>
          <p className={`text-xs font-medium ${statusColor}`}>{status}</p>
        </div>
      </div>
      <div className="text-sm text-right">
        {battery !== null ? (
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-3.5 rounded-sm border border-black/20 relative overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 ${battery > 20 ? "bg-black" : "bg-red-500"}`}
                style={{ width: `${battery}%` }}
              />
            </div>
            <span className="text-xs text-[#828282] tabular-nums">{battery}%</span>
          </div>
        ) : (
          <WifiOff size={14} className="text-gray-300" />
        )}
      </div>
    </div>
  );
}

export function DashboardMainContent({ user }: { user: { name: string; email: string } }) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", time: "09:00", due_date: "", meta: "", priority: "normal" });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...form };
      const res = await apiFetch<any>(`/api/v1/reminders?start_now=${false}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("Reminder created");
      setShowCreate(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create reminder");
    }
  }

  const totalExpenses = useMemo(() => EXPENSES.reduce((sum, expense) => sum + expense.amount, 0), []);
  const urgentCount = useMemo(
    () => EVENTS.filter((event) => event.type === "urgent" || event.type === "deadline").length,
    []
  );
  const onlineDevices = useMemo(() => DEVICES.filter((device) => device.status !== "Offline").length, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-black px-6 sm:px-10 py-8 sm:py-10">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-pink-600/30 blur-3xl" />
        <div className="absolute -right-4 bottom-0 w-40 h-40 rounded-full bg-pink-400/20 blur-2xl" />
        <div className="relative z-10">
          <p className="text-sm font-medium text-pink-300 mb-2">{today}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">
            Good to see you, {user.name.split(" ")[0]}.
          </h1>
          <p className="text-sm sm:text-base text-white/70 max-w-lg mb-6">
            Here&apos;s your personal assistant overview — events, spending, and device
            health, all in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <StatChip label="Events tracked" value={EVENTS.length} />
            <StatChip label="Need attention" value={urgentCount} />
            <StatChip label="Devices online" value={`${onlineDevices}/${DEVICES.length}`} />
            <StatChip label="This month spent" value={`$${totalExpenses.toFixed(0)}`} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-6">
        <div className="flex flex-col gap-6">
          <SectionCard
            title="Today&apos;s events"
            action={
                          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 text-xs font-medium text-pink-600 hover:text-pink-700">
                <PlusCircle size={14} />
                Add
              </button>
            }
          >
            <ul className="flex flex-col gap-2">
              {EVENTS.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </ul>
            <p className="mt-4 text-xs text-[#a3a3a3]">
              Categories: urgent, important, deadline, missed, upcoming.
            </p>
          </SectionCard>

          <SectionCard
            title="Expense tracker"
            action={<span className="text-xs font-medium text-[#828282]">${totalExpenses.toFixed(2)} this month</span>}
          >
          
            <div className="flex flex-col gap-4">
              {EXPENSES.map((expense) => (
                <ExpenseBar key={expense.id} {...expense} />
              ))}
            </div>
            <Link
              href="#"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-black hover:text-pink-600 transition-colors"
            >
              <Receipt size={14} />
              Open full expense tracker
            </Link>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard title="Device status">
            <div className="flex flex-col gap-2.5">
              {DEVICES.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="New insights">
            <div className="space-y-3 text-sm text-[#454545]">
              <div className="flex items-center gap-3 rounded-xl bg-pink-50 p-3">
                <Calendar size={16} className="text-pink-600" />
                <span>Project review is scheduled for tomorrow morning.</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-pink-50 p-3">
                <Wifi size={16} className="text-pink-600" />
                <span>Your laptop is charging and ready for the next session.</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-pink-50 p-3">
                <Zap size={16} className="text-pink-600" />
                <span>Two reminders are due before the end of the day.</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Create Reminder Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-3">Create Reminder</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} type="time" className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due date</label>
                <input value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} type="date" className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" />
              </div>
              <div className="flex items-center gap-2">
                <button type="submit" className="rounded-md bg-black text-white px-3 py-2">Create</button>
                <button type="button" onClick={() => setShowCreate(false)} className="rounded-md border px-3 py-2">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
