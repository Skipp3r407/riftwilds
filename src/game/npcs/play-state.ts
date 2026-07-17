/**
 * Local Live World play state — quests, flags, demo credits, combat stubs.
 * Persists in localStorage for demo playthrough (no mainnet / real SOL).
 */

import {
  DEMO_INVENTORY_STORAGE_KEY,
  DEMO_STARTER_INVENTORY,
  grantDemoInventoryItem,
  parseDemoInventory,
  type DemoInventoryRow,
} from "@/lib/shop/demo-inventory";
import type { ItemRarity } from "@/lib/items/types";
import { STARTER_QUEST_CHAIN } from "@/game/npcs/starter-quests";
import { getNpcShop } from "@/game/npcs/shops";
import type { QuestStatus } from "@/game/quests/quest-types";

export const LIVE_PLAY_STATE_KEY = "riftwilds-live-play-v1";

export type LiveQuestEntry = {
  status: QuestStatus | "ready";
  progress: Record<string, number>;
  rewarded: boolean;
};

export type LivePlayState = {
  demoCredits: number;
  flags: string[];
  quests: Record<string, LiveQuestEntry>;
  activeCompanionName: string | null;
  hasHatched: boolean;
  enemiesDefeated: number;
  markersRepaired: string[];
  regionsVisited: string[];
  toolsCrafted: string[];
  updatedAt: number;
};

function emptyQuestProgress(key: string): Record<string, number> {
  const q = STARTER_QUEST_CHAIN.find((x) => x.key === key);
  if (!q) return {};
  return Object.fromEntries(q.objectives.map((o) => [o.key, 0]));
}

export function createDefaultLivePlayState(): LivePlayState {
  const quests: Record<string, LiveQuestEntry> = {};
  for (const q of STARTER_QUEST_CHAIN) {
    const locked = Boolean(q.requires?.length);
    quests[q.key] = {
      status: locked ? "locked" : "available",
      progress: emptyQuestProgress(q.key),
      rewarded: false,
    };
  }
  // First quest starts available; unlock chain as completions happen
  quests["starter-q1-awakening"] = {
    status: "available",
    progress: emptyQuestProgress("starter-q1-awakening"),
    rewarded: false,
  };
  return {
    demoCredits: 200,
    flags: [],
    quests,
    activeCompanionName: null,
    hasHatched: false,
    enemiesDefeated: 0,
    markersRepaired: [],
    regionsVisited: ["riftwild-commons"],
    toolsCrafted: [],
    updatedAt: Date.now(),
  };
}

export function loadLivePlayState(): LivePlayState {
  if (typeof window === "undefined") return createDefaultLivePlayState();
  try {
    const raw = localStorage.getItem(LIVE_PLAY_STATE_KEY);
    if (!raw) {
      const fresh = createDefaultLivePlayState();
      localStorage.setItem(LIVE_PLAY_STATE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return { ...createDefaultLivePlayState(), ...JSON.parse(raw) } as LivePlayState;
  } catch {
    return createDefaultLivePlayState();
  }
}

export function saveLivePlayState(state: LivePlayState): void {
  if (typeof window === "undefined") return;
  try {
    state.updatedAt = Date.now();
    localStorage.setItem(LIVE_PLAY_STATE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function acceptQuest(state: LivePlayState, questId: string): LivePlayState {
  const entry = state.quests[questId];
  if (!entry || (entry.status !== "available" && entry.status !== "locked")) return state;
  const q = STARTER_QUEST_CHAIN.find((x) => x.key === questId);
  if (q?.requires?.length) {
    const ok = q.requires.every((r) => state.quests[r]?.status === "completed");
    if (!ok) return state;
  }
  state.quests[questId] = {
    ...entry,
    status: "active",
    progress: emptyQuestProgress(questId),
  };
  return state;
}

export function bumpObjective(
  state: LivePlayState,
  questId: string,
  objectiveKey: string,
  amount = 1,
): LivePlayState {
  const entry = state.quests[questId];
  const quest = STARTER_QUEST_CHAIN.find((q) => q.key === questId);
  if (!entry || !quest || entry.status !== "active") return state;
  const obj = quest.objectives.find((o) => o.key === objectiveKey);
  if (!obj) return state;
  const next = Math.min(obj.target, (entry.progress[objectiveKey] ?? 0) + amount);
  entry.progress[objectiveKey] = next;
  const done = quest.objectives.every((o) => (entry.progress[o.key] ?? 0) >= o.target);
  if (done) entry.status = "ready";
  return state;
}

export function completeQuest(state: LivePlayState, questId: string): LivePlayState {
  const entry = state.quests[questId];
  const quest = STARTER_QUEST_CHAIN.find((q) => q.key === questId);
  if (!entry || !quest) return state;
  if (entry.status !== "ready" && entry.status !== "active") return state;
  if (entry.rewarded) {
    entry.status = "completed";
    return state;
  }
  for (const reward of quest.rewards) {
    if (reward.kind === "soft_currency") {
      state.demoCredits += reward.amount;
    }
  }
  entry.status = "completed";
  entry.rewarded = true;
  // Unlock next quests
  for (const q of STARTER_QUEST_CHAIN) {
    if (!q.requires?.includes(questId)) continue;
    const e = state.quests[q.key];
    if (e && e.status === "locked") {
      const ok = (q.requires ?? []).every((r) => state.quests[r]?.status === "completed");
      if (ok) e.status = "available";
    }
  }
  return state;
}

export function recordNpcTalk(state: LivePlayState, npcSlug: string): LivePlayState {
  const map: Record<string, { questId: string; objectiveKey: string }[]> = {
    "rowan-vale": [{ questId: "starter-q1-awakening", objectiveKey: "talk-rowan" }],
    "elara-venn": [
      { questId: "starter-q1-awakening", objectiveKey: "find-elara" },
      { questId: "starter-q2-fragments", objectiveKey: "hear-fracture" },
      { questId: "starter-q8-world-beyond", objectiveKey: "choose" },
    ],
    "archivist-solen": [{ questId: "starter-q2-fragments", objectiveKey: "visit-codex" }],
    "mira-shellbright": [
      { questId: "starter-q3-waiting-heart", objectiveKey: "visit-hatchery" },
    ],
    "captain-orren": [{ questId: "starter-q5-first-steps", objectiveKey: "return" }],
    "kael-ashwalker": [{ questId: "starter-q8-world-beyond", objectiveKey: "meet-guide" }],
    "luma-tidecrest": [{ questId: "starter-q8-world-beyond", objectiveKey: "meet-guide" }],
    "warden-sylvi": [{ questId: "starter-q8-world-beyond", objectiveKey: "meet-guide" }],
  };
  for (const hit of map[npcSlug] ?? []) {
    bumpObjective(state, hit.questId, hit.objectiveKey);
    const e = state.quests[hit.questId];
    if (e?.status === "ready") completeQuest(state, hit.questId);
  }
  return state;
}

export function recordPlayerMoved(state: LivePlayState): LivePlayState {
  bumpObjective(state, "starter-q1-awakening", "move");
  return state;
}

export function purchaseFromShop(
  state: LivePlayState,
  shopId: string,
  itemId: string,
): { state: LivePlayState; ok: boolean; message: string; inventory?: DemoInventoryRow[] } {
  const shop = getNpcShop(shopId);
  const item = shop?.buy.find((i) => i.itemId === itemId);
  if (!shop || !item) return { state, ok: false, message: "Item not found." };
  if (state.demoCredits < item.price) {
    return { state, ok: false, message: "Not enough demo credits." };
  }
  state.demoCredits -= item.price;
  let inventory = DEMO_STARTER_INVENTORY;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(DEMO_INVENTORY_STORAGE_KEY);
      inventory = raw ? parseDemoInventory(raw) : [...DEMO_STARTER_INVENTORY];
      inventory = grantDemoInventoryItem(inventory, {
        id: item.itemId,
        name: item.name,
        family: item.family,
        rarity: item.rarity as ItemRarity,
        iconPath: item.iconPath,
      });
      localStorage.setItem(DEMO_INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
    } catch {
      /* ignore */
    }
  }
  saveLivePlayState(state);
  return { state, ok: true, message: `Purchased ${item.name}.`, inventory };
}

export function applyService(
  state: LivePlayState,
  serviceId: string,
): { state: LivePlayState; message: string } {
  switch (serviceId) {
    case "heal_riftling":
    case "revive_riftling":
      return { state, message: "Your active Riftling feels restored (demo heal)." };
    case "training_battle":
    case "beginner_tournament":
      state.enemiesDefeated += 1;
      bumpObjective(state, "starter-q5-first-steps", "defeat");
      return { state, message: "Training bout complete. Practice rank updated." };
    case "arena_rank":
      return { state, message: "Practice rank: Initiate Keeper." };
    case "open_codex":
    case "view_lore":
      bumpObjective(state, "starter-q2-fragments", "visit-codex");
      return { state, message: "Codex opened — Fracture fragments catalogued." };
    case "hatch_eggs":
    case "view_eggs":
    case "care_supplies": {
      bumpObjective(state, "starter-q3-waiting-heart", "visit-hatchery");
      bumpObjective(state, "starter-q3-waiting-heart", "inspect-egg");
      bumpObjective(state, "starter-q3-waiting-heart", "gather-mossmeal");
      bumpObjective(state, "starter-q3-waiting-heart", "hatch");
      if (state.quests["starter-q3-waiting-heart"]?.status === "ready") {
        completeQuest(state, "starter-q3-waiting-heart");
      }
      state.hasHatched = true;
      if (!state.activeCompanionName) state.activeCompanionName = "Spark";
      bumpObjective(state, "starter-q4-new-bond", "name");
      bumpObjective(state, "starter-q4-new-bond", "profile");
      bumpObjective(state, "starter-q4-new-bond", "care");
      bumpObjective(state, "starter-q4-new-bond", "equip");
      if (state.quests["starter-q4-new-bond"]?.status === "ready") {
        completeQuest(state, "starter-q4-new-bond");
      }
      return {
        state,
        message:
          "Demo hatch complete — Spark is bonded as your companion. Visit /hatchery for the full incubator UI.",
      };
    }
    case "craft_basic": {
      if (!state.toolsCrafted.includes("starter-pick")) {
        state.toolsCrafted.push("starter-pick");
        bumpObjective(state, "starter-q6-tools", "craft");
        bumpObjective(state, "starter-q6-tools", "equip-tool");
      }
      return { state, message: "Crafted and equipped a Starter Pick." };
    }
    case "repair":
      return { state, message: "Equipment repaired at the forge." };
    default:
      return { state, message: "Service noted." };
  }
}
