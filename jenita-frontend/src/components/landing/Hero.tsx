"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export function Hero() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [showConsent, setShowConsent] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
      return;
    }
    setShowConsent(true);
  };

  const acceptConsent = async () => {
    if (typeof window !== "undefined") {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
          localStorage.setItem("jenita_voice_consent", "granted");
        } else {
          localStorage.setItem("jenita_voice_consent", "denied");
        }
      } catch (e) {
        console.warn("Microphone permission request failed or was denied", e);
        localStorage.setItem("jenita_voice_consent", "denied");
      }
    }
    router.push("/login");
  };

  return (
    <>
      <section id="home" className="bg-white pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
          <div className="max-w-3xl mb-10 sm:mb-14">
            <h1 className="text-[2.5rem] sm:text-5xl lg:text-[4rem] font-bold text-black leading-tight mb-5 sm:mb-6 tracking-tight">
              Your AI day planner that actually talks to you
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-black/75 leading-relaxed mb-8 sm:mb-10">
              Jenita speaks reminders aloud, listens for verbal confirmation, and lets
              you reschedule by voice so your day stays on track without constant
              screen checks.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleGetStarted}
                className="bg-black text-white px-7 py-4 rounded-lg text-lg sm:text-xl font-medium hover:bg-pink-600 transition-colors"
              >
                Get started
              </button>
              <a
                href="#download"
                className="bg-pink-100 text-black/90 px-7 py-4 rounded-lg text-lg sm:text-xl font-medium hover:bg-pink-200 transition-colors"
              >
                Download app
              </a>
            </div>
          </div>
          <div className="w-full rounded-xl overflow-hidden shadow-sm bg-pink-100">
            <Image
              src="/images/hero.png"
              alt="Jenita AI planner interface on a desktop monitor"
              width={1400}
              height={700}
              className="w-full h-[220px] sm:h-[360px] lg:h-[480px] object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-600">Voice consent</p>
            <h2 className="mt-3 text-2xl font-bold text-black">Let Jenita listen when you want</h2>
            <p className="mt-3 text-sm leading-6 text-[#454545]">
              We need your permission to use your microphone and stream PCM audio to Gemini Live for spoken reminders,
              voice scheduling, and follow-up responses. This happens only when you choose to start a live session.
            </p>

            <div className="mt-5 rounded-xl bg-pink-50 p-3 text-sm text-black/80">
              <p className="font-medium">What this enables</p>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-[#454545]">
                <li>Spoken reminders and confirmation</li>
                <li>Voice rescheduling and task updates</li>
                <li>Live AI responses from Gemini</li>
              </ul>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={acceptConsent}
                className="flex-1 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-pink-600 transition-colors"
              >
                Continue to login
              </button>
              <button
                type="button"
                onClick={() => setShowConsent(false)}
                className="flex-1 rounded-lg border border-pink-200 bg-white px-4 py-3 text-sm font-medium text-black hover:bg-pink-50 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
