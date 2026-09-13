import { useQuery } from "@tanstack/react-query";
import type { PricingPlan } from "@/types";

async function fetchPricing(): Promise<PricingPlan[]> {
  const res = await fetch("/api/pricing");
  if (!res.ok) throw new Error("Failed to load pricing");
  return res.json();
}

export function usePricing() {
  return useQuery({
    queryKey: ["pricing"],
    queryFn: fetchPricing,
    staleTime: 5 * 60 * 1000,
  });
}
