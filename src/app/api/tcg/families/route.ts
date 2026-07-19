import { NextResponse } from "next/server";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getCollection } from "@/game/tcg/collection-store";
import {
  binderEntriesToMap,
  getFamilyProgressById,
  listFamilyProgress,
} from "@/game/tcg/card-families";
import { TCG_CARD_FAMILY_BUNDLE } from "@/content/tcg";
import {
  attachTcgGuestCookie,
  resolveTcgOwnerKey,
} from "@/game/tcg/owner-key";

export async function GET(req: Request) {
  if (!featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
    return NextResponse.json({ error: "TCG_DISABLED" }, { status: 403 });
  }

  const { key, guestToken } = await resolveTcgOwnerKey();
  const collection = getCollection(key);
  const owned = binderEntriesToMap(collection.cards);
  const url = new URL(req.url);
  const familyId = url.searchParams.get("id");

  if (familyId) {
    const progress = getFamilyProgressById(familyId, owned);
    if (!progress) {
      return NextResponse.json({ error: "FAMILY_NOT_FOUND" }, { status: 404 });
    }
    return attachTcgGuestCookie(
      NextResponse.json({
        family: progress,
        stageLabels: TCG_CARD_FAMILY_BUNDLE.stageLabels,
        finishes: TCG_CARD_FAMILY_BUNDLE.finishes,
      }),
      guestToken,
    );
  }

  return attachTcgGuestCookie(
    NextResponse.json({
      families: listFamilyProgress(owned),
      stageLabels: TCG_CARD_FAMILY_BUNDLE.stageLabels,
      finishes: TCG_CARD_FAMILY_BUNDLE.finishes,
      note: "Card Families are a collection/Codex layer. Foil finishes are cosmetic only.",
    }),
    guestToken,
  );
}
