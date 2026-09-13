import { NextResponse } from "next/server";
import { stats } from "@/lib/data";

export async function GET() {
  return NextResponse.json(stats);
}
