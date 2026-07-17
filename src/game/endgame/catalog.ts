import type { BossDef, EndlessRiftFloor, RaidDef } from "@/game/endgame/types";

export const BOSS_CATALOG: BossDef[] = [
  {
    key: "ashmaw_colossus",
    name: "Ashmaw Colossus",
    regionSlug: "ember-crater",
    tier: "world",
    recommendedPower: 120,
    phases: 3,
    description: "World boss scaffold — ash storms empower its second phase.",
    featureFlag: "WORLD_BOSSES_ENABLED",
  },
  {
    key: "moonwater_leviathan",
    name: "Moonwater Leviathan",
    regionSlug: "moonwater-coast",
    tier: "world",
    recommendedPower: 130,
    phases: 3,
    description: "Coastal world boss scaffold tied to tidal breach disasters.",
    featureFlag: "WORLD_BOSSES_ENABLED",
  },
  {
    key: "celestial_gate_warden",
    name: "Celestial Gate Warden",
    regionSlug: "celestial-rift",
    tier: "raid",
    recommendedPower: 220,
    phases: 4,
    description: "Raid gatekeeper — unlocks after civilization celestial milestone.",
    featureFlag: "ENDGAME_RAIDS_ENABLED",
  },
  {
    key: "endless_echo",
    name: "Endless Echo",
    regionSlug: "celestial-rift",
    tier: "endless",
    recommendedPower: 150,
    phases: 1,
    description: "Scales per Endless Rift floor.",
    featureFlag: "ENDLESS_RIFT_ENABLED",
  },
];

export const RAID_CATALOG: RaidDef[] = [
  {
    key: "gate_ascent",
    name: "Gate Ascent",
    bossKeys: ["celestial_gate_warden"],
    partySize: { min: 2, max: 4 },
    description: "Cooperative raid scaffold — requires multiplayer service.",
    featureFlag: "ENDGAME_RAIDS_ENABLED",
  },
];

export function generateEndlessFloor(floor: number): EndlessRiftFloor {
  const modifiers = [
    "weather_locked",
    "care_drain",
    "affinity_shift",
    "discovery_rich",
    "wildlife_surge",
  ];
  return {
    floor,
    modifiers: [
      modifiers[floor % modifiers.length]!,
      modifiers[(floor * 3) % modifiers.length]!,
    ],
    bossHint: floor % 5 === 0 ? "endless_echo" : undefined,
  };
}
