"use client";

import { cn } from "@/lib/utils";

interface VoiceWaveformProps {
  active: boolean;
  className?: string;
  barClassName?: string;
}

const heights = [0.35, 0.6, 0.9, 0.5, 0.75, 0.4, 0.65, 0.3];

export function VoiceWaveform({ active, className, barClassName }: VoiceWaveformProps) {
  return (
    <div
      className={cn("flex h-10 items-end gap-1", className)}
      role="img"
      aria-label={active ? "Listening" : "Voice waveform"}
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className={cn(
            "w-1.5 rounded-full bg-current",
            active ? "animate-wave" : "opacity-40",
            barClassName
          )}
          style={{
            height: `${h * 100}%`,
            animationDelay: `${i * 90}ms`,
          }}
        />
      ))}
    </div>
  );
}
