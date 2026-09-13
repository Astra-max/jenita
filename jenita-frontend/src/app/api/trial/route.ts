import { NextResponse } from "next/server";
import { z } from "zod";

const trialSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = trialSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 600));

  return NextResponse.json({
    ok: true,
    message: "Free trial started. Check your email to confirm.",
  });
}
