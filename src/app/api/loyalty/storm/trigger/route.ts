import { NextResponse } from "next/server";
import { z } from "zod";
import {
  emergencyCancelStorm,
  triggerRiftStorm,
  tryScheduledStorm,
} from "@/lib/loyalty/service";
import { listStormAuditTrail } from "@/lib/loyalty/rift-storm-engine";
import { getAdminConfigSnapshot } from "@/lib/loyalty/config";
import {
  STORM_FREQUENCY_HINT,
  STORM_WAVES,
  STORM_SOL,
} from "@/lib/loyalty/rift-storm-config";
import { withApiGuard } from "@/lib/security/api-guard";

/**
 * Admin / dev storm controls — Phase 1 open stub (ops should gate by admin role later).
 */
const bodySchema = z.object({
  action: z.enum(["trigger", "cancel", "schedule_tick", "config"]),
  intensity: z.enum(["MINOR", "GREATER", "LEGENDARY", "SEASONAL", "CATACLYSM"]).optional(),
  triggerReason: z
    .enum([
      "RANDOM_ACTIVE_HOURS",
      "SEASONAL",
      "WORLD_BOSS",
      "COMMUNITY_MILESTONE",
      "ADMIN",
      "REGION_OBJECTIVE",
      "ANNIVERSARY",
      "EMERGENCY_STIMULATION",
      "SCHEDULED",
      "DEV",
    ])
    .optional(),
  skipWarning: z.boolean().optional(),
  regionIds: z.array(z.string()).optional(),
  global: z.boolean().optional(),
  solPoolLamports: z.number().int().min(0).optional(),
  cancelReason: z.string().max(200).optional(),
  forceSchedule: z.boolean().optional(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "loyalty-storm-admin",
    limit: 40,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  if (parsed.data.action === "config") {
    return NextResponse.json({
      ok: true,
      loyalty: getAdminConfigSnapshot(),
      waves: STORM_WAVES,
      frequency: STORM_FREQUENCY_HINT,
      sol: { ...STORM_SOL, enabledRuntimeFlag: "RIFT_STORM_SOL_ENABLED" },
      audit: listStormAuditTrail(20),
      requestId: guard.requestId,
    });
  }

  if (parsed.data.action === "cancel") {
    const storm = emergencyCancelStorm(parsed.data.cancelReason ?? "Admin emergency cancellation");
    return NextResponse.json({ ok: true, storm, requestId: guard.requestId });
  }

  if (parsed.data.action === "schedule_tick") {
    const storm = tryScheduledStorm(Boolean(parsed.data.forceSchedule));
    return NextResponse.json({
      ok: true,
      activated: Boolean(storm),
      storm,
      requestId: guard.requestId,
    });
  }

  const storm = triggerRiftStorm({
    triggeredBy: "admin",
    intensity: parsed.data.intensity,
    triggerReason: parsed.data.triggerReason ?? "ADMIN",
    skipWarning: parsed.data.skipWarning ?? false,
    regionIds: parsed.data.regionIds,
    global: parsed.data.global,
    solPoolLamports: parsed.data.solPoolLamports,
  });

  return NextResponse.json({
    ok: true,
    storm,
    requestId: guard.requestId,
    note: "Winners are never revealed early. SOL promo stays flagged off unless armed.",
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    actions: ["trigger", "cancel", "schedule_tick", "config"],
    intensities: ["MINOR", "GREATER", "LEGENDARY", "SEASONAL", "CATACLYSM"],
  });
}
