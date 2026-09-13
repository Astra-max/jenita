"use client";

import { useStats } from "@/hooks/useStats";
import { stats as fallbackStats } from "@/lib/data";

export function StatsBar() {
  const { data = fallbackStats } = useStats();

  return (
    <section className="bg-bloom-50 pb-20 md:pb-28">
      <div className="section-shell">
        <div className="grid grid-cols-2 gap-8 border-t border-bloom-200 pt-10 md:grid-cols-4">
          {data.map((stat) => (
            <div key={stat.id}>
              <p className="font-display text-3xl font-extrabold text-ink md:text-4xl">
                {stat.value}
                {stat.id === "rating" && <span className="ml-1 text-bloom-500">★</span>}
              </p>
              <p className="mt-1 text-sm text-ink-soft">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
