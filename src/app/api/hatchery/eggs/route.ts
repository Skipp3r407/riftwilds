import { NextResponse } from "next/server";
import { attachGuestCookie, resolveOwnerKey } from "@/lib/auth/owner-key";
import { eggTypeLabel, listEggsForOwner, listPetsForOwner } from "@/game/eggs/hatchery-store";

export async function GET() {
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const eggs = listEggsForOwner(ownerKey).map((egg) => ({
    ...egg,
    eggTypeLabel: eggTypeLabel(egg.eggType),
  }));
  const pets = listPetsForOwner(ownerKey);
  const res = NextResponse.json({ eggs, pets, demo: true });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
