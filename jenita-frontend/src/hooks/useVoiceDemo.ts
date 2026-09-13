import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAppDispatch } from "@/store/hooks";
import { setPhase, setResponse } from "@/store/slices/voiceDemoSlice";

async function askJenita() {
  const res = await fetch("/api/voice-demo", { method: "POST" });
  if (!res.ok) throw new Error("Jenita didn't catch that.");
  return res.json() as Promise<{ ok: boolean; message: string }>;
}

export function useVoiceDemo() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: askJenita,
    onMutate: () => {
      dispatch(setPhase("thinking"));
    },
    onSuccess: (data) => {
      dispatch(setResponse(data.message));
      toast.success(data.message);
    },
    onError: () => {
      dispatch(setPhase("idle"));
      toast.error("Jenita didn't catch that. Try again.");
    },
  });
}
