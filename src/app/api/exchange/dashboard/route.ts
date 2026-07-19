import { NextResponse } from "next/server";
import { getRiftExchangeDashboard } from "@/lib/exchange";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keeperSeed = searchParams.get("keeper") ?? undefined;
  const dashboard = getRiftExchangeDashboard({ keeperSeed });
  return NextResponse.json({ dashboard });
}
