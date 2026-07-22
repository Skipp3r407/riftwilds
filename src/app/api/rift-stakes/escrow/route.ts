import { NextResponse } from "next/server";
import { isRiftStakesEnabled } from "@/game/rift-stakes/config";
import { getEscrow, getMatch } from "@/game/rift-stakes/store";

export async function GET(req: Request) {
  if (!isRiftStakesEnabled()) {
    return NextResponse.json({ error: "RIFT_STAKES_DISABLED" }, { status: 403 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "MISSING_ID" }, { status: 400 });
  }
  const escrow = getEscrow(id);
  if (!escrow) {
    return NextResponse.json({ error: "ESCROW_NOT_FOUND" }, { status: 404 });
  }
  const match = getMatch(escrow.matchId);
  return NextResponse.json({
    escrow,
    match,
    fee: escrow.fee,
    phases:
      "CONNECT → CONFIRM → DEPOSIT → LOCKED → MATCH → VERIFY → PAYOUT/REFUND",
    demoMode: escrow.demoMode,
  });
}
