/** Enemy spawn catalog for blueprint enemy_spawn objects. */

export type EnemyDef = {
  id: string;
  name: string;
  regionIds: string[];
  tier: "beginner" | "standard" | "elite" | "boss";
  affinityHint?: string;
};

export const ENEMY_DEFS: EnemyDef[] = [
  { id: "rift-slime", name: "Rift Slime", regionIds: ["riftwild-commons"], tier: "beginner" },
  { id: "spirit-spark", name: "Lost Spirit Spark", regionIds: ["riftwild-commons", "spirit-marsh"], tier: "beginner" },
  { id: "vine-sprout", name: "Wild Vine Sprout", regionIds: ["riftwild-commons", "elderwood-forest"], tier: "beginner" },
  { id: "cinder-crawler", name: "Cinder Crawler", regionIds: ["ember-crater"], tier: "standard", affinityHint: "EMBER" },
  { id: "magma-beetle", name: "Magma Beetle", regionIds: ["ember-crater"], tier: "standard", affinityHint: "EMBER" },
  { id: "ash-hound", name: "Ash Hound", regionIds: ["ember-crater"], tier: "standard" },
  { id: "ember-wisp", name: "Ember Wisp", regionIds: ["ember-crater"], tier: "standard" },
  { id: "ashmaw-colossus", name: "Ashmaw Colossus", regionIds: ["ember-crater"], tier: "boss", affinityHint: "EMBER" },
  { id: "tide-crab", name: "Tide Crab", regionIds: ["moonwater-coast"], tier: "standard", affinityHint: "TIDE" },
  { id: "reef-stalker", name: "Reef Stalker", regionIds: ["moonwater-coast"], tier: "standard" },
  { id: "moonwater-leviathan", name: "Moonwater Leviathan", regionIds: ["moonwater-coast"], tier: "boss", affinityHint: "TIDE" },
  { id: "grove-sprite", name: "Grove Sprite", regionIds: ["elderwood-forest"], tier: "standard", affinityHint: "GROVE" },
  { id: "bark-guardian", name: "Bark Guardian", regionIds: ["elderwood-forest"], tier: "elite" },
  { id: "elderwood-heartwood", name: "Elderwood Heartwood", regionIds: ["elderwood-forest"], tier: "boss", affinityHint: "GROVE" },
  { id: "storm-raptor", name: "Storm Raptor", regionIds: ["stormspire-peaks"], tier: "standard", affinityHint: "STORM" },
  { id: "spark-wisp", name: "Spark Wisp", regionIds: ["stormspire-peaks"], tier: "standard", affinityHint: "STORM" },
  { id: "gale-mite", name: "Gale Mite", regionIds: ["stormspire-peaks"], tier: "beginner", affinityHint: "STORM" },
  { id: "stormspire-titan", name: "Stormspire Titan", regionIds: ["stormspire-peaks"], tier: "boss", affinityHint: "STORM" },
  { id: "rock-crawler", name: "Rock Crawler", regionIds: ["stoneheart-canyon"], tier: "standard", affinityHint: "STONE" },
  { id: "dust-scorpion", name: "Dust Scorpion", regionIds: ["stoneheart-canyon"], tier: "standard", affinityHint: "STONE" },
  { id: "slate-bat", name: "Slate Bat", regionIds: ["stoneheart-canyon"], tier: "beginner", affinityHint: "STONE" },
  { id: "stoneheart-behemoth", name: "Stoneheart Behemoth", regionIds: ["stoneheart-canyon"], tier: "boss", affinityHint: "STONE" },
  { id: "frost-wolf", name: "Frost Wolf", regionIds: ["frostveil-basin"], tier: "standard", affinityHint: "FROST" },
  { id: "ice-mite", name: "Ice Mite", regionIds: ["frostveil-basin"], tier: "beginner", affinityHint: "FROST" },
  { id: "snow-lurker", name: "Snow Lurker", regionIds: ["frostveil-basin"], tier: "standard", affinityHint: "FROST" },
  { id: "frostveil-warden", name: "Frostveil Warden", regionIds: ["frostveil-basin"], tier: "boss", affinityHint: "FROST" },
  { id: "radiant-construct", name: "Radiant Construct", regionIds: ["radiant-citadel"], tier: "standard", affinityHint: "RADIANT" },
  { id: "light-mote", name: "Light Mote", regionIds: ["radiant-citadel"], tier: "beginner", affinityHint: "RADIANT" },
  { id: "gilded-ward", name: "Gilded Ward", regionIds: ["radiant-citadel"], tier: "elite", affinityHint: "RADIANT" },
  { id: "radiant-sentinel", name: "Radiant Sentinel", regionIds: ["radiant-citadel"], tier: "boss", affinityHint: "RADIANT" },
  { id: "rift-stalker", name: "Rift Stalker", regionIds: ["void-hollow"], tier: "elite", affinityHint: "VOID" },
  { id: "void-mite", name: "Void Mite", regionIds: ["void-hollow"], tier: "standard", affinityHint: "VOID" },
  { id: "echo-shade", name: "Echo Shade", regionIds: ["void-hollow"], tier: "standard", affinityHint: "VOID" },
  { id: "void-riftborn", name: "Void Riftborn", regionIds: ["void-hollow"], tier: "boss", affinityHint: "VOID" },
  { id: "security-drone", name: "Security Drone", regionIds: ["alloy-ruins"], tier: "standard", affinityHint: "ALLOY" },
  { id: "scrap-mite", name: "Scrap Mite", regionIds: ["alloy-ruins"], tier: "beginner", affinityHint: "ALLOY" },
  { id: "arc-spider", name: "Arc Spider", regionIds: ["alloy-ruins"], tier: "standard", affinityHint: "ALLOY" },
  { id: "alloy-warframe", name: "Alloy Warframe", regionIds: ["alloy-ruins"], tier: "boss", affinityHint: "ALLOY" },
  { id: "marsh-spirit", name: "Marsh Spirit", regionIds: ["spirit-marsh"], tier: "standard", affinityHint: "SPIRIT" },
  { id: "bog-wisp", name: "Bog Wisp", regionIds: ["spirit-marsh"], tier: "beginner", affinityHint: "SPIRIT" },
  { id: "spirit-lantern-king", name: "Spirit Lantern King", regionIds: ["spirit-marsh"], tier: "boss", affinityHint: "SPIRIT" },
  { id: "starborn-guardian", name: "Starborn Guardian", regionIds: ["celestial-rift"], tier: "elite" },
  { id: "comet-mite", name: "Comet Mite", regionIds: ["celestial-rift"], tier: "standard" },
  { id: "astral-wisp", name: "Astral Wisp", regionIds: ["celestial-rift"], tier: "beginner" },
  { id: "celestial-rift-entity", name: "Celestial Rift Entity", regionIds: ["celestial-rift"], tier: "boss" },
];

export const ENEMY_BY_ID = Object.fromEntries(
  ENEMY_DEFS.map((e) => [e.id, e]),
) as Record<string, EnemyDef>;
