import type { EggSourceKind } from "@/lib/economy/egg-supply";
import type {
  ListingBundleMode,
  MarketplaceAssetCategory,
} from "@/lib/marketplace/listing-rules";

export type MarketplaceListingKind = "EGG" | "PET" | "ITEM";

export type OwnershipHistoryEntry = {
  ownerLabel: string;
  acquiredAt: string;
  method: string;
};

export type EggListingDisclosure = {
  eggType: string;
  sourceKind: EggSourceKind;
  generation: number;
  parents: { label: string; publicId?: string }[] | null;
  possibleSpecies: string[];
  possibleAffinities: string[];
  possibleRarityRange: string[];
  possibleCosmeticTraits: string[];
  hatchTimeHours: { min: number; max: number };
  originalSource: string;
  ownershipHistory: OwnershipHistoryEntry[];
  breedable: boolean;
  holderRewardEligible: boolean;
  exactCreatureKnown: false;
};

export type PetListingDisclosure = {
  rarity: string;
  speciesSlug: string;
  speciesName: string;
  affinity: string;
  geneticsSummary: string;
  cosmetics: string[];
  evolutionStage: string;
  level: number;
  abilities: string[];
  ultimate: string | null;
  battleRecord: { wins: number; losses: number };
  breeding: { available: boolean; usesRemaining: number };
  permanentTraits: string[];
  seasonalOrigin: string | null;
  generation: number;
  founderStatus: boolean;
  memories: string[];
  achievements: string[];
  /** Species short bio (authored lore). */
  shortBio?: string | null;
  /** Personal biography preview (generated, verified). */
  personalBioPreview?: string | null;
  originStory?: string | null;
  temperament?: string | null;
  favoriteActivity?: string | null;
  uniqueHabit?: string | null;
  hatchDate?: string | null;
};

export type MarketplaceListingView = {
  publicId: string;
  kind: MarketplaceListingKind;
  category: MarketplaceAssetCategory;
  subfilter: string | null;
  title: string;
  sellerLabel: string;
  priceLamports: string;
  priceSol: string;
  /** Play-currency ask — Credits path is authoritative for demo settlement. */
  priceCredits?: number;
  /** DEMO_CREDITS is a legacy alias for CREDITS. */
  currency: "CREDITS" | "DEMO_CREDITS" | "SOL";
  status: "ACTIVE" | "SOLD" | "CANCELLED" | "EXPIRED";
  createdAt: string;
  expiresAt: string;
  bundleMode: ListingBundleMode | null;
  bundledItems: { key: string; name: string; slot?: string }[];
  egg: EggListingDisclosure | null;
  pet: PetListingDisclosure | null;
  item: {
    key: string;
    name: string;
    rarity: string;
    category: string;
    /** Product art for listing cards / detail pane. */
    iconPath?: string | null;
  } | null;
  feeDisclosure: {
    listingFeeSol: string;
    saleFeeNote: string;
  };
  demo: boolean;
};
