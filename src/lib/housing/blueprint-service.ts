import { createHash } from "crypto";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { settleEnsureStarter, settleTransfer } from "@/lib/economy/core/settlement";
import { getHomeForUser } from "@/lib/housing/instance-service";
import type { HomeBlueprint, PlayerHome } from "@/lib/housing/types";

type Store = { blueprints: Map<string, HomeBlueprint> };

function store(): Store {
  const g = globalThis as unknown as { __rwHomeBlueprints?: Store };
  if (!g.__rwHomeBlueprints) g.__rwHomeBlueprints = { blueprints: new Map() };
  return g.__rwHomeBlueprints;
}

export function resetBlueprintsForTests(): void {
  store().blueprints.clear();
}

function hashRooms(home: PlayerHome): string {
  const payload = JSON.stringify(
    home.rooms.map((r) => ({
      roomKey: r.roomKey,
      wallKey: r.wallKey,
      floorKey: r.floorKey,
      furniture: r.furniture.map((f) => ({
        skuKey: f.skuKey,
        x: f.x,
        y: f.y,
        rotation: f.rotation,
        scale: f.scale,
      })),
    })),
  );
  return createHash("sha256").update(payload).digest("hex");
}

export function createBlueprint(params: {
  userId: string;
  name: string;
  listPriceCredits?: number | null;
}): { ok: true; blueprint: HomeBlueprint } | { ok: false; error: string; message: string } {
  const home = getHomeForUser(params.userId);
  if (!home) return { ok: false, error: "no_home", message: "Create a home first." };
  const hash = hashRooms(home);
  // Anti-dupe: same layout hash from same owner cannot mint infinite unique listings
  for (const existing of store().blueprints.values()) {
    if (existing.ownerUserId === params.userId && existing.hash === hash && existing.listed) {
      return { ok: false, error: "dupe", message: "Identical blueprint already listed." };
    }
  }
  const bp: HomeBlueprint = {
    blueprintId: `bp_${Date.now().toString(36)}`,
    ownerUserId: params.userId,
    name: params.name.slice(0, 48) || `${home.name} Blueprint`,
    homeId: home.homeId,
    roomSnapshotJson: JSON.stringify(home.rooms),
    creditsPrice: params.listPriceCredits ?? null,
    listed: params.listPriceCredits != null && params.listPriceCredits > 0,
    hash,
    createdAt: new Date().toISOString(),
  };
  store().blueprints.set(bp.blueprintId, bp);
  return { ok: true, blueprint: bp };
}

export function listMarketplaceBlueprints(): HomeBlueprint[] {
  return [...store().blueprints.values()].filter((b) => b.listed);
}

export function purchaseBlueprint(params: {
  buyerUserId: string;
  blueprintId: string;
  requestId: string;
}): { ok: true; blueprint: HomeBlueprint } | { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("PLAYER_HOUSING_ENABLED") && !isFeatureEnabled("HOUSING_ECONOMY_ENABLED")) {
    return { ok: false, error: "disabled", message: "Housing marketplace disabled." };
  }
  const bp = store().blueprints.get(params.blueprintId);
  if (!bp?.listed || bp.creditsPrice == null) {
    return { ok: false, error: "not_listed", message: "Blueprint not for sale." };
  }
  if (bp.ownerUserId === params.buyerUserId) {
    return { ok: false, error: "own", message: "Cannot buy your own blueprint." };
  }
  settleEnsureStarter(params.buyerUserId);
  const fee = Math.max(1, Math.floor((bp.creditsPrice * 500) / 10_000));
  const t = settleTransfer({
    fromUserId: params.buyerUserId,
    toUserId: bp.ownerUserId,
    grossAmount: bp.creditsPrice,
    feeAmount: fee,
    buyerRequestId: `${params.requestId}:buyer`,
    sellerRequestId: `${params.requestId}:seller`,
    feeRequestId: `${params.requestId}:fee`,
    buyReason: "HOUSING_FEE",
    sellReason: "MARKETPLACE_SALE",
    metadata: { kind: "blueprint", blueprintId: bp.blueprintId, hash: bp.hash },
  });
  if (!t.ok) return { ok: false, error: t.error, message: t.message };
  // Buyer receives a personal unlisted copy — never duplicates seller listing stock
  const copy: HomeBlueprint = {
    ...bp,
    blueprintId: `bp_${params.buyerUserId.slice(0, 8)}_${Date.now().toString(36)}`,
    ownerUserId: params.buyerUserId,
    listed: false,
    creditsPrice: null,
    createdAt: new Date().toISOString(),
  };
  store().blueprints.set(copy.blueprintId, copy);
  return { ok: true, blueprint: copy };
}

export function getBlueprint(id: string): HomeBlueprint | null {
  return store().blueprints.get(id) ?? null;
}
