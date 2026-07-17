import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * Readiness probe — verifies Postgres connectivity.
 */
export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        ok: true,
        database: "up",
        latencyMs: Date.now() - started,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        database: "down",
        latencyMs: Date.now() - started,
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
