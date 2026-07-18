import { NextResponse } from "next/server";
import {
  attachGuestCookie,
  guestIdentityFields,
} from "@/lib/auth/owner-key";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { resolvePersistenceOwner } from "@/lib/persistence/owner-resolve";
import { withApiGuard } from "@/lib/security/api-guard";
import { ensureSocialProfile, getSocialSummary } from "@/lib/social";

/** Lightweight unread / request badge payload for nav. */
export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-summary",
    limit: 120,
    windowMs: 60_000,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.FRIENDS_AND_PM_ENABLED) {
    return NextResponse.json({
      ok: true,
      requestId: guard.requestId,
      enabled: false,
      summary: {
        friendsCount: 0,
        onlineFriendsCount: 0,
        pendingIncomingRequests: 0,
        unreadMessages: 0,
      },
    });
  }

  const owner = await resolvePersistenceOwner();
  ensureSocialProfile(owner.ownerKey);
  const summary = getSocialSummary(owner.ownerKey);
  const badgeCount = summary.unreadMessages + summary.pendingIncomingRequests;

  const res = NextResponse.json({
    ok: true,
    requestId: guard.requestId,
    enabled: true,
    summary,
    badgeCount,
    ...guestIdentityFields(owner.isGuest, owner.guestToken),
  });
  if (owner.isGuest) attachGuestCookie(res, owner.guestToken);
  return res;
}
