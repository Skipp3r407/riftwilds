/**
 * NPC–NPC ambient conversations + social gestures (rate-limited).
 */

export type AmbientChatLine = {
  speakerSlug: string;
  listenerSlug: string;
  line: string;
  gesture: "wave" | "nod" | "laugh" | "point" | "none";
};

const PAIR_LINES: { a: RegExp; b: RegExp; lines: [string, string]; gesture: AmbientChatLine["gesture"] }[] = [
  {
    a: /guard/,
    b: /guard|captain/,
    lines: ["Quiet shift so far.", "Keep the east lane clear."],
    gesture: "nod",
  },
  {
    a: /child|mim/,
    b: /riftling|emberkit|glowpup|pouchling/,
    lines: ["Do the flip again!", "*happy chirp*"],
    gesture: "laugh",
  },
  {
    a: /vendor|tessa|merchant|cal/,
    b: /cook|uma|vendor/,
    lines: ["Evening rush coming.", "Bowls are hot if you send them my way."],
    gesture: "wave",
  },
  {
    a: /rowan|guide/,
    b: /elara|mira/,
    lines: ["New Keeper found their feet.", "Good. Send them when they're ready."],
    gesture: "nod",
  },
  {
    a: /bram|smith/,
    b: /pip|guard/,
    lines: ["Hinges holding?", "For now — don't kick them."],
    gesture: "point",
  },
  {
    a: /musician|reo/,
    b: /child|mim|gardener/,
    lines: ["Got a favorite tune?", "The skippy one!"],
    gesture: "laugh",
  },
];

const GENERIC: { line: string; gesture: AmbientChatLine["gesture"] }[] = [
  { line: "Heard the aurora might lean west tonight.", gesture: "point" },
  { line: "Market lanterns look good this season.", gesture: "nod" },
  { line: "Don't block the portal path.", gesture: "wave" },
  { line: "Soft rain tomorrow, if the mist holds.", gesture: "none" },
];

export const AMBIENT_CHAT_COOLDOWN_MS = 14_000;
export const AMBIENT_CHAT_RANGE = 72;
export const AMBIENT_CHAT_CHANCE = 0.08;

export function pickAmbientChat(input: {
  slugA: string;
  slugB: string;
  seed: number;
}): AmbientChatLine | null {
  if (input.slugA === input.slugB) return null;
  for (const pair of PAIR_LINES) {
    const aMatch = pair.a.test(input.slugA) && pair.b.test(input.slugB);
    const bMatch = pair.a.test(input.slugB) && pair.b.test(input.slugA);
    if (aMatch || bMatch) {
      const speaker = aMatch ? input.slugA : input.slugB;
      const listener = aMatch ? input.slugB : input.slugA;
      const idx = Math.abs(input.seed) % 2;
      return {
        speakerSlug: speaker,
        listenerSlug: listener,
        line: pair.lines[idx]!,
        gesture: pair.gesture,
      };
    }
  }
  const g = GENERIC[Math.abs(input.seed) % GENERIC.length]!;
  return {
    speakerSlug: input.slugA,
    listenerSlug: input.slugB,
    line: g.line,
    gesture: g.gesture,
  };
}
