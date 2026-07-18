/**
 * One-time discovery rewards — Codex, XP, exploration points, Credits, achievements.
 * No rediscovery spam.
 */

import {
  loadTravelProgress,
  saveTravelProgress,
} from "@/game/world-travel/progress";
import { REGION_BY_SLUG, REGION_IDENTITIES } from "@/game/world-maps/regions";
import type { DiscoveryResult, DiscoveryReward } from "@/game/world-travel/types";
import { loadLivePlayState, saveLivePlayState } from "@/game/npcs/play-state";

const REGION_DISCOVERY_XP = 40;
const REGION_DISCOVERY_POINTS = 10;
const REGION_DISCOVERY_CREDITS = 25;

function rewardKey(regionId: string): string {
  return `discover-region:${regionId}`;
}

function gatewayRewardKey(gatewayId: string): string {
  return `activate-gateway:${gatewayId}`;
}

export function grantRegionDiscoveryRewards(regionId: string): DiscoveryResult {
  const region = REGION_BY_SLUG[regionId];
  const key = rewardKey(regionId);
  const state = loadTravelProgress();

  if (state.claimedDiscoveryRewards.includes(key)) {
    return { firstVisit: false, rewards: [], alreadyClaimed: true };
  }

  const firstVisit = !state.regionsDiscovered.includes(regionId);
  if (firstVisit) state.regionsDiscovered.push(regionId);

  const rewards: DiscoveryReward[] = [
    {
      kind: "codex",
      key: `codex-region-${regionId}`,
      label: `Codex: ${region?.name ?? regionId}`,
    },
    {
      kind: "xp",
      amount: REGION_DISCOVERY_XP,
      label: `+${REGION_DISCOVERY_XP} exploration XP`,
    },
    {
      kind: "exploration_points",
      amount: REGION_DISCOVERY_POINTS,
      label: `+${REGION_DISCOVERY_POINTS} exploration points`,
    },
    {
      kind: "credits",
      amount: REGION_DISCOVERY_CREDITS,
      label: `+${REGION_DISCOVERY_CREDITS} Credits (one-time)`,
    },
  ];

  state.explorationXp += REGION_DISCOVERY_XP;
  state.explorationPoints += REGION_DISCOVERY_POINTS;
  // Soft level from exploration XP (every 100 XP ≈ +1 toward travel gates)
  const gainedLevels = Math.floor(state.explorationXp / 100);
  state.playerLevel = Math.max(state.playerLevel, 1 + gainedLevels);

  const discoveredCount = state.regionsDiscovered.length;
  if (discoveredCount >= 3 && !state.travelAchievements.includes("region_discovery_3")) {
    state.travelAchievements.push("region_discovery_3");
    rewards.push({
      kind: "achievement",
      key: "region_discovery_3",
      label: "Achievement: Pathfinder",
    });
  }
  if (
    discoveredCount >= REGION_IDENTITIES.length &&
    !state.travelAchievements.includes("region_discovery_12")
  ) {
    state.travelAchievements.push("region_discovery_12");
    rewards.push({
      kind: "achievement",
      key: "region_discovery_12",
      label: "Achievement: Cartographer of the Rift",
    });
  }

  state.claimedDiscoveryRewards.push(key);
  saveTravelProgress(state);

  // Demo credits mirror (never SOL)
  try {
    const play = loadLivePlayState();
    play.demoCredits += REGION_DISCOVERY_CREDITS;
    if (!play.regionsVisited.includes(regionId)) {
      play.regionsVisited.push(regionId);
    }
    saveLivePlayState(play);
  } catch {
    /* SSR / no window */
  }

  return { firstVisit: true, rewards, alreadyClaimed: false };
}

export function grantGatewayActivationRewards(gatewayId: string): DiscoveryResult {
  const key = gatewayRewardKey(gatewayId);
  const state = loadTravelProgress();
  if (state.claimedDiscoveryRewards.includes(key)) {
    return { firstVisit: false, rewards: [], alreadyClaimed: true };
  }

  const rewards: DiscoveryReward[] = [
    {
      kind: "exploration_points",
      amount: 5,
      label: "+5 exploration points (Gateway)",
    },
    {
      kind: "codex",
      key: `codex-gateway-${gatewayId}`,
      label: "Codex: Gateway Stone activated",
    },
  ];
  state.explorationPoints += 5;
  state.claimedDiscoveryRewards.push(key);

  const activated = state.activatedGateways.length;
  if (activated >= 5 && !state.travelAchievements.includes("gateway_network_5")) {
    state.travelAchievements.push("gateway_network_5");
    rewards.push({
      kind: "achievement",
      key: "gateway_network_5",
      label: "Achievement: Stonewalker",
    });
  }

  saveTravelProgress(state);
  return { firstVisit: true, rewards, alreadyClaimed: false };
}
