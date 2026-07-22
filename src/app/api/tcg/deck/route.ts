import { NextResponse } from "next/server";
import { z } from "zod";
import {
  TCG_FACTIONS,
  TCG_FORMATS,
  TCG_HEROES,
  TCG_LAUNCH_POOL,
  TCG_LIVE_OPS,
  TCG_STARTER_SET_20,
  getCardById,
  getTcgRegistry,
} from "@/content/tcg";
import { CONSTRUCTED_RULES } from "@/content/tcg/framework/deck-rules";
import { isCombatEligibleCard } from "@/content/tcg/framework/combat-eligibility";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getTcgCardCatalog } from "@/game/tcg/card-catalog";
import {
  getActiveDeckList,
  getCollection,
  setActiveCommander,
  setActiveContentDeck,
  setActiveDeckList,
  setActiveShowcaseDeck,
} from "@/game/tcg/collection-store";
import {
  attachTcgGuestCookie,
  resolveTcgOwnerKey,
} from "@/game/tcg/owner-key";
import { cardDefToBuilderRow } from "@/game/tcg/schemas";
import { TCG_DEFAULTS } from "@/game/tcg/types";

export async function GET() {
  if (!featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
    return NextResponse.json({ error: "TCG_DISABLED" }, { status: 403 });
  }

  const { key, guestToken } = await resolveTcgOwnerKey();
  // Purge inventory leftovers from hot binders before returning the atelier payload.
  const activeDeck = getActiveDeckList(key);
  const collection = getCollection(key);
  const catalog = getTcgCardCatalog().filter((def) => isCombatEligibleCard(def.id));
  const owned = new Map(collection.cards.map((c) => [c.defId, c.count]));

  const rows = catalog.map((def) => {
    const content = getCardById(def.id);
    return {
      ...cardDefToBuilderRow(def, {
        keywords: content?.keywords ?? [],
        element: content?.element ?? "",
      }),
      owned: owned.get(def.id) ?? 0,
    };
  });

  const registry = getTcgRegistry();
  const res = NextResponse.json({
    defaults: {
      ...TCG_DEFAULTS,
      ...CONSTRUCTED_RULES,
      copyLimits: CONSTRUCTED_RULES.copyLimits,
    },
    constructedRules: CONSTRUCTED_RULES,
    formats: TCG_FORMATS,
    liveOps: TCG_LIVE_OPS,
    launchPool: {
      targetCount: TCG_LAUNCH_POOL.targetCount,
      size: TCG_LAUNCH_POOL.cardIds.length,
    },
    facets: registry.facets,
    activeDeck,
    activeDeckId: collection.activeDeckId,
    commanderHeroId: collection.commanderHeroId,
    savedDecks: collection.savedDecks,
    factions: TCG_FACTIONS,
    commanders: TCG_HEROES.map((h) => ({
      id: h.id,
      name: h.name,
      title: h.title,
      element: h.element,
      difficulty: h.difficulty,
      deckPreference: h.deckPreference,
    })),
    starterShowcase: TCG_STARTER_SET_20,
    catalog: rows,
    f2pNote: CONSTRUCTED_RULES.f2pCompetitive,
  });
  return attachTcgGuestCookie(res, guestToken);
}

const postSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("save"),
    name: z.string().min(1).max(48).optional(),
    cardIds: z.array(z.string().min(1).max(80)).length(CONSTRUCTED_RULES.deckSize),
    commanderHeroId: z.string().min(1).max(64).nullable().optional(),
  }),
  z.object({
    action: z.literal("load_starter"),
    deckId: z.string().min(1).max(64),
  }),
  z.object({
    action: z.literal("load_showcase"),
  }),
  z.object({
    action: z.literal("set_commander"),
    commanderHeroId: z.string().min(1).max(64).nullable(),
  }),
]);

export async function POST(req: Request) {
  if (!featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
    return NextResponse.json({ error: "TCG_DISABLED" }, { status: 403 });
  }

  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_BODY", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { key, guestToken } = await resolveTcgOwnerKey();
  const body = parsed.data;

  if (body.action === "save") {
    const result = setActiveDeckList(key, body.cardIds, {
      name: body.name,
      commanderHeroId: body.commanderHeroId,
    });
    if (!result.ok) {
      return NextResponse.json({ error: "INVALID_DECK", reason: result.reason }, { status: 400 });
    }
    return attachTcgGuestCookie(
      NextResponse.json({ ok: true, ...getCollection(key) }),
      guestToken,
    );
  }

  if (body.action === "load_starter") {
    const ok = setActiveContentDeck(key, body.deckId);
    if (!ok) {
      return NextResponse.json({ error: "UNKNOWN_DECK" }, { status: 404 });
    }
    return attachTcgGuestCookie(
      NextResponse.json({ ok: true, ...getCollection(key) }),
      guestToken,
    );
  }

  if (body.action === "load_showcase") {
    const ok = setActiveShowcaseDeck(key);
    if (!ok) {
      return NextResponse.json({ error: "SHOWCASE_FAILED" }, { status: 400 });
    }
    return attachTcgGuestCookie(
      NextResponse.json({ ok: true, ...getCollection(key) }),
      guestToken,
    );
  }

  if (body.action === "set_commander") {
    const ok = setActiveCommander(key, body.commanderHeroId);
    if (!ok) {
      return NextResponse.json({ error: "UNKNOWN_COMMANDER" }, { status: 404 });
    }
    return attachTcgGuestCookie(
      NextResponse.json({ ok: true, ...getCollection(key) }),
      guestToken,
    );
  }

  return NextResponse.json({ error: "UNKNOWN_ACTION" }, { status: 400 });
}
