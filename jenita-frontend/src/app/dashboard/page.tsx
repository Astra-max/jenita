"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Bell,
  Calendar,
  Laptop,
  Mic,
  PlusCircle,
  Receipt,
  Smartphone,
  Tablet,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/features/auth/authSlice";

// ---------- Mock data (swap for real data when you wire this up) ----------

type EventType = "urgent" | "important" | "deadline" | "missed" | "upcoming";

const EVENTS: { id: number; title: string; when: string; type: EventType }[] = [
  { id: 1, title: "Pay rent", when: "Today, 5:00 PM", type: "urgent" },
  { id: 2, title: "Project review", when: "Tomorrow, 10:00 AM", type: "important" },
  { id: 3, title: "Submit taxes", when: "In 3 days", type: "deadline" },
  { id: 4, title: "Call with Sam", when: "Missed · Yesterday", type: "missed" },
  { id: 5, title: "Dentist appointment", when: "Next week", type: "upcoming" },
];

const EVENT_STYLES: Record<EventType, { dot: string; badge: string; label: string }> = {
  urgent: { dot: "bg-red-500", badge: "bg-red-50 text-red-600", label: "Urgent" },
  important: { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-600", label: "Important" },
  deadline: { dot: "bg-purple-500", badge: "bg-purple-50 text-purple-600", label: "Deadline" },
  missed: { dot: "bg-gray-400", badge: "bg-gray-100 text-gray-500", label: "Missed" },
  upcoming: { dot: "bg-pink-500", badge: "bg-pink-50 text-pink-600", label: "Upcoming" },
};

const EXPENSES = [
  { id: 1, label: "Groceries", amount: 84.2, max: 150 },
  { id: 2, label: "Utilities", amount: 120.5, max: 150 },
  { id: 3, label: "Transport", amount: 24.0, max: 150 },
  { id: 4, label: "Subscriptions", amount: 42.75, max: 150 },
];

type DeviceStatus = "Online" | "Charging" | "Offline";

const DEVICES: { id: string; name: string; status: DeviceStatus; battery: number | null; Icon: typeof Smartphone }[] = [
  { id: "phone", name: "Phone", status: "Online", battery: 82, Icon: Smartphone },
  { id: "laptop", name: "Computer", status: "Charging", battery: 64, Icon: Laptop },
  { id: "tablet", name: "Tablet", status: "Offline", battery: null, Icon: Tablet },
];

const SUGGESTIONS = ["Sync calendar", "Review missed events", "Schedule follow-ups", "Set payment reminders"];

const QUICK_ACTIONS = [
  { label: "Add event", icon: Calendar },
  { label: "Log expense", icon: Receipt },
  { label: "Scan device", icon: Wifi },
];

// ---------- Small local components (inline for now — split out on refactor) ----------

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[110px]">
      <p className="text-2xl font-bold text-white leading-none mb-1">{value}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-pink-200/80 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black">{title}</h3>
        {action}
      </div>
      {children}
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
  const { name, status, battery, Icon } = device;
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

// ---------- Page ----------

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  const totalExpenses = useMemo(() => EXPENSES.reduce((sum, e) => sum + e.amount, 0), []);
  const urgentCount = useMemo(() => EVENTS.filter((e) => e.type === "urgent" || e.type === "deadline").length, []);
  const onlineDevices = useMemo(() => DEVICES.filter((d) => d.status !== "Offline").length, []);

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Signed out. See you soon.");
    router.push("/");
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-pink-200 sticky top-0 z-20">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 flex items-center justify-between h-16 sm:h-[74px]">
          <Link href="/" className="text-2xl font-bold text-black tracking-tight">
            Jenita
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => toast("You're all caught up.", { icon: <Bell size={16} /> })}
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full hover:bg-pink-50 transition-colors text-[#454545]"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <p className="hidden sm:block text-sm text-[#454545]">{user.email}</p>
            <button
              onClick={handleLogout}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1280px] w-full mx-auto px-5 sm:px-8 lg:px-10 py-8 sm:py-12">
        {/* Greeting banner */}
        <div className="relative overflow-hidden rounded-2xl bg-black px-6 sm:px-10 py-8 sm:py-10 mb-8">
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left: overview + quick actions */}
          <aside className="md:col-span-1 flex flex-col gap-6">
            <SectionCard title="Quick actions">
              <div className="flex flex-col gap-1">
                {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
                  <Link
                    key={label}
                    href="#"
                    className="flex items-center gap-2.5 text-sm text-black/80 hover:text-pink-600 py-2 px-2.5 rounded-lg hover:bg-pink-50 transition-colors"
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Voice assistant">
              <div className="rounded-xl bg-gradient-to-br from-black to-[#1a1a1a] p-4 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <Mic size={14} className="text-pink-400" />
                  </div>
                  <span className="text-sm font-medium">Jenita is listening</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Say &ldquo;what&apos;s next&rdquo; or &ldquo;reschedule my 3pm&rdquo; any time.
                </p>
              </div>
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
          </aside>

          {/* Center: events + expenses */}
          <section className="md:col-span-2 flex flex-col gap-6">
            <SectionCard
              title="Today's events"
              action={
                <button className="flex items-center gap-1.5 text-xs font-medium text-pink-600 hover:text-pink-700">
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
              action={
                <span className="text-xs font-medium text-[#828282]">
                  ${totalExpenses.toFixed(2)} this month
                </span>
              }
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
          </section>

          {/* Right: devices */}
          <aside className="md:col-span-1">
            <SectionCard title="Device status">
              <div className="flex flex-col gap-2.5">
                {DEVICES.map((device) => (
                  <DeviceCard key={device.id} device={device} />
                ))}
              </div>
            </SectionCard>
          </aside>
        </div>
      </main>
    </div>
  );
}