import { NextResponse } from "next/server";
import { projectConfig } from "@/lib/config/project";

/**
 * Liveness probe — does not require database.
 * Use /api/ready for dependency checks.
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: projectConfig.PROJECT_NAME,
      version: projectConfig.GAME_VERSION,
      env: process.env.NODE_ENV ?? "development",
      time: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
