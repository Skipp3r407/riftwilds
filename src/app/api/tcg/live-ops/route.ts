import { NextResponse } from "next/server";
import { TCG_LIVE_OPS, getCardById } from "@/content/tcg";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export async function GET() {
  if (!featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
    return NextResponse.json({ error: "TCG_DISABLED" }, { status: 403 });
  }
  const featured = TCG_LIVE_OPS.featuredCards.map((f) => {
    const card = getCardById(f.cardId);
    return {
      ...f,
      name: card?.localization.name ?? f.cardId,
      element: card?.element,
      rarity: card?.rarity,
    };
  });
  return NextResponse.json({
    ...TCG_LIVE_OPS,
    featuredCards: featured,
    cryptoRequired: false,
  });
}
