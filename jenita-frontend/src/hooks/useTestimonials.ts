import { useQuery } from "@tanstack/react-query";
import type { Testimonial } from "@/types";

async function fetchTestimonials(): Promise<Testimonial[]> {
  const res = await fetch("/api/testimonials");
  if (!res.ok) throw new Error("Failed to load testimonials");
  return res.json();
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
    staleTime: 5 * 60 * 1000,
  });
}
