import type { RegionContentPack } from "@/content/regions/types";

/**
 * Spirit Realm — rescue instance / content pack.
 * Entered via recovery flow (not a 13th overworld travel region).
 * Playable stub: quests, NPCs, gather nodes, corruption cleanses.
 */
export const SPIRIT_REALM_CONTENT_PACK: RegionContentPack = {
  regionId: "spirit-realm",
  regionName: "Spirit Realm",
  blurb:
    "Floating lantern islands and aurora temples where Downed Riftlings wait — rescue by quest, never forced SOL.",
  questChainKeys: ["chain-spirit-realm-rescue"],
  quests: [
    { questKey: "sq-restore-memories", name: "Restore Scattered Memories", creditReward: 90 },
    { questKey: "sq-cleanse-corruption", name: "Cleanse the Corrupted Grove", creditReward: 110 },
    { questKey: "sq-defeat-nightmare", name: "Defeat the Nightmare Echo", creditReward: 140 },
    { questKey: "sq-soul-bridge", name: "Rebuild the Broken Soul Bridge", creditReward: 100 },
    { questKey: "daily-spirit-realm", name: "Spirit Realm Vigil", creditReward: 50 },
  ],
  activities: [
    {
      id: "gather-memory-fragment",
      name: "Gather Memory Fragment",
      kind: "gather",
      creditReward: 10,
      cooldownMs: 45_000,
      dailyCapCredits: 80,
      sinkHint: "CRAFT_FEE",
      description: "Soft shards along light bridges.",
    },
    {
      id: "cleanse-corruption-node",
      name: "Cleanse Corruption Node",
      kind: "explore",
      creditReward: 22,
      cooldownMs: 60_000,
      dailyCapCredits: 90,
      sinkHint: "SERVICE_FEE",
      description: "Purge nightmare residue from shrines.",
    },
    {
      id: "speak-ancestor-echo",
      name: "Speak with Ancestor Echo",
      kind: "social",
      creditReward: 16,
      cooldownMs: 120_000,
      dailyCapCredits: 48,
      sinkHint: "SERVICE_FEE",
      description: "Lore blessings — never combat power.",
    },
    {
      id: "craft-soul-thread",
      name: "Craft Soul Thread",
      kind: "craft",
      creditReward: 30,
      cooldownMs: 90_000,
      dailyCapCredits: 90,
      sinkHint: "CRAFT_FEE",
      description: "Weave rescue materials at the Soul Blacksmith.",
    },
  ],
  sinks: [
    {
      id: "sink-spirit-realm-healer",
      reason: "SERVICE_FEE",
      name: "Spirit Keeper Healer",
      minCost: 40,
      maxCost: 400,
      leavesCirculation: true,
    },
    {
      id: "sink-ghost-merchant",
      reason: "NPC_SHOP_BUY",
      name: "Ghost Merchant Maps",
      minCost: 15,
      maxCost: 200,
      leavesCirculation: true,
    },
    {
      id: "sink-soul-bridge",
      reason: "RESTORATION_DONATION",
      name: "Soul Bridge Fund",
      minCost: 10,
      maxCost: 5_000,
      leavesCirculation: true,
    },
  ],
  jobBoardIds: ["job-spirit-realm-rescue"],
  eventKeys: ["event-spirit-aurora", "event-ancestor-council"],
  restorationKey: "restore-soul-bridges",
  completeness: "full",
  theme: {
    lighting: "Aurora violet-teal over soft moongold lanterns",
    weatherDefault: "spirit_aurora",
    vegetation: "Ghost reeds, memory blossoms, floating moss islands",
    architecture: "Ancient temples, light bridges, puzzle shrines",
  },
  pois: [
    {
      id: "poi-floating-isles",
      name: "Floating Lantern Isles",
      kind: "landmark",
      blurb: "Entry islands above the mist sea.",
    },
    {
      id: "poi-ancient-temple",
      name: "Temple of Returned Breath",
      kind: "settlement",
      blurb: "Safe recovery hub with Spirit Keeper.",
    },
    {
      id: "poi-corruption-grove",
      name: "Corrupted Grove",
      kind: "danger",
      blurb: "Nightmare echo hunting grounds.",
    },
    {
      id: "poi-puzzle-shrine",
      name: "Aurora Puzzle Shrine",
      kind: "dungeon",
      blurb: "Glyph rings that reopen soul gates.",
    },
    {
      id: "poi-memorial-overlook",
      name: "Memorial Overlook",
      kind: "hidden",
      blurb: "Quiet view toward Hardcore memorials.",
    },
  ],
  npcSpawnIds: [
    "npc-spirit-keeper",
    "npc-ancient-guardian",
    "npc-memory-weaver",
    "npc-soul-blacksmith",
    "npc-ancestor-council",
    "npc-dream-walker",
    "npc-lost-child",
    "npc-ghost-merchant",
  ],
  resourceNodeIds: [
    "memory-fragment",
    "soul-bloom-node",
    "aurora-thread",
    "spirit-crystal-node",
  ],
  enemyIds: ["corrupted-wisp", "nightmare-echo", "bridge-shade"],
  dangerZoneIds: ["corruption-grove", "nightmare-hollow", "broken-bridge"],
  portal: {
    id: "portal-spirit-realm",
    name: "Lantern Gate of Return",
    arrivalNote: "Aurora opens — your Riftling's soft glow waits beyond the mist.",
  },
  musicKey: "music-spirit-realm",
  ambianceKey: "ambient-spirit-realm",
  densityNote:
    "Playable rescue stub with quests + NPCs. Full cinematic Spirit Realm polish (3D islands, animated bridges) remains backlog.",
};
