import Image from "next/image";
import { howItWorks } from "@/lib/data";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-bloom-50 py-20 md:py-28">
      <div className="section-shell">
        <h2 className="font-display text-display-lg font-bold text-ink">How Jenita Works</h2>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {howItWorks.map((item) => (
            <div key={item.id}>
              <div className="overflow-hidden rounded-2xl">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={800}
                  height={800}
                  className="h-56 w-full object-cover"
                />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
