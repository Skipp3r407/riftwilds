import type { RegionContentPack } from "@/content/regions/types";
import { REGION_IDENTITIES } from "@/game/world-maps/regions";

const RESTORATION_BY_REGION: Record<string, string> = {
  "ember-crater": "restore-ember-forge",
  "moonwater-coast": "restore-tide-piers",
  "elderwood-forest": "restore-grove-shrine",
  "stormspire-peaks": "restore-storm-beacons",
  "stoneheart-canyon": "restore-stone-bridges",
  "frostveil-basin": "restore-frost-observatory",
  "radiant-citadel": "restore-radiant-archives",
  "void-hollow": "restore-void-seals",
  "alloy-ruins": "restore-alloy-foundry",
  "spirit-marsh": "restore-spirit-ways",
  "celestial-rift": "restore-celestial-gate",
};

/**
 * Fallback scaffold packs for any future region not yet authored.
 * Known launch regions should use full packs in `packs/*.ts` instead.
 */
export function buildScaffoldPacks(): RegionContentPack[] {
  return REGION_IDENTITIES.filter((r) => r.id !== "riftwild-commons").map((r) => {
    const short = r.id.split("-")[0] ?? r.id;
    return {
      regionId: r.id,
      regionName: r.name,
      blurb: r.blurb,
      questChainKeys: [`chain-${r.id}`],
      quests: [
        {
          questKey: `quest-${short}-intro`,
          name: `${r.name}: First Survey`,
          creditReward: 40,
        },
        {
          questKey: `quest-${short}-deep`,
          name: `${r.name}: Deep Path`,
          creditReward: 70,
        },
        {
          questKey: `daily-${short}`,
          name: `${r.name} Daily`,
          creditReward: 35,
        },
      ],
      activities: [
        {
          id: `gather-${short}-node`,
          name: `${r.name} Gather`,
          kind: "gather",
          creditReward: 10,
          cooldownMs: 30_000,
          dailyCapCredits: 100,
          sinkHint: "CRAFT_FEE",
          description: `Gather nodes in ${r.name} — cooldown and daily caps apply.`,
        },
        {
          id: `craft-${short}-basic`,
          name: `${r.name} Craft`,
          kind: "craft",
          creditReward: 25,
          cooldownMs: 45_000,
          dailyCapCredits: 125,
          sinkHint: "CRAFT_FEE",
          description: "Craft completion Credits after paying station fee.",
        },
        {
          id: `explore-${short}`,
          name: `${r.name} Explore`,
          kind: "explore",
          creditReward: 20,
          cooldownMs: 60_000,
          dailyCapCredits: 80,
          sinkHint: "TRAVEL_FEE",
          description: "Exploration grants capped; travel fees sink Credits.",
        },
      ],
      sinks: [
        {
          id: `sink-${short}-shop`,
          reason: "NPC_SHOP_BUY",
          name: `${r.name} Supply Stall`,
          minCost: 20,
          maxCost: 200,
          leavesCirculation: true,
        },
        {
          id: `sink-${short}-travel`,
          reason: "TRAVEL_FEE",
          name: `${r.name} Travel Toll`,
          minCost: 15,
          maxCost: 80,
          leavesCirculation: true,
        },
        {
          id: `sink-${short}-restore`,
          reason: "RESTORATION_DONATION",
          name: `${r.name} Restoration Fund`,
          minCost: 10,
          maxCost: 10_000,
          leavesCirculation: true,
        },
        {
          id: `sink-${short}-repair`,
          reason: "REPAIR",
          name: `${r.name} Repair Bench`,
          minCost: 10,
          maxCost: 250,
          leavesCirculation: true,
        },
      ],
      jobBoardIds: [`job-${short}-board-1`, `job-${short}-board-2`],
      eventKeys: [`event-${short}-public`],
      restorationKey: RESTORATION_BY_REGION[r.id] ?? `restore-${r.id}`,
      completeness: "scaffold",
      theme: {
        lighting: "Generic placeholder lighting",
        weatherDefault: r.defaultWeather,
        vegetation: "Placeholder vegetation",
        architecture: "Placeholder architecture",
      },
      pois: [
        {
          id: `poi-${short}-camp`,
          name: `${r.name} Camp`,
          kind: "settlement",
          blurb: "Scaffold settlement — replace with authored pack.",
        },
        {
          id: `poi-${short}-landmark`,
          name: `${r.name} Landmark`,
          kind: "landmark",
          blurb: "Scaffold landmark — replace with authored pack.",
        },
      ],
      npcSpawnIds: [`${short}-guide`, `${short}-porter`, `${short}-guard`],
      resourceNodeIds: [`${short}-node-a`, `${short}-node-b`],
      enemyIds: [`${short}-foe`],
      dangerZoneIds: [`${short}-danger`],
      portal: {
        id: `portal-${short}`,
        name: `${r.name} Gateway`,
        arrivalNote: `Arrive in ${r.name} (scaffold).`,
      },
      musicKey: r.musicKey,
      ambianceKey: `ambient-${r.id}`,
      densityNote: "Scaffold only — not for launch regions.",
    } satisfies RegionContentPack;
  });
}
