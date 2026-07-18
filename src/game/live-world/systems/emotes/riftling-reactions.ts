/**
 * Riftling (pet companion) cosmetic reactions based on bond/mood.
 * No rewards — visual / chat flavor only. Rate-limited pet-to-pet greetings.
 */

import type { CareStats } from "@/game/creatures/care";
import type { EmoteEventBus } from "@/game/live-world/systems/emotes/event-bus";

export type PetMoodBand = "joyful" | "content" | "tired" | "stressed" | "bonded";

export function moodFromCare(stats: Partial<CareStats>): PetMoodBand {
  const happiness = stats.happiness ?? 50;
  const energy = stats.energy ?? 50;
  const stress = stats.stress ?? 10;
  const bond = stats.bond ?? 20;
  if (stress >= 60) return "stressed";
  if (energy <= 25) return "tired";
  if (bond >= 70 && happiness >= 60) return "bonded";
  if (happiness >= 70) return "joyful";
  return "content";
}

/** Player emote → pet reaction key (cosmetic). */
const REACTION_TABLE: Record<string, Partial<Record<PetMoodBand, string>>> = {
  wave: { joyful: "wave", content: "nod", bonded: "wave", tired: "nod", stressed: "shrug" },
  hello: { joyful: "wave", content: "hello", bonded: "hello", tired: "nod", stressed: "shrug" },
  cheer: { joyful: "cheer", content: "clap", bonded: "celebrate", tired: "nod", stressed: "shrug" },
  dance: { joyful: "dance", content: "clap", bonded: "dance", tired: "sit", stressed: "shrug" },
  sit: { joyful: "sit", content: "sit", bonded: "sit", tired: "sit", stressed: "sit" },
  thanks: { joyful: "bow", content: "nod", bonded: "bow", tired: "nod", stressed: "nod" },
  ready: { joyful: "cheer", content: "nod", bonded: "salute", tired: "nod", stressed: "shrug" },
};

export const PET_GREET_COOLDOWN_MS = 12_000;

export type RiftlingReactionController = {
  reactToPlayerEmote: (
    emoteKey: string,
    care: Partial<CareStats>,
    now?: number,
  ) => { ok: true; reactionKey: string; mood: PetMoodBand } | { ok: false; reason: string };
  tryPetGreeting: (
    otherPetId: string,
    care: Partial<CareStats>,
    now?: number,
  ) => { ok: true; reactionKey: string } | { ok: false; reason: string };
};

export function createRiftlingReactionController(
  bus: EmoteEventBus,
): RiftlingReactionController {
  let lastReactAt: number | null = null;
  const greetLast = new Map<string, number>();

  return {
    reactToPlayerEmote(emoteKey, care, now = Date.now()) {
      if (lastReactAt !== null && now - lastReactAt < 2500) {
        return { ok: false, reason: "Pet reaction cooldown" };
      }
      const mood = moodFromCare(care);
      const table = REACTION_TABLE[emoteKey];
      const reactionKey = table?.[mood] ?? (mood === "joyful" ? "wave" : "nod");
      lastReactAt = now;
      bus.publish({
        type: "pet_react",
        payload: { emoteKey: reactionKey, mood, at: now },
      });
      return { ok: true, reactionKey, mood };
    },
    tryPetGreeting(otherPetId, care, now = Date.now()) {
      const prev = greetLast.get(otherPetId);
      if (prev !== undefined && now - prev < PET_GREET_COOLDOWN_MS) {
        return { ok: false, reason: "Pet greeting rate limited" };
      }
      const mood = moodFromCare(care);
      if (mood === "stressed" || mood === "tired") {
        return { ok: false, reason: "Companion too tired for greetings" };
      }
      greetLast.set(otherPetId, now);
      const reactionKey = mood === "bonded" || mood === "joyful" ? "wave" : "nod";
      bus.publish({
        type: "pet_react",
        payload: { emoteKey: reactionKey, mood, at: now },
      });
      return { ok: true, reactionKey };
    },
  };
}
