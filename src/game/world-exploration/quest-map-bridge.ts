/**
 * Quest → map integration.
 * Reads the live quest catalog + demo progress — never duplicates quest defs.
 */

import { QUEST_CATALOG, type QuestDef } from "@/game/quests/quest-catalog";
import {
  loadQuestDemoState,
  type QuestDemoState,
} from "@/game/quests/quest-demo-store";
import { resolveLiveRegionSlug } from "@/game/world-exploration/region-aliases";
import { iconKeyForMarker } from "@/game/world-exploration/map-icons";
import type { MapMarker, MapMarkerState } from "@/game/world-exploration/types";
import { getBlueprint } from "@/game/world-maps/blueprints";
import { REGION_BY_SLUG } from "@/game/world-maps/regions";

/** Secret / spoiler quest keys — never place on map until active or completed. */
const HIDDEN_UNTIL_ACTIVE = new Set<string>([
  "community-boss-hit",
]);

function questMarkerState(
  status: QuestDemoState[string]["status"],
  tracked: boolean,
): MapMarkerState {
  if (status === "completed") return "completed";
  if (status === "locked") return "locked";
  if (status === "active" && tracked) return "tracked";
  if (status === "active") return "active";
  if (status === "available") return "available";
  return "idle";
}

function anchorForQuest(quest: QuestDef, regionSlug: string): { x: number; y: number } {
  try {
    const bp = getBlueprint(regionSlug);
    const questObj = bp.objects.find(
      (o) =>
        o.type === "quest" ||
        (o.type === "npc" && (o.label?.toLowerCase().includes("quest") ?? false)),
    );
    if (questObj) return { x: questObj.x, y: questObj.y };
    const board = bp.objects.find(
      (o) =>
        o.id.toLowerCase().includes("quest") ||
        (o.label?.toLowerCase().includes("board") ?? false),
    );
    if (board) return { x: board.x, y: board.y };
    const waypoint = bp.objects.find((o) => o.type === "waypoint");
    if (waypoint) return { x: waypoint.x, y: waypoint.y };
    return { x: bp.spawn.x, y: bp.spawn.y };
  } catch {
    const region = REGION_BY_SLUG[regionSlug];
    return region?.spawn ?? { x: 512, y: 512 };
  }
}

function progressSubtitle(quest: QuestDef, demo: QuestDemoState): string | undefined {
  const entry = demo[quest.key];
  if (!entry || entry.status !== "active") return undefined;
  const parts = quest.objectives.map((o) => {
    const cur = entry.progress[o.key] ?? 0;
    return `${cur}/${o.target}`;
  });
  return parts.join(" · ");
}

/**
 * Build map markers from the quest catalog + live demo state.
 * Locked/hidden quests are omitted (no spoilers).
 */
export function buildQuestMapMarkers(opts?: {
  demoState?: QuestDemoState;
  regionSlug?: string | null;
}): MapMarker[] {
  const demo = opts?.demoState ?? loadQuestDemoState();
  const markers: MapMarker[] = [];

  for (const quest of QUEST_CATALOG) {
    const entry = demo[quest.key];
    if (!entry) continue;

    const regionSlug = resolveLiveRegionSlug(quest.regionKey);
    // Quests without a map region (care/daily hub) pin to Commons when tracked/active
    const pinRegion =
      regionSlug ??
      (entry.status === "active" || entry.tracked ? "riftwild-commons" : null);
    if (!pinRegion) continue;
    if (opts?.regionSlug && pinRegion !== opts.regionSlug) continue;

    // Spoiler gate
    if (HIDDEN_UNTIL_ACTIVE.has(quest.key) && entry.status !== "active" && entry.status !== "completed") {
      continue;
    }
    if (entry.status === "locked") continue;

    const state = questMarkerState(entry.status, entry.tracked);
    // Completed quests only show when tracked filter interest — keep available/active/tracked
    if (entry.status === "completed" && !entry.tracked) {
      // Still show completed story/exploration lightly for region completion context
      if (quest.boardTab !== "story" && quest.boardTab !== "exploration") continue;
    }

    const anchor = anchorForQuest(quest, pinRegion);
    const iconKey = iconKeyForMarker("quest", state);

    markers.push({
      id: `quest-${quest.key}`,
      kind: "quest",
      category: "quests",
      regionSlug: pinRegion,
      x: anchor.x,
      y: anchor.y,
      label: quest.name,
      subtitle: progressSubtitle(quest, demo) ?? quest.difficulty,
      state,
      visibility: "visible",
      iconKey,
      searchText: `${quest.name} ${quest.category} ${pinRegion} ${quest.key}`.toLowerCase(),
      questKey: quest.key,
      questStatus: entry.status,
      codexHref: null,
      clusterKey: `${pinRegion}:quests`,
      priority: entry.tracked ? 100 : entry.status === "active" ? 80 : entry.status === "available" ? 60 : 20,
      metadata: {
        boardTab: quest.boardTab,
        category: quest.category,
        tracked: entry.tracked,
      },
    });
  }

  return markers.sort((a, b) => b.priority - a.priority);
}

/** Live progress sync helper for UI polling. */
export function getTrackedQuestMarkers(regionSlug?: string | null): MapMarker[] {
  return buildQuestMapMarkers({ regionSlug }).filter(
    (m) => m.state === "tracked" || m.state === "active",
  );
}

export function questKeysOnMap(): string[] {
  return buildQuestMapMarkers().map((m) => m.questKey!).filter(Boolean);
}
