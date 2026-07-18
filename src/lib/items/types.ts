export type ItemRarity =
  | "COMMON"
  | "UNCOMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY"
  | "MYTHIC"
  | "CELESTIAL";

export type ShopCategory =
  | "WEAPONS"
  | "ARMOR"
  | "POTIONS"
  | "MAGIC"
  | "MATERIALS"
  | "COSMETICS"
  | "RECOVERY"
  | "CARE"
  | "FEATURED";

export type ItemFamily =
  | "WEAPON"
  | "ARMOR"
  | "POTION"
  | "ABILITY_SCROLL"
  | "MATERIAL"
  | "CARE"
  | "COSMETIC"
  | "RECOVERY";

export type OwnershipKind = "OFF_CHAIN" | "ON_CHAIN_OPTIONAL";
export type Tradeability = "TRADEABLE" | "ACCOUNT_BOUND" | "PET_BOUND_ON_USE" | "NON_TRANSFERABLE";

export type AffinityId =
  | "EMBER"
  | "TIDE"
  | "GROVE"
  | "STORM"
  | "STONE"
  | "FROST"
  | "RADIANT"
  | "VOID"
  | "ALLOY"
  | "SPIRIT"
  | null;

export type AttachmentPoint =
  | "head"
  | "horn"
  | "neck"
  | "chest"
  | "back"
  | "frontPawLeft"
  | "frontPawRight"
  | "rearPawLeft"
  | "rearPawRight"
  | "tailBase"
  | "tailMiddle"
  | "tailTip"
  | "wingLeft"
  | "wingRight"
  | "floatingFocus";

export type ItemAffix =
  | "Strong"
  | "Guarded"
  | "Swift"
  | "Focused"
  | "Restorative"
  | "Resistant"
  | "Energized"
  | "Precise"
  | "Bonded"
  | "Affinity-Tuned";

export type CatalogItemBase = {
  id: string;
  name: string;
  description: string;
  family: ItemFamily;
  shopCategory: ShopCategory;
  rarity: ItemRarity;
  affinity: AffinityId;
  levelRequirement: number;
  tradeability: Tradeability;
  ownership: OwnershipKind;
  stackable: boolean;
  maxStack: number;
  /** Versioned price key — look up in pricing table. */
  priceKey: string;
  supply: "UNLIMITED" | "LIMITED" | "CRAFT_ONLY" | "GAMEPLAY_ONLY";
  totalSupply?: number;
  remainingSupply?: number;
  affixes: ItemAffix[];
  iconPath: string;
  inventoryPath: string;
  compatibleAnatomy: string[];
  attachment?: AttachmentPoint;
};

export type WeaponCatalogItem = CatalogItemBase & {
  family: "WEAPON";
  weaponClass: "CLAW" | "TAIL" | "HORN" | "FLOATING_FOCUS" | "HARNESS";
  stats: { attack: number; defense: number; speed: number };
  passive?: string;
};

export type ArmorCatalogItem = CatalogItemBase & {
  family: "ARMOR";
  armorClass:
    | "HEAD"
    | "CHEST"
    | "BACK"
    | "PAW"
    | "TAIL"
    | "WING"
    | "BARRIER"
    | "COSMETIC_SET";
  weightClass: "LIGHT" | "MEDIUM" | "HEAVY";
  stats: {
    defense: number;
    maxHp: number;
    affinityResistBps: number;
    critResistBps: number;
    statusResistBps: number;
    energyRecovery: number;
    evasion: number;
  };
  passive?: string;
  cosmeticEffect?: string;
};

export type PotionCatalogItem = CatalogItemBase & {
  family: "POTION" | "CARE" | "RECOVERY";
  potionType: "HEALTH" | "ENERGY" | "STATUS" | "CARE" | "RECOVERY";
  effect: string;
  battleUsesMax?: number;
  statusRemoved?: string;
  careEffects?: Partial<{
    hunger: number;
    thirst: number;
    happiness: number;
    hygiene: number;
    energy: number;
    health: number;
    bond: number;
    stress: number;
  }>;
};

export type AbilityCatalogItem = {
  id: string;
  name: string;
  description: string;
  affinity: AffinityId;
  category: "ATTACK" | "DEFENSIVE" | "HEALING" | "CONTROL" | "SUPPORT" | "ULTIMATE" | "PHYSICAL";
  rarity: ItemRarity;
  power: number;
  energyCost: number;
  cooldown: number;
  iconPath: string;
  scrollId?: string;
};

export type MaterialCatalogItem = CatalogItemBase & {
  family: "MATERIAL";
};

export type AnyCatalogItem =
  | WeaponCatalogItem
  | ArmorCatalogItem
  | PotionCatalogItem
  | MaterialCatalogItem
  | CatalogItemBase;
