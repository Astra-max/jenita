export type EventType = "urgent" | "important" | "deadline" | "missed" | "upcoming";

export const EVENTS: { id: number; title: string; when: string; type: EventType }[] = [
  { id: 1, title: "Pay rent", when: "Today, 5:00 PM", type: "urgent" },
  { id: 2, title: "Project review", when: "Tomorrow, 10:00 AM", type: "important" },
  { id: 3, title: "Submit taxes", when: "In 3 days", type: "deadline" },
  { id: 4, title: "Call with Sam", when: "Missed · Yesterday", type: "missed" },
  { id: 5, title: "Dentist appointment", when: "Next week", type: "upcoming" },
];

export const EVENT_STYLES: Record<EventType, { dot: string; badge: string; label: string }> = {
  urgent: { dot: "bg-red-500", badge: "bg-red-50 text-red-600", label: "Urgent" },
  important: { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-600", label: "Important" },
  deadline: { dot: "bg-purple-500", badge: "bg-purple-50 text-purple-600", label: "Deadline" },
  missed: { dot: "bg-gray-400", badge: "bg-gray-100 text-gray-500", label: "Missed" },
  upcoming: { dot: "bg-pink-500", badge: "bg-pink-50 text-pink-600", label: "Upcoming" },
};

export const EXPENSES = [
  { id: 1, label: "Groceries", amount: 84.2, max: 150 },
  { id: 2, label: "Utilities", amount: 120.5, max: 150 },
  { id: 3, label: "Transport", amount: 24.0, max: 150 },
  { id: 4, label: "Subscriptions", amount: 42.75, max: 150 },
];

export type DeviceStatus = "Online" | "Charging" | "Offline";

export const DEVICES: { id: string; name: string; status: DeviceStatus; battery: number | null }[] = [
  { id: "phone", name: "Phone", status: "Online", battery: 82 },
  { id: "laptop", name: "Computer", status: "Charging", battery: 64 },
  { id: "tablet", name: "Tablet", status: "Offline", battery: null },
];

export const SUGGESTIONS = ["Sync calendar", "Review missed events", "Schedule follow-ups", "Set payment reminders"];

export const QUICK_ACTIONS = [
  { label: "Add event", icon: "Calendar" },
  { label: "Log expense", icon: "Receipt" },
  { label: "Scan device", icon: "Wifi" },
] as const;

export const SIDEBAR_NAV_ITEMS = [
  { label: "Overview", icon: "LayoutDashboard", active: true },
  { label: "Calendar", icon: "Calendar", active: false },
  { label: "Alerts", icon: "Bell", active: false },
  { label: "Settings", icon: "Settings", active: false },
] as const;
