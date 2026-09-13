"use client";

import { Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { usePricing } from "@/hooks/usePricing";
import { pricingPlans as fallback } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const { data = fallback, isLoading } = usePricing();

  return (
    <div className="bg-white py-16 md:py-24">
      <div className="section-shell">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-bloom-500">Pricing</p>
          <h1 className="mt-3 font-display text-display-lg font-bold text-ink">
            Simple plans for every kind of busy.
          </h1>
          <p className="mt-4 text-lg text-ink-soft">
            Start free, upgrade when Jenita becomes part of how your day runs.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-2xl bg-bloom-50" />
              ))
            : data.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "flex flex-col rounded-2xl border p-7",
                    plan.highlighted
                      ? "border-ink bg-ink text-white"
                      : "border-bloom-100 bg-white text-ink"
                  )}
                >
                  <p className="text-sm font-semibold">{plan.name}</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-extrabold">{plan.price}</span>
                    <span
                      className={cn(
                        "text-sm",
                        plan.highlighted ? "text-white/60" : "text-ink-soft"
                      )}
                    >
                      {plan.period}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "mt-3 text-sm leading-relaxed",
                      plan.highlighted ? "text-white/75" : "text-ink-soft"
                    )}
                  >
                    {plan.description}
                  </p>

                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check
                          className={cn(
                            "mt-0.5 h-4 w-4 shrink-0",
                            plan.highlighted ? "text-bloom-300" : "text-bloom-500"
                          )}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() =>
                      toast.success(
                        plan.cta === "Talk to Sales"
                          ? "Thanks — our team will reach out shortly."
                          : `Free trial started for the ${plan.name} plan.`
                      )
                    }
                    variant={plan.highlighted ? "secondary" : "primary"}
                    className="mt-7 w-full"
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
