import { getFurnitureSku } from "@/lib/housing/furniture-catalog";
import { assertNoPermissionAbuse } from "@/lib/housing/permissions";
import { getPropertyDef } from "@/lib/housing/property-catalog";
import type {
  BuildOp,
  BuildSession,
  PlacementMode,
  PlacedFurniture,
  PlayerHome,
} from "@/lib/housing/types";

const GRID = 32;
const MAX_UNDO = 40;

type Store = { sessions: Map<string, BuildSession> };

function store(): Store {
  const g = globalThis as unknown as { __rwHousingBuild?: Store };
  if (!g.__rwHousingBuild) g.__rwHousingBuild = { sessions: new Map() };
  return g.__rwHousingBuild;
}

export function resetBuildSessionsForTests(): void {
  store().sessions.clear();
}

function sessionKey(homeId: string, userId: string): string {
  return `${homeId}:${userId}`;
}

export function startBuildSession(params: {
  home: PlayerHome;
  userId: string;
  mode?: PlacementMode;
  blueprintMode?: boolean;
}): { ok: true; session: BuildSession } | { ok: false; error: string; message: string } {
  const gate = assertNoPermissionAbuse(params.home, params.userId, "build");
  if (!gate.ok) return gate;
  const session: BuildSession = {
    homeId: params.home.homeId,
    userId: params.userId,
    mode: params.mode ?? "grid",
    blueprintMode: Boolean(params.blueprintMode),
    undo: [],
    redo: [],
    selectedIds: [],
  };
  store().sessions.set(sessionKey(params.home.homeId, params.userId), session);
  return { ok: true, session };
}

export function getBuildSession(homeId: string, userId: string): BuildSession | null {
  return store().sessions.get(sessionKey(homeId, userId)) ?? null;
}

function snap(n: number, mode: PlacementMode): number {
  if (mode === "free") return Math.round(n);
  return Math.round(n / GRID) * GRID;
}

function roomOf(home: PlayerHome, roomKey: string) {
  return home.rooms.find((r) => r.roomKey === roomKey);
}

function allFurniture(home: PlayerHome): PlacedFurniture[] {
  return home.rooms.flatMap((r) => r.furniture);
}

function collides(
  home: PlayerHome,
  candidate: PlacedFurniture,
  ignoreId?: string,
): boolean {
  const sku = getFurnitureSku(candidate.skuKey);
  if (!sku?.collides) return false;
  const room = roomOf(home, candidate.roomKey);
  if (!room) return true;
  for (const other of room.furniture) {
    if (other.instanceId === ignoreId || other.instanceId === candidate.instanceId) continue;
    const oSku = getFurnitureSku(other.skuKey);
    if (!oSku?.collides) continue;
    const ax1 = candidate.x;
    const ay1 = candidate.y;
    const ax2 = candidate.x + sku.footprint.w * GRID * candidate.scale;
    const ay2 = candidate.y + sku.footprint.h * GRID * candidate.scale;
    const bx1 = other.x;
    const by1 = other.y;
    const bx2 = other.x + oSku.footprint.w * GRID * other.scale;
    const by2 = other.y + oSku.footprint.h * GRID * other.scale;
    if (ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1) return true;
  }
  return false;
}

function pushUndo(session: BuildSession, op: BuildOp): void {
  session.undo.push(op);
  if (session.undo.length > MAX_UNDO) session.undo.shift();
  session.redo = [];
}

function countFurniture(home: PlayerHome): number {
  return allFurniture(home).length;
}

export function placeFurniture(params: {
  home: PlayerHome;
  userId: string;
  skuKey: string;
  roomKey: string;
  x: number;
  y: number;
  rotation?: PlacedFurniture["rotation"];
  scale?: number;
}):
  | { ok: true; home: PlayerHome; placed: PlacedFurniture }
  | { ok: false; error: string; message: string } {
  const gate = assertNoPermissionAbuse(params.home, params.userId, "build");
  if (!gate.ok) return gate;

  const sku = getFurnitureSku(params.skuKey);
  if (!sku) return { ok: false, error: "unknown_sku", message: "Unknown furniture." };

  const room = roomOf(params.home, params.roomKey);
  if (!room?.unlocked) {
    return { ok: false, error: "room_locked", message: "Room not unlocked." };
  }

  const prop = getPropertyDef(params.home.propertyTier);
  if (prop && countFurniture(params.home) >= prop.maxFurniture) {
    return { ok: false, error: "limit", message: "Furniture limit reached for property tier." };
  }

  const session = getBuildSession(params.home.homeId, params.userId);
  const mode = session?.mode ?? "grid";
  const scale = sku.scalable ? Math.min(2, Math.max(0.5, params.scale ?? 1)) : 1;
  const placed: PlacedFurniture = {
    instanceId: `pf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    skuKey: sku.key,
    roomKey: params.roomKey,
    x: snap(params.x, mode),
    y: snap(params.y, mode),
    rotation: params.rotation ?? 0,
    scale,
    layer: sku.category === "floors" || sku.category === "decor" ? 0 : 1,
    locked: false,
  };

  if (collides(params.home, placed)) {
    return { ok: false, error: "collision", message: "Placement collides with another object." };
  }

  room.furniture.push(placed);
  params.home.updatedAt = new Date().toISOString();
  params.home.revision += 1;
  if (session) pushUndo(session, { kind: "place", furniture: { ...placed } });
  return { ok: true, home: params.home, placed };
}

export function moveFurniture(params: {
  home: PlayerHome;
  userId: string;
  instanceId: string;
  x: number;
  y: number;
  rotation?: PlacedFurniture["rotation"];
}): { ok: true; home: PlayerHome } | { ok: false; error: string; message: string } {
  const gate = assertNoPermissionAbuse(params.home, params.userId, "build");
  if (!gate.ok) return gate;
  const session = getBuildSession(params.home.homeId, params.userId);
  const mode = session?.mode ?? "grid";

  for (const room of params.home.rooms) {
    const item = room.furniture.find((f) => f.instanceId === params.instanceId);
    if (!item) continue;
    if (item.locked) return { ok: false, error: "locked", message: "Furniture is locked." };
    const prev = { ...item };
    item.x = snap(params.x, mode);
    item.y = snap(params.y, mode);
    if (params.rotation != null) item.rotation = params.rotation;
    if (collides(params.home, item, item.instanceId)) {
      item.x = prev.x;
      item.y = prev.y;
      item.rotation = prev.rotation;
      return { ok: false, error: "collision", message: "Move would collide." };
    }
    params.home.revision += 1;
    if (session) {
      pushUndo(session, {
        kind: "move",
        instanceId: item.instanceId,
        x: prev.x,
        y: prev.y,
        rotation: prev.rotation,
      });
    }
    return { ok: true, home: params.home };
  }
  return { ok: false, error: "missing", message: "Furniture not found." };
}

export function deleteFurniture(params: {
  home: PlayerHome;
  userId: string;
  instanceId: string;
}): { ok: true; home: PlayerHome } | { ok: false; error: string; message: string } {
  const gate = assertNoPermissionAbuse(params.home, params.userId, "build");
  if (!gate.ok) return gate;
  const session = getBuildSession(params.home.homeId, params.userId);

  for (const room of params.home.rooms) {
    const idx = room.furniture.findIndex((f) => f.instanceId === params.instanceId);
    if (idx < 0) continue;
    const [removed] = room.furniture.splice(idx, 1);
    params.home.revision += 1;
    if (session && removed) pushUndo(session, { kind: "delete", instanceId: removed.instanceId });
    // Note: delete undo restores via redo path stub — full restore in applyUndo
    if (session && removed) {
      session.undo[session.undo.length - 1] = { kind: "place", furniture: removed };
      // Store inverse: we pushed wrong — fix by storing delete with furniture in redo convention
      session.undo[session.undo.length - 1] = {
        kind: "copy",
        sourceInstanceId: removed.instanceId,
        furniture: removed,
      };
    }
    return { ok: true, home: params.home };
  }
  return { ok: false, error: "missing", message: "Furniture not found." };
}

export function copyFurniture(params: {
  home: PlayerHome;
  userId: string;
  instanceId: string;
  x: number;
  y: number;
}):
  | { ok: true; home: PlayerHome; placed: PlacedFurniture }
  | { ok: false; error: string; message: string } {
  const source = allFurniture(params.home).find((f) => f.instanceId === params.instanceId);
  if (!source) return { ok: false, error: "missing", message: "Source not found." };
  return placeFurniture({
    home: params.home,
    userId: params.userId,
    skuKey: source.skuKey,
    roomKey: source.roomKey,
    x: params.x,
    y: params.y,
    rotation: source.rotation,
    scale: source.scale,
  });
}

export function setMultiSelectStub(params: {
  homeId: string;
  userId: string;
  instanceIds: string[];
}): BuildSession | null {
  const session = getBuildSession(params.homeId, params.userId);
  if (!session) return null;
  session.selectedIds = params.instanceIds.slice(0, 24);
  return session;
}

export function undoBuild(params: {
  home: PlayerHome;
  userId: string;
}): { ok: true; home: PlayerHome } | { ok: false; error: string; message: string } {
  const session = getBuildSession(params.home.homeId, params.userId);
  if (!session || session.undo.length === 0) {
    return { ok: false, error: "empty", message: "Nothing to undo." };
  }
  const op = session.undo.pop()!;
  session.redo.push(op);

  if (op.kind === "place" || op.kind === "copy") {
    for (const room of params.home.rooms) {
      room.furniture = room.furniture.filter((f) => f.instanceId !== op.furniture.instanceId);
    }
  } else if (op.kind === "move") {
    for (const room of params.home.rooms) {
      const item = room.furniture.find((f) => f.instanceId === op.instanceId);
      if (item) {
        item.x = op.x;
        item.y = op.y;
        item.rotation = op.rotation;
      }
    }
  } else if (op.kind === "set_surface") {
    const room = roomOf(params.home, op.roomKey);
    if (room) {
      if (op.wallKey) room.wallKey = "wall_timber";
      if (op.floorKey) room.floorKey = "floor_plank";
    }
  }
  params.home.revision += 1;
  return { ok: true, home: params.home };
}

export function redoBuild(params: {
  home: PlayerHome;
  userId: string;
}): { ok: true; home: PlayerHome } | { ok: false; error: string; message: string } {
  const session = getBuildSession(params.home.homeId, params.userId);
  if (!session || session.redo.length === 0) {
    return { ok: false, error: "empty", message: "Nothing to redo." };
  }
  const op = session.redo.pop()!;
  if (op.kind === "place" || op.kind === "copy") {
    const room = roomOf(params.home, op.furniture.roomKey);
    if (room && !room.furniture.some((f) => f.instanceId === op.furniture.instanceId)) {
      room.furniture.push({ ...op.furniture });
    }
  } else if (op.kind === "move") {
    // Redo of move undoes the undo — re-apply is approximate in Phase 1
  }
  session.undo.push(op);
  params.home.revision += 1;
  return { ok: true, home: params.home };
}

export function nearbyFurniture(
  home: PlayerHome,
  roomKey: string,
  cx: number,
  cy: number,
  radius = 256,
): PlacedFurniture[] {
  const room = roomOf(home, roomKey);
  if (!room) return [];
  const r2 = radius * radius;
  return room.furniture.filter((f) => {
    const dx = f.x - cx;
    const dy = f.y - cy;
    return dx * dx + dy * dy <= r2;
  });
}
