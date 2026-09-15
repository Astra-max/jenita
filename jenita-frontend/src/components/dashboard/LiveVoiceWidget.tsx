"use client";

import { useEffect, useState } from "react";
import { Mic, MicOff, RefreshCw, Sparkles, Send, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { VoiceWaveform } from "@/components/ui/VoiceWaveform";
import { useGeminiLive } from "@/hooks/useGeminiLive";
import { cn } from "@/lib/utils";

interface LiveVoiceWidgetProps {
  onTaskUpdated?: () => void;
}

export function LiveVoiceWidget({ onTaskUpdated }: LiveVoiceWidgetProps) {
  const {
    status,
    reconnectAttempt,
    maxAttempts,
    statusMessage,
    isMicActive,
    audioLevel,
    messages,
    connect,
    disconnect,
    toggleMic,
    sendText,
  } = useGeminiLive({ onTaskUpdated });

  const [inputVal, setInputVal] = useState("");
  const [hasAutoGreeted, setHasAutoGreeted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("jenita_voice_consent") === "granted") {
      connect();
    }
  }, [connect]);

  useEffect(() => {
    if (status === "connected" && !hasAutoGreeted) {
      setHasAutoGreeted(true);
      window.setTimeout(() => {
        sendText("Hello! Please greet me warmly and tell me what is most important today.");
      }, 900);
    }
  }, [status, hasAutoGreeted, sendText]);

  const samplePrompts = [
    "Reschedule Client sync to 5:00 PM",
    "Confirm my upcoming reminder",
    "What's on my plate today?",
    "Snooze current task 15 minutes",
  ];

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputVal.trim()) return;
    sendText(inputVal.trim());
    setInputVal("");
  }

  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-ink p-5 text-white shadow-2xl shadow-ink/40">
      {/* Top Bar with Connection Status Badge */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3 items-center justify-center">
            {status === "connected" && (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </>
            )}
            {status === "reconnecting" && (
              <span className="relative inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-amber-400" />
            )}
            {status === "connecting" && (
              <span className="relative inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-sky-400" />
            )}
            {(status === "disconnected" || status === "error") && (
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
            )}
          </div>
          <span className="text-xs font-semibold tracking-wide text-white/90">
            Jenita Gemini Live
          </span>
        </div>

        <div className="flex items-center gap-2">
          {status === "connected" && (
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
              Live Stream
            </span>
          )}
          {status === "reconnecting" && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Retrying ({reconnectAttempt}/{maxAttempts})
            </span>
          )}
          {status === "connecting" && (
            <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[11px] font-medium text-sky-300">
              Connecting…
            </span>
          )}
          {(status === "disconnected" || status === "error") && (
            <button
              onClick={connect}
              className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/80 hover:bg-white/20 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Connect
            </button>
          )}
        </div>
      </div>

      {/* Waveform Visualizer */}
      <div className="relative my-4 flex h-20 flex-col items-center justify-center rounded-xl bg-white/[0.04] p-3">
        <VoiceWaveform active={isMicActive || status === "connected"} />
        {statusMessage && (
          <p className="mt-2 text-center text-[11px] text-white/60 line-clamp-1">
            {statusMessage}
          </p>
        )}
      </div>

      {/* Live Conversation Stream / Transcript */}
      <div className="mb-4 flex max-h-48 min-h-[5rem] flex-col-reverse gap-2 overflow-y-auto rounded-xl bg-white/[0.03] p-3 text-xs">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <p className="text-center text-white/40 italic py-3">
              Tap the mic or type a command to speak with Jenita.
            </p>
          ) : (
            messages
              .slice(-5)
              .reverse()
              .map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "rounded-lg p-2 leading-relaxed",
                    m.speaker === "user" && "ml-auto bg-bloom-500/20 text-bloom-200",
                    m.speaker === "jenita" && "mr-auto bg-white/10 text-white/90",
                    m.speaker === "system" && "mx-auto bg-amber-500/15 text-amber-200 font-medium"
                  )}
                >
                  <span className="font-semibold capitalize text-white/50 block text-[10px] mb-0.5">
                    {m.speaker === "system" ? "Action" : m.speaker}
                  </span>
                  {m.text}
                </motion.div>
              ))
          )}
        </AnimatePresence>
      </div>

      {/* Suggested Spoken Commands */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {samplePrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => sendText(prompt)}
            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70 transition-colors hover:border-bloom-400 hover:bg-bloom-500/20 hover:text-bloom-200"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Mic & Text Input Controls */}
      <div className="space-y-2">
        <button
          onClick={toggleMic}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-all",
            isMicActive
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse"
              : "bg-bloom-400 text-ink hover:bg-bloom-300"
          )}
        >
          {isMicActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          {isMicActive ? "Mute" : "Go"}
        </button>

        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Or type a command (e.g. reschedule...)"
            className="h-9 w-full rounded-full border border-white/15 bg-white/5 pl-4 pr-10 text-xs text-white placeholder:text-white/40 outline-none focus:border-bloom-400"
          />
          <button
            type="submit"
            className="absolute right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-bloom-400 hover:text-ink transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
