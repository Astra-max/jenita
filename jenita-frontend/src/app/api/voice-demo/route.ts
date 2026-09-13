import { NextResponse } from "next/server";

const responses = [
  "Reminder set for 3 PM.",
  "Moved Client Sync to tomorrow at 2 PM.",
  "Sent today's summary to your inbox.",
  "Added \"Call Mom\" to your reminders.",
];

export async function POST() {
  await new Promise((resolve) => setTimeout(resolve, 900));
  const message = responses[Math.floor(Math.random() * responses.length)];
  return NextResponse.json({ ok: true, message });
}
