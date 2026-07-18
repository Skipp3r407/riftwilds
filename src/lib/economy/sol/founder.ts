/**
 * Founder Collection — cosmetic / collectible only. Not investments.
 */

export type FounderItemDef = {
  key: string;
  name: string;
  kind: "ALT_ART" | "CARD_BACK" | "TITLE" | "PROFILE_FRAME" | "RIFTLING_SKIN" | "HOUSING_STATUE" | "BOARD_THEME";
  /** null = unlimited cosmetic grant pool */
  supply: number | null;
  perWalletLimit: number;
  perAccountLimit: number;
  grantsGameplayPower: false;
  solPrice: string | null;
  goldPrice: number | null;
  mintPolicy: "OFF" | "OPT_IN_DEVNET";
  disclosure: string;
};

export const FOUNDER_COLLECTION: FounderItemDef[] = [
  {
    key: "founder-spark-alt",
    name: "Founder Spark Alternate Art",
    kind: "ALT_ART",
    supply: 1000,
    perWalletLimit: 1,
    perAccountLimit: 1,
    grantsGameplayPower: false,
    solPrice: "0.25",
    goldPrice: null,
    mintPolicy: "OFF",
    disclosure: "Cosmetic collectible. Not an investment. No guaranteed value.",
  },
  {
    key: "founder-card-back",
    name: "Founder Card Back",
    kind: "CARD_BACK",
    supply: 5000,
    perWalletLimit: 1,
    perAccountLimit: 1,
    grantsGameplayPower: false,
    solPrice: "0.05",
    goldPrice: 800,
    mintPolicy: "OFF",
    disclosure: "Cosmetic only. Earnable path via Gold where listed.",
  },
  {
    key: "founder-title",
    name: "Title: Founding Keeper",
    kind: "TITLE",
    supply: null,
    perWalletLimit: 1,
    perAccountLimit: 1,
    grantsGameplayPower: false,
    solPrice: null,
    goldPrice: 0,
    mintPolicy: "OFF",
    disclosure: "Account title. Cosmetic. Not financial.",
  },
];

export function listFounderItems(): FounderItemDef[] {
  return [...FOUNDER_COLLECTION];
}
