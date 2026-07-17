/**
 * Procedural expedition generator — deterministic from seed + region + clock.
 */

import type {
  ExpeditionDef,
  ExpeditionDifficulty,
  ExpeditionNode,
  ExpeditionNodeKind,
} from "@/game/expeditions/types";
import type { LivingWorldClock } from "@/game/living-world/clock";

const BIOME_BY_REGION: Record<string, string> = {
  "riftwild-commons": "plaza_fringe",
  "ember-crater": "volcanic_caves",
  "moonwater-coast": "tide_flats",
  "elderwood-forest": "ancient_grove",
  "stormspire-peaks": "sky_ridges",
  "stoneheart-canyon": "canyon_depths",
  "frostveil-basin": "crystal_basin",
  "radiant-citadel": "citadel_ruins",
  "void-hollow": "hollow_dark",
  "alloy-ruins": "gear_wastes",
  "spirit-marsh": "lantern_marsh",
  "celestial-rift": "rift_edge",
};

const NODE_TEMPLATES: Record<
  ExpeditionNodeKind,
  { titles: string[]; descriptions: string[]; rewards: string[] }
> = {
  travel: {
    titles: ["Winding Path", "Rift Switchback", "Overgrown Trail"],
    descriptions: [
      "The path bends around a scar of old light.",
      "Your Riftling sniffs a safer detour.",
    ],
    rewards: ["travel XP (flavor)"],
  },
  gather: {
    titles: ["Resource Cache", "Glinting Node", "Keeper's Cache"],
    descriptions: [
      "Materials hum with seasonal charge.",
      "A gather node responds to the current weather.",
    ],
    rewards: ["region material", "care treat chance"],
  },
  wildlife: {
    titles: ["Wildlife Crossing", "Curious Pack", "Skittish Herd"],
    descriptions: [
      "Local wildlife watches your approach.",
      "A non-lethal encounter tests patience.",
    ],
    rewards: ["friendship hint", "observation note"],
  },
  discovery: {
    titles: ["Hidden Marker", "Forgotten Etching", "Soft Discovery"],
    descriptions: [
      "Something the Archivist has not cataloged.",
      "A lore scrap waits beneath moss.",
    ],
    rewards: ["codex fragment", "timeline event"],
  },
  npc: {
    titles: ["Traveling Keeper", "Quiet Vendor", "Lost Scout"],
    descriptions: [
      "A brief dialogue opens a story hook.",
      "Someone shares a regional rumor.",
    ],
    rewards: ["story flag", "reputation crumb"],
  },
  hazard: {
    titles: ["Unstable Ground", "Weather Bite", "Rift Static"],
    descriptions: [
      "Risk rises with disaster intensity.",
      "Care supplies may be needed after.",
    ],
    rewards: ["survival XP (flavor)"],
  },
  boss_hint: {
    titles: ["Colossus Trace", "Raid Echo", "Endgame Whisper"],
    descriptions: [
      "A footprint larger than the trail.",
      "Endgame content scaffolding — not a live boss yet.",
    ],
    rewards: ["boss briefing stub"],
  },
  rest: {
    titles: ["Quiet Camp", "Lantern Rest", "Moss Circle"],
    descriptions: [
      "Your Riftling settles; mood recovers slightly.",
      "A safe beat before the next node.",
    ],
    rewards: ["mood recovery hint"],
  },
};

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DIFFICULTY_NODES: Record<ExpeditionDifficulty, number> = {
  scout: 4,
  ranger: 6,
  warden: 8,
  mythic: 10,
};

const KINDS_BY_DIFFICULTY: Record<ExpeditionDifficulty, ExpeditionNodeKind[]> = {
  scout: ["travel", "gather", "wildlife", "rest", "discovery"],
  ranger: ["travel", "gather", "wildlife", "hazard", "npc", "discovery", "rest"],
  warden: ["travel", "hazard", "gather", "wildlife", "npc", "discovery", "boss_hint", "rest"],
  mythic: ["travel", "hazard", "wildlife", "discovery", "boss_hint", "npc", "gather", "rest"],
};

export function generateExpedition(opts: {
  seed: string;
  regionSlug: string;
  difficulty?: ExpeditionDifficulty;
  clock?: LivingWorldClock;
}): ExpeditionDef {
  const difficulty = opts.difficulty ?? "scout";
  const rng = mulberry32(hashStr(`${opts.seed}:${opts.regionSlug}:${difficulty}`));
  const biomeKey = BIOME_BY_REGION[opts.regionSlug] ?? "unknown_fringe";
  const count = DIFFICULTY_NODES[difficulty];
  const kinds = KINDS_BY_DIFFICULTY[difficulty];
  const nodes: ExpeditionNode[] = [];

  for (let i = 0; i < count; i++) {
    const kind = kinds[Math.floor(rng() * kinds.length)]!;
    const tmpl = NODE_TEMPLATES[kind];
    const title = tmpl.titles[Math.floor(rng() * tmpl.titles.length)]!;
    const description = tmpl.descriptions[Math.floor(rng() * tmpl.descriptions.length)]!;
    nodes.push({
      id: `n${i + 1}`,
      kind,
      title,
      description,
      risk: Math.round(rng() * (difficulty === "mythic" ? 90 : 60)),
      rewardHints: [tmpl.rewards[Math.floor(rng() * tmpl.rewards.length)]!],
    });
  }

  const nameParts = [
    opts.clock?.labels.season ?? "Rift",
    biomeKey.replace(/_/g, " "),
    difficulty,
  ];

  return {
    id: `exp_${hashStr(opts.seed).toString(16)}`,
    seed: opts.seed,
    name: nameParts.map((p) => p[0]!.toUpperCase() + p.slice(1)).join(" · "),
    regionSlug: opts.regionSlug,
    biomeKey,
    difficulty,
    estimatedMinutes: 5 + count * 3,
    nodes,
    seasonKey: opts.clock?.season,
    weatherKey: opts.clock?.weather,
    disclaimer:
      "Expeditions are entertainment content. Rewards shown are previews with no cash value or investment return.",
  };
}
