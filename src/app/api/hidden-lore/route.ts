import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import {
  discoverSecret,
  listSecretHints,
  listUnlockedSecrets,
} from "@/lib/hidden-lore";
import { withApiGuard } from "@/lib/security/api-guard";

const bodySchema = z.object({
  discoveryId: z.string().min(2).max(64),
  engaged: z.boolean().default(true),
});

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "hidden-lore",
    limit: 100,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;
  const url = new URL(request.url);
  const regionSlug = url.searchParams.get("regionSlug") ?? undefined;
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const res = NextResponse.json({
    requestId: guard.requestId,
    hints: listSecretHints(regionSlug),
    unlocked: listUnlockedSecrets(ownerKey),
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "hidden-lore-discover",
    limit: 40,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const result = discoverSecret({
    userId: ownerKey,
    discoveryId: parsed.data.discoveryId,
    engaged: parsed.data.engaged,
    requestId: guard.requestId,
  });
  const res = NextResponse.json({
    ...result,
    requestId: guard.requestId,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
