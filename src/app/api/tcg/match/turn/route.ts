import { NextResponse } from "next/server";
import { z } from "zod";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { guestIdentityFields } from "@/lib/auth/owner-key";
import { snapshotTcgMatch, submitTcgAction } from "@/game/tcg/match-store";
import {
  attachTcgGuestCookie,
  readTcgOwnerKey,
} from "@/game/tcg/owner-key";
import { appendReplayHook } from "@/game/rift-arena/replay-hooks";
import { grantBattleXp } from "@/lib/progression";

const bodySchema = z.object({
  publicId: z.string().min(4).max(48),
  action: z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("PLAY_CARD"),
      handInstanceId: z.string().min(1).max(48),
      targetInstanceId: z.string().min(1).max(48).optional(),
    }),
    z.object({ kind: z.literal("END_TURN") }),
    z.object({ kind: z.literal("DECLARE_COMBAT") }),
    z.object({ kind: z.literal("SURRENDER") }),
    z.object({ kind: z.literal("KEEP_HAND") }),
    z.object({
      kind: z.literal("MULLIGAN"),
      replaceInstanceIds: z.array(z.string().min(1).max(48)).max(12),
    }),
    z.object({ kind: z.literal("ENERGY_TO_DRAW") }),
    z.object({
      kind: z.literal("DISCARD_FOR_ENERGY"),
      handInstanceId: z.string().min(1).max(48),
    }),
    z.object({
      kind: z.literal("RECYCLE"),
      handInstanceId: z.string().min(1).max(48),
    }),
    z.object({ kind: z.literal("COMMANDER_DRAW") }),
  ]),
});

export async function POST(req: Request) {
  if (!featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
    return NextResponse.json({ error: "TCG_DISABLED" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_BODY", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const key = await readTcgOwnerKey();
  if (!key) {
    return NextResponse.json({ error: "NO_SESSION" }, { status: 401 });
  }

  const guestToken = key.startsWith("guest_") ? key.slice("guest_".length) : null;

  try {
    const rec = submitTcgAction(
      parsed.data.publicId,
      key,
      parsed.data.action,
    );
    if (!rec) {
      return NextResponse.json({ error: "MATCH_NOT_FOUND" }, { status: 404 });
    }

    appendReplayHook({
      matchPublicId: rec.state.publicId,
      kind: "ACTION",
      mode: rec.state.mode,
      actorKey: key,
      payload: {
        action: parsed.data.action.kind,
        status: rec.state.status,
        turn: rec.state.turn,
      },
    });

    let xpGrant: ReturnType<typeof grantBattleXp> | null = null;
    if (
      featureFlagDefaults.KEEPER_PROGRESSION_ENABLED &&
      rec.state.status === "COMPLETED" &&
      rec.state.winnerId
    ) {
      const playerSide = rec.state.players.find((p) => !p.isAi) ?? rec.state.players[0];
      const won = playerSide != null && rec.state.winnerId === playerSide.id;
      const surrendered = parsed.data.action.kind === "SURRENDER";
      xpGrant = grantBattleXp({
        ownerKey: key,
        won,
        matchId: rec.state.publicId,
        opponentId: rec.state.players.find((p) => p.id !== playerSide?.id)?.id ?? "ai",
        // Surrendering player gets no XP; winner of a concede still earns.
        surrendered: surrendered && !won,
        // Practice AI is legitimate play — not bot-farm detection.
        botMatch: false,
      });
    }

    const res = NextResponse.json({
      ...snapshotTcgMatch(rec, key),
      progressionXp: xpGrant,
      ...guestIdentityFields(Boolean(guestToken), guestToken),
    });
    return attachTcgGuestCookie(res, guestToken);
  } catch (err) {
    const message = err instanceof Error ? err.message : "ACTION_FAILED";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
