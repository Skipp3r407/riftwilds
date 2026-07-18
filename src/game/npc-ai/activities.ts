/**
 * Occupation → activity behaviors for living NPCs.
 */

export type NpcActivity =
  | "sleep"
  | "eat"
  | "work"
  | "patrol"
  | "social"
  | "play"
  | "shop_open"
  | "shop_closed"
  | "roam"
  | "pray"
  | "train"
  | "idle";

export type ActivityBehaviorMap = Record<NpcActivity, string>;

/** Maps schedule activities to Phaser ambientBehavior strings. */
export const ACTIVITY_TO_BEHAVIOR: ActivityBehaviorMap = {
  sleep: "idle",
  eat: "organize_goods",
  work: "forge",
  patrol: "patrol",
  social: "look_around",
  play: "pace",
  shop_open: "organize_goods",
  shop_closed: "idle",
  roam: "look_around",
  pray: "read",
  train: "train",
  idle: "idle",
};

export type OccupationRole =
  | "merchant"
  | "guard"
  | "child"
  | "smith"
  | "healer"
  | "priest"
  | "guide"
  | "scholar"
  | "cook"
  | "farmer"
  | "musician"
  | "courier"
  | "arena"
  | "hatchery"
  | "bandit"
  | "animal"
  | "citizen";

export function inferOccupationRole(
  occupation: string,
  kind?: string,
  slug?: string,
): OccupationRole {
  const o = `${occupation} ${kind ?? ""} ${slug ?? ""}`.toLowerCase();
  if (/child|kid|mim|bean|shell pip/.test(o)) return "child";
  if (/guard|captain|warden|patrol/.test(o)) return "guard";
  if (/merchant|vendor|exchange|trader|stall/.test(o)) return "merchant";
  if (/smith|forge|blacksmith|craft/.test(o)) return "smith";
  if (/heal|brook|remed|medic/.test(o)) return "healer";
  if (/priest|acolyte|cleric|temple|faith/.test(o)) return "priest";
  if (/guide|orientation|rowan/.test(o)) return "guide";
  if (/archiv|scholar|scribe|codex|historian|elara|solen/.test(o)) return "scholar";
  if (/cook|pot|kitchen/.test(o)) return "cook";
  if (/farm|garden|grove/.test(o)) return "farmer";
  if (/music|singer|reo/.test(o)) return "musician";
  if (/courier|runner|dash/.test(o)) return "courier";
  if (/arena|rook|train/.test(o)) return "arena";
  if (/hatch|mira|egg|caretaker/.test(o)) return "hatchery";
  if (/bandit|outlaw|raider/.test(o)) return "bandit";
  if (/riftling|companion|animal|creature/.test(o)) return "animal";
  return "citizen";
}

export function activityLabel(activity: NpcActivity): string {
  switch (activity) {
    case "sleep":
      return "resting";
    case "eat":
      return "eating";
    case "work":
      return "working";
    case "patrol":
      return "on patrol";
    case "social":
      return "chatting";
    case "play":
      return "playing";
    case "shop_open":
      return "tending shop";
    case "shop_closed":
      return "shop closed";
    case "roam":
      return "wandering";
    case "pray":
      return "in quiet thought";
    case "train":
      return "training";
    default:
      return "idling";
  }
}
