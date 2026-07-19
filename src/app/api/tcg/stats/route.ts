import { NextResponse } from "next/server";
import { getTcgRegistry, TCG_LAUNCH_POOL, TCG_CARD_FAMILIES } from "@/content/tcg";
import { bucketByPower } from "@/content/tcg/framework/balance";
import { ARCHETYPES } from "@/content/tcg/framework/balance";
import { collectionCompletion } from "@/content/tcg/framework/registry";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  attachTcgGuestCookie,
  resolveTcgOwnerKey,
} from "@/game/tcg/owner-key";
import { getCollection } from "@/game/tcg/collection-store";

/**
 * Player + catalog balance metrics (scaffolding).
 * Live ranked stats will attach to match telemetry later.
 */
export async function GET() {
  if (!featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
    return NextResponse.json({ error: "TCG_DISABLED" }, { status: 403 });
  }
  const { key, guestToken } = await resolveTcgOwnerKey();
  const registry = getTcgRegistry();
  const collection = getCollection(key);
  const ownedIds = new Set(
    collection.cards.filter((c) => c.count > 0).map((c) => c.defId),
  );
  const completion = collectionCompletion(registry, ownedIds, {
    competitiveOnly: true,
  });
  const launchOwned = TCG_LAUNCH_POOL.cardIds.filter((id) =>
    ownedIds.has(id),
  ).length;

  return attachTcgGuestCookie(
    NextResponse.json({
      catalog: {
        total: registry.all.length,
        competitive: registry.competitive.length,
        families: TCG_CARD_FAMILIES.length,
        launchPool: TCG_LAUNCH_POOL.cardIds.length,
      },
      collection: {
        ...completion,
        launchPoolOwned: launchOwned,
        launchPoolPercent: Math.round(
          (launchOwned / Math.max(1, TCG_LAUNCH_POOL.cardIds.length)) * 100,
        ),
      },
      balanceBuckets: bucketByPower(registry.competitive).map((b) => ({
        band: b.band,
        count: b.cards.length,
        sample: b.cards.slice(0, 5),
      })),
      archetypes: ARCHETYPES,
      todo: "Wire match win-rate telemetry into balance.watchlist.",
    }),
    guestToken,
  );
}
