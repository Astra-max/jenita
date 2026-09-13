import { useQuery } from "@tanstack/react-query";
import type { AgendaItem } from "@/types";

async function fetchAgenda(): Promise<AgendaItem[]> {
  const res = await fetch("/api/agenda");
  if (!res.ok) throw new Error("Failed to load agenda");
  return res.json();
}

export function useAgenda() {
  return useQuery({
    queryKey: ["agenda"],
    queryFn: fetchAgenda,
  });
}
