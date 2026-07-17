import { NextResponse } from "next/server";
import { getSpeciesLore } from "@/content/pets/lore";
import { isFeatureEnabled } from "@/lib/config/feature-flags";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  if (!isFeatureEnabled("PET_LORE_ENABLED")) {
    return NextResponse.json({ error: "PET_LORE_DISABLED" }, { status: 503 });
  }
  const { slug } = await params;
  const lore = getSpeciesLore(slug);
  if (!lore) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  return NextResponse.json({
    lore: {
      ...lore,
      hiddenTruth: lore.spoilerHiddenTruth ? undefined : lore.hiddenTruth,
      hiddenTruthLocked: lore.spoilerHiddenTruth,
    },
  });
}
