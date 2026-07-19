import { NextResponse } from "next/server";
import {
  getTcgRegistry,
  TCG_EXPANSIONS,
  TCG_FORMATS,
  TCG_LIVE_OPS,
  TCG_LAUNCH_POOL,
  TCG_CARD_FAMILIES,
} from "@/content/tcg";
import { CRAFT_POLICY } from "@/content/tcg/framework/craft";
import { CONSTRUCTED_RULES } from "@/content/tcg/framework/deck-rules";
import { documentElementMapping } from "@/content/tcg/framework/element-map";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

/**
 * Admin dashboard stub — read-only ops snapshot.
 * TODO: auth gate + write endpoints for featured cards / rotation / bans.
 */
export async function GET() {
  if (!featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
    return NextResponse.json({ error: "TCG_DISABLED" }, { status: 403 });
  }
  const registry = getTcgRegistry();
  return NextResponse.json({
    status: "scaffold",
    auth: "TODO — require staff session before writes",
    snapshot: {
      cards: registry.all.length,
      competitive: registry.competitive.length,
      placeholders: registry.all.filter((c) => c.isPlaceholder).length,
      families: TCG_CARD_FAMILIES.length,
      expansions: TCG_EXPANSIONS.length,
      formats: TCG_FORMATS.length,
      launchPool: TCG_LAUNCH_POOL.cardIds.length,
      season: TCG_LIVE_OPS.seasonName,
    },
    constructedRules: CONSTRUCTED_RULES,
    craftPolicy: CRAFT_POLICY,
    elementMapping: documentElementMapping(),
    facets: registry.facets,
    todos: [
      "Auth-gated PATCH for live-ops featured cards",
      "Expansion rotate wizard (Standard legal set)",
      "Balance watchlist editor",
      "Craft ledger audit view",
      "Ban / unban card ids per format",
    ],
  });
}
