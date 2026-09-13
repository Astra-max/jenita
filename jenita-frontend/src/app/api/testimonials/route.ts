import { NextResponse } from "next/server";
import { testimonials } from "@/lib/data";

export async function GET() {
  return NextResponse.json(testimonials);
}
