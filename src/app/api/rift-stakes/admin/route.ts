import { NextResponse } from "next/server";
import {
  getAdminState,
  listAdminLogs,
  setAdminFeeBps,
  setPauseFlags,
  upsertPromotion,
} from "@/game/rift-stakes/admin";
import { isRiftStakesEnabled, MAX_FEE_BPS } from "@/game/rift-stakes/config";
import type { PromoFeeEvent } from "@/game/rift-stakes/types";

export async function GET() {
  if (!isRiftStakesEnabled()) {
    return NextResponse.json({ error: "RIFT_STAKES_DISABLED" }, { status: 403 });
  }
  return NextResponse.json({
    ...listAdminLogs(),
    maxFeeBps: MAX_FEE_BPS,
  });
}

export async function POST(req: Request) {
  if (!isRiftStakesEnabled()) {
    return NextResponse.json({ error: "RIFT_STAKES_DISABLED" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    action?: "set_fee" | "pause" | "promo";
    feeBps?: number;
    stakesPaused?: boolean;
    treasuryPaused?: boolean;
    matchmakingPaused?: boolean;
    pauseReason?: string | null;
    promo?: PromoFeeEvent;
  };

  if (body.action === "set_fee") {
    const result = setAdminFeeBps(body.feeBps ?? 200);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  if (body.action === "pause") {
    const admin = setPauseFlags({
      stakesPaused: body.stakesPaused,
      treasuryPaused: body.treasuryPaused,
      matchmakingPaused: body.matchmakingPaused,
      pauseReason: body.pauseReason,
    });
    return NextResponse.json({ ok: true, admin });
  }

  if (body.action === "promo" && body.promo) {
    upsertPromotion(body.promo);
    return NextResponse.json({ ok: true, admin: getAdminState() });
  }

  return NextResponse.json({ error: "UNKNOWN_ACTION" }, { status: 400 });
}
