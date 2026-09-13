"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button, LinkButton } from "@/components/ui/Button";
import { useStartTrial } from "@/hooks/useStartTrial";

const emailSchema = z.string().email();

export function CtaBanner() {
  const [email, setEmail] = useState("");
  const { mutate, isPending } = useStartTrial();

  function handleClick() {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error("Enter a valid email to start your free trial.");
      return;
    }
    mutate({ email });
  }

  return (
    <section className="bg-bloom-50 py-20 md:py-28">
      <div className="section-shell flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <h2 className="font-display text-display-lg font-bold text-ink">
          Start Planning Smarter Today
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@work.com"
            className="h-12 w-56 rounded-full border border-bloom-200 bg-white px-5 text-sm text-ink outline-none placeholder:text-ink-soft/60"
          />
          <Button size="lg" onClick={handleClick} disabled={isPending}>
            {isPending ? "Starting…" : "Start Your Free Trial"}
          </Button>
          <LinkButton href="/pricing" variant="secondary" size="lg">
            See Pricing
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
