import Image from "next/image";
import { agents } from "@/lib/data";

export function AgentsSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="section-shell grid gap-12 md:grid-cols-2 md:gap-16 md:items-center">
        <div>
          <h2 className="font-display text-display-lg font-bold text-ink">
            Meet the Agents Behind Your Day
          </h2>
          <div className="mt-8 space-y-7">
            {agents.map((agent) => (
              <div key={agent.id} className="border-l-2 border-bloom-200 pl-5">
                <p className="font-semibold text-ink">{agent.name}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">
                  {agent.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/5 bg-ink shadow-xl">
          <Image
            src="/images/voice-waveform-card.png"
            alt="Voice interaction panel showing Aura AI listening to a query about project updates"
            width={1024}
            height={1024}
            className="h-auto w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
