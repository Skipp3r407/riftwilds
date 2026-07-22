import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { getSessionContext } from "@/lib/auth/session";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { grantBattleXp, grantQuestXp, grantXp, isXpSourceKey } from "@/lib/progression";
import { withApiGuard } from "@/lib/security/api-guard";

/**
 * Server-authoritative XP grant.
 * Clients send a source key (+ optional context) — never a raw XP amount.
 */
const bodySchema = z.object({
  source: z.string().min(3).max(48),
  requestId: z.string().min(4).max(96).optional(),
  context: z
    .object({
      opponentId: z.string().max(64).optional().nullable(),
      matchId: z.string().max(64).optional().nullable(),
      surrendered: z.boolean().optional(),
      afk: z.boolean().optional(),
      botMatch: z.boolean().optional(),
      perfectVictory: z.boolean().optional(),
      noCardsLost: z.boolean().optional(),
      higherRanked: z.boolean().optional(),
      questKey: z.string().max(64).optional().nullable(),
      questDifficulty: z.enum(["easy", "medium", "hard"]).optional().nullable(),
      catalogXp: z.number().int().min(0).max(50000).optional().nullable(),
      cardId: z.string().max(64).optional().nullable(),
      petId: z.string().max(64).optional().nullable(),
      weaponId: z.string().max(64).optional().nullable(),
      tournament: z.boolean().optional(),
      won: z.boolean().optional(),
      boosts: z
        .object({
          premium: z.boolean().optional(),
          weekend: z.boolean().optional(),
          holiday: z.boolean().optional(),
          questBonusPercent: z.number().int().min(0).max(200).optional(),
        })
        .optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "progression-grant",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.KEEPER_PROGRESSION_ENABLED) {
    return NextResponse.json({ enabled: false }, { status: 403 });
  }

  const { ownerKey, isGuest, guestToken, authorized } = await resolveOwnerKey();
  if (!authorized || !ownerKey) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const raw = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if ("amount" in raw || "xp" in raw || "rawXp" in raw) {
    return NextResponse.json(
      { error: "CLIENT_XP_FORBIDDEN", message: "Clients may not specify XP amounts." },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_BODY", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const session = await getSessionContext();
  const ctx = parsed.data.context;

  let result;
  if (parsed.data.source === "BATTLE_RESULT" && ctx?.matchId) {
    result = grantBattleXp({
      ownerKey,
      userId: session?.userId ?? null,
      won: Boolean(ctx.won),
      matchId: ctx.matchId,
      opponentId: ctx.opponentId,
      surrendered: ctx.surrendered,
      afk: ctx.afk,
      botMatch: ctx.botMatch,
      perfectVictory: ctx.perfectVictory,
      noCardsLost: ctx.noCardsLost,
      higherRanked: ctx.higherRanked,
      tournament: ctx.tournament,
    });
  } else if (parsed.data.source === "QUEST_COMPLETE" && ctx?.questKey) {
    result = grantQuestXp({
      ownerKey,
      userId: session?.userId ?? null,
      questKey: ctx.questKey,
      difficulty: ctx.questDifficulty,
      catalogXp: ctx.catalogXp,
      requestId: parsed.data.requestId ?? `quest:${ctx.questKey}`,
    });
  } else if (isXpSourceKey(parsed.data.source)) {
    result = grantXp({
      ownerKey,
      userId: session?.userId ?? null,
      source: parsed.data.source,
      requestId: parsed.data.requestId,
      context: {
        opponentId: ctx?.opponentId,
        matchId: ctx?.matchId,
        surrendered: ctx?.surrendered,
        afk: ctx?.afk,
        botMatch: ctx?.botMatch,
        perfectVictory: ctx?.perfectVictory,
        noCardsLost: ctx?.noCardsLost,
        higherRanked: ctx?.higherRanked,
        questKey: ctx?.questKey,
        questDifficulty: ctx?.questDifficulty,
        catalogXp: ctx?.catalogXp,
        cardId: ctx?.cardId,
        petId: ctx?.petId,
        weaponId: ctx?.weaponId,
        boosts: ctx?.boosts,
      },
    });
  } else {
    return NextResponse.json({ error: "INVALID_SOURCE" }, { status: 400 });
  }

  const res = NextResponse.json({
    requestId: guard.requestId,
    ...result,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
