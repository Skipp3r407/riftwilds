import { NextResponse } from "next/server";
import { attachGuestCookie, resolveOwnerKey } from "@/lib/auth/owner-key";
import { listPetsForOwner, petCareSummary } from "@/game/eggs/hatchery-store";

export async function GET() {
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const pets = listPetsForOwner(ownerKey).map((p) => ({
    ...petCareSummary(p),
    speciesSlug: p.speciesSlug,
    affinity: p.affinity,
    rarity: p.rarity,
    temperament: p.temperament,
    memories: p.memories,
  }));
  const res = NextResponse.json({ pets, demo: true });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
