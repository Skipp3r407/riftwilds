import { NextResponse } from "next/server";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { withApiGuard } from "@/lib/security/api-guard";
import {
  COMMUNITY_SHOP,
  getCommunityTokenBalance,
  getSocialPresenceSnapshot,
  listSocialHubs,
  recommendHubForNewPlayer,
} from "@/lib/social-presence";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-presence-profile",
    limit: 120,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (
    !featureFlagDefaults.SOCIAL_PRESENCE_ENABLED &&
    !featureFlagDefaults.LIVING_SERVER_POPULATION_ENABLED
  ) {
    return NextResponse.json({ enabled: false }, { status: 403 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const snapshot = getSocialPresenceSnapshot({ userId: ownerKey });
  const res = NextResponse.json({
    requestId: guard.requestId,
    enabled: true,
    snapshot,
    communityTokens: getCommunityTokenBalance(ownerKey),
    shop: featureFlagDefaults.COMMUNITY_TOKENS_ENABLED ? COMMUNITY_SHOP : [],
    hubs: listSocialHubs(),
    recommendedHub: recommendHubForNewPlayer(),
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
