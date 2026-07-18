/**
 * Optional quest discovery from NPC attention — does NOT duplicate quest defs.
 * Feeds map markers via existing quest catalog keys when accepted.
 */

import type { AttentionKind } from "@/game/npc-ai/attention";
import type { DayPhase, WeatherKey } from "@/game/living-world/clock";
import type { OccupationRole } from "@/game/npc-ai/activities";

export type InteractionType =
  | "greeting"
  | "lore"
  | "tip"
  | "rumor"
  | "quest_offer"
  | "shop"
  | "service"
  | "killer_reaction";

export type QuestOfferGate = {
  questId: string;
  npcSlug: string;
  minLevel?: number;
  minRep?: number;
  dayPhases?: DayPhase[];
  weather?: WeatherKey[];
  requiresFlags?: string[];
  storyFlags?: string[];
  weight: number;
};

/** Sparse optional offers — many chats have none. */
/** Quest ids match NPC dialogue `questId` fields — not duplicated quest defs. */
export const OPTIONAL_QUEST_OFFERS: QuestOfferGate[] = [
  {
    questId: "starter-awakening",
    npcSlug: "rowan-vale",
    dayPhases: ["dawn", "day", "dusk"],
    weight: 0.55,
  },
  {
    questId: "starter-fragments-of-the-past",
    npcSlug: "elara-venn",
    dayPhases: ["day", "dusk"],
    weight: 0.4,
  },
  {
    questId: "starter-waiting-heart",
    npcSlug: "mira-shellbright",
    dayPhases: ["dawn", "day"],
    weight: 0.45,
  },
  {
    questId: "starter-tools-of-the-keeper",
    npcSlug: "bram-ironroot",
    dayPhases: ["day"],
    weight: 0.35,
  },
  {
    questId: "starter-first-steps-together",
    npcSlug: "captain-orren",
    dayPhases: ["day", "dusk"],
    minRep: -20,
    weight: 0.3,
  },
];

export type DiscoveryRollContext = {
  npcSlug: string;
  role: OccupationRole;
  dayPhase: DayPhase;
  weather: WeatherKey;
  playerLevel?: number;
  relationshipScore?: number;
  flags?: string[];
  questStatus?: Record<string, string>;
  /** 0–1 RNG */
  roll: number;
};

export type DiscoveryResult = {
  interaction: InteractionType;
  attention: Exclude<AttentionKind, "none">;
  questId?: string;
  rumorId?: string;
};

/**
 * Not every chat is a quest. Prefer lore/tips/rumors/greetings.
 */
export function rollNpcDiscovery(ctx: DiscoveryRollContext): DiscoveryResult {
  const offers = OPTIONAL_QUEST_OFFERS.filter((o) => {
    if (o.npcSlug !== ctx.npcSlug) return false;
    if (o.dayPhases && !o.dayPhases.includes(ctx.dayPhase)) return false;
    if (o.weather && !o.weather.includes(ctx.weather)) return false;
    if (o.minLevel != null && (ctx.playerLevel ?? 1) < o.minLevel) return false;
    if (o.minRep != null && (ctx.relationshipScore ?? 0) < o.minRep) return false;
    if (o.requiresFlags?.some((f) => !ctx.flags?.includes(f))) return false;
    const st = ctx.questStatus?.[o.questId];
    if (st && st !== "available" && st !== "locked") return false;
    return true;
  });

  for (const offer of offers) {
    if (ctx.roll < offer.weight * 0.35) {
      return {
        interaction: "quest_offer",
        attention: "quest",
        questId: offer.questId,
      };
    }
  }

  // Role-weighted non-quest mix
  if (ctx.role === "scholar" || ctx.role === "guide") {
    if (ctx.roll < 0.45) return { interaction: "lore", attention: "story" };
    if (ctx.roll < 0.7) return { interaction: "tip", attention: "chat" };
  }
  if (ctx.role === "merchant" || ctx.role === "cook") {
    if (ctx.roll < 0.5) return { interaction: "tip", attention: "chat" };
    if (ctx.roll < 0.65) return { interaction: "shop", attention: "chat" };
  }
  if (ctx.role === "child") {
    if (ctx.roll < 0.6) return { interaction: "greeting", attention: "chat" };
  }
  if (ctx.roll < 0.25) return { interaction: "rumor", attention: "story", rumorId: `rumor-${ctx.npcSlug}` };
  if (ctx.roll < 0.55) return { interaction: "greeting", attention: "chat" };
  if (ctx.roll < 0.75) return { interaction: "tip", attention: "chat" };
  return { interaction: "lore", attention: "story" };
}

/** Map-bridge helper: quest keys newly offered (caller pins via quest-map-bridge). */
export function questKeysFromDiscovery(result: DiscoveryResult): string[] {
  return result.questId ? [result.questId] : [];
}
