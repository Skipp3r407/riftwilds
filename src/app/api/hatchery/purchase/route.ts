import { NextResponse } from "next/server";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import {
  eggTypeLabel,
  getHatcheryOfferStatus,
  purchasePremiumEgg,
} from "@/game/eggs/hatchery-store";
import { ensureStarterCredits } from "@/lib/credits/ledger";
import { PREMIUM_EGG_CREDITS_PRICE } from "@/lib/economy/egg-supply";

/**
 * POST — buy a Common Rift Egg with Credits when free claim is unavailable.
 * Soft-currency sink only (never SOL / wallet spend).
 */
export async function POST(req: Request) {
  if (!isFeatureEnabled("STARTER_EGG_CLAIMS_ENABLED") || !isFeatureEnabled("EGG_SYSTEM_ENABLED")) {
    return NextResponse.json({ error: "CLAIMS_DISABLED" }, { status: 403 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  ensureStarterCredits(ownerKey);

  let requestId: string | undefined;
  try {
    const body = (await req.json().catch(() => ({}))) as { requestId?: string };
    if (typeof body.requestId === "string" && body.requestId.length > 0) {
      requestId = body.requestId.slice(0, 128);
    }
  } catch {
    // no body
  }

  const result = purchasePremiumEgg(ownerKey, { requestId });
  const offer = getHatcheryOfferStatus(ownerKey);

  if (!result.ok) {
    const status =
      result.error === "insufficient_credits"
        ? 402
        : result.error === "FREE_CLAIM_STILL_AVAILABLE"
          ? 409
          : result.error === "EGG_SYSTEM_DISABLED"
            ? 403
            : 400;
    const res = NextResponse.json(
      {
        error: result.error,
        message: result.message,
        priceCredits: result.priceCredits,
        balance: result.balance,
        offer,
        ...guestIdentityFields(isGuest, guestToken),
      },
      { status },
    );
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  const res = NextResponse.json({
    egg: {
      ...result.egg,
      eggTypeLabel: eggTypeLabel(result.egg.eggType),
    },
    priceCredits: result.priceCredits,
    balance: result.balance,
    offer,
    demo: true,
    message: `Premium Common Rift Egg purchased for ${PREMIUM_EGG_CREDITS_PRICE} Credits. Incubation is short in demo mode.`,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
