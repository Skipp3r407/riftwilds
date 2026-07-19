/**
 * Card Family progress helpers — collection / Codex layer (not battle rules).
 * Foil / gold / crystal / animated finishes are cosmetic-only.
 */

import {
  TCG_CARD_FAMILIES,
  TCG_CARD_FAMILY_BUNDLE,
  getCardById,
  getCardFamilyById,
  type TcgCardFamily,
  type TcgCardFinish,
  type TcgEvolutionStage,
} from "@/content/tcg";

export type FamilyStageProgress = {
  stage: TcgEvolutionStage;
  owned: number;
  unlocked: boolean;
  finishesOwned: TcgCardFinish[];
};

export type FamilyProgress = {
  family: TcgCardFamily;
  releasedTotal: number;
  releasedOwned: number;
  percent: number;
  missingCardIds: string[];
  missingStageLabels: string[];
  stages: FamilyStageProgress[];
  loreUnlocked: { id: string; title: string; body: string }[];
  rewardReady: boolean;
  finishes: {
    id: string;
    label: string;
    cosmetic: boolean;
    ownedAny: boolean;
  }[];
};

export type OwnedBinderMap = Map<string, number>;

/** Demo finish unlock stubs — cosmetic only; no PvP power. */
function finishesForOwnedCount(count: number): TcgCardFinish[] {
  const out: TcgCardFinish[] = [];
  if (count >= 1) out.push("standard");
  if (count >= 2) out.push("foil");
  if (count >= 3) out.push("gold");
  if (count >= 4) out.push("crystal");
  if (count >= 5) out.push("animated");
  return out;
}

export function computeFamilyProgress(
  family: TcgCardFamily,
  owned: OwnedBinderMap,
): FamilyProgress {
  const released = family.stages.filter(
    (s) => s.status === "released" && s.cardId,
  );
  const stages: FamilyStageProgress[] = family.stages.map((stage) => {
    const count = stage.cardId ? (owned.get(stage.cardId) ?? 0) : 0;
    const unlocked = stage.status === "released" && count > 0;
    return {
      stage,
      owned: count,
      unlocked,
      finishesOwned: finishesForOwnedCount(count),
    };
  });

  const releasedOwned = stages.filter(
    (s) => s.stage.status === "released" && s.unlocked,
  ).length;
  const releasedTotal = released.length;
  const percent =
    releasedTotal === 0
      ? 0
      : Math.round((releasedOwned / releasedTotal) * 100);

  const missingCardIds = released
    .filter((s) => s.cardId && (owned.get(s.cardId) ?? 0) <= 0)
    .map((s) => s.cardId!) ;

  const missingStageLabels = family.stages
    .filter((s) => {
      if (s.status === "planned") return true;
      if (!s.cardId) return true;
      return (owned.get(s.cardId) ?? 0) <= 0;
    })
    .map((s) => s.label);

  const loreUnlocked = family.loreChapters.filter((ch) => {
    const stage = family.stages.find((s) => s.stageId === ch.unlockStageId);
    if (!stage?.cardId) return false;
    return (owned.get(stage.cardId) ?? 0) > 0;
  });

  const finishMeta = TCG_CARD_FAMILY_BUNDLE.finishes.map((f) => ({
    id: f.id,
    label: f.label,
    cosmetic: f.cosmetic,
    ownedAny: stages.some((s) =>
      s.finishesOwned.includes(f.id as TcgCardFinish),
    ),
  }));

  return {
    family,
    releasedTotal,
    releasedOwned,
    percent,
    missingCardIds,
    missingStageLabels,
    stages,
    loreUnlocked,
    rewardReady: releasedTotal > 0 && releasedOwned >= releasedTotal,
    finishes: finishMeta,
  };
}

export function listFamilyProgress(owned: OwnedBinderMap): FamilyProgress[] {
  return TCG_CARD_FAMILIES.map((f) => computeFamilyProgress(f, owned)).sort(
    (a, b) => b.percent - a.percent || a.family.name.localeCompare(b.family.name),
  );
}

export function getFamilyProgressById(
  familyId: string,
  owned: OwnedBinderMap,
): FamilyProgress | null {
  const family = getCardFamilyById(familyId);
  if (!family) return null;
  return computeFamilyProgress(family, owned);
}

/** Resolve stage card for UI (released only). */
export function resolveStageCard(stage: TcgEvolutionStage) {
  if (!stage.cardId) return null;
  return getCardById(stage.cardId) ?? null;
}

export function binderEntriesToMap(
  entries: { defId: string; count: number }[],
): OwnedBinderMap {
  return new Map(entries.map((e) => [e.defId, e.count]));
}
