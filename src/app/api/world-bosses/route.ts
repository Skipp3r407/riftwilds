import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { withApiGuard } from "@/lib/security/api-guard";
import { engageWorldBoss, spawnWorldBoss, worldBossSnapshot } from "@/lib/world-bosses";

const bodySchema = z.object({
  action: z.enum(["spawn", "hit"]),
  damage: z.number().int().min(1).max(250).optional(),
  regionSlug: z.string().min(2).max(64).optional(),
  signals: z
    .array(z.enum(["MOVE", "CAMERA", "INTERACT", "CHAT", "EMOTE", "UI", "PET", "COMBAT"]))
    .max(8)
    .optional(),
});

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "world-boss",
    limit: 100,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;
  return NextResponse.json({ requestId: guard.requestId, ...worldBossSnapshot() });
}

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "world-boss-write",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();

  if (parsed.data.action === "spawn") {
    const boss = spawnWorldBoss({ regionSlug: parsed.data.regionSlug });
    const res = NextResponse.json({
      ok: true,
      boss,
      requestId: guard.requestId,
      ...guestIdentityFields(isGuest, guestToken),
    });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  const result = engageWorldBoss({
    userId: ownerKey,
    damage: parsed.data.damage,
    signals: parsed.data.signals,
  });
  const res = NextResponse.json({
    ...result,
    requestId: guard.requestId,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
