/**
 * Authoritative pet care service — Credits debit before effects.
 * Basic care never requires SOL.
 */

import { randomUUID } from "crypto";
import {
  applyCareAction,
  applyCareGameplayTuning,
  careGameplayModifiers,
  derivePetCondition,
  displayCareStats,
  type CareAction,
  type CareStats,
} from "@/game/creatures/care";
import {
  CARE_ACTION_DEFS,
  CARE_ITEM_CATALOG,
  advanceCareStreak,
  careLevelFromXp,
  getCareCatalogItem,
  pickNeedMessage,
  type CareJournalEntry,
  type CareStreakMilestone,
  type NeedMessage,
  type PetCareProgress,
  DEFAULT_CARE_PROGRESS,
} from "@/game/creatures/care-catalog";
import { careBonusFromTraits } from "@/game/creatures/rpg-types";
import { getSpeciesBySlug } from "@/game/creatures/species-catalog";
import {
  getPet,
  ensurePetCareProgress,
  savePet,
  type HatcheryPet,
} from "@/game/eggs/hatchery-store";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import {
  canAfford,
  ensureStarterCredits,
  getCreditBalance,
  spendCareAction,
  spendCareItem,
} from "@/lib/credits";
import { assertOwnership } from "@/lib/security/authorization";

export type CareActionRequest = {
  ownerKey: string;
  petPublicId: string;
  action: CareAction;
  /** Idempotency key — required for paid actions; generated if omitted. */
  requestId?: string;
  /** Optional catalog item consumed from pet inventory. */
  catalogItemId?: string;
  now?: number;
};

export type CareActionResult =
  | {
      ok: true;
      pet: HatcheryPet;
      action: CareAction;
      creditCost: number;
      creditsBalance: number;
      energySpent: number;
      careXpGained: number;
      journalEntry: CareJournalEntry;
      newMilestones: CareStreakMilestone[];
      needMessage: NeedMessage | null;
      modifiers: ReturnType<typeof careGameplayModifiers>;
      displayCare: CareStats;
      idempotentReplay?: boolean;
      animation: string;
    }
  | {
      ok: false;
      error:
        | "CARE_DISABLED"
        | "PET_NOT_FOUND"
        | "FORBIDDEN"
        | "UNKNOWN_ACTION"
        | "ON_COOLDOWN"
        | "INSUFFICIENT_CREDITS"
        | "INSUFFICIENT_ENERGY"
        | "ITEM_NOT_FOUND"
        | "ITEM_MISSING"
        | "LEDGER_ERROR";
      message: string;
      retryAfterMs?: number;
      creditsBalance?: number;
    };

type ReplayStore = Map<string, CareActionResult & { ok: true }>;

const globalForCare = globalThis as unknown as { __riftwildsCareReplay?: ReplayStore };

function replayStore(): ReplayStore {
  if (!globalForCare.__riftwildsCareReplay) {
    globalForCare.__riftwildsCareReplay = new Map();
  }
  return globalForCare.__riftwildsCareReplay;
}

/** Test helper. */
export function resetCareServiceForTests(): void {
  globalForCare.__riftwildsCareReplay = new Map();
}

function applyTraitBonuses(pet: HatcheryPet, action: CareAction, care: CareStats): CareStats {
  const species = getSpeciesBySlug(pet.speciesSlug);
  if (!species) return care;
  const clamp = (n: number) => Math.min(100, Math.max(0, n));
  const bonus = { happiness: 0, bond: 0, energy: 0, health: 0 };
  if (action === "PLAY" || action === "ENCOURAGE" || action === "PET" || action === "SOCIALIZE") {
    bonus.happiness = careBonusFromTraits(species.traits, "happiness");
    bonus.bond = careBonusFromTraits(species.traits, "bond");
  }
  if (action === "FEED" || action === "COOK_MEAL" || action === "TREAT") {
    bonus.bond = Math.max(bonus.bond, Math.floor(careBonusFromTraits(species.traits, "bond") / 2));
  }
  if (action === "REST" || action === "SLEEP") {
    bonus.energy = careBonusFromTraits(species.traits, "energy");
  }
  if (
    action === "HEAL" ||
    action === "MEDICINE" ||
    action === "VET" ||
    action === "RECOVERY_CENTER"
  ) {
    bonus.health = careBonusFromTraits(species.traits, "health");
  }
  return {
    ...care,
    happiness: clamp(care.happiness + bonus.happiness),
    bond: clamp(care.bond + bonus.bond),
    energy: clamp(care.energy + bonus.energy),
    health: clamp(care.health + bonus.health),
  };
}

function consumeInventory(
  progress: PetCareProgress,
  itemId: string,
): PetCareProgress | null {
  const slot = progress.inventory.find((s) => s.itemId === itemId);
  if (!slot || slot.qty < 1) return null;
  return {
    ...progress,
    inventory: progress.inventory
      .map((s) => (s.itemId === itemId ? { ...s, qty: s.qty - 1 } : s))
      .filter((s) => s.qty > 0),
  };
}

export function performCareAction(req: CareActionRequest): CareActionResult {
  if (!isFeatureEnabled("PET_CARE_ENABLED") && !isFeatureEnabled("CARE_ENABLED")) {
    return { ok: false, error: "CARE_DISABLED", message: "Pet care is disabled" };
  }

  const def = CARE_ACTION_DEFS[req.action];
  if (!def) {
    return { ok: false, error: "UNKNOWN_ACTION", message: `Unknown care action: ${req.action}` };
  }

  const requestId = req.requestId?.trim() || `care_${randomUUID()}`;
  const cached = replayStore().get(requestId);
  if (cached) {
    return { ...cached, idempotentReplay: true };
  }

  const now = req.now ?? Date.now();
  const pet = getPet(req.petPublicId);
  if (!pet) {
    return { ok: false, error: "PET_NOT_FOUND", message: "Pet not found" };
  }
  try {
    assertOwnership(pet.ownerKey, req.ownerKey);
  } catch {
    return { ok: false, error: "FORBIDDEN", message: "Not your pet" };
  }

  ensureStarterCredits(req.ownerKey);
  let progress = ensurePetCareProgress(pet);

  const lastAt = progress.cooldowns[req.action] ?? 0;
  const remaining = def.cooldownMs - (now - lastAt);
  if (remaining > 0) {
    return {
      ok: false,
      error: "ON_COOLDOWN",
      message: `${def.label} is cooling down`,
      retryAfterMs: remaining,
      creditsBalance: getCreditBalance(req.ownerKey),
    };
  }

  if (def.energyCost > 0 && pet.care.energy < def.energyCost) {
    return {
      ok: false,
      error: "INSUFFICIENT_ENERGY",
      message: `${pet.name} is too tired for an adventure`,
      creditsBalance: getCreditBalance(req.ownerKey),
    };
  }

  let creditCost = def.creditCost;
  let catalogNote = "";

  if (req.catalogItemId) {
    const item = getCareCatalogItem(req.catalogItemId);
    if (!item) {
      return { ok: false, error: "ITEM_NOT_FOUND", message: "Unknown care item" };
    }
    if (item.useAction !== req.action && req.action !== "GIVE_ITEM") {
      return {
        ok: false,
        error: "ITEM_NOT_FOUND",
        message: "Item does not match this care action",
      };
    }
    const nextInv = consumeInventory(progress, req.catalogItemId);
    if (!nextInv) {
      return {
        ok: false,
        error: "ITEM_MISSING",
        message: `No ${item.name} in pet inventory`,
        creditsBalance: getCreditBalance(req.ownerKey),
      };
    }
    progress = nextInv;
    creditCost = 0; // inventory consume — already paid at shop
    catalogNote = `Used ${item.name} from inventory.`;
  }

  if (creditCost > 0) {
    if (!canAfford(req.ownerKey, creditCost)) {
      return {
        ok: false,
        error: "INSUFFICIENT_CREDITS",
        message: `Need ${creditCost} Credits (never SOL) for ${def.label}`,
        creditsBalance: getCreditBalance(req.ownerKey),
      };
    }
    const debit = spendCareAction({
      userId: req.ownerKey,
      petId: pet.publicId,
      action: req.action,
      amount: creditCost,
      requestId,
    });
    if (!debit.ok) {
      return {
        ok: false,
        error: debit.error === "insufficient_credits" ? "INSUFFICIENT_CREDITS" : "LEDGER_ERROR",
        message: debit.message,
        creditsBalance: debit.balance ?? getCreditBalance(req.ownerKey),
      };
    }
  }

  const before = { ...pet.care };
  let after = applyCareAction(before, req.action);
  after = applyCareGameplayTuning(before, after, req.action);
  after = applyTraitBonuses(pet, req.action, after);

  pet.care = after;
  pet.condition = derivePetCondition(
    pet.care,
    isFeatureEnabled("PERMANENT_DEATH_ENABLED"),
  );
  pet.lastDecayAt = new Date(now).toISOString();

  const xpGain = def.careXp;
  const streaked = advanceCareStreak(progress, now);
  progress = streaked.progress;
  progress = {
    ...progress,
    careXp: progress.careXp + xpGain,
    careLevel: careLevelFromXp(progress.careXp + xpGain),
    cooldowns: { ...progress.cooldowns, [req.action]: now },
  };

  const journalEntry: CareJournalEntry = {
    id: `j_${requestId.slice(0, 16)}`,
    at: new Date(now).toISOString(),
    action: req.action,
    label: def.label,
    creditCost,
    careXpGained: xpGain,
    note: catalogNote || `${def.label} — ${creditCost === 0 ? "free" : `${creditCost} Credits`}`,
    deltas: def.expectedDeltas,
  };
  progress = {
    ...progress,
    journal: [journalEntry, ...progress.journal].slice(0, 40),
  };

  if (req.action === "FEED" && !pet.memories.some((m) => m.kind === "FIRST_MEAL")) {
    pet.memories.push({
      kind: "FIRST_MEAL",
      label: "First meal shared",
      at: new Date(now).toISOString(),
    });
  }

  pet.careProgress = progress;
  savePet(pet);

  const result: CareActionResult & { ok: true } = {
    ok: true,
    pet,
    action: req.action,
    creditCost,
    creditsBalance: getCreditBalance(req.ownerKey),
    energySpent: def.energyCost,
    careXpGained: xpGain,
    journalEntry,
    newMilestones: streaked.newMilestones,
    needMessage: pickNeedMessage(pet.care, pet.name),
    modifiers: careGameplayModifiers(pet.care),
    displayCare: displayCareStats(pet.care),
    animation: def.animation,
  };
  replayStore().set(requestId, result);
  return result;
}

/** Preview payload for UI tooltips (no side effects). */
export function previewCareAction(action: CareAction) {
  const def = CARE_ACTION_DEFS[action];
  if (!def) return null;
  return {
    action: def.action,
    label: def.label,
    description: def.description,
    creditCost: def.creditCost,
    energyCost: def.energyCost,
    cooldownMs: def.cooldownMs,
    durationLabel: def.durationLabel,
    expectedDeltas: def.expectedDeltas,
    careXp: def.careXp,
    neverRequiresSol: true,
  };
}

export function listCareCatalogForUi() {
  return CARE_ITEM_CATALOG.map((item) => ({
    ...item,
    shopHook: `/shop?focus=${item.id}`,
    craftHook: item.craftRecipeId ? `/crafting?recipe=${item.craftRecipeId}` : null,
  }));
}
