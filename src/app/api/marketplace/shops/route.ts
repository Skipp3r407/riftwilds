import { NextResponse } from "next/server";
import { listPlayerShops } from "@/lib/marketplace/player-shops";

export async function GET() {
  return NextResponse.json({ shops: listPlayerShops() });
}
