"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

type OS = "mac" | "windows" | "linux";

const platforms: { id: OS; label: string; version: string; size: string }[] = [
  { id: "mac", label: "macOS", version: "v2.4.1", size: "68 MB" },
  { id: "windows", label: "Windows", version: "v2.4.1", size: "72 MB" },
  { id: "linux", label: "Linux", version: "v2.4.1", size: "65 MB" },
];

const requirements: Record<OS, string> = {
  mac: "macOS 12.0 (Monterey) or later · Apple Silicon or Intel · 4 GB RAM",
  windows: "Windows 10 (64-bit) or later · 4 GB RAM · 200 MB disk space",
  linux: "Ubuntu 20.04+ / Fedora 36+ · x86_64 · 4 GB RAM",
};

export function Download() {
  const [activeOS, setActiveOS] = useState<OS>("mac");
  const current = platforms.find((p) => p.id === activeOS)!;

  return (
    <section id="download" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-sm font-medium text-[#828282] mb-4">Desktop app</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight mb-5 tracking-tight">
              Take Jenita to your desktop
            </h2>
            <p className="text-base sm:text-lg text-[#454545] leading-relaxed mb-8">
              The Jenita desktop app runs quietly in the background, speaks
              reminders through your speakers, and lets you respond by voice —
              no browser tab needed. Works seamlessly on Mac, Windows, and
              Linux.
            </p>

            <div className="flex gap-2 mb-6 bg-pink-50 p-1 rounded-lg w-fit">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveOS(p.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeOS === p.id ? "bg-white text-black shadow-sm" : "text-pink-400 hover:text-black"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="border border-pink-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg font-medium text-black">
                    Jenita for {current.label}
                  </p>
                  <p className="text-sm text-[#828282]">
                    {current.version} · {current.size}
                  </p>
                </div>
                <span className="bg-[#f0fdf4] text-[#16a34a] text-xs font-medium px-2.5 py-1 rounded-full">
                  Stable
                </span>
              </div>
              <button
                onClick={() => toast.success(`Download started for ${current.label}.`)}
                className="w-full bg-black text-white py-3.5 rounded-lg text-base font-medium hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download for {current.label}
              </button>
            </div>

            <p className="text-sm text-[#828282]">
              System requirements: {requirements[activeOS]}
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              {["Free to download", "No credit card required", "Automatic updates"].map((feat) => (
                <div key={feat} className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-sm text-[#828282]">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl overflow-hidden bg-pink-100 shadow-lg">
            <Image
              src="/images/more2.png"
              alt="Jenita desktop application on a laptop"
              width={900}
              height={700}
              className="w-full h-72 sm:h-96 lg:h-[480px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
