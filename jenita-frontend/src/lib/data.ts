import type {
  AgendaItem,
  DownloadBuild,
  OS,
  PricingPlan,
  StatItem,
  Testimonial,
} from "@/types";

export const testimonials: Testimonial[] = [
  {
    id: "maya-chen",
    quote:
      "Jenita actually talks to me, so I can stay focused without constantly checking my phone.",
    name: "Maya Chen",
    role: "Product Manager",
    avatarSeed: "maya-chen",
  },
  {
    id: "daniel-park",
    quote:
      "I can reschedule calls by voice while I'm walking between meetings. It's saved me so much time.",
    name: "Daniel Park",
    role: "Sales Director",
    avatarSeed: "daniel-park",
  },
  {
    id: "sofia-alvarez",
    quote:
      "The email summaries are the perfect backup. I never worry about missing a deadline again.",
    name: "Sofia Alvarez",
    role: "Founder",
    avatarSeed: "sofia-alvarez",
  },
];

export const stats: StatItem[] = [
  { id: "users", value: "12,000+", label: "Active Users" },
  { id: "countries", value: "40+", label: "Countries" },
  { id: "accuracy", value: "98%", label: "Reminder Accuracy" },
  { id: "rating", value: "4.9", label: "Average Rating" },
];

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "Try voice planning for a single calendar with the basics covered.",
    features: [
      "1 connected calendar",
      "Voice reminders on this device",
      "Daily email summary",
      "Community support",
    ],
    cta: "Start Free Trial",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$14",
    period: "/month",
    description: "For people juggling a full calendar who need Jenita everywhere.",
    features: [
      "Unlimited calendars",
      "Voice reminders on every device",
      "Conversational rescheduling",
      "Priority email summaries",
      "Desktop + mobile apps",
    ],
    highlighted: true,
    cta: "Start Free Trial",
  },
  {
    id: "team",
    name: "Team",
    price: "$36",
    period: "/month",
    description: "Shared scheduling intelligence for founders and their teams.",
    features: [
      "Everything in Pro",
      "Shared team agenda",
      "Admin controls & seats",
      "Dedicated onboarding",
    ],
    cta: "Talk to Sales",
  },
];

export const downloadBuilds: Record<OS, DownloadBuild> = {
  macOS: {
    os: "macOS",
    version: "v2.4.1",
    size: "68 MB",
    status: "Stable",
    requirements: "macOS 12.0 (Monterey) or later · Apple Silicon or Intel · 4 GB RAM",
  },
  Windows: {
    os: "Windows",
    version: "v2.4.1",
    size: "74 MB",
    status: "Stable",
    requirements: "Windows 10 64-bit or later · 4 GB RAM",
  },
  Linux: {
    os: "Linux",
    version: "v2.3.8",
    size: "61 MB",
    status: "Beta",
    requirements: "Ubuntu 20.04+ or equivalent · 4 GB RAM",
  },
};

export const agenda: AgendaItem[] = [
  { id: "1", time: "9:00 AM", title: "Team stand-up", meta: "Meet · 15 min", status: "done" },
  { id: "2", time: "10:30 AM", title: "Project review", meta: "Zoom · with Design", status: "confirmed" },
  { id: "3", time: "12:00 PM", title: "Lunch with Sarah", meta: "Personal", status: "confirmed" },
  { id: "4", time: "2:00 PM", title: "Deep work: Q4 roadmap", meta: "Focus block · 2 hrs", status: "pending" },
  { id: "5", time: "4:30 PM", title: "Client sync", meta: "Call · Acme Co.", status: "pending" },
];

export const agents = [
  {
    id: "planning",
    name: "Planning Agent",
    description:
      "Reviews your schedule, identifies conflicts, and suggests realistic blocks for every task.",
  },
  {
    id: "priority",
    name: "Priority & Timing Agent",
    description:
      "Weighs urgency, travel time, and focus windows to keep your day realistic and on track.",
  },
  {
    id: "voice",
    name: "Voice Reminder Agent",
    description:
      "Speaks reminders aloud, waits for your confirmation, and escalates if you need a nudge.",
  },
];

export const howItWorks = [
  {
    id: "voice-reminders",
    title: "Voice Reminders",
    description:
      "Jenita speaks reminders aloud and repeats them with increasing urgency until you confirm you're on your way.",
    image: "/images/voice-reminders.png",
  },
  {
    id: "conversational-scheduling",
    title: "Conversational Scheduling",
    description: 'Say "push that to 3pm" and Jenita updates your schedule instantly.',
    image: "/images/conversational-scheduling.png",
  },
  {
    id: "smart-email-backup",
    title: "Smart Email Backup",
    description:
      "Get a daily email summary of what's due so you always have a backup plan.",
    image: "/images/email-backup.png",
  },
];

export const moreWays = [
  {
    id: "never-miss",
    title: "Never Miss a Reminder",
    description:
      "Jenita escalates reminders with increasing urgency until you confirm, on any speaker in the room.",
    image: "/images/smart-speaker.png",
  },
  {
    id: "schedule-fly",
    title: "Schedule On The Fly",
    description:
      "Add meetings, calls, and errands with voice commands while you're away from your desk.",
    image: "/images/hero-desk.png",
  },
];
