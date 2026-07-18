import { NextResponse } from "next/server";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import {
  claimStarterEgg,
  eggTypeLabel,
  getFreeStarterPoolStatus,
  getHatcheryOfferStatus,
} from "@/game/eggs/hatchery-store";

export async function POST() {
  if (!isFeatureEnabled("STARTER_EGG_CLAIMS_ENABLED") || !isFeatureEnabled("EGG_SYSTEM_ENABLED")) {
    return NextResponse.json({ error: "CLAIMS_DISABLED" }, { status: 403 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  try {
    const egg = claimStarterEgg(ownerKey);
    const offer = getHatcheryOfferStatus(ownerKey);
    const res = NextResponse.json({
      egg: {
        ...egg,
        eggTypeLabel: eggTypeLabel(egg.eggType),
      },
      offer,
      freePool: getFreeStarterPoolStatus(),
      demo: true,
      message: "Starter Common Rift Egg claimed. Incubation is short in demo mode.",
      ...guestIdentityFields(isGuest, guestToken),
    });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "CLAIM_FAILED";
    const status =
      msg === "STARTER_ALREADY_CLAIMED"
        ? 409
        : msg === "FREE_POOL_EXHAUSTED"
          ? 410
          : 400;
    const offer = getHatcheryOfferStatus(ownerKey);
    const res = NextResponse.json(
      {
        error: msg,
        offer,
        freePool: getFreeStarterPoolStatus(),
        message:
          msg === "FREE_POOL_EXHAUSTED"
            ? "Free starter eggs are gone. Buy a premium egg with Credits."
            : msg === "STARTER_ALREADY_CLAIMED"
              ? "You already claimed your free starter egg. Premium eggs are available for Credits."
              : msg,
        ...guestIdentityFields(isGuest, guestToken),
      },
      { status },
    );
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }
}
