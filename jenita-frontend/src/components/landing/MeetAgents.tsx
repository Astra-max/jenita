import Image from "next/image";

const agents = [
  {
    title: "Planning agent",
    desc: "Jenita reviews your schedule, identifies conflicts, and suggests realistic blocks for every task.",
  },
  {
    title: "Priority & timing agent",
    desc: "It weighs urgency, travel time, and focus windows to keep your day realistic and on track.",
  },
  {
    title: "Voice reminder agent",
    desc: "It speaks reminders aloud, waits for your confirmation, and escalates if you need a nudge.",
  },
];

export function MeetAgents() {
  return (
    <section className="bg-pink-50 py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 flex flex-col gap-10">
            <h2 className="text-3xl sm:text-4xl lg:text-[3rem] font-semibold text-black leading-tight tracking-tight">
              Meet the agents behind your day
            </h2>
            <div className="flex flex-col gap-10">
              {agents.map((a) => (
                <div key={a.title}>
                  <p className="text-lg sm:text-xl font-medium text-black mb-2">{a.title}</p>
                  <p className="text-base sm:text-lg text-[#828282] leading-relaxed">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2 rounded-xl overflow-hidden bg-pink-100">
            <Image
              src="/images/agents.png"
              alt="AI agents working behind the scenes"
              width={800}
              height={700}
              className="w-full h-72 sm:h-96 lg:h-[520px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
