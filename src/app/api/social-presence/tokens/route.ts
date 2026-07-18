import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { withApiGuard } from "@/lib/security/api-guard";
import {
  COMMUNITY_SHOP,
  getCommunityTokenBalance,
  purchaseCommunityShopItem,
  tokensEarnedToday,
  COMMUNITY_TOKENS_DAY_CAP,
  COMMUNITY_TOKENS_WEEK_CAP,
} from "@/lib/social-presence";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-presence-tokens",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.COMMUNITY_TOKENS_ENABLED) {
    return NextResponse.json({ enabled: false }, { status: 403 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const res = NextResponse.json({
    requestId: guard.requestId,
    enabled: true,
    balance: getCommunityTokenBalance(ownerKey),
    earnedToday: tokensEarnedToday(ownerKey),
    dayCap: COMMUNITY_TOKENS_DAY_CAP,
    weekCap: COMMUNITY_TOKENS_WEEK_CAP,
    shop: COMMUNITY_SHOP,
    note: "Community Tokens are account-bound, non-transferable, never sold for SOL.",
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

const buySchema = z.object({ itemId: z.string().min(2).max(64) });

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-presence-tokens-buy",
    limit: 20,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.COMMUNITY_TOKENS_ENABLED) {
    return NextResponse.json({ ok: false, error: "feature_disabled" }, { status: 403 });
  }

  const parsed = buySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const result = purchaseCommunityShopItem({
    userId: ownerKey,
    itemId: parsed.data.itemId,
  });
  const res = NextResponse.json({
    requestId: guard.requestId,
    ...result,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
