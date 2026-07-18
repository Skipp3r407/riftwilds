/**
 * Town ambience hooks — crowd murmur, market chatter, campfire crackle (stubs).
 */

export type AmbienceLayer =
  | "crowd_murmur"
  | "market_chatter"
  | "campfire_crackle"
  | "festival_drums"
  | "inn_hearth"
  | "dock_waves"
  | "musician_loop";

export type AmbiencePlan = {
  layers: AmbienceLayer[];
  intensity: number;
  note: string;
};

export function ambienceForRestZone(
  restZoneKind: string | null,
  nearbyEstimate: number | null,
): AmbiencePlan {
  const density = nearbyEstimate ?? 0;
  const intensity = Math.min(1, 0.25 + density * 0.08);
  switch (restZoneKind) {
    case "market_square":
      return {
        layers: ["market_chatter", "crowd_murmur"],
        intensity,
        note: "Market ambience stub — await audio bus wiring.",
      };
    case "campfire":
      return {
        layers: ["campfire_crackle", "crowd_murmur"],
        intensity: Math.max(0.3, intensity * 0.8),
        note: "Campfire rest ambience stub.",
      };
    case "festival_grounds":
      return {
        layers: ["festival_drums", "musician_loop", "crowd_murmur"],
        intensity: Math.min(1, intensity + 0.2),
        note: "Festival ambience stub.",
      };
    case "inn":
    case "logout_rest":
      return {
        layers: ["inn_hearth"],
        intensity: 0.35,
        note: "Quiet inn ambience stub.",
      };
    case "fishing_dock":
      return {
        layers: ["dock_waves"],
        intensity: 0.4,
        note: "Dock ambience stub.",
      };
    case "town_plaza":
    case "safe_zone":
    default:
      return {
        layers: ["crowd_murmur"],
        intensity,
        note: "Plaza ambience stub.",
      };
  }
}
