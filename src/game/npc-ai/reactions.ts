/**
 * NPC reactions to weather, combat nearby, emotes, and world events.
 */

import type { WeatherKey } from "@/game/living-world/clock";
import type { OccupationRole } from "@/game/npc-ai/activities";

export type WorldReaction = {
  line: string;
  behaviorHint: string;
  attentionBoost?: "chat" | "story" | "fear";
};

export function weatherReaction(
  weather: WeatherKey,
  role: OccupationRole,
): WorldReaction | null {
  if (weather === "light_rain" || weather === "storm_front") {
    if (role === "child") {
      return { line: "Puddle race!", behaviorHint: "play", attentionBoost: "chat" };
    }
    if (role === "merchant") {
      return { line: "Canvas down — keep the dry goods dry.", behaviorHint: "organize_goods" };
    }
    return { line: "Rain on the plaza stones again.", behaviorHint: "look_around" };
  }
  if (weather === "ash_storm" || weather === "void_haze") {
    return {
      line: "Eyes down — don't breathe that haze.",
      behaviorHint: "idle",
      attentionBoost: "fear",
    };
  }
  if (weather === "rift_aurora" || weather === "fireflies") {
    if (role === "scholar" || role === "guide") {
      return {
        line: "Look up — the Rift is writing tonight.",
        behaviorHint: "look_around",
        attentionBoost: "story",
      };
    }
  }
  if (weather === "snow_drift" && (role === "child" || role === "animal")) {
    return { line: "Cold toes, warm chase!", behaviorHint: "pace" };
  }
  return null;
}

export function combatNearbyReaction(role: OccupationRole): WorldReaction {
  if (role === "guard") {
    return {
      line: "Steel out — form on me!",
      behaviorHint: "patrol",
      attentionBoost: "fear",
    };
  }
  if (role === "child") {
    return {
      line: "I'm going home!",
      behaviorHint: "idle",
      attentionBoost: "fear",
    };
  }
  if (role === "merchant") {
    return {
      line: "Shutters. Now.",
      behaviorHint: "idle",
      attentionBoost: "fear",
    };
  }
  return {
    line: "Trouble nearby — give it space.",
    behaviorHint: "look_around",
    attentionBoost: "chat",
  };
}

export const REACTION_COOLDOWN_MS = 10_000;
