import Link from "next/link";

export function CTA() {
  return (
    <section className="bg-pink-50 py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-black leading-tight max-w-xl tracking-tight">
            Start planning smarter today
          </h2>
          <div className="flex flex-wrap gap-4 shrink-0">
            <Link
              href="/signup"
              className="bg-black text-white px-7 py-4 rounded-lg text-lg font-medium hover:bg-pink-600 transition-colors"
            >
              Start your free trial
            </Link>
            <a
              href="#download"
              className="bg-pink-100 text-black/90 px-7 py-4 rounded-lg text-lg font-medium hover:bg-pink-200 transition-colors"
            >
              See pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
