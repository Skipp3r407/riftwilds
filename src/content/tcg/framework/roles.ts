/**
 * Competitive board roles — orthogonal to card type.
 * Brief roles + legacy aliases for migrated data.
 */

export const TCG_ROLE_IDS = [
  "tank",
  "bruiser",
  "assassin",
  "support",
  "healer",
  "controller",
  "summoner",
  "swarm",
  "defender",
  "energy_generator",
  "disruptor",
  "finisher",
  "utility",
  // Legacy aliases kept for older JSON / tests
  "striker",
  "skirmisher",
  "wall",
  "ramp",
] as const;

export type TcgRoleId = (typeof TCG_ROLE_IDS)[number];

export const ROLE_DISPLAY: Record<string, string> = {
  tank: "Tank",
  bruiser: "Bruiser",
  assassin: "Assassin",
  support: "Support",
  healer: "Healer",
  controller: "Controller",
  summoner: "Summoner",
  swarm: "Swarm",
  defender: "Defender",
  energy_generator: "Energy Generator",
  disruptor: "Disruptor",
  finisher: "Finisher",
  utility: "Utility",
  striker: "Bruiser",
  skirmisher: "Assassin",
  wall: "Defender",
  ramp: "Energy Generator",
};

/** Map legacy role labels onto the brief vocabulary. */
export function canonicalizeRole(role: string | null | undefined): TcgRoleId {
  if (!role) return "bruiser";
  const r = role.toLowerCase().replace(/\s+/g, "_");
  const map: Record<string, TcgRoleId> = {
    striker: "bruiser",
    skirmisher: "assassin",
    wall: "defender",
    ramp: "energy_generator",
    energygenerator: "energy_generator",
    "energy-generator": "energy_generator",
  };
  if (map[r]) return map[r]!;
  if ((TCG_ROLE_IDS as readonly string[]).includes(r)) return r as TcgRoleId;
  return "bruiser";
}
