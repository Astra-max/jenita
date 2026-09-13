import Image from "next/image";

const quotes = [
  {
    quote:
      "Jenita actually talks to me, so I can stay focused without constantly checking my phone.",
    name: "Maya Chen",
    role: "Product Manager",
    img: "/images/avatar1.png",
  },
  {
    quote:
      "I can reschedule calls by voice while I'm walking between meetings. It's saved me so much time.",
    name: "Daniel Park",
    role: "Sales Director",
    img: "/images/avatar2.png",
  },
  {
    quote:
      "The email summaries are the perfect backup. I never worry about missing a deadline again.",
    name: "Sofia Alvarez",
    role: "Founder",
    img: "/images/avatar3.png",
  },
];

export function Testimonials() {
  return (
    <section className="bg-pink-50 py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        <h2 className="text-3xl sm:text-4xl lg:text-[3rem] font-semibold text-black mb-10 sm:mb-14 tracking-tight">
          What people say about Jenita
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {quotes.map((q) => (
            <div
              key={q.name}
              className="bg-white border border-pink-200 rounded-xl p-7 sm:p-8 flex flex-col justify-between gap-10"
            >
              <p className="text-lg sm:text-xl font-medium text-black leading-relaxed">
                &ldquo;{q.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <Image
                  src={q.img}
                  alt={q.name}
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-full object-cover shrink-0"
                />
                <div>
                  <p className="text-base font-medium text-black">{q.name}</p>
                  <p className="text-base text-[#828282]">{q.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
