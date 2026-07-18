/**
 * Live World → TCG battle handoff.
 * Preserves return path so the hub session can resume after the board.
 */

export type WorldEncounterHandoff = {
  enemyId: string;
  regionSlug: string;
  returnTo: string;
};

export function buildTcgBattlePath(handoff: WorldEncounterHandoff): string {
  const params = new URLSearchParams({
    encounter: handoff.enemyId,
    region: handoff.regionSlug,
    returnTo: handoff.returnTo,
  });
  return `/tcg/battle?${params.toString()}`;
}

export function parseEncounterFromSearch(
  search: URLSearchParams | { get(name: string): string | null },
): WorldEncounterHandoff | null {
  const enemyId = search.get("encounter");
  if (!enemyId) return null;
  return {
    enemyId,
    regionSlug: search.get("region") ?? "riftwild-commons",
    returnTo: search.get("returnTo") ?? "/live-world",
  };
}

export function encounterChallengeLines(enemyId: string): string[] {
  const label = enemyId.replace(/-/g, " ");
  return [
    `A ${label} steps from the rift fringe!`,
    "Every battle is a Rift Energy card match — ready your deck.",
    "Accept to open the board. Win or lose, you return to the world.",
  ];
}
