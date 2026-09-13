"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, Circle, Plus, Trash2, Check, RefreshCw } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { TaskModal } from "@/components/dashboard/TaskModal";
import { cn } from "@/lib/utils";

const statusStyles = {
  done: "text-moss-600",
  confirmed: "text-bloom-500",
  pending: "text-ink-soft",
};

const statusIcon = {
  done: CheckCircle2,
  confirmed: Clock3,
  pending: Circle,
};

export function AgendaList() {
  const { tasks, isLoading, createTask, isCreating, updateStatus, snoozeTask, deleteTask, refresh } = useTasks();
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "done">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  return (
    <div className="rounded-2xl border border-bloom-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-bloom-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Today&apos;s agenda</h2>
          <span className="text-xs text-ink-soft">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refresh()}
            className="rounded-full p-2 text-ink-soft hover:bg-sand-100 hover:text-ink transition-colors"
            title="Refresh agenda"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-bloom-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-bloom-600 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Item
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-bloom-100/60 px-6 py-2 bg-sand-50/50">
        {(["all", "pending", "confirmed", "done"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
              filter === tab
                ? "bg-white text-ink shadow-sm border border-bloom-200"
                : "text-ink-soft hover:text-ink"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task List */}
      <ul className="divide-y divide-bloom-100">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="h-16 animate-pulse bg-sand-50" />
          ))
        ) : filteredTasks.length === 0 ? (
          <li className="px-6 py-10 text-center text-sm text-ink-soft">
            No {filter !== "all" ? filter : ""} agenda items for today.
          </li>
        ) : (
          filteredTasks.map((item) => {
            const Icon = statusIcon[item.status as keyof typeof statusIcon] || Circle;
            return (
              <li
                key={item.id}
                className="group flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-sand-50/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      updateStatus({
                        id: item.id,
                        status: item.status === "done" ? "pending" : "done",
                      })
                    }
                    title="Toggle completed"
                    className="shrink-0 transition-transform active:scale-95"
                  >
                    <Icon className={cn("h-5 w-5", statusStyles[item.status as keyof typeof statusStyles])} />
                  </button>
                  <div>
                    <p
                      className={cn(
                        "text-sm font-medium text-ink",
                        item.status === "done" && "line-through text-ink-soft"
                      )}
                    >
                      {item.title}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {item.time} · {item.meta || "General"}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                  {item.status !== "done" && (
                    <>
                      {item.status === "pending" && (
                        <button
                          onClick={() => updateStatus({ id: item.id, status: "confirmed" })}
                          className="rounded-full bg-bloom-100 px-3 py-1.5 text-xs font-semibold text-bloom-700 hover:bg-bloom-200 transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      <button
                        onClick={() => snoozeTask({ id: item.id, minutes: 15 })}
                        className="rounded-full bg-sand-100 px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-sand-200 hover:text-ink transition-colors"
                      >
                        Snooze +15m
                      </button>
                      <button
                        onClick={() => updateStatus({ id: item.id, status: "done" })}
                        className="rounded-full p-1.5 text-moss-600 hover:bg-moss-50 transition-colors"
                        title="Mark Done"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteTask(item.id)}
                    className="opacity-0 group-hover:opacity-100 rounded-full p-1.5 text-ink-soft hover:text-rose-500 hover:bg-rose-50 transition-all"
                    title="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>

      {/* Schedule Item Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createTask}
        isLoading={isCreating}
      />
    </div>
  );
}
