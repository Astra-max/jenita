import { NextResponse } from "next/server";
import { downloadBuilds } from "@/lib/data";
import type { OS } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const os = (searchParams.get("os") as OS) ?? "macOS";
  const build = downloadBuilds[os] ?? downloadBuilds.macOS;
  return NextResponse.json(build);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const os = (body.os as OS) ?? "macOS";
  // Simulate a short server delay for a real download trigger.
  await new Promise((resolve) => setTimeout(resolve, 500));
  return NextResponse.json({ ok: true, os, downloadUrl: `/downloads/jenita-${os.toLowerCase()}.dmg` });
}
