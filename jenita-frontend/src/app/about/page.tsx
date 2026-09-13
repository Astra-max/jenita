import Image from "next/image";
import { AboutProject } from "@/components/home/AboutProject";
import { agents } from "@/lib/data";

export default function AboutPage() {
  return (
    <div>
      <section className="bg-white py-16 md:py-24">
        <div className="section-shell max-w-3xl">
          <p className="text-sm font-medium text-bloom-500">About Jenita</p>
          <h1 className="mt-3 font-display text-display-lg font-bold text-ink">
            An AI planner that talks, listens, and adapts.
          </h1>
          <p className="mt-5 text-lg text-ink-soft">
            Jenita is built by a small team who got tired of scheduling apps that only work when
            you stop what you&apos;re doing to stare at a screen.
          </p>
        </div>
      </section>

      <AboutProject />

      <section className="bg-white py-20 md:py-28">
        <div className="section-shell">
          <h2 className="font-display text-display-lg font-bold text-ink">
            The three agents working for you
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {agents.map((agent) => (
              <div key={agent.id} className="rounded-2xl border border-bloom-100 p-6">
                <p className="font-semibold text-ink">{agent.name}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                  {agent.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bloom-50 py-20 md:py-28">
        <div className="section-shell grid gap-10 md:grid-cols-2 md:items-center">
          <div className="overflow-hidden rounded-3xl">
            <Image
              src="/images/team-cafe.avif"
              alt="The Jenita team gathered around a table"
              width={1000}
              height={800}
              className="h-auto w-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-display text-display-md font-bold text-ink">
              Working the way people actually move through their day
            </h2>
            <p className="mt-4 max-w-[50ch] text-[15px] leading-relaxed text-ink-soft">
              We&apos;re a small, remote team of engineers and designers who all shared the same
              complaint about the planning tools we used before Jenita. So we built the one we
              wanted: one that keeps up while you&apos;re walking, driving, or heads-down in
              something else entirely.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
