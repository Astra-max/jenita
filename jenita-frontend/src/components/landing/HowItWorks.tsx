import Image from "next/image";

const cards = [
  {
    img: "/images/feature1.png",
    title: "Voice reminders",
    desc: "Jenita speaks reminders aloud and repeats them until you confirm you're on your way.",
  },
  {
    img: "/images/feature2.png",
    title: "Conversational scheduling",
    desc: `Say "push that to 3pm" and Jenita updates your schedule instantly.`,
  },
  {
    img: "/images/feature3.png",
    title: "Smart email backup",
    desc: "Get a daily email summary of what's due so you always have a backup plan.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        <h2 className="text-3xl sm:text-4xl lg:text-[3rem] font-semibold text-black mb-10 sm:mb-14 tracking-tight">
          How Jenita works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8">
          {cards.map((card) => (
            <div key={card.title} className="flex flex-col gap-5">
              <div className="rounded-xl overflow-hidden bg-pink-100 w-full">
                <Image
                  src={card.img}
                  alt={card.title}
                  width={600}
                  height={400}
                  className="w-full h-56 sm:h-64 lg:h-72 object-cover"
                />
              </div>
              <div>
                <p className="text-xl font-medium text-black mb-1.5">{card.title}</p>
                <p className="text-base sm:text-lg text-[#828282] leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
