import { NextResponse } from "next/server";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getTcgCardCatalog } from "@/game/tcg/card-catalog";
import { getCollection } from "@/game/tcg/collection-store";
import {
  attachTcgGuestCookie,
  resolveTcgOwnerKey,
} from "@/game/tcg/owner-key";

export async function GET() {
  if (!featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
    return NextResponse.json({ error: "TCG_DISABLED" }, { status: 403 });
  }

  const { key, guestToken } = await resolveTcgOwnerKey();
  const collection = getCollection(key);
  const catalog = getTcgCardCatalog();
  const byId = new Map(catalog.map((c) => [c.id, c]));

  const res = NextResponse.json({
    ...collection,
    cards: collection.cards.map((entry) => ({
      ...entry,
      def: byId.get(entry.defId) ?? null,
    })),
    economy: {
      packsHref: "/shop/packs",
      hatcheryHref: "/hatchery",
      solRequired: false,
      note: "Grow the binder via Hatchery companions and Credits packs. SOL is never required.",
    },
  });
  return attachTcgGuestCookie(res, guestToken);
}
