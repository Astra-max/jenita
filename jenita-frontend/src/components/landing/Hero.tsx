import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section id="home" className="bg-white pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        <div className="max-w-3xl mb-10 sm:mb-14">
          <h1 className="text-[2.5rem] sm:text-5xl lg:text-[4rem] font-bold text-black leading-tight mb-5 sm:mb-6 tracking-tight">
            Your AI day planner that actually talks to you
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-black/75 leading-relaxed mb-8 sm:mb-10">
            Jenita speaks reminders aloud, listens for verbal confirmation, and lets
            you reschedule by voice so your day stays on track without constant
            screen checks.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="bg-black text-white px-7 py-4 rounded-lg text-lg sm:text-xl font-medium hover:bg-pink-600 transition-colors"
            >
              Start planning smarter
            </Link>
            <a
              href="#download"
              className="bg-pink-100 text-black/90 px-7 py-4 rounded-lg text-lg sm:text-xl font-medium hover:bg-pink-200 transition-colors"
            >
              Download app
            </a>
          </div>
        </div>
        <div className="w-full rounded-xl overflow-hidden shadow-sm bg-pink-100">
          <Image
            src="/images/hero.png"
            alt="Jenita AI planner interface on a desktop monitor"
            width={1400}
            height={700}
            className="w-full h-[220px] sm:h-[360px] lg:h-[480px] object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
