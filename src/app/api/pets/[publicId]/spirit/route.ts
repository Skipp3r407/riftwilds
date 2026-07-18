import { NextResponse } from "next/server";
import { attachGuestCookie, resolveOwnerKey } from "@/lib/auth/owner-key";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { getPet } from "@/game/eggs/hatchery-store";
import {
  activityGatesForState,
  ensureSpiritRecord,
  getRecoveryOptions,
  getSpiritQuest,
  listRecoveryHistory,
  quoteSolInstantRecall,
  remainingCountdownMs,
  visualFxForState,
} from "@/game/spirit";

type Params = { params: Promise<{ publicId: string }> };

export async function GET(_req: Request, { params }: Params) {
  if (!isFeatureEnabled("SPIRIT_SYSTEM_ENABLED")) {
    return NextResponse.json({ error: "DISABLED" }, { status: 403 });
  }
  const { publicId } = await params;
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const pet = getPet(publicId);
  if (!pet) return NextResponse.json({ error: "PET_NOT_FOUND" }, { status: 404 });

  const spirit = ensureSpiritRecord({
    petPublicId: publicId,
    ownerKey: pet.ownerKey,
    bond: pet.care.bond,
  });
  const options = getRecoveryOptions(publicId, ownerKey);
  const quest = spirit.activeQuestId ? getSpiritQuest(spirit.activeQuestId) : null;
  const solQuote = quoteSolInstantRecall({ level: spirit.level, rarity: pet.rarity });

  const res = NextResponse.json({
    petPublicId: publicId,
    name: pet.name,
    lifeState: spirit.lifeState,
    spirit,
    gates: activityGatesForState(spirit.lifeState),
    fx: visualFxForState(spirit.lifeState),
    countdownRemainingMs: remainingCountdownMs(spirit),
    recoveryOptions: options,
    activeQuest: quest,
    history: listRecoveryHistory(publicId, 20),
    solRecall: {
      optional: true,
      neverRequired: true,
      enabled: isFeatureEnabled("SOL_SPIRIT_RECALL_ENABLED"),
      quote: solQuote,
      rarityIgnored: true,
    },
    hardcore: spirit.hardcore,
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
