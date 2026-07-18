import { NextResponse } from "next/server";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import {
  eggTypeLabel,
  getFreeStarterPoolStatus,
  getHatcheryOfferStatus,
  listEggsForOwner,
  listPetsForOwner,
} from "@/game/eggs/hatchery-store";
import { ensureStarterCredits } from "@/lib/credits/ledger";

export async function GET() {
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  ensureStarterCredits(ownerKey);
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
    demo: true,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
