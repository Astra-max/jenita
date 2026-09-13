"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "@/lib/api";
import { toast } from "sonner";
import { agenda as fallbackAgenda } from "@/lib/data";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  time: string;
  due_date: string;
  meta: string;
  status: "pending" | "confirmed" | "done";
  priority: "low" | "normal" | "high" | "urgent";
  recurrence?: string;
  created_at?: string;
}

export function useTasks(date?: string) {
  const queryClient = useQueryClient();

  // Query: Tasks
  const tasksQuery = useQuery({
    queryKey: ["tasks", date || "today"],
    queryFn: async () => {
      try {
        return await tasksApi.list(date);
      } catch (err) {
        console.warn("Backend tasks query failed, using local fallback:", err);
        return fallbackAgenda as unknown as Task[];
      }
    },
    staleTime: 5000,
  });

  // Query: Stats
  const statsQuery = useQuery({
    queryKey: ["task_stats", date || "today"],
    queryFn: async () => {
      try {
        return await tasksApi.getStats(date);
      } catch {
        // Fallback default stats
        return {
          completed_count: 2,
          total_count: 5,
          focus_hours_left: "3.5 hrs",
          next_reminder_title: "Deep work: Q4 roadmap",
          next_reminder_time: "2:00 PM",
        };
      }
    },
    staleTime: 5000,
  });

  // Invalidate queries helper
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["task_stats"] });
    queryClient.invalidateQueries({ queryKey: ["agenda"] });
  };

  // Mutation: Create
  const createMutation = useMutation({
    mutationFn: (data: { title: string; time: string; due_date?: string; meta?: string; priority?: string }) =>
      tasksApi.create(data),
    onSuccess: (newTask) => {
      toast.success(`Added "${newTask.title}" at ${newTask.time}`);
      refresh();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create task");
    },
  });

  // Mutation: Update status
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "pending" | "confirmed" | "done" }) =>
      tasksApi.updateStatus(id, status),
    onSuccess: (_, vars) => {
      if (vars.status === "confirmed") {
        toast.success("Reminder confirmed!");
      } else if (vars.status === "done") {
        toast.success("Task completed!");
      }
      refresh();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  // Mutation: Snooze
  const snoozeMutation = useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes?: number }) =>
      tasksApi.snooze(id, minutes || 15),
    onSuccess: (updated) => {
      toast.info(`Snoozed "${updated.title}" to ${updated.time}`);
      refresh();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to snooze task");
    },
  });

  // Mutation: Delete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      toast.success("Task deleted");
      refresh();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete task");
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    stats: statsQuery.data,
    createTask: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateStatus: statusMutation.mutate,
    snoozeTask: snoozeMutation.mutate,
    deleteTask: deleteMutation.mutate,
    refresh,
  };
}
