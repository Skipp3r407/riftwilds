import { NextResponse } from "next/server";
import { attachGuestCookie, resolveOwnerKey } from "@/lib/auth/owner-key";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { claimStarterEgg, eggTypeLabel } from "@/game/eggs/hatchery-store";

export async function POST() {
  if (!isFeatureEnabled("STARTER_EGG_CLAIMS_ENABLED") || !isFeatureEnabled("EGG_SYSTEM_ENABLED")) {
    return NextResponse.json({ error: "CLAIMS_DISABLED" }, { status: 403 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  try {
    const egg = claimStarterEgg(ownerKey);
    const res = NextResponse.json({
      egg: {
        ...egg,
        eggTypeLabel: eggTypeLabel(egg.eggType),
      },
      demo: true,
      message: "Starter Common Rift Egg claimed. Incubation is short in demo mode.",
    });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "CLAIM_FAILED";
    const status = msg === "STARTER_ALREADY_CLAIMED" ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
