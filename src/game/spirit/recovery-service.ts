/**
 * Authoritative recovery orchestration — methods 1–7.
 * Anti-dupe via requestId. Equipment preserved. SOL optional.
 */

import { randomUUID } from "crypto";
import { normalizeCareStats, type CareStats } from "@/game/creatures/care";
import {
  ensurePetCareProgress,
  getPet,
  savePet,
  type HatcheryPet,
} from "@/game/eggs/hatchery-store";
import { applyBondToCountdownMs, bondRecoveryDialogue } from "@/game/spirit/bond-modifiers";
import { SPIRIT_RECOVERY_CONFIG, countdownMsForPreset } from "@/game/spirit/config";
import {
  snapshotEquipmentForRecovery,
  assertEquipmentPreserved,
} from "@/game/spirit/equipment-preserve";
import { quoteCreditsHealer } from "@/game/spirit/fees";
import { createMemorial } from "@/game/spirit/memorial";
import { decorateGarden, unlockMemorialGarden } from "@/game/spirit/memorial";
import { consumeInsuranceFreeRecovery } from "@/game/spirit/insurance";
import { pickRescueQuest, advanceQuestStep, getSpiritQuest } from "@/game/spirit/quests";
import { attemptSolSpiritRecall } from "@/game/spirit/sol-recall";
import { isRecoverable } from "@/game/spirit/states";
import {
  appendRecoveryHistory,
  ensureSpiritRecord,
  getInsurance,
  getOrCreateGarden,
  getQuestProgress,
  getSolRecallPoolLamports,
  hasProcessedRequestId,
  markProcessedRequestId,
  saveGarden,
  saveInsurance,
  saveMemorial,
  saveQuestProgress,
  saveSpiritRecord,
  setSolRecallPoolLamports,
  getInsuranceForPet,
} from "@/game/spirit/store";
import type {
  RecoveryHistoryEntry,
  RecoveryMethod,
  RiftlingLifeState,
  SpiritRecord,
} from "@/game/spirit/types";
import { spendServiceFee } from "@/lib/credits/sinks";
import { creditCredits, ensureStarterCredits, getCreditBalance } from "@/lib/credits/ledger";
import { debitLoyaltyTokens } from "@/lib/loyalty/tokens";
import { getTokenAccount } from "@/lib/loyalty/store";
import { assertOwnership } from "@/lib/security/authorization";
import { isFeatureEnabled } from "@/lib/config/feature-flags";

export type DownPetInput = {
  petPublicId: string;
  ownerKey: string;
  level?: number;
  cause?: string;
  nowMs?: number;
};

export type RecoverInput = {
  petPublicId: string;
  ownerKey: string;
  method: RecoveryMethod;
  requestId?: string;
  itemId?: string;
  assistantKey?: string;
  walletAddress?: string | null;
  treasuryValidated?: boolean;
  fraudRisk?: number;
  questStepId?: string;
};

export type RecoverResult =
  | {
      ok: true;
      pet: HatcheryPet;
      spirit: SpiritRecord;
      method: RecoveryMethod;
      creditsSpent: number;
      loyaltyTokensSpent: number;
      solLamports: number;
      dialogue: string;
      equipmentPreserved: boolean;
      idempotentReplay?: boolean;
      historyId: string;
    }
  | {
      ok: false;
      error: string;
      message: string;
      creditsBalance?: number;
    };

function restoreCareAfterRecovery(care: CareStats): CareStats {
  const s = normalizeCareStats(care);
  return {
    ...s,
    health: Math.max(55, s.health),
    stress: Math.min(40, s.stress),
    energy: Math.max(40, s.energy),
    happiness: Math.max(45, s.happiness),
  };
}

/** Enter Downed (normal) — never instant death. */
export function downRiftling(input: DownPetInput): {
  ok: true;
  spirit: SpiritRecord;
  pet: HatcheryPet;
} | { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("SPIRIT_SYSTEM_ENABLED")) {
    return { ok: false, error: "DISABLED", message: "Spirit system is disabled." };
  }
  const pet = getPet(input.petPublicId);
  if (!pet) return { ok: false, error: "PET_NOT_FOUND", message: "Riftling not found." };
  try {
    assertOwnership(pet.ownerKey, input.ownerKey);
  } catch {
    return { ok: false, error: "FORBIDDEN", message: "Not your Riftling." };
  }

  const bond = pet.care.bond;
  const level = input.level ?? pet.careProgress?.careLevel ?? 1;
  const snap = snapshotEquipmentForRecovery({
    ownerKey: pet.ownerKey,
    petPublicId: pet.publicId,
  });
  const record = ensureSpiritRecord({
    petPublicId: pet.publicId,
    ownerKey: pet.ownerKey,
    level,
    bond,
  });

  const now = input.nowMs ?? Date.now();
  const baseMs = countdownMsForPreset();
  const timerMs = applyBondToCountdownMs(baseMs, bond);
  const insurance = record.insurancePolicyId
    ? getInsurance(record.insurancePolicyId)
    : getInsuranceForPet(pet.publicId);
  const extra = insurance?.extraTimerMs ?? 0;
  const ends =
    Number.isFinite(timerMs) ? new Date(now + timerMs + extra).toISOString() : null;

  const next: SpiritRecord = {
    ...record,
    lifeState: "DOWNED",
    downedAt: new Date(now).toISOString(),
    countdownEndsAt: ends,
    bondAtDown: bond,
    level,
    equipmentSnapshotIds: snap.itemIds,
    questLocked: false,
    activeQuestId: null,
    updatedAt: new Date(now).toISOString(),
    version: record.version + 1,
  };
  saveSpiritRecord(next);

  pet.care = { ...normalizeCareStats(pet.care), health: 0 };
  pet.condition = "CRITICAL";
  pet.memories.push({
    kind: "DOWNED",
    label: "Fell unconscious",
    at: new Date(now).toISOString(),
    narrative: input.cause ?? "Critical wound — awaiting recovery. Not permanently lost.",
  });
  savePet(pet);

  return { ok: true, spirit: next, pet };
}

/** Enter Spirit Form for rescue quests. */
export function enterSpiritForm(petPublicId: string, ownerKey: string): RecoverResult | {
  ok: true;
  spirit: SpiritRecord;
  questId: string;
  dialogue: string;
} {
  const pet = getPet(petPublicId);
  if (!pet) return { ok: false, error: "PET_NOT_FOUND", message: "Riftling not found." };
  try {
    assertOwnership(pet.ownerKey, ownerKey);
  } catch {
    return { ok: false, error: "FORBIDDEN", message: "Not your Riftling." };
  }
  const record = ensureSpiritRecord({ petPublicId, ownerKey: pet.ownerKey });
  if (record.lifeState !== "DOWNED" && record.lifeState !== "SPIRIT_FORM") {
    return { ok: false, error: "NOT_DOWNED", message: "Only Downed Riftlings enter Spirit Form." };
  }
  const quest = pickRescueQuest({ bond: pet.care.bond, petPublicId });
  const next: SpiritRecord = {
    ...record,
    lifeState: "SPIRIT_FORM",
    activeQuestId: quest.id,
    questLocked: true,
    updatedAt: new Date().toISOString(),
    version: record.version + 1,
  };
  saveSpiritRecord(next);
  saveQuestProgress({
    questId: quest.id,
    petPublicId,
    completedStepIds: [],
    completed: false,
  });
  return {
    ok: true,
    spirit: next,
    questId: quest.id,
    dialogue: bondRecoveryDialogue(pet.care.bond, pet.name),
  };
}

function finalizeRecovery(params: {
  pet: HatcheryPet;
  spirit: SpiritRecord;
  method: RecoveryMethod;
  requestId: string;
  creditsSpent: number;
  loyaltyTokensSpent: number;
  solLamports: number;
  assistantKey: string | null;
  fromState: RiftlingLifeState;
  metadata?: Record<string, unknown>;
}): RecoverResult {
  const beforeEquip = snapshotEquipmentForRecovery({
    ownerKey: params.pet.ownerKey,
    petPublicId: params.pet.publicId,
  });

  params.pet.care = restoreCareAfterRecovery(params.pet.care);
  params.pet.condition = "HEALTHY";
  params.pet.memories.push({
    kind: "RECOVERED",
    label: `Recovered via ${params.method}`,
    at: new Date().toISOString(),
  });
  savePet(params.pet);

  const afterEquip = snapshotEquipmentForRecovery({
    ownerKey: params.pet.ownerKey,
    petPublicId: params.pet.publicId,
  });
  const preserved = assertEquipmentPreserved(beforeEquip, afterEquip);

  const spirit: SpiritRecord = {
    ...params.spirit,
    lifeState: "RECOVERED",
    downedAt: null,
    countdownEndsAt: null,
    activeQuestId: null,
    questLocked: false,
    updatedAt: new Date().toISOString(),
    version: params.spirit.version + 1,
  };
  saveSpiritRecord(spirit);

  const history: RecoveryHistoryEntry = {
    id: `rh_${randomUUID()}`,
    petPublicId: params.pet.publicId,
    ownerKey: params.pet.ownerKey,
    method: params.method,
    at: new Date().toISOString(),
    creditsSpent: params.creditsSpent,
    loyaltyTokensSpent: params.loyaltyTokensSpent,
    solLamports: params.solLamports,
    itemId: (params.metadata?.itemId as string) ?? null,
    requestId: params.requestId,
    fromState: params.fromState,
    toState: "RECOVERED",
    assistantKey: params.assistantKey,
    metadata: params.metadata,
  };
  appendRecoveryHistory(history);
  markProcessedRequestId(params.requestId);

  return {
    ok: true,
    pet: params.pet,
    spirit,
    method: params.method,
    creditsSpent: params.creditsSpent,
    loyaltyTokensSpent: params.loyaltyTokensSpent,
    solLamports: params.solLamports,
    dialogue: bondRecoveryDialogue(params.pet.care.bond, params.pet.name),
    equipmentPreserved: preserved.ok,
    historyId: history.id,
  };
}

export function recoverRiftling(input: RecoverInput): RecoverResult {
  if (!isFeatureEnabled("SPIRIT_SYSTEM_ENABLED")) {
    return { ok: false, error: "DISABLED", message: "Spirit system is disabled." };
  }
  const requestId = input.requestId ?? randomUUID();
  if (hasProcessedRequestId(requestId)) {
    return {
      ok: false,
      error: "DUPLICATE",
      message: "This recovery request was already processed (anti-dupe).",
    };
  }

  const pet = getPet(input.petPublicId);
  if (!pet) return { ok: false, error: "PET_NOT_FOUND", message: "Riftling not found." };
  try {
    assertOwnership(pet.ownerKey, input.ownerKey);
  } catch {
    return { ok: false, error: "FORBIDDEN", message: "Not your Riftling." };
  }

  const spirit = ensureSpiritRecord({
    petPublicId: pet.publicId,
    ownerKey: pet.ownerKey,
  });
  if (spirit.lifeState === "PERMADEAD" || spirit.lifeState === "MEMORIALIZED") {
    return {
      ok: false,
      error: "PERMADEAD",
      message: "This Riftling is permanently lost (Hardcore). Visit the Memorial Garden.",
    };
  }
  if (!isRecoverable(spirit.lifeState) && spirit.lifeState !== "RECOVERED") {
    // Allow recovering from DOWNED/SPIRIT/CRITICAL/WEAK; if already healthy, no-op fail.
    if (spirit.lifeState === "HEALTHY" && pet.care.health > 0) {
      return { ok: false, error: "NOT_NEEDED", message: "This Riftling does not need recovery." };
    }
  }

  // Soft-sync: if care health is 0 but spirit still HEALTHY, treat as DOWNED.
  let working = spirit;
  if (pet.care.health <= 0 && (spirit.lifeState === "HEALTHY" || spirit.lifeState === "RECOVERED")) {
    const d = downRiftling({
      petPublicId: pet.publicId,
      ownerKey: input.ownerKey,
      level: spirit.level,
    });
    if (!d.ok) return d;
    working = d.spirit;
  }

  const fromState = working.lifeState;
  ensureStarterCredits(input.ownerKey);

  switch (input.method) {
    case "CREDITS_HEALER": {
      let insurance = working.insurancePolicyId
        ? getInsurance(working.insurancePolicyId)
        : getInsuranceForPet(pet.publicId);
      const quote = quoteCreditsHealer({ bond: pet.care.bond, insurance });
      if (!quote.free && quote.credits > 0) {
        const spend = spendServiceFee({
          userId: input.ownerKey,
          serviceId: "spirit-healer",
          amount: quote.credits,
          requestId,
        });
        if (!spend.ok) {
          return {
            ok: false,
            error: "INSUFFICIENT_CREDITS",
            message: spend.message ?? "Not enough Credits for healer recovery.",
            creditsBalance: getCreditBalance(input.ownerKey),
          };
        }
      }
      if (insurance && quote.free) {
        insurance = consumeInsuranceFreeRecovery(insurance);
        saveInsurance(insurance);
      }
      return finalizeRecovery({
        pet,
        spirit: working,
        method: "CREDITS_HEALER",
        requestId,
        creditsSpent: quote.free ? 0 : quote.credits,
        loyaltyTokensSpent: 0,
        solLamports: 0,
        assistantKey: null,
        fromState,
        metadata: { insuranceApplied: quote.insuranceApplied },
      });
    }

    case "RECOVERY_ITEM": {
      const itemId = input.itemId;
      if (!itemId || !(SPIRIT_RECOVERY_CONFIG.recoveryItems as readonly string[]).includes(itemId)) {
        return {
          ok: false,
          error: "INVALID_ITEM",
          message: "Use a valid recovery item (Spirit Crystal, Phoenix Feather, …).",
        };
      }
      const progress = ensurePetCareProgress(pet);
      const slot = progress.inventory.find((s) => s.itemId === itemId);
      if (!slot || slot.qty < 1) {
        return {
          ok: false,
          error: "ITEM_MISSING",
          message: "You do not have that recovery item.",
        };
      }
      slot.qty -= 1;
      savePet(pet);
      return finalizeRecovery({
        pet,
        spirit: working,
        method: "RECOVERY_ITEM",
        requestId,
        creditsSpent: 0,
        loyaltyTokensSpent: 0,
        solLamports: 0,
        assistantKey: null,
        fromState,
        metadata: { itemId },
      });
    }

    case "SPIRIT_QUEST": {
      if (working.lifeState !== "SPIRIT_FORM" || !working.activeQuestId) {
        const entered = enterSpiritForm(pet.publicId, input.ownerKey);
        if (!entered.ok) return entered;
        working = entered.spirit;
      }
      const questId = working.activeQuestId!;
      let progress =
        getQuestProgress(pet.publicId, questId) ?? {
          questId,
          petPublicId: pet.publicId,
          completedStepIds: [],
          completed: false,
        };
      const quest = getSpiritQuest(questId);
      if (!quest) {
        return { ok: false, error: "QUEST_MISSING", message: "Spirit quest not found." };
      }
      const stepId = input.questStepId ?? quest.steps.find((s) => !progress.completedStepIds.includes(s.id))?.id;
      if (!stepId) {
        return { ok: false, error: "QUEST_STUCK", message: "No quest step available." };
      }
      progress = advanceQuestStep(progress, stepId);
      saveQuestProgress(progress);
      if (!progress.completed) {
        markProcessedRequestId(requestId);
        return {
          ok: false,
          error: "QUEST_IN_PROGRESS",
          message: `Step complete. Remaining: ${quest.steps.filter((s) => !progress.completedStepIds.includes(s.id)).map((s) => s.label).join("; ")}`,
        };
      }
      // Reward Credits (faucet-safe stub via creditCredits ADMIN? use EVENT_REWARD)
      creditCredits({
        userId: input.ownerKey,
        amount: quest.creditReward,
        reason: "EVENT_REWARD",
        requestId: `${requestId}_quest_reward`,
        metadata: { questId, spiritRescue: true },
      });
      return finalizeRecovery({
        pet,
        spirit: working,
        method: "SPIRIT_QUEST",
        requestId,
        creditsSpent: 0,
        loyaltyTokensSpent: 0,
        solLamports: 0,
        assistantKey: null,
        fromState,
        metadata: { questId },
      });
    }

    case "LOYALTY_TOKEN": {
      const cost = SPIRIT_RECOVERY_CONFIG.loyaltyTokenCost;
      const deb = debitLoyaltyTokens({
        userId: input.ownerKey,
        amount: cost,
        reason: "spirit_recovery",
        requestId,
        metadata: { petPublicId: pet.publicId },
      });
      if (!deb.ok) {
        return {
          ok: false,
          error: "INSUFFICIENT_LOYALTY",
          message: deb.message,
        };
      }
      return finalizeRecovery({
        pet,
        spirit: working,
        method: "LOYALTY_TOKEN",
        requestId,
        creditsSpent: 0,
        loyaltyTokensSpent: cost,
        solLamports: 0,
        assistantKey: null,
        fromState,
      });
    }

    case "GUILD_ASSIST": {
      const assistant = input.assistantKey;
      if (!assistant) {
        return {
          ok: false,
          error: "ASSISTANT_REQUIRED",
          message: "Guild assistance requires an assisting member key.",
        };
      }
      // Stub: guild donates Credits on behalf of the owner (assistant pays).
      const amount = SPIRIT_RECOVERY_CONFIG.guildAssistCreditsTarget;
      ensureStarterCredits(assistant);
      const spend = spendServiceFee({
        userId: assistant,
        serviceId: "guild-spirit-assist",
        amount,
        requestId,
      });
      if (!spend.ok) {
        return {
          ok: false,
          error: "ASSIST_FUNDS",
          message: "Guild assistant cannot cover the recovery donation.",
        };
      }
      return finalizeRecovery({
        pet,
        spirit: working,
        method: "GUILD_ASSIST",
        requestId,
        creditsSpent: amount,
        loyaltyTokensSpent: 0,
        solLamports: 0,
        assistantKey: assistant,
        fromState,
      });
    }

    case "FRIEND_ASSIST": {
      const assistant = input.assistantKey;
      if (!assistant) {
        return {
          ok: false,
          error: "ASSISTANT_REQUIRED",
          message: "Friend assistance requires a friend key.",
        };
      }
      const amount = SPIRIT_RECOVERY_CONFIG.friendAssistCreditsTarget;
      ensureStarterCredits(assistant);
      const spend = spendServiceFee({
        userId: assistant,
        serviceId: "friend-spirit-assist",
        amount,
        requestId,
      });
      if (!spend.ok) {
        return {
          ok: false,
          error: "ASSIST_FUNDS",
          message: "Friend cannot cover the assist contribution.",
        };
      }
      return finalizeRecovery({
        pet,
        spirit: working,
        method: "FRIEND_ASSIST",
        requestId,
        creditsSpent: amount,
        loyaltyTokensSpent: 0,
        solLamports: 0,
        assistantKey: assistant,
        fromState,
      });
    }

    case "SOL_INSTANT_RECALL": {
      const result = attemptSolSpiritRecall({
        userId: input.ownerKey,
        walletAddress: input.walletAddress,
        petPublicId: pet.publicId,
        level: working.level,
        poolLamports: getSolRecallPoolLamports(),
        requestId,
        alreadyProcessed: hasProcessedRequestId(requestId),
        fraudRisk: input.fraudRisk ?? 0,
        treasuryValidated: input.treasuryValidated ?? false,
      });
      setSolRecallPoolLamports(result.poolLamports);

      if (!result.attempt.granted) {
        if (
          result.attempt.failReason === "pool_empty" ||
          result.attempt.failReason === "flag_off" ||
          result.attempt.substitutedNonSol
        ) {
          // Substitute Credits path — still optional convenience, never required.
          const sub = result.attempt.substituteCredits;
          if (sub > 0) {
            const spend = spendServiceFee({
              userId: input.ownerKey,
              serviceId: "spirit-recall-substitute",
              amount: sub,
              requestId: `${requestId}_sub`,
            });
            if (!spend.ok) {
              return {
                ok: false,
                error: result.attempt.failReason ?? "SOL_UNAVAILABLE",
                message:
                  "SOL Instant Spirit Recall unavailable. Credits substitute also failed — use healer, items, quest, loyalty, guild, or friends.",
                creditsBalance: getCreditBalance(input.ownerKey),
              };
            }
            return finalizeRecovery({
              pet,
              spirit: working,
              method: "SOL_INSTANT_RECALL",
              requestId,
              creditsSpent: sub,
              loyaltyTokensSpent: 0,
              solLamports: 0,
              assistantKey: null,
              fromState,
              metadata: {
                substituted: true,
                failReason: result.attempt.failReason,
              },
            });
          }
        }
        return {
          ok: false,
          error: result.attempt.failReason ?? "SOL_FAILED",
          message:
            "Instant Spirit Recall failed. SOL is optional — try Credits healer, items, Spirit Quest, loyalty, guild, or friends.",
        };
      }

      return finalizeRecovery({
        pet,
        spirit: working,
        method: "SOL_INSTANT_RECALL",
        requestId,
        creditsSpent: 0,
        loyaltyTokensSpent: 0,
        solLamports: result.attempt.lamports,
        assistantKey: null,
        fromState,
        metadata: { signature: result.attempt.signature },
      });
    }

    default:
      return { ok: false, error: "UNKNOWN_METHOD", message: "Unknown recovery method." };
  }
}

/** Hardcore-only permanent loss → memorial. */
export function permadeathToMemorial(params: {
  petPublicId: string;
  ownerKey: string;
  cause: string;
}): { ok: true; memorialId: string } | { ok: false; error: string; message: string } {
  const pet = getPet(params.petPublicId);
  if (!pet) return { ok: false, error: "PET_NOT_FOUND", message: "Riftling not found." };
  const spirit = ensureSpiritRecord({
    petPublicId: pet.publicId,
    ownerKey: pet.ownerKey,
  });
  if (!spirit.hardcore.enabled) {
    return {
      ok: false,
      error: "NOT_HARDCORE",
      message: "Permanent death only applies to Hardcore opt-in Riftlings.",
    };
  }
  const memorial = createMemorial({
    petPublicId: pet.publicId,
    ownerKey: pet.ownerKey,
    name: pet.name,
    speciesSlug: pet.speciesSlug,
    speciesName: pet.speciesName,
    level: spirit.level,
    bond: pet.care.bond,
    obtainedAt: pet.createdAt,
    cause: params.cause,
    favoriteEquipment: spirit.equipmentSnapshotIds,
    hardcore: true,
  });
  saveMemorial(memorial);
  let garden = getOrCreateGarden(pet.ownerKey);
  garden = unlockMemorialGarden(garden);
  garden = decorateGarden(garden, "statues", memorial.id);
  saveGarden(garden);

  const next: SpiritRecord = {
    ...spirit,
    lifeState: "MEMORIALIZED",
    memorialId: memorial.id,
    updatedAt: new Date().toISOString(),
    version: spirit.version + 1,
  };
  saveSpiritRecord(next);
  pet.condition = "DECEASED";
  savePet(pet);
  return { ok: true, memorialId: memorial.id };
}

export function getRecoveryOptions(petPublicId: string, ownerKey: string) {
  const pet = getPet(petPublicId);
  if (!pet) return null;
  const spirit = ensureSpiritRecord({ petPublicId, ownerKey: pet.ownerKey });
  const insurance = spirit.insurancePolicyId
    ? getInsurance(spirit.insurancePolicyId)
    : getInsuranceForPet(petPublicId);
  const creditsQuote = quoteCreditsHealer({ bond: pet.care.bond, insurance });
  return {
    lifeState: spirit.lifeState,
    dialogue: bondRecoveryDialogue(pet.care.bond, pet.name),
    methods: [
      {
        id: "CREDITS_HEALER" as const,
        label: "Credits Healer",
        required: false,
        costCredits: creditsQuote.credits,
        free: creditsQuote.free,
      },
      {
        id: "RECOVERY_ITEM" as const,
        label: "Recovery Item",
        required: false,
        items: SPIRIT_RECOVERY_CONFIG.recoveryItems,
      },
      {
        id: "SPIRIT_QUEST" as const,
        label: "Spirit Realm Rescue Quest",
        required: false,
      },
      {
        id: "LOYALTY_TOKEN" as const,
        label: "Loyalty Recovery Tokens",
        required: false,
        costTokens: SPIRIT_RECOVERY_CONFIG.loyaltyTokenCost,
        balance: getTokenAccount(ownerKey).balance,
      },
      {
        id: "GUILD_ASSIST" as const,
        label: "Guild Assistance",
        required: false,
      },
      {
        id: "FRIEND_ASSIST" as const,
        label: "Friend Assistance",
        required: false,
      },
      {
        id: "SOL_INSTANT_RECALL" as const,
        label: "Instant Spirit Recall (optional SOL)",
        required: false,
        optionalConvenience: true,
        neverRequired: true,
        solEnabled: isFeatureEnabled("SOL_SPIRIT_RECALL_ENABLED"),
      },
    ],
    solNeverRequired: true,
  };
}
