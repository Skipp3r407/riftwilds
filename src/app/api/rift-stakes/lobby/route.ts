import { NextResponse } from "next/server";
import { getStakeTier, isRiftStakesEnabled } from "@/game/rift-stakes/config";
import { buildConfirmationSummary } from "@/game/rift-stakes/fees";
import { resolveEffectiveFee } from "@/game/rift-stakes/fee-resolver";
import type { StakeTierId } from "@/game/rift-stakes/types";
import {
  attachTcgGuestCookie,
  resolveTcgOwnerKey,
} from "@/game/tcg/owner-key";

/** Preview confirmation numbers before queue join — no enrollment. */
export async function POST(req: Request) {
  if (!isRiftStakesEnabled()) {
    return NextResponse.json({ error: "RIFT_STAKES_DISABLED" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    stakeTierId?: string;
    vipTierId?: string;
  };
  const tier = getStakeTier(body.stakeTierId ?? "standard");
  if (!tier) {
    return NextResponse.json({ error: "UNKNOWN_TIER" }, { status: 400 });
  }

  const { key, guestToken } = await resolveTcgOwnerKey();
  const fee = resolveEffectiveFee({
    stakePerPlayerLamports: tier.stakeLamports,
    vipTierId: body.vipTierId ?? null,
  });

  const res = NextResponse.json({
    ownerKey: key,
    stakeTierId: tier.id as StakeTierId,
    confirmation: buildConfirmationSummary(fee),
    fee,
    requiresExplicitConfirm: true,
    label: "Optional · Real SOL",
    note: "No funds moved. Confirm in UI then POST /api/rift-stakes/queue.",
  });
  return attachTcgGuestCookie(res, guestToken);
}
