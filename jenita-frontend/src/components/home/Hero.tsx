"use client";

import Image from "next/image";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { VoiceDemoWidget } from "@/components/home/VoiceDemoWidget";
import { useStartTrial } from "@/hooks/useStartTrial";
import { toast } from "sonner";

const emailSchema = z.string().email();

export function Hero() {
  const [email, setEmail] = useState("");
  const { mutate, isPending } = useStartTrial();

  function handleStartTrial() {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error("Enter a valid email to start your free trial.");
      return;
    }
    mutate({ email });
  }

  return (
    <section className="relative overflow-hidden bg-white pb-20 pt-14 md:pb-28 md:pt-20">
      <div className="section-shell grid gap-14 md:grid-cols-2 md:items-center md:gap-10">
        <div className="animate-fade-up">
          <h1 className="font-display text-display-xl font-extrabold text-ink">
            Your AI Day Planner That Actually Talks to You
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg text-ink-soft">
            Jenita speaks reminders aloud, listens for verbal confirmation, and lets you
            reschedule by voice so your day stays on track without constant screen checks.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center overflow-hidden rounded-full border border-bloom-200 bg-white pl-5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@work.com"
                className="h-11 w-44 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/60 sm:w-56"
              />
              <Button onClick={handleStartTrial} disabled={isPending} className="rounded-l-none">
                {isPending ? "Starting…" : "Start Planning Smarter"}
              </Button>
            </div>
            <Button variant="secondary" size="md">
              Download App
            </Button>
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-6 md:items-end">
          <div className="w-full overflow-hidden rounded-3xl border border-bloom-100 shadow-xl shadow-bloom-100/60">
            <Image
              src="/images/hero-desk.png"
              alt="Desk setup with Jenita's Aura interface showing a day planner and voice waveform"
              width={1200}
              height={900}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
          <div className="md:absolute md:-bottom-8 md:-left-10">
            <VoiceDemoWidget />
          </div>
        </div>
      </div>
    </section>
  );
}
