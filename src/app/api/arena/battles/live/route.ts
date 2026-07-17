import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    battles: [],
    note: "Live public battles appear when spectator mode is enabled (Phase 2).",
  });
}
