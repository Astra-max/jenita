"use client";

import { useTestimonials } from "@/hooks/useTestimonials";
import { testimonials as fallback } from "@/lib/data";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

export function Testimonials() {
  const { data = fallback, isLoading } = useTestimonials();

  return (
    <section className="bg-bloom-50 py-20 md:py-28">
      <div className="section-shell">
        <h2 className="font-display text-display-lg font-bold text-ink">
          What People Say About Jenita
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-52 animate-pulse rounded-2xl bg-white/70" />
              ))
            : data.map((t) => (
                <figure
                  key={t.id}
                  className="flex flex-col justify-between rounded-2xl border border-bloom-200/70 bg-white p-7"
                >
                  <blockquote className="text-[15px] leading-relaxed text-ink">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bloom-200 text-xs font-semibold text-bloom-600">
                      {initials(t.name)}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink">{t.name}</span>
                      <span className="block text-xs text-ink-soft">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
        </div>
      </div>
    </section>
  );
}
