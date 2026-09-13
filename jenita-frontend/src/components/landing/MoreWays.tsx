import Image from "next/image";

const cards = [
  {
    img: "/images/more1.png",
    title: "Never miss a reminder",
    desc: "Jenita escalates reminders with increasing urgency until you confirm you're on your way.",
  },
  {
    img: "/images/more2.png",
    title: "Schedule on the fly",
    desc: "Add meetings, calls, and errands with voice commands while you're already in motion.",
  },
];

export function MoreWays() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        <h2 className="text-3xl sm:text-4xl lg:text-[3rem] font-semibold text-black mb-10 sm:mb-14 tracking-tight">
          More ways Jenita keeps you moving
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
          {cards.map((card) => (
            <div key={card.title} className="flex flex-col gap-6">
              <div className="rounded-xl overflow-hidden bg-pink-100">
                <Image
                  src={card.img}
                  alt={card.title}
                  width={800}
                  height={640}
                  className="w-full h-64 sm:h-72 lg:h-80 object-cover"
                />
              </div>
              <div>
                <p className="text-xl font-medium text-black mb-2">{card.title}</p>
                <p className="text-base sm:text-lg text-[#828282] leading-relaxed">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
