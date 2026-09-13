"use client";

import { useState } from "react";
import { X, Calendar, Clock, Tag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    time: string;
    due_date: string;
    meta: string;
    priority: "low" | "normal" | "high" | "urgent";
  }) => Promise<any>;
  isLoading?: boolean;
}

export function TaskModal({ isOpen, onClose, onSubmit, isLoading }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("3:00 PM");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [meta, setMeta] = useState("Focus block");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }
    if (!time.trim()) {
      setError("Time is required");
      return;
    }

    setError("");
    try {
      await onSubmit({ title, time, due_date: dueDate, meta, priority });
      setTitle("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save task");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-bloom-100 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-bloom-100 pb-4">
          <h3 className="font-display text-lg font-bold text-ink">Schedule New Item</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-soft hover:bg-sand-100 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-bloom-100/60 p-3 text-xs text-bloom-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Task or Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Client roadmap review"
              className="mt-1.5 h-10 w-full rounded-xl border border-bloom-200 px-3.5 text-sm text-ink outline-none focus:border-bloom-400"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Time
              </label>
              <div className="relative mt-1.5 flex items-center">
                <Clock className="absolute left-3 h-4 w-4 text-ink-soft" />
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 2:30 PM"
                  className="h-10 w-full rounded-xl border border-bloom-200 pl-9 pr-3 text-sm text-ink outline-none focus:border-bloom-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Date
              </label>
              <div className="relative mt-1.5 flex items-center">
                <Calendar className="absolute left-3 h-4 w-4 text-ink-soft" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-bloom-200 pl-9 pr-3 text-sm text-ink outline-none focus:border-bloom-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Context / Tag
            </label>
            <div className="relative mt-1.5 flex items-center">
              <Tag className="absolute left-3 h-4 w-4 text-ink-soft" />
              <input
                type="text"
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
                placeholder="e.g. Zoom · with Team, or Focus block · 1 hr"
                className="h-10 w-full rounded-xl border border-bloom-200 pl-9 pr-3 text-sm text-ink outline-none focus:border-bloom-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Priority
            </label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {(["low", "normal", "high", "urgent"] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`rounded-xl py-2 text-xs font-medium capitalize transition-colors ${
                    priority === p
                      ? "bg-bloom-500 text-white font-semibold"
                      : "bg-sand-100 text-ink-soft hover:bg-sand-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft hover:bg-sand-100"
            >
              Cancel
            </button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Scheduling..." : "Schedule Item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
