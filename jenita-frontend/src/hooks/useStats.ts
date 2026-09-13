import { useQuery } from "@tanstack/react-query";
import type { StatItem } from "@/types";

async function fetchStats(): Promise<StatItem[]> {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime: 5 * 60 * 1000,
  });
}
