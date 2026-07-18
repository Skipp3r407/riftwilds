/**
 * Authoritative Dynamic World Event catalog — original Riftwilds IP only.
 */

import type { WorldEventDef, WorldEventKey } from "@/lib/world-events/types";

export const WORLD_EVENT_CATALOG: WorldEventDef[] = [
  {
    key: "dragon_city_attack",
    name: "Ashwing Raid on the Commons",
    blurb: "A rift-scarred ashwing circles the plaza — roofs smoke, keepers rally the walls.",
    tier: "REGIONAL",
    regionAffinity: ["riftwild-commons"],
    announceMs: 2 * 60_000,
    activeMs: 12 * 60_000,
    resolveMs: 90_000,
    mapPriority: 98,
    weatherHint: "ember_haze",
    worldChanges: [
      { kind: "weather", key: "ember_haze", label: "Ember haze over plaza", payload: { intensity: 0.7 } },
      { kind: "blocked_road", key: "north_gate_rubble", label: "North gate rubble", payload: { passable: false } },
      { kind: "spawn_override", key: "ashwing_adds", label: "Ashwing hatchlings", payload: { count: 6 } },
    ],
    npcReactionTemplates: [
      {
        npcId: "mira-eggwarden",
        mood: "alarmed",
        line: "Get the eggs under stone! That ashwing smells yolk through the rift!",
      },
      {
        npcId: "serae-ledger",
        mood: "grim",
        line: "Ledger red tonight. Defend the market stalls — ink burns slower than wood.",
      },
    ],
    questTemplates: [
      {
        title: "Bucket Line",
        giverNpcId: "mira-eggwarden",
        objective: "Douse three plaza fires and report back.",
        rewardHint: "Credits + care water cosmetic stub",
      },
    ],
    participationActions: ["ARRIVE", "DEFEND", "RESCUE", "REPAIR", "NPC_HELP", "PHOTO"],
    qualifyScore: 18,
    maxCreditsReward: 40,
  },
  {
    key: "caravan_ambush",
    name: "Riftroad Caravan Ambush",
    blurb: "Bandits cut a merchant line between Commons and Ember — wagons need escort.",
    tier: "LOCAL",
    regionAffinity: ["riftwild-commons", "ember-crater"],
    announceMs: 90_000,
    activeMs: 10 * 60_000,
    resolveMs: 60_000,
    mapPriority: 88,
    weatherHint: "dust",
    worldChanges: [
      { kind: "blocked_road", key: "riftroad_cut", label: "Riftroad cut by fallen carts", payload: { passable: false } },
      { kind: "treasure_spawn", key: "spilled_crates", label: "Spilled trade crates", payload: { nodes: 4 } },
    ],
    npcReactionTemplates: [
      {
        npcId: "pip-courier",
        mood: "alarmed",
        line: "My satchel's on that wagon! Please — don't let the bandits open the seals!",
      },
    ],
    questTemplates: [
      {
        title: "Escort the Ledger Seals",
        giverNpcId: "pip-courier",
        objective: "Clear the ambush and walk the caravan past the cut.",
        rewardHint: "Credits + courier ribbon cosmetic",
      },
    ],
    participationActions: ["ARRIVE", "DEFEND", "ESCORT", "SCOUT", "GATHER_AID", "TREASURE_CLAIM"],
    qualifyScore: 14,
    maxCreditsReward: 35,
  },
  {
    key: "goblin_invasion",
    name: "Goblin Scraptide",
    blurb: "Alloy scrap-goblins pour from a culvert — noisy, sticky, and oddly organized.",
    tier: "REGIONAL",
    regionAffinity: ["alloy-ruins", "riftwild-commons"],
    announceMs: 2 * 60_000,
    activeMs: 11 * 60_000,
    resolveMs: 75_000,
    mapPriority: 90,
    weatherHint: "smog",
    worldChanges: [
      { kind: "spawn_override", key: "scrap_goblins", label: "Scrap goblin packs", payload: { waves: 3 } },
      { kind: "npc_schedule", key: "vendors_hide", label: "Vendors shutter stalls", payload: { indoors: true } },
    ],
    npcReactionTemplates: [
      {
        npcId: "hex-conductor",
        mood: "excited",
        line: "They're stealing my calibrated bolts! Marvelous improvisation — terrible manners!",
      },
    ],
    questTemplates: [
      {
        title: "Bolt Recovery",
        giverNpcId: "hex-conductor",
        objective: "Recover three stolen calibration bolts from goblin packs.",
        rewardHint: "Credits + scrap badge",
      },
    ],
    participationActions: ["ARRIVE", "DEFEND", "SCOUT", "GATHER_AID", "NPC_HELP", "PHOTO"],
    qualifyScore: 16,
    maxCreditsReward: 35,
  },
  {
    key: "bridge_collapse",
    name: "Moonspan Bridge Collapse",
    blurb: "A support stone shears — the coastal span drops, isolating Moonwater approaches.",
    tier: "REGIONAL",
    regionAffinity: ["moonwater-coast", "riftwild-commons"],
    announceMs: 2 * 60_000,
    activeMs: 14 * 60_000,
    resolveMs: 2 * 60_000,
    mapPriority: 92,
    weatherHint: "rain",
    worldChanges: [
      { kind: "blocked_road", key: "moonspan_down", label: "Moonspan impassable", payload: { passable: false } },
      { kind: "weather", key: "coastal_rain", label: "Coastal rain", payload: { intensity: 0.6 } },
      { kind: "treasure_spawn", key: "tide_salvage", label: "Tide salvage", payload: { nodes: 5 } },
    ],
    npcReactionTemplates: [
      {
        npcId: "tide-chorister",
        mood: "grim",
        line: "The moons did not warn us. Help pull survivors from the kelp before the second tide.",
      },
    ],
    questTemplates: [
      {
        title: "Jury-Rig Span",
        giverNpcId: "tide-chorister",
        objective: "Deliver bracing timber and clear debris at both abutments.",
        rewardHint: "Credits + tideglass trinket",
      },
    ],
    participationActions: ["ARRIVE", "RESCUE", "REPAIR", "GATHER_AID", "NPC_HELP", "TREASURE_CLAIM"],
    qualifyScore: 15,
    maxCreditsReward: 40,
  },
  {
    key: "wandering_world_boss",
    name: "Wandering Rift Colossus",
    blurb: "A half-formed colossus drifts the wilds — not a raid instance, a walking hazard.",
    tier: "LEGENDARY",
    regionAffinity: ["stoneheart-canyon", "elderwood-forest", "riftwild-commons"],
    announceMs: 3 * 60_000,
    activeMs: 18 * 60_000,
    resolveMs: 2 * 60_000,
    mapPriority: 99,
    weatherHint: "rift_glow",
    worldChanges: [
      { kind: "spawn_override", key: "colossus", label: "Rift Colossus", payload: { boss: true } },
      { kind: "lighting", key: "rift_glow", label: "Rift underglow", payload: { hue: "violet_amber" } },
      { kind: "treasure_spawn", key: "colossus_shards", label: "Colossus shard fields", payload: { nodes: 3 } },
    ],
    npcReactionTemplates: [
      {
        npcId: "solen-archivist",
        mood: "curious",
        line: "Document its gait. If it remembers a name, the Codex wants the syllables.",
      },
    ],
    questTemplates: [
      {
        title: "Colossus Field Notes",
        giverNpcId: "solen-archivist",
        objective: "Land meaningful hits and photograph three weak-point flares.",
        rewardHint: "Credits + Codex scrap (never SOL)",
      },
    ],
    participationActions: ["ARRIVE", "SCOUT", "BOSS_HIT", "PHOTO", "TREASURE_CLAIM", "NPC_HELP"],
    qualifyScore: 22,
    maxCreditsReward: 55,
  },
  {
    key: "traveling_circus",
    name: "Riftling Traveling Circus",
    blurb: "Lantern wagons roll in — performers, pet tricks, and a suspiciously honest raffle.",
    tier: "LOCAL",
    regionAffinity: ["riftwild-commons"],
    announceMs: 3 * 60_000,
    activeMs: 20 * 60_000,
    resolveMs: 60_000,
    mapPriority: 70,
    weatherHint: "clear_festival",
    worldChanges: [
      { kind: "ambient_audio", key: "circus_band", label: "Circus band", payload: { bed: "plaza_festive" } },
      { kind: "npc_schedule", key: "circus_performers", label: "Performers on plaza", payload: { density: 1.4 } },
      { kind: "treasure_spawn", key: "lost_tickets", label: "Lost raffle tickets", payload: { nodes: 2 } },
    ],
    npcReactionTemplates: [
      {
        npcId: "plaza-crier",
        mood: "festive",
        line: "Step right up! No SOL in the hat — only cheers, Credits, and confetti!",
      },
    ],
    questTemplates: [
      {
        title: "Applause Circuit",
        giverNpcId: "plaza-crier",
        objective: "Cheer three acts and help a performer recover a prop.",
        rewardHint: "Credits + confetti emote stub",
      },
    ],
    participationActions: ["ARRIVE", "PHOTO", "NPC_HELP", "GATHER_AID", "EMOTE" as never],
    qualifyScore: 10,
    maxCreditsReward: 25,
  },
  {
    key: "meteor_crash",
    name: "Starfall Meteor Crash",
    blurb: "A celestial shard punches the basin — hot glass, strange seeds, short-lived glow.",
    tier: "CONTINENTAL",
    regionAffinity: ["frostveil-basin", "celestial-spires", "riftwild-commons"],
    announceMs: 2 * 60_000,
    activeMs: 15 * 60_000,
    resolveMs: 90_000,
    mapPriority: 96,
    weatherHint: "meteor_glow",
    worldChanges: [
      { kind: "weather", key: "meteor_glow", label: "Meteor afterglow", payload: { intensity: 0.8 } },
      { kind: "treasure_spawn", key: "star_glass", label: "Star-glass fragments", payload: { nodes: 6 } },
      { kind: "blocked_road", key: "crater_rim", label: "Crater rim unstable", payload: { passable: false } },
    ],
    npcReactionTemplates: [
      {
        npcId: "aurora-watcher",
        mood: "excited",
        line: "Don't pocket the warm shards bare-handed — wrap them. The sky still sings in them.",
      },
    ],
    questTemplates: [
      {
        title: "Cool the Shard",
        giverNpcId: "aurora-watcher",
        objective: "Douse the core and collect three cooled star-glass pieces.",
        rewardHint: "Credits + sky-script cosmetic",
      },
    ],
    participationActions: ["ARRIVE", "SCOUT", "REPAIR", "GATHER_AID", "TREASURE_CLAIM", "PHOTO"],
    qualifyScore: 16,
    maxCreditsReward: 45,
  },
  {
    key: "rare_rift_opening",
    name: "Rare Rift Opening",
    blurb: "A quiet tear blooms — brief window into a side-path that won't stay open.",
    tier: "LEGENDARY",
    regionAffinity: ["void-hollow", "riftwild-commons", "spirit-marsh"],
    announceMs: 90_000,
    activeMs: 8 * 60_000,
    resolveMs: 45_000,
    mapPriority: 97,
    weatherHint: "rift_aurora",
    worldChanges: [
      { kind: "lighting", key: "rift_aurora", label: "Rift aurora", payload: { pulse: true } },
      { kind: "spawn_override", key: "rift_wisps", label: "Curious rift wisps", payload: { count: 8 } },
      { kind: "treasure_spawn", key: "rift_motes", label: "Rift mote blooms", payload: { nodes: 4 } },
    ],
    npcReactionTemplates: [
      {
        npcId: "void-sealer",
        mood: "haunted",
        line: "Look, don't linger. Openings like this remember who stared too long.",
      },
    ],
    questTemplates: [
      {
        title: "Mote Census",
        giverNpcId: "void-sealer",
        objective: "Tag four rift motes before the tear seals.",
        rewardHint: "Credits + hush-charm cosmetic",
      },
    ],
    participationActions: ["ARRIVE", "SCOUT", "PHOTO", "TREASURE_CLAIM", "NPC_HELP", "BOSS_HIT"],
    qualifyScore: 12,
    maxCreditsReward: 50,
  },
  {
    key: "shipwreck",
    name: "Tidehold Shipwreck",
    blurb: "A storm-tossed hull beaches at dawn — cargo, survivors, and something below deck.",
    tier: "REGIONAL",
    regionAffinity: ["moonwater-coast"],
    announceMs: 2 * 60_000,
    activeMs: 13 * 60_000,
    resolveMs: 90_000,
    mapPriority: 89,
    weatherHint: "sea_fog",
    worldChanges: [
      { kind: "weather", key: "sea_fog", label: "Sea fog", payload: { intensity: 0.55 } },
      { kind: "treasure_spawn", key: "washed_cargo", label: "Washed cargo", payload: { nodes: 5 } },
      { kind: "spawn_override", key: "deck_scavengers", label: "Deck scavengers", payload: { count: 5 } },
    ],
    npcReactionTemplates: [
      {
        npcId: "dock-quartermaster",
        mood: "grim",
        line: "Pull the living first. The crates can wait — unless they start humming.",
      },
    ],
    questTemplates: [
      {
        title: "Beach Triage",
        giverNpcId: "dock-quartermaster",
        objective: "Rescue survivors and secure two humming crates.",
        rewardHint: "Credits + sailor knot cosmetic",
      },
    ],
    participationActions: ["ARRIVE", "RESCUE", "SCOUT", "GATHER_AID", "TREASURE_CLAIM", "DEFEND"],
    qualifyScore: 15,
    maxCreditsReward: 40,
  },
  {
    key: "haunted_forest_night",
    name: "Haunted Elderwood Night",
    blurb: "After dusk the Heartwood paths misremember themselves — lanterns float without hands.",
    tier: "REGIONAL",
    regionAffinity: ["elderwood-forest"],
    announceMs: 2 * 60_000,
    activeMs: 16 * 60_000,
    resolveMs: 60_000,
    mapPriority: 85,
    weatherHint: "moonmist",
    worldChanges: [
      { kind: "lighting", key: "moonmist", label: "Moonmist paths", payload: { confusing: true } },
      { kind: "ambient_audio", key: "whisper_chorus", label: "Whisper chorus", payload: { bed: "elder_haunt" } },
      { kind: "treasure_spawn", key: "ghost_lanterns", label: "Abandoned ghost lanterns", payload: { nodes: 4 } },
    ],
    npcReactionTemplates: [
      {
        npcId: "grove-warden",
        mood: "haunted",
        line: "Stay on the root-marks. If a lantern beckons off-path, wave — don't follow.",
      },
    ],
    questTemplates: [
      {
        title: "Root-Mark Vigil",
        giverNpcId: "grove-warden",
        objective: "Relight three root-marks and photograph a false path.",
        rewardHint: "Credits + moss-glow cosmetic",
      },
    ],
    participationActions: ["ARRIVE", "SCOUT", "PHOTO", "NPC_HELP", "GATHER_AID", "RESCUE"],
    qualifyScore: 14,
    maxCreditsReward: 35,
  },
];

const BY_KEY = Object.fromEntries(WORLD_EVENT_CATALOG.map((d) => [d.key, d])) as Record<
  WorldEventKey,
  WorldEventDef
>;

export function getWorldEventDef(key: WorldEventKey): WorldEventDef {
  return BY_KEY[key];
}

export function listWorldEventCatalog(): WorldEventDef[] {
  return WORLD_EVENT_CATALOG.slice();
}

export function isCatalogParticipationAction(
  key: WorldEventKey,
  action: string,
): boolean {
  return getWorldEventDef(key).participationActions.includes(
    action as WorldEventDef["participationActions"][number],
  );
}
