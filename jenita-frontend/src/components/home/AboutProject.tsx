import Image from "next/image";

export function AboutProject() {
  return (
    <section id="about" className="bg-bloom-50 py-20 md:py-28">
      <div className="section-shell grid gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <p className="text-sm font-medium text-bloom-500">About the project</p>
          <h2 className="mt-3 font-display text-display-lg font-bold text-ink">
            Built for the People Who Never Stop Moving
          </h2>
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            <p>
              Jenita was born out of a simple frustration: most scheduling tools require you to
              stop and look at a screen. But the people who need help the most — founders, sales
              directors, busy parents — are almost never sitting still.
            </p>
            <p>
              We set out to build an AI planner that works the way humans actually do: through
              conversation. Jenita doesn&apos;t wait for you to open an app. It talks to you,
              listens to your responses, and adapts your schedule in real time — all without a
              single tap.
            </p>
            <p>
              Today, Jenita is trusted by over 12,000 professionals across 40 countries. Whether
              you&apos;re managing a startup or juggling a packed personal calendar, Jenita keeps
              your day on track — wherever you are.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 overflow-hidden rounded-2xl">
            <Image
              src="/images/team-laptops.avif"
              alt="People working together on laptops with headphones on"
              width={1200}
              height={800}
              className="h-56 w-full object-cover md:h-64"
            />
          </div>
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/team-cafe.avif"
              alt="A small team gathered around a table"
              width={600}
              height={600}
              className="h-40 w-full object-cover md:h-48"
            />
          </div>
          <div className="flex flex-col justify-center rounded-2xl bg-ink px-6 py-6 text-white">
            <span className="font-display text-4xl font-extrabold">12K+</span>
            <span className="mt-1 text-sm text-white/70">Active users worldwide</span>
          </div>
        </div>
      </div>
    </section>
  );
}
