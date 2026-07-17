import { NextResponse } from "next/server";
import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { generateExpedition } from "@/game/expeditions/generator";
import { resolveLivingWorldClock } from "@/game/living-world/clock";
import type { ExpeditionDifficulty } from "@/game/expeditions/types";
import { trackAnalytics } from "@/lib/analytics/events";

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "expedition-generate",
    limit: 40,
    windowMs: 60_000,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
    auditAction: "expedition_generate",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.PROCEDURAL_EXPEDITIONS_ENABLED) {
    return NextResponse.json(
      { ok: false, error: "disabled", requestId: guard.requestId },
      { status: 403 },
    );
  }

  let body: {
    seed?: string;
    regionSlug?: string;
    difficulty?: ExpeditionDifficulty;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const clock = resolveLivingWorldClock();
  const expedition = generateExpedition({
    seed: body.seed ?? `keeper-${Date.now()}`,
    regionSlug: body.regionSlug ?? "riftwild-commons",
    difficulty: body.difficulty ?? "scout",
    clock,
  });

  trackAnalytics("expedition_generated", {
    regionSlug: expedition.regionSlug,
    difficulty: expedition.difficulty,
  });

  return jsonOk({ expedition }, guard.requestId);
}
