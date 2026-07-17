import type { EconomyStageId } from "@/lib/config/economy";

export type FlywheelStage = {
  id: EconomyStageId;
  title: string;
  summary: string;
  system: string;
  /** planned | scaffolded | live | external | disabled */
  status: "planned" | "scaffolded" | "live" | "external" | "disabled";
};

/**
 * Canonical economy loop — keep UI, docs, and admin in sync via this list.
 */
export const ECONOMY_FLYWHEEL: FlywheelStage[] = [
  {
    id: "BUY_COIN",
    title: "Player buys coin",
    summary: "Acquire $HATCH on Pump.fun / Solana and connect a wallet.",
    system: "Token gate + balance verification",
    status: "scaffolded",
  },
  {
    id: "GET_EGG",
    title: "Gets an Egg",
    summary: "Eligible Keepers claim a starter egg (or earn quest/event eggs).",
    system: "Egg claims",
    status: "planned",
  },
  {
    id: "HATCH",
    title: "Egg Hatches",
    summary: "Server-authoritative hatch reveals an original Riftling.",
    system: "Hatchery + CSPRNG",
    status: "planned",
  },
  {
    id: "FEED",
    title: "Pet must be fed",
    summary: "Care stats decay over time; feeding and care keep pets thriving.",
    system: "Care loop",
    status: "scaffolded",
  },
  {
    id: "BUY_ITEMS",
    title: "Player buys food/items",
    summary: "Food and care items purchased with soft currency or demo credits.",
    system: "Shop + inventory",
    status: "planned",
  },
  {
    id: "MARKETPLACE_FEES",
    title: "Marketplace fees",
    summary: "Trades take a transparent fee in basis points.",
    system: "Marketplace settlement",
    status: "scaffolded",
  },
  {
    id: "TREASURY_GROWS",
    title: "Treasury grows",
    summary: "Fees credit the community treasury ledger.",
    system: "Treasury accounting",
    status: "scaffolded",
  },
  {
    id: "COMMUNITY_EVENTS",
    title: "Community events",
    summary: "Bosses, seasons, and shared goals funded by activity.",
    system: "Community boss / seasons",
    status: "planned",
  },
  {
    id: "MORE_PLAYERS",
    title: "More players join",
    summary: "Growth from gameplay, events, and the token community.",
    system: "Acquisition (organic)",
    status: "external",
  },
  {
    id: "CREATOR_FEES",
    title: "Optional creator allocations",
    summary:
      "Project may allocate verified creator-fee proceeds into treasuries when available — never automatic per-buy pet SOL.",
    system: "Pump.fun (external) → project-controlled deposit",
    status: "external",
  },
  {
    id: "EPOCH_REWARDS",
    title: "Eligible pets share Community Reward Treasury",
    summary:
      "Own a Riftling, stay eligible via care/quests/events, and share epoch distributions funded by verified project-controlled deposits. Soft currency by default; real-money path off until audited.",
    system: "Community Reward Treasury",
    status: "disabled",
  },
];

export function getFlywheelStage(id: EconomyStageId): FlywheelStage | undefined {
  return ECONOMY_FLYWHEEL.find((s) => s.id === id);
}
