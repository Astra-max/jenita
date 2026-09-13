import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { DownloadBuild, OS } from "@/types";

async function fetchBuild(os: OS): Promise<DownloadBuild> {
  const res = await fetch(`/api/downloads?os=${os}`);
  if (!res.ok) throw new Error("Failed to load build info");
  return res.json();
}

export function useDownloadBuild(os: OS) {
  return useQuery({
    queryKey: ["download-build", os],
    queryFn: () => fetchBuild(os),
  });
}

async function triggerDownload(os: OS) {
  const res = await fetch("/api/downloads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ os }),
  });
  if (!res.ok) throw new Error("Download failed");
  return res.json() as Promise<{ ok: boolean; os: OS; downloadUrl: string }>;
}

export function useStartDownload() {
  return useMutation({
    mutationFn: triggerDownload,
    onSuccess: (data) => {
      toast.success(`Download started for ${data.os}`, {
        description: "Check your downloads folder once it finishes.",
      });
    },
    onError: () => {
      toast.error("Couldn't start the download. Try again.");
    },
  });
}
