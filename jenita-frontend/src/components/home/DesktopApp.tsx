"use client";

import Image from "next/image";
import { Check, Download } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedOS } from "@/store/slices/downloadSlice";
import { useDownloadBuild, useStartDownload } from "@/hooks/useDownload";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { OS } from "@/types";

const oses: OS[] = ["macOS", "Windows", "Linux"];

export function DesktopApp() {
  const selectedOS = useAppSelector((s) => s.download.selectedOS);
  const dispatch = useAppDispatch();
  const { data: build } = useDownloadBuild(selectedOS);
  const { mutate: startDownload, isPending } = useStartDownload();

  return (
    <section className="border-t border-bloom-100 bg-white py-20 md:py-28">
      <div className="section-shell grid gap-14 md:grid-cols-2 md:items-center md:gap-16">
        <div>
          <p className="text-sm font-medium text-bloom-500">Desktop app</p>
          <h2 className="mt-3 font-display text-display-lg font-bold text-ink">
            Take Jenita to Your Desktop
          </h2>
          <p className="mt-5 max-w-[48ch] text-[15px] leading-relaxed text-ink-soft">
            The Jenita desktop app runs quietly in the background, speaks reminders through your
            speakers, and lets you respond by voice — no browser tab needed. Works seamlessly on
            Mac, Windows, and Linux.
          </p>

          <div className="mt-7 flex gap-2 border-b border-bloom-100">
            {oses.map((os) => (
              <button
                key={os}
                onClick={() => dispatch(setSelectedOS(os))}
                className={cn(
                  "-mb-px border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
                  selectedOS === os
                    ? "border-ink text-ink"
                    : "border-transparent text-bloom-500 hover:text-ink"
                )}
              >
                {os}
              </button>
            ))}
          </div>

          {build && (
            <div className="mt-6 rounded-2xl border border-bloom-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink">Jenita for {build.os}</p>
                  <p className="text-sm text-ink-soft">
                    {build.version} · {build.size}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    build.status === "Stable"
                      ? "bg-moss-100 text-moss-600"
                      : "bg-bloom-100 text-bloom-600"
                  )}
                >
                  {build.status}
                </span>
              </div>
              <Button
                onClick={() => startDownload(selectedOS)}
                disabled={isPending}
                className="mt-4 w-full"
              >
                <Download className="h-4 w-4" />
                {isPending ? "Preparing download…" : `Download for ${build.os}`}
              </Button>
              <p className="mt-4 text-xs text-ink-soft">System requirements: {build.requirements}</p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-soft">
                {["Free to download", "No credit card required", "Automatic updates"].map((f) => (
                  <li key={f} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-bloom-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-3xl border border-bloom-100">
          <Image
            src="/images/hero-desk.png"
            alt="Jenita desktop app running on a monitor at a home office desk"
            width={1200}
            height={900}
            className="h-auto w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
