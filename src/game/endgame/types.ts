export type BossDef = {
  key: string;
  name: string;
  regionSlug: string;
  tier: "world" | "raid" | "endless";
  recommendedPower: number;
  phases: number;
  description: string;
  featureFlag?: string;
};

export type RaidDef = {
  key: string;
  name: string;
  bossKeys: string[];
  partySize: { min: number; max: number };
  description: string;
  featureFlag?: string;
};

export type EndlessRiftFloor = {
  floor: number;
  modifiers: string[];
  bossHint?: string;
};
