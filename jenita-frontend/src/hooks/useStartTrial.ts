import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface TrialPayload {
  email: string;
}

async function startTrial(payload: TrialPayload) {
  const res = await fetch("/api/trial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Something went wrong.");
  }
  return data as { ok: true; message: string };
}

export function useStartTrial() {
  return useMutation({
    mutationFn: startTrial,
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
