import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import {
  activateWorldEvent,
  cancelWorldEvent,
  listWorldEventAdminSnapshot,
  listWorldEventCatalog,
  tickWorldEventScheduler,
} from "@/lib/world-events";

/**
 * Admin / dev world-event controls — Phase 1 open stub (gate by admin role later).
 */
const bodySchema = z.object({
  action: z.enum(["trigger", "cancel", "schedule_tick", "config", "ensure_demo"]),
  key: z
    .enum([
      "dragon_city_attack",
      "caravan_ambush",
      "goblin_invasion",
      "bridge_collapse",
      "wandering_world_boss",
      "traveling_circus",
      "meteor_crash",
      "rare_rift_opening",
      "shipwreck",
      "haunted_forest_night",
    ])
    .optional(),
  regionSlug: z.string().min(2).max(64).optional(),
  skipAnnounce: z.boolean().optional(),
  cancelReason: z.string().max(200).optional(),
  forceSpawn: z.boolean().optional(),
});

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "world-events-admin",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  return NextResponse.json({
    ok: true,
    snapshot: listWorldEventAdminSnapshot(),
    requestId: guard.requestId,
  });
}

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "world-events-admin",
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
      catalog: listWorldEventCatalog(),
      snapshot: listWorldEventAdminSnapshot(),
      requestId: guard.requestId,
    });
  }

  if (parsed.data.action === "cancel") {
    const instance = cancelWorldEvent(parsed.data.cancelReason ?? "Admin cancellation");
    return NextResponse.json({
      ok: true,
      instance,
      requestId: guard.requestId,
    });
  }

  if (parsed.data.action === "schedule_tick") {
    const tick = tickWorldEventScheduler(Date.now(), {
      forceSpawn: Boolean(parsed.data.forceSpawn),
    });
    return NextResponse.json({
      ok: true,
      ...tick,
      requestId: guard.requestId,
    });
  }

  if (parsed.data.action === "ensure_demo") {
    const { ensureDemoWorldEvent } = await import("@/lib/world-events");
    const instance = ensureDemoWorldEvent();
    return NextResponse.json({ ok: true, instance, requestId: guard.requestId });
  }

  if (!parsed.data.key) {
    return NextResponse.json({ ok: false, error: "MISSING_KEY" }, { status: 400 });
  }

  const instance = activateWorldEvent({
    key: parsed.data.key,
    triggerReason: "ADMIN",
    regionSlug: parsed.data.regionSlug,
    skipAnnounce: parsed.data.skipAnnounce,
    actorId: "admin",
    forceReplace: true,
  });

  return NextResponse.json({
    ok: true,
    instance,
    requestId: guard.requestId,
    note: "Rewards are soft Credits only. Full 100-player boss sync rem