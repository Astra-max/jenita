"use client";

import { useState } from "react";
import { Volume2, AlertTriangle, CheckCircle2, Clock, Mail, Play } from "lucide-react";
import { remindersApi } from "@/lib/api";
import { toast } from "sonner";

interface ReminderEscalationCardProps {
  nextReminderTitle?: string;
  nextReminderTime?: string;
  onActionComplete?: () => void;
}

export function ReminderEscalationCard({
  nextReminderTitle = "Deep work: Q4 roadmap",
  nextReminderTime = "2:00 PM",
  onActionComplete,
}: ReminderEscalationCardProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeEscalation, setActiveEscalation] = useState<any | null>(null);

  async function handleSimulate() {
    setIsSimulating(true);
    try {
      const state = await remindersApi.triggerTest();
      setActiveEscalation(state);
      toast.info(`Voice alert triggered: ${state.message}`);
      if (onActionComplete) onActionComplete();
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger reminder simulation");
    } finally {
      setIsSimulating(false);
    }
  }

  async function handleConfirm() {
    if (!activeEscalation) return;
    try {
      await remindersApi.confirm(activeEscalation.task_id);
      toast.success(`Confirmed reminder for "${activeEscalation.task_title}"`);
      setActiveEscalation(null);
      if (onActionComplete) onActionComplete();
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm reminder");
    }
  }

  async function handleSnooze() {
    if (!activeEscalation) return;
    try {
      await remindersApi.snooze(activeEscalation.task_id, 15);
      toast.info(`Snoozed "${activeEscalation.task_title}" for 15 minutes`);
      setActiveEscalation(null);
      if (onActionComplete) onActionComplete();
    } catch (err: any) {
      toast.error(err.message || "Failed to snooze reminder");
    }
  }

  return (
    <div className="rounded-2xl border border-bloom-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-bloom-500" />
          <h3 className="font-semibold text-sm text-ink">Voice Reminder Agent</h3>
        </div>
        <span className="rounded-full bg-bloom-100 px-2.5 py-0.5 text-xs font-medium text-bloom-600">
          Escalation Loop
        </span>
      </div>

      {!activeEscalation ? (
        <div className="mt-3">
          <p className="text-xs text-ink-soft leading-relaxed">
            Jenita speaks due reminders aloud and escalates until verbally confirmed. Next reminder is{" "}
            <span className="font-semibold text-ink">{nextReminderTitle}</span> scheduled for{" "}
            <span className="font-semibold text-ink">{nextReminderTime}</span>.
          </p>

          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-bloom-50 border border-bloom-200 py-2 text-xs font-semibold text-bloom-700 hover:bg-bloom-100 transition-colors"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {isSimulating ? "Firing alert..." : "Simulate Spoken Reminder"}
          </button>
        </div>
      ) : (
        <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs">
          <div className="flex items-center justify-between text-amber-800 font-semibold mb-1.5">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Spoken Reminder Alert (Loop #{activeEscalation.attempt}/3)
            </span>
            <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Urgent
            </span>
          </div>

          <p className="text-amber-900 leading-relaxed font-medium">
            &ldquo;{activeEscalation.message}&rdquo;
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleConfirm}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 py-1.5 font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirm Done
            </button>
            <button
              onClick={handleSnooze}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white border border-amber-300 py-1.5 font-medium text-amber-800 hover:bg-amber-100 transition-colors"
            >
              <Clock className="h-3.5 w-3.5" />
              Snooze 15m
            </button>
          </div>

          <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-700/80">
            <Mail className="h-3 w-3" />
            <span>Fallback email dispatched if unconfirmed after 3 loops.</span>
          </div>
        </div>
      )}
    </div>
  );
}
