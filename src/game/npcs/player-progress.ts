/**
 * Live World starter progress — localStorage demo authority (Phase 1).
 */

import { NPC_SHOP_BY_ID } from "@/content/npcs/shops";
import {
  STARTER_QUEST_BY_KEY,
  STARTER_QUEST_CHAIN,
  STARTER_QUEST_KEYS,
} from "@/game/npcs/starter-quests";
import type { QuestStatus } from "@/game/quests/quest-types";

export const LIVE_PROGRESS_KEY = "riftwilds-live-progress-v1";

export type LiveQuestEntry = {
  status: QuestStatus;
  progress: Record<string, number>;
};

export type LiveProgressState = {
  credits: number;
  inventory: Record<string, number>;
  flags: string[];
  quests: Record<string, LiveQuestEntry>;
  hatched: boolean;
  petNamed: boolean;
  petEquipped: boolean;
  moved: boolean;
  portalUnlocked: boolean;
  talkedNpcIds: string[];
  craftedTrainingClaw: boolean;
  mapMarkerPlaced: boolean;
  combatDone: boolean;
  lastRegion?: string;
};

function emptyQuestProgress(key: string): Record<string, number> {
  const q = STARTER_QUEST_BY_KEY[key];
  if (!q) return {};
  return Object.fromEntries(q.objectives.map((o) => [o.key, 0]));
}

export function createDefaultLiveProgress(): LiveProgressState {
  const quests: Record<string, LiveQuestEntry> = {};
  for (const key of STARTER_QUEST_KEYS) {
    quests[key] = {
      status: key === "starter-awakening" ? "available" : "locked",
      progress: emptyQuestProgress(key),
    };
  }
  return {
    credits: 100,
    inventory: { mossmeal: 0 },
    flags: [],
    quests,
    hatched: false,
    petNamed: false,
    petEquipped: false,
    moved: false,
    portalUnlocked: false,
    talkedNpcIds: [],
    craftedTrainingClaw: false,
    mapMarkerPlaced: false,
    combatDone: false,
  };
}

export function loadLiveProgress(): LiveProgressState {
  if (typeof window === "undefined") return createDefaultLiveProgress();
  try {
    const raw = localStorage.getItem(LIVE_PROGRESS_KEY);
    if (!raw) return createDefaultLiveProgress();
    const parsed = JSON.parse(raw) as LiveProgressState;
    const base = createDefaultLiveProgress();
    return {
      ...base,
      ...parsed,
      inventory: { ...base.inventory, ...parsed.inventory },
      quests: { ...base.quests, ...parsed.quests },
      flags: parsed.flags ?? [],
      talkedNpcIds: parsed.talkedNpcIds ?? [],
    };
  } catch {
    return createDefaultLiveProgress();
  }
}

export function saveLiveProgress(state: LiveProgressState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LIVE_PROGRESS_KEY, JSON.stringify(state));
}

function unlockNext(state: LiveProgressState, completedKey: string): void {
  const idx = STARTER_QUEST_CHAIN.findIndex((q) => q.key === completedKey);
  const next = STARTER_QUEST_CHAIN[idx + 1];
  if (!next) return;
  const entry = state.quests[next.key];
  if (entry && entry.status === "locked") entry.status = "available";
}

function grantRewards(state: LiveProgressState, questKey: string): void {
  const quest = STARTER_QUEST_BY_KEY[questKey];
  if (!quest) return;
  for (const r of quest.rewards) {
    if (r.kind === "soft_currency") state.credits += r.amount;
    if (r.kind === "care_item" && r.itemKey) {
      state.inventory[r.itemKey] = (state.inventory[r.itemKey] ?? 0) + (r.quantity ?? 1);
    }
  }
}

function bumpInPlace(state: LiveProgressState, questId: string, objectiveKey: string): void {
  const entry = state.quests[questId];
  const quest = STARTER_QUEST_BY_KEY[questId];
  if (!entry || !quest) return;
  if (entry.status === "locked" || entry.status === "completed") return;
  if (entry.status === "available") entry.status = "active";
  const obj = quest.objectives.find((o) => o.key === objectiveKey);
  if (!obj) return;
  entry.progress[objectiveKey] = Math.min(
    obj.target,
    Math.max(entry.progress[objectiveKey] ?? 0, obj.target),
  );
  const done = quest.objectives.every((o) => (entry.progress[o.key] ?? 0) >= o.target);
  if (done && entry.status === "active") {
    entry.status = "completed";
    grantRewards(state, questId);
    unlockNext(state, questId);
    if (questId === "starter-map-and-marker") state.portalUnlocked = true;
  }
}

export function acceptQuest(state: LiveProgressState, questId: string): LiveProgressState {
  const next = structuredClone(state);
  const entry = next.quests[questId];
  if (!entry) return state;
  if (entry.status === "locked" || entry.status === "completed") return state;
  entry.status = "active";
  // Auto-complete move if already walked
  if (questId === "starter-awakening" && next.moved) {
    bumpInPlace(next, "starter-awakening", "move");
  }
  saveLiveProgress(next);
  return next;
}

export function markTalked(state: LiveProgressState, npcId: string): LiveProgressState {
  const next = structuredClone(state);
  if (!next.talkedNpcIds.includes(npcId)) next.talkedNpcIds.push(npcId);

  if (npcId === "rowan-vale") bumpInPlace(next, "starter-awakening", "talk-rowan");
  if (npcId === "elara-venn") {
    bumpInPlace(next, "starter-awakening", "visit-elara");
    bumpInPlace(next, "starter-first-portal", "talk-elara");
    if (next.flags.includes("heard-fracture")) {
      bumpInPlace(next, "starter-fragments-of-the-past", "hear-fracture");
    }
  }
  if (npcId === "archivist-solen") {
    bumpInPlace(next, "starter-fragments-of-the-past", "visit-codex");
  }
  if (npcId === "captain-orren" && next.combatDone) {
    bumpInPlace(next, "starter-first-steps-together", "return");
  }
  if (npcId === "mira-shellbright") {
    bumpInPlace(next, "starter-waiting-heart", "visit-hatchery");
  }
  saveLiveProgress(next);
  return next;
}

export function markMoved(state: LiveProgressState): LiveProgressState {
  if (state.moved) return state;
  const next = structuredClone(state);
  next.moved = true;
  bumpInPlace(next, "starter-awakening", "move");
  saveLiveProgress(next);
  return next;
}

export function markFlag(state: LiveProgressState, flag: string): LiveProgressState {
  const next = structuredClone(state);
  if (!next.flags.includes(flag)) next.flags.push(flag);
  if (flag === "heard-fracture") {
    bumpInPlace(next, "starter-fragments-of-the-past", "hear-fracture");
  }
  saveLiveProgress(next);
  return next;
}

export function buyShopItem(
  state: LiveProgressState,
  shopId: string,
  itemId: string,
): { ok: true; state: LiveProgressState } | { ok: false; reason: string } {
  const shop = NPC_SHOP_BY_ID[shopId];
  if (!shop) return { ok: false, reason: "Shop not found" };
  const item = shop.buy.find((i) => i.itemId === itemId);
  if (!item) return { ok: false, reason: "Item not found" };
  if (state.credits < item.price) return { ok: false, reason: "Not enough demo credits" };
  const next = structuredClone(state);
  next.credits -= item.price;
  next.inventory[itemId] = (next.inventory[itemId] ?? 0) + 1;
  if (itemId === "mossmeal") bumpInPlace(next, "starter-waiting-heart", "gather-mossmeal");
  if (itemId === "map-marker-pin") {
    next.mapMarkerPlaced = true;
    bumpInPlace(next, "starter-map-and-marker", "place-marker");
  }
  if (itemId === "training-claw-blank" || itemId === "charstone" || itemId === "rope-coil") {
    bumpInPlace(next, "starter-tools-of-the-keeper", "gather");
  }
  saveLiveProgress(next);
  return { ok: true, state: next };
}

export function craftTrainingClaw(state: LiveProgressState):
  | { ok: true; state: LiveProgressState }
  | { ok: false; reason: string } {
  const next = structuredClone(state);
  const hasMat =
    (next.inventory["training-claw-blank"] ?? 0) > 0 ||
    (next.inventory["charstone"] ?? 0) > 0 ||
    (next.inventory["rope-coil"] ?? 0) > 0 ||
    (next.inventory["slime-gel"] ?? 0) > 0 ||
    next.flags.includes("gathered-material") ||
    next.combatDone;
  if (!hasMat) {
    return { ok: false, reason: "Gather ore/wood or buy a blank from Bram first" };
  }
  next.craftedTrainingClaw = true;
  next.inventory["training-claw"] = (next.inventory["training-claw"] ?? 0) + 1;
  bumpInPlace(next, "starter-tools-of-the-keeper", "gather");
  bumpInPlace(next, "starter-tools-of-the-keeper", "craft");
  saveLiveProgress(next);
  return { ok: true, state: next };
}

export function completeDemoCombat(state: LiveProgressState): LiveProgressState {
  const next = structuredClone(state);
  next.combatDone = true;
  next.inventory["slime-gel"] = (next.inventory["slime-gel"] ?? 0) + 1;
  bumpInPlace(next, "starter-first-steps-together", "leave-safe");
  bumpInPlace(next, "starter-first-steps-together", "defeat");
  bumpInPlace(next, "starter-first-steps-together", "loot");
  saveLiveProgress(next);
  return next;
}

export function markHatchProgress(
  state: LiveProgressState,
  step: "visit" | "inspect" | "hatch",
): LiveProgressState {
  const next = structuredClone(state);
  if (step === "visit") bumpInPlace(next, "starter-waiting-heart", "visit-hatchery");
  if (step === "inspect") bumpInPlace(next, "starter-waiting-heart", "inspect-egg");
  if (step === "hatch") {
    next.hatched = true;
    if ((next.inventory.mossmeal ?? 0) < 1) next.inventory.mossmeal = 1;
    bumpInPlace(next, "starter-waiting-heart", "gather-mossmeal");
    bumpInPlace(next, "starter-waiting-heart", "hatch");
  }
  saveLiveProgress(next);
  return next;
}

export function markBondProgress(
  state: LiveProgressState,
  step: "name" | "profile" | "care" | "equip",
): LiveProgressState {
  const next = structuredClone(state);
  if (step === "name") {
    next.petNamed = true;
    bumpInPlace(next, "starter-new-bond", "name");
  }
  if (step === "profile") bumpInPlace(next, "starter-new-bond", "profile");
  if (step === "care") bumpInPlace(next, "starter-new-bond", "care");
  if (step === "equip") {
    next.petEquipped = true;
    bumpInPlace(next, "starter-new-bond", "equip");
  }
  saveLiveProgress(next);
  return next;
}

export function markRegionTravel(state: LiveProgressState, regionId: string): LiveProgressState {
  const next = structuredClone(state);
  next.lastRegion = regionId;
  if (regionId !== "riftwild-commons") {
    bumpInPlace(next, "starter-first-portal", "enter-region");
  } else {
    bumpInPlace(next, "starter-map-and-marker", "confirm-portal");
  }
  saveLiveProgress(next);
  return next;
}

export function markGathered(state: LiveProgressState): LiveProgressState {
  const next = structuredClone(state);
  if (!next.flags.includes("gathered-material")) next.flags.push("gathered-material");
  next.inventory["charstone"] = (next.inventory["charstone"] ?? 0) + 1;
  bumpInPlace(next, "starter-tools-of-the-keeper", "gather");
  saveLiveProgress(next);
  return next;
}

export function placeMapMarker(state: LiveProgressState): LiveProgressState {
  const next = structuredClone(state);
  next.mapMarkerPlaced = true;
  bumpInPlace(next, "starter-map-and-marker", "place-marker");
  bumpInPlace(next, "starter-map-and-marker", "confirm-portal");
  saveLiveProgress(next);
  return next;
}
