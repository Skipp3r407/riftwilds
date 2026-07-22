import { NextResponse } from "next/server";
import { z } from "zod";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { guestIdentityFields } from "@/lib/auth/owner-key";
import {
  getActiveCommanderHeroId,
  getActiveDeckList,
  getCollection,
} from "@/game/tcg/collection-store";
import {
  validateContentDeckList,
  validateDeckList,
} from "@/game/tcg/deck";
import { snapshotTcgMatch, startTcgMatch } from "@/game/tcg/match-store";
import {
  attachTcgGuestCookie,
  resolveTcgOwnerKey,
} from "@/game/tcg/owner-key";
import {
  materializePracticeLoadout,
  resolvePracticeMatchLoadouts,
} from "@/game/tcg/practice-loadout";
import { appendReplayHook } from "@/game/rift-arena/replay-hooks";

const bodySchema = z.object({
  playerName: z
    .string()
    .max(40)
    .optional()
    .transform((s) => {
      if (s == null) return undefined;
      const cleaned = s
        .replace(/<[^>]*>/g, "")
        .replace(/[<>]/g, "")
        .trim();
      return cleaned.length > 0 ? cleaned.slice(0, 40) : undefined;
    }),
  commanderHeroId: z.string().min(1).max(64).optional(),
  encounter: z
    .object({
      enemyId: z.string().min(1).max(64),
      regionSlug: z.string().min(1).max(64),
      returnTo: z.string().min(1).max(200),
    })
    .optional(),
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

  const { key, guestToken, authorized } = await resolveTcgOwnerKey();
  if (!authorized || !key) {
    return NextResponse.json({ error: "NO_SESSION" }, { status: 401 });
  }
  const deckList = getActiveDeckList(key);
  // getActiveDeckList repairs duplicate-heavy / undersized binders to unique 29.
  // Practice still rebuilds loadouts below — only gate on those if needed.
  const constructed = validateDeckList(deckList);
  const valid = constructed.ok ? constructed : validateContentDeckList(deckList);
  if (!valid.ok) {
    return NextResponse.json({ error: "INVALID_DECK", reason: valid.reason }, { status: 400 });
  }

  const commanderHeroId =
    parsed.data.commanderHeroId ?? getActiveCommanderHeroId(key);
  const binder = getCollection(key);

  // Practice-only: rotate starters / random legal slices + AI deck; rematch re-rolls.
  const loadouts = resolvePracticeMatchLoadouts({
    activeDeckId: binder.activeDeckId,
    activeDeck: deckList,
    commanderHeroId,
  });
  const playerValid =
    validateDeckList(loadouts.player.cardIds, loadouts.player.commanderHeroId).ok ||
    validateContentDeckList(loadouts.player.cardIds).ok;
  const aiValid =
    validateDeckList(loadouts.ai.cardIds, loadouts.ai.commanderHeroId).ok ||
    validateContentDeckList(loadouts.ai.cardIds).ok;
  if (!playerValid || !aiValid) {
    return NextResponse.json(
      { error: "INVALID_DECK", reason: "Practice loadout failed legality checks" },
      { status: 400 },
    );
  }

  const rec = startTcgMatch(key, {
    playerName: parsed.data.playerName,
    playerDeck: materializePracticeLoadout(loadouts.player),
    commanderHeroId: loadouts.player.commanderHeroId,
    mode: "practice",
    encounter: parsed.data.encounter,
    opponent: {
      name: "Rift Challenger",
      deck: materializePracticeLoadout(loadouts.ai),
      commanderHeroId: loadouts.ai.commanderHeroId,
      isAi: true,
    },
  });

  appendReplayHook({
    matchPublicId: rec.state.publicId,
    kind: "MATCH_CREATED",
    mode: "practice",
    actorKey: key,
    payload: { encounter: parsed.data.encounter?.enemyId ?? null },
  });

  const res = NextResponse.json({
    ...snapshotTcgMatch(rec, key),
    ...guestIdentityFields(Boolean(guestToken), guestToken),
  });
  return attachTcgGuestCookie(res, guestToken);
}
