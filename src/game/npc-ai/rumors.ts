/**
 * Rumors → exploration hints (no full spoilers / no secret coords).
 */

export type RumorHint = {
  id: string;
  text: string;
  /** Soft region nudge — never exact coordinates. */
  regionHint?: string;
  /** Optional discovery id once progress allows (caller checks). */
  discoverableId?: string;
};

const RUMORS: RumorHint[] = [
  {
    id: "rumor-east-woods",
    text: "Couriers say the eastern treeline hums louder after dusk — nothing precise, just a pull.",
    regionHint: "elderwood-forest",
  },
  {
    id: "rumor-ash-glow",
    text: "Ash runners mutter about a warm glow that isn't campfire. Stay on marked stone if you chase it.",
    regionHint: "ember-crater",
  },
  {
    id: "rumor-tide-glass",
    text: "Netters talk of tideglass pockets when the fog sits low. Don't dive past the buoys.",
    regionHint: "moonwater-coast",
  },
  {
    id: "rumor-marker",
    text: "Pip swears one plaza marker still argues with the map. Tinker, don't force it.",
    regionHint: "riftwild-commons",
    discoverableId: undefined,
  },
  {
    id: "rumor-aurora",
    text: "When the aurora leans, scholars stop arguing and start writing. Worth a look — not a spoiler.",
    regionHint: "riftwild-commons",
  },
];

export function rumorForNpc(npcSlug: string, seed = 0): RumorHint {
  const idx = Math.abs(hash(npcSlug) + seed) % RUMORS.length;
  return RUMORS[idx]!;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Vague line safe for chat bubbles — never includes coordinates. */
export function formatRumorLine(rumor: RumorHint): string {
  return rumor.text;
}
