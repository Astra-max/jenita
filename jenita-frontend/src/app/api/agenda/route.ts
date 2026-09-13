import { NextResponse } from "next/server";
import { agenda } from "@/lib/data";

export async function GET() {
  return NextResponse.json(agenda);
}
