/** Phase 4 — wild encounters / world events / bosses (LIVE_WORLD_PVE_ENABLED etc.). */

export type PveEncounterStub = {
  id: string;
  kind: "wild" | "event" | "boss";
  regionId: string;
};

export function listActiveEncounters(): PveEncounterStub[] {
  return [];
}

export function startEncounter(_id: string): { ok: false; reason: string } {
  return { ok: false, reason: "PvE ships in Phase 4 — server authoritative" };
}
