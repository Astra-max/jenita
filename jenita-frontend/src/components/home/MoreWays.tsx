import Image from "next/image";
import { moreWays } from "@/lib/data";

export function MoreWays() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="section-shell">
        <h2 className="font-display text-display-lg font-bold text-ink">
          More Ways Jenita Keeps You Moving
        </h2>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {moreWays.map((item) => (
            <div key={item.id}>
              <div className="overflow-hidden rounded-2xl">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={900}
                  height={700}
                  className="h-64 w-full object-cover md:h-72"
                />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-ink-soft">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
