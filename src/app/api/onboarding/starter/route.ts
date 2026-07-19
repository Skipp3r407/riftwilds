import { NextResponse } from "next/server";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { ensureStarterPackage } from "@/game/onboarding/starter-package";

/**
 * GET — first-login / new-keeper package status.
 * Free to play: no wallet, SOL, or $RIFT required.
 */
export async function GET() {
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const autoClaim =
    isFeatureEnabled("STARTER_PACKAGE_AUTO_GRANT_ENABLED") &&
    isFeatureEnabled("STARTER_EGG_CLAIMS_ENABLED");
  const pack = ensureStarterPackage(ownerKey, { autoClaimEgg: autoClaim });
  const res = NextResponse.json({
    ...pack,
    demo: true,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
