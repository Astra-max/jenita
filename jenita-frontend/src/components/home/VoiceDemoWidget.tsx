"use client";

import { useMemo } from "react";
import { Mic, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPhase } from "@/store/slices/voiceDemoSlice";
import { useVoiceDemo } from "@/hooks/useVoiceDemo";
import { VoiceWaveform } from "@/components/ui/VoiceWaveform";
import { cn } from "@/lib/utils";

const prompts = [
  "Please summarize the latest project updates and set a reminder for 3 PM.",
  "Reschedule my client meeting to tomorrow at 2.",
  "What's still on my plate today?",
];

export function VoiceDemoWidget() {
  const phase = useAppSelector((s) => s.voiceDemo.phase);
  const lastResponse = useAppSelector((s) => s.voiceDemo.lastResponse);
  const dispatch = useAppDispatch();
  const { mutate, isPending } = useVoiceDemo();

  const isListening = phase === "listening";
  const isThinking = phase === "thinking" || isPending;
  const prompt = useMemo(() => prompts[Math.floor(Math.random() * prompts.length)], [isListening]);

  function handleMicClick() {
    if (isListening) {
      mutate();
      return;
    }
    if (phase === "idle" || phase === "responded") {
      dispatch(setPhase("listening"));
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-ink px-5 py-5 text-white shadow-2xl shadow-ink/30">
      <div className="flex items-center justify-between text-xs text-white/60">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-bloom-300" />
          Voice interaction · Jenita
        </span>
        <span>Live demo</span>
      </div>

      <div className="mt-4 flex h-16 items-center justify-center text-bloom-300">
        <VoiceWaveform active={isListening || isThinking} />
      </div>

      <div className="mt-4 min-h-[3.25rem] text-sm text-white/80">
        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Tap the mic and ask Jenita to plan your afternoon.
            </motion.p>
          )}
          {isListening && (
            <motion.p key="listening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              &ldquo;{prompt}&rdquo;
            </motion.p>
          )}
          {isThinking && (
            <motion.p key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Thinking through your schedule…
            </motion.p>
          )}
          {phase === "responded" && lastResponse && (
            <motion.p
              key="responded"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-bloom-200"
            >
              {lastResponse}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={handleMicClick}
        disabled={isThinking}
        className={cn(
          "mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-white/15 py-2.5 text-sm font-medium transition-colors",
          isListening ? "bg-bloom-400 text-ink" : "bg-white/5 text-white hover:bg-white/10"
        )}
      >
        {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        {isListening ? "Send to Jenita" : isThinking ? "Listening…" : "Tap to speak"}
      </button>
    </div>
  );
}
