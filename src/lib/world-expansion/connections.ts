import { createRequestId } from "@/lib/utils/request-id";
import { getExpansionStore } from "@/lib/world-expansion/store";
import type { WorldConnection, WorldMapRecord } from "@/lib/world-expansion/types";

export function connectMaps(params: {
  fromMapId: string;
  toMapId: string;
  kind: WorldConnection["kind"];
  label?: string;
  bidirectional?: boolean;
}):
  | { ok: true; connection: WorldConnection }
  | { ok: false; error: string } {
  const s = getExpansionStore();
  const from = s.maps.get(params.fromMapId);
  const to = s.maps.get(params.toMapId);
  if (!from || !to) return { ok: false, error: "missing_map" };

  const connection: WorldConnection = {
    connectionId: `conn_${createRequestId().slice(0, 10)}`,
    fromMapId: params.fromMapId,
    toMapId: params.toMapId,
    kind: params.kind,
    label: params.label ?? `${params.kind} to ${to.publicName}`,
    bidirectional: params.bidirectional ?? true,
  };

  attach(from, connection);
  if (connection.bidirectional) {
    attach(to, {
      ...connection,
      connectionId: `${connection.connectionId}_rev`,
      fromMapId: params.toMapId,
      toMapId: params.fromMapId,
    });
  }
  return { ok: true, connection };
}

function attach(map: WorldMapRecord, connection: WorldConnection): void {
  if (map.connections.some((c) => c.connectionId === connection.connectionId)) return;
  map.connections.push(connection);
  map.updatedAt = new Date().toISOString();
  getExpansionStore().maps.set(map.mapId, map);
}

export function listConnections(mapId: string): WorldConnection[] {
  return getExpansionStore().maps.get(mapId)?.connections ?? [];
}
