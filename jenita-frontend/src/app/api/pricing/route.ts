import { NextResponse } from "next/server";
import { pricingPlans } from "@/lib/data";

export async function GET() {
  return NextResponse.json(pricingPlans);
}
