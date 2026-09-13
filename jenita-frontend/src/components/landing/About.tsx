import Image from "next/image";

const stats = [
  { value: "12,000+", label: "Active users" },
  { value: "40+", label: "Countries" },
  { value: "98%", label: "Reminder accuracy" },
  { value: "4.9 ★", label: "Average rating" },
];

export function About() {
  return (
    <section id="about" className="bg-pink-50 py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-14 sm:mb-20">
          <div>
            <p className="text-sm font-medium text-[#828282] mb-4">About the project</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight mb-6 tracking-tight">
              Built for the people who never stop moving
            </h2>
            <p className="text-base sm:text-lg text-[#454545] leading-relaxed mb-5">
              Jenita was born out of a simple frustration: most scheduling tools
              require you to stop and look at a screen. But the people who need
              help the most — founders, sales directors, busy parents — are
              almost never sitting still.
            </p>
            <p className="text-base sm:text-lg text-[#454545] leading-relaxed mb-5">
              We set out to build an AI planner that works the way humans
              actually do: through conversation. Jenita doesn&apos;t wait for you
              to open an app. It talks to you, listens to your responses, and
              adapts your schedule in real time — all without a single tap.
            </p>
            <p className="text-base sm:text-lg text-[#828282] leading-relaxed">
              Today, Jenita is trusted by over 12,000 professionals across 40
              countries. Whether you&apos;re managing a startup or juggling a
              packed personal calendar, Jenita keeps your day on track —
              wherever you are.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl overflow-hidden bg-pink-100 col-span-2">
              <Image
                src="/images/feature1.png"
                alt="Jenita team working together"
                width={800}
                height={500}
                className="w-full h-56 sm:h-72 object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden bg-pink-100">
              <Image
                src="/images/more1.png"
                alt="People using Jenita"
                width={400}
                height={300}
                className="w-full h-40 sm:h-52 object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center p-6">
              <div className="text-center">
                <p className="text-4xl sm:text-5xl font-bold text-white mb-1">12k+</p>
                <p className="text-sm sm:text-base text-white/70">Active users worldwide</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 border-t border-pink-200 pt-12 sm:pt-16">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl sm:text-4xl font-bold text-black mb-1">{s.value}</p>
              <p className="text-base text-[#828282]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
