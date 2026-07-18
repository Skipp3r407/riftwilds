import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, resolveOwnerKey } from "@/lib/auth/owner-key";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { withApiGuard } from "@/lib/security/api-guard";
import {
  approveGuildRelocation,
  commitRelocation,
  requestRelocation,
} from "@/lib/world-expansion";

const bodySchema = z.object({
  action: z.enum(["request", "commit", "guild_approve"]),
  toMapId: z.string().optional(),
  toPlotId: z.string().nullable().optional(),
  idempotencyKey: z.string().min(8).max(128).optional(),
  relocationId: z.string().optional(),
  guildApprovalRequired: z.boolean().optional(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "world-expansion-relocate",
    limit: 20,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
    auditAction: "world_expansion_relocate",
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
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const body = parsed.data;
  let result: Record<string, unknown>;

  switch (body.action) {
    case "request": {
      if (!body.toMapId || !body.idempotencyKey) {
        result = { ok: false, error: "toMapId_and_idempotencyKey_required" };
        break;
      }
      result = requestRelocation({
        userId: ownerKey,
        toMapId: body.toMapId,
        toPlotId: body.toPlotId,
        idempotencyKey: body.idempotencyKey,
        guildApprovalRequired: body.guildApprovalRequired,
      });
      break;
    }
    case "commit": {
      if (!body.relocationId) {
        result = { ok: false, error: "relocationId_required" };
        break;
      }
      result = commitRelocation(body.relocationId);
      break;
    }
    case "guild_approve": {
      if (!body.relocationId) {
        result = { ok: false, error: "relocationId_required" };
        break;
      }
      result = approveGuildRelocation({
        relocationId: body.relocationId,
        officerUserId: ownerKey,
      });
      break;
    }
    default:
      result = { ok: false, error: "unknown_action" };
  }

  const res = NextResponse.json({ requestId: guard.requestId, ...result });
  if (isGuest && guestToken) attachGuestCookie(res, guestToken);
  return res;
}
