export type ExpeditionDifficulty = "scout" | "ranger" | "warden" | "mythic";

export type ExpeditionNodeKind =
  | "travel"
  | "gather"
  | "wildlife"
  | "discovery"
  | "npc"
  | "hazard"
  | "boss_hint"
  | "rest";

export type ExpeditionNode = {
  id: string;
  kind: ExpeditionNodeKind;
  title: string;
  description: string;
  risk: number;
  rewardHints: string[];
};

export type ExpeditionDef = {
  id: string;
  seed: string;
  name: string;
  regionSlug: string;
  biomeKey: string;
  difficulty: ExpeditionDifficulty;
  estimatedMinutes: number;
  nodes: ExpeditionNode[];
  seasonKey?: string;
  weatherKey?: string;
  disclaimer: string;
};
