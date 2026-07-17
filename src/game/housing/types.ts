export type FurnitureCategory =
  | "seating"
  | "storage"
  | "decor"
  | "care"
  | "farming"
  | "trophy"
  | "lighting"
  | "workshop"
  | "guest";

export type FurnitureDef = {
  key: string;
  name: string;
  category: FurnitureCategory;
  roomKeys: string[];
  rarity: "common" | "uncommon" | "rare" | "epic";
  description: string;
  /** Grid footprint for future layout editor. */
  footprint: { w: number; h: number };
};

export type FarmPlotDef = {
  key: string;
  name: string;
  cropKeys: string[];
  growWorldDays: number;
  roomKey: string;
};

export type HomesteadExpansionModel = {
  rooms: {
    roomKey: string;
    name: string;
    unlockHint: string;
    supportsFarming: boolean;
    supportsTrophies: boolean;
    supportsGuest: boolean;
  }[];
  furniture: FurnitureDef[];
  farmPlots: FarmPlotDef[];
  visitPolicies: ("PRIVATE" | "FRIENDS" | "GUILD" | "PUBLIC")[];
};
