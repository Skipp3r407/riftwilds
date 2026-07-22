import { NextResponse } from "next/server";
import { isRiftStakesEnabled } from "@/game/rift-stakes/config";
import {
  cancelOrRefundMatch,
  depositForMatch,
  settleMatchServer,
} from "@/game/rift-stakes/match-service";
import { getEscrow, getMatch } from "@/game/rift-stakes/store";
import {
  attachTcgGuestCookie,
  resolveTcgOwnerKey,
} from "@/game/tcg/owner-key";

export async function GET(req: Request) {
  if (!isRiftStakesEnabled()) {
    return NextResponse.json({ error: "RIFT_STAKES_DISABLED" }, { status: 403 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "MISSING_ID" }, { status: 400 });
  }
  const match = getMatch(id);
  if (!match) {
    return NextResponse.json({ error: "MATCH_NOT_FOUND" }, { status: 404 });
  }
  const escrow = match.escrowId ? getEscrow(match.escrowId) : null;
  return NextResponse.json({
    match,
    escrow,
    fee: match.feeSnapshot ?? escrow?.fee ?? null,
    label: "Optional · Real SOL",
  });
}

export async function POST(req: Request) {
  if (!isRiftStakesEnabled()) {
    return NextResponse.json({ error: "RIFT_STAKES_DISABLED" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    action?: "deposit" | "settle" | "refund" | "forfeit_demo";
    matchId?: string;
    /** DEMO-only: server simulates a win for the caller after lock */
    claimSelfWinDemo?: boolean;
  };

  const { key, guestToken } = await resolveTcgOwnerKey();
  if (!body.matchId) {
    return NextResponse.json({ error: "MISSING_MATCH_ID" }, { status: 400 });
  }

  if (body.action === "deposit") {
    const result = depositForMatch({ matchId: body.matchId, ownerKey: key });
    const res = NextResponse.json(result, { status: result.ok ? 200 : 400 });
    return attachTcgGuestCookie(res, guestToken);
  }

  if (body.action === "refund") {
    const result = cancelOrRefundMatch({
      matchId: body.matchId,
      reason: "PLAYER_CANCEL_OR_DISCONNECT",
    });
    const res = NextResponse.json(result, { status: result.ok ? 200 : 400 });
    return attachTcgGuestCookie(res, guestToken);
  }

  if (body.action === "settle" || body.action === "forfeit_demo") {
    const match = getMatch(body.matchId);
    if (!match) {
      return NextResponse.json({ error: "MATCH_NOT_FOUND" }, { status: 404 });
    }
    // DEMO vertical slice: allow participant to trigger server settle as self-win
    // after escrow locked. Production will replace with match-engine verify only.
    if (!body.claimSelfWinDemo) {
      return NextResponse.json(
        {
          error: "SERVER_VERIFY_REQUIRED",
          note: "Payouts are server-authoritative. Pass claimSelfWinDemo only in DEMO.",
        },
        { status: 400 },
      );
    }
    if (key !== match.hostOwnerKey && key !== match.guestOwnerKey) {
      return NextResponse.json({ error: "NOT_PARTICIPANT" }, { status: 403 });
    }
    const result = settleMatchServer({
      matchId: body.matchId,
      winnerOwnerKey: key,
    });
    const res = NextResponse.json(
      { ...result, demo: true, note: "DEMO settle — replace with engine verify" },
      { status: result.ok ? 200 : 400 },
    );
    return attachTcgGuestCookie(res, guestToken);
  }

  return NextResponse.json({ error: "UNKNOWN_ACTION" }, { status: 400 });
}
