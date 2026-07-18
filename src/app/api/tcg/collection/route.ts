import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { authDefaults } from "@/lib/config/project";
import { getTcgCardCatalog } from "@/game/tcg/card-catalog";
import { getCollection } from "@/game/tcg/collection-store";

async function ownerKey(): Promise<string> {
  const jar = await cookies();
  const session = jar.get(authDefaults.COOKIE_NAME)?.value;
  if (session) return `sess_${session.slice(0, 24)}`;
  const guest = jar.get("tcg_guest")?.value;
  if (guest) return `guest_${guest}`;
  return `guest_anon`;
}

export async function GET() {
  if (!featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
    return NextResponse.json({ error: "TCG_DISABLED" }, { status: 403 });
  }

  const key = await ownerKey();
  const collection = getCollection(key);
  const catalog = getTcgCardCatalog();
  const byId = new Map(catalog.map((c) => [c.id, c]));

  return NextResponse.json({
    ...collection,
    cards: collection.cards.map((entry) => ({
      ...entry,
      def: byId.get(entry.defId) ?? null,
    })),
    note: "Binder stub — will link hatchery ownership + Credits packs; SOL never required.",
  });
}
