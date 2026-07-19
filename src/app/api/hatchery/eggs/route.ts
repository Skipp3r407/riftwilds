import { NextResponse } from "next/server";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import {
  eggTypeLabel,
  getFreeStarterPoolStatus,
  getHatcheryOfferStatus,
  listEggsForOwner,
  listPetsForOwner,
} from "@/game/eggs/hatchery-store";
import { EGG_EARN_PATHS } from "@/game/eggs/earn-paths";
import { listEggTypeKeys } from "@/game/eggs/egg-types";
import { ensureStarterPackage } from "@/game/onboarding/starter-package";

export async function GET() {
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  // Credits + package status only — leave claim UX / smoke claim POST intact.
  const starter = ensureStarterPackage(ownerKey, { autoClaimEgg: false });
  const eggs = listEggsForOwner(ownerKey).map((egg) => ({
    ...egg,
    eggTypeLabel: eggTypeLabel(egg.eggType),
  }));
  const pets = listPetsForOwner(ownerKey);
  const offer = getHatcheryOfferStatus(ownerKey);
  const res = NextResponse.json({
    eggs,
    pets,
    offer,
    freePool: getFreeStarterPoolStatus(),
    starterPackage: starter,
    eggTypes: listEggTypeKeys(),
    earnPaths: EGG_EARN_PATHS,
    freeToPlay: true,
    walletRequired: false,
    messaging: [
      "Free to play — no wallet, SOL, or $RIFT needed to hatch or battle.",
      "Optional token perks are cosmetics only (flags default off).",
    ],
    demo: true,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
