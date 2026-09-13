export type OS = "macOS" | "Windows" | "Linux";

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatarSeed: string;
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export interface DownloadBuild {
  os: OS;
  version: string;
  size: string;
  status: "Stable" | "Beta";
  requirements: string;
}

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  meta: string;
  status: "confirmed" | "pending" | "done";
}
