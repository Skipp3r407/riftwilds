import { NextResponse } from "next/server";
import { getAdminState } from "@/game/rift-stakes/admin";
import { isRiftStakesEnabled } from "@/game/rift-stakes/config";
import {
  enqueueStakes,
  leaveStakesQueue,
  stakesQueueSize,
} from "@/game/rift-stakes/matchmaking";
import type { StakeTierId } from "@/game/rift-stakes/types";
import {
  attachTcgGuestCookie,
  resolveTcgOwnerKey,
} from "@/game/tcg/owner-key";

const TIERS: StakeTierId[] = ["micro", "low", "standard", "high"];

export async function GET() {
  if (!isRiftStakesEnabled()) {
    return NextResponse.json({ error: "RIFT_STAKES_DISABLED" }, { status: 403 });
  }
  return NextResponse.json({
    queueSize: stakesQueueSize(),
    admin: getAdminState(),
  });
}

export async function POST(req: Request) {
  if (!isRiftStakesEnabled()) {
    return NextResponse.json({ error: "RIFT_STAKES_DISABLED" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    action?: "join" | "leave";
    stakeTierId?: string;
    displayName?: string;
    wallet?: string | null;
    vipTierId?: string | null;
    confirmedStake?: boolean;
    confirmedFee?: boolean;
    confirmedPayout?: boolean;
  };

  const { key, guestToken } = await resolveTcgOwnerKey();

  if (body.action === "leave") {
    leaveStakesQueue(key);
    const res = NextResponse.json({ ok: true, left: true, queueSize: stakesQueueSize() });
    return attachTcgGuestCookie(res, guestToken);
  }

  // Never auto-enroll — require explicit confirmation flags
  if (!body.confirmedStake || !body.confirmedFee || !body.confirmedPayout) {
    return NextResponse.json(
      {
        error: "CONFIRMATION_REQUIRED",
        note: "Confirm stake, fee, and payout before joining Rift Stakes queue.",
      },
      { status: 400 },
    );
  }

  const tierId = (body.stakeTierId ?? "standard") as StakeTierId;
  if (!TIERS.includes(tierId)) {
    return NextResponse.json({ error: "UNKNOWN_TIER" }, { status: 400 });
  }

  const result = enqueueStakes({
    ownerKey: key,
    displayName: body.displayName?.trim() || `Keeper-${key.slice(-4)}`,
    wallet: body.wallet ?? null,
    stakeTierId: tierId,
    vipTierId: body.vipTierId ?? null,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const res = NextResponse.json({ ...result, label: "Optional · Real SOL" });
  return attachTcgGuestCookie(res, guestToken);
}
