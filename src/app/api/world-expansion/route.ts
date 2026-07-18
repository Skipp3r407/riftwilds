import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, resolveOwnerKey } from "@/lib/auth/owner-key";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { withApiGuard } from "@/lib/security/api-guard";
import {
  adminApprove,
  adminArchive,
  adminAuditLog,
  adminForceGenerate,
  adminPause,
  adminRename,
  adminResume,
  adminRetryJob,
  adminSnapshot,
  assertClientCannotCreateMaps,
  assignPlayerToMap,
  claimFounderRewards,
  listPublicDirectory,
  listTemplates,
  sanitizeMapForClient,
  tickCapacityOrchestrator,
} from "@/lib/world-expansion";

const bodySchema = z.object({
  action: z.enum([
    "assign",
    "directory",
    "templates",
    "founder_claim",
    "map",
    // admin (rate-limited; actor required)
    "approve",
    "pause",
    "resume",
    "force_generate",
    "retry",
    "archive",
    "rename",
    "tick",
    "admin_snapshot",
    "audit",
  ]),
  mapId: z.string().optional(),
  publicName: z.string().max(64).optional(),
  templateKey: z
    .enum([
      "forest_hamlet",
      "coastal_village",
      "mountain_hold",
      "farming_croft",
      "merchant_crossroads",
      "harbor_port",
      "beginner_meadow",
      "guild_banner_court",
      "island_archipelago",
      "rift_edge_outpost",
    ])
    .optional(),
  jobId: z.string().optional(),
  sourceMapId: z.string().optional(),
  mapKind: z.enum(["permanent", "overflow"]).optional(),
  autoOpen: z.boolean().optional(),
  completeArchive: z.boolean().optional(),
  isNewPlayer: z.boolean().optional(),
  wantsHousing: z.boolean().optional(),
  friendMapIds: z.array(z.string()).optional(),
  guildMapId: z.string().nullable().optional(),
  preferredRegionSlug: z.string().optional(),
  overflowEventKey: z.string().optional(),
  /** Forbidden if present — security check rejects. */
  seed: z.string().optional(),
  actorId: z.string().optional(),
});

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "world-expansion",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.WORLD_EXPANSION_ENABLED) {
    return NextResponse.json({ ok: false, error: "disabled" }, { status: 503 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const url = new URL(request.url);
  const mapId = url.searchParams.get("mapId");

  const payload = {
    ok: true as const,
    requestId: guard.requestId,
    ownerKey,
    directory: listPublicDirectory({ userId: ownerKey }),
    templates: listTemplates().map((t) => ({
      key: t.key,
      name: t.name,
      biome: t.biome,
      blurb: t.blurb,
      allowsPermanentHousing: t.allowsPermanentHousing,
      mapKind: t.mapKind,
    })),
    map: mapId ? sanitizeMapForClient(mapId) : null,
    prismaPrepared: featureFlagDefaults.WORLD_EXPANSION_PRISMA_ENABLED,
  };

  const res = NextResponse.json(payload);
  if (isGuest && guestToken) attachGuestCookie(res, guestToken);
  return res;
}

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "world-expansion-write",
    limit: 40,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
    auditAction: "world_expansion_write",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.WORLD_EXPANSION_ENABLED) {
    return NextResponse.json({ ok: false, error: "disabled" }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid", issues: parsed.error.issues }, { status: 400 });
  }

  const body = parsed.data;
  const security = assertClientCannotCreateMaps(body as Record<string, unknown>);
  if (!security.ok) {
    return NextResponse.json({ ok: false, error: security.error }, { status: 403 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const actorId = body.actorId ?? ownerKey;

  let result: Record<string, unknown>;

  switch (body.action) {
    case "directory":
      result = { directory: listPublicDirectory({ userId: ownerKey, friendMapIds: body.friendMapIds, guildMapId: body.guildMapId }) };
      break;
    case "templates":
      result = { templates: listTemplates() };
      break;
    case "map":
      result = { map: body.mapId ? sanitizeMapForClient(body.mapId) : null };
      break;
    case "assign": {
      const assigned = assignPlayerToMap({
        userId: ownerKey,
        isNewPlayer: body.isNewPlayer,
        wantsHousing: body.wantsHousing,
        friendMapIds: body.friendMapIds,
        guildMapId: body.guildMapId,
        preferredRegionSlug: body.preferredRegionSlug,
        overflowEventKey: body.overflowEventKey,
      });
      result = assigned.ok
        ? { assignment: assigned.assignment, map: sanitizeMapForClient(assigned.map.mapId) }
        : { error: assigned.error, message: assigned.message };
      break;
    }
    case "founder_claim": {
      if (!body.mapId) {
        result = { error: "mapId_required" };
        break;
      }
      const claim = claimFounderRewards({ userId: ownerKey, mapId: body.mapId });
      result = claim.ok ? { reward: claim.reward } : { error: claim.error, message: claim.message };
      break;
    }
    case "approve":
      result = body.mapId ? adminApprove(body.mapId, actorId) : { ok: false, error: "mapId_required" };
      break;
    case "pause":
      result = body.mapId ? adminPause(body.mapId, actorId) : { ok: false, error: "mapId_required" };
      break;
    case "resume":
      result = body.mapId ? adminResume(body.mapId, actorId) : { ok: false, error: "mapId_required" };
      break;
    case "force_generate":
      if (!body.templateKey) {
        result = { ok: false, error: "templateKey_required" };
        break;
      }
      result = adminForceGenerate({
        actorId,
        templateKey: body.templateKey,
        sourceMapId: body.sourceMapId,
        mapKind: body.mapKind,
        autoOpen: body.autoOpen,
      });
      break;
    case "retry":
      result = body.jobId ? adminRetryJob(body.jobId, actorId) : { ok: false, error: "jobId_required" };
      break;
    case "archive":
      result = body.mapId
        ? adminArchive(body.mapId, actorId, body.completeArchive)
        : { ok: false, error: "mapId_required" };
      break;
    case "rename":
      result =
        body.mapId && body.publicName
          ? adminRename(body.mapId, body.publicName, actorId)
          : { ok: false, error: "mapId_and_name_required" };
      break;
    case "tick":
      result = tickCapacityOrchestrator();
      break;
    case "admin_snapshot":
      result = adminSnapshot();
      break;
    case "audit":
      result = { audit: adminAuditLog(50) };
      break;
    default:
      result = { error: "unknown_action" };
  }

  const res = NextResponse.json({ ok: !("error" in result && result.error), requestId: guard.requestId, ...result });
  if (isGuest && guestToken) attachGuestCookie(res, guestToken);
  return res;
}
