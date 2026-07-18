import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import {
  assignRiftlingCare,
  expandProperty,
  getHomeForUser,
  housingAdminSnapshot,
  housingCatalogSnapshot,
  plantGardenCrop,
  purchaseOrBuildHome,
  scheduleHomeEvent,
  setHomeAmbience,
  setVisitPolicy,
  unlockHomeRoom,
  visitHomeSocial,
  enterHomeInstance,
} from "@/lib/housing";
import {
  copyFurniture,
  deleteFurniture,
  moveFurniture,
  placeFurniture,
  redoBuild,
  startBuildSession,
  undoBuild,
} from "@/lib/housing/build-mode";
import { createBlueprint, listMarketplaceBlueprints, purchaseBlueprint } from "@/lib/housing/blueprint-service";
import { FURNITURE_SKUS } from "@/lib/housing/furniture-catalog";
import { ensureGuildHall } from "@/lib/housing/guild-housing";
import { depositToHomeStorage, withdrawFromHomeStorage } from "@/lib/housing/storage-service";
import { browseHomes } from "@/lib/housing/visitor-browser";
import { withApiGuard } from "@/lib/security/api-guard";

const bodySchema = z.object({
  action: z.enum([
    "purchase",
    "unlock_room",
    "expand",
    "visit_policy",
    "enter",
    "visit_social",
    "build_start",
    "place",
    "move",
    "delete_furniture",
    "copy",
    "undo",
    "redo",
    "storage_deposit",
    "storage_withdraw",
    "event",
    "ambience",
    "plant",
    "riftling",
    "blueprint_create",
    "blueprint_buy",
    "guild_hall",
    "admin_snapshot",
  ]),
  name: z.string().min(1).max(40).optional(),
  propertyTier: z.string().min(2).max(40).optional(),
  acquisition: z.enum(["buy_prebuilt", "claim_land_build"]).optional(),
  parcelId: z.string().optional(),
  plotId: z.string().optional(),
  neighborhoodId: z.string().optional(),
  roomKey: z.string().optional(),
  policy: z.enum(["PRIVATE", "FRIENDS", "GUILD", "FEATURED", "PUBLIC"]).optional(),
  homeId: z.string().optional(),
  skuKey: z.string().optional(),
  instanceId: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  rotation: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]).optional(),
  scale: z.number().optional(),
  itemKey: z.string().optional(),
  qty: z.number().int().optional(),
  category: z.string().optional(),
  slotId: z.string().optional(),
  title: z.string().optional(),
  kind: z.enum(["party", "tour", "competition", "quiet_hours"]).optional(),
  hours: z.number().optional(),
  musicAmbient: z.string().nullable().optional(),
  lightingGlobal: z.string().optional(),
  cropKey: z.string().optional(),
  plotKey: z.string().optional(),
  petId: z.string().optional(),
  liked: z.boolean().optional(),
  rating: z.number().min(1).max(5).nullable().optional(),
  guestbookNote: z.string().max(200).optional(),
  blueprintName: z.string().optional(),
  listPriceCredits: z.number().int().optional(),
  blueprintId: z.string().optional(),
});

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "housing",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const url = new URL(request.url);
  const mode = url.searchParams.get("browse") as
    | "public"
    | "featured"
    | "friends"
    | "guild"
    | "all"
    | null;

  const res = NextResponse.json({
    requestId: guard.requestId,
    catalog: housingCatalogSnapshot(),
    furnitureCount: FURNITURE_SKUS.length,
    furniture: FURNITURE_SKUS,
    mine: getHomeForUser(ownerKey),
    browse: browseHomes({ mode: mode ?? "all" }),
    blueprints: listMarketplaceBlueprints(),
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "housing-write",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const d = parsed.data;
  let result: Record<string, unknown> = { ok: false, error: "unhandled" };

  switch (d.action) {
    case "purchase":
      if (!d.name || !d.propertyTier || !d.acquisition) {
        result = { ok: false, error: "MISSING_FIELDS" };
        break;
      }
      result = purchaseOrBuildHome({
        userId: ownerKey,
        name: d.name,
        propertyTier: d.propertyTier as never,
        acquisition: d.acquisition,
        requestId: guard.requestId,
        parcelId: d.parcelId,
        plotId: d.plotId,
        neighborhoodId: d.neighborhoodId,
      });
      break;
    case "unlock_room":
      if (!d.roomKey) {
        result = { ok: false, error: "MISSING_ROOM" };
        break;
      }
      result = unlockHomeRoom({
        userId: ownerKey,
        roomKey: d.roomKey,
        requestId: guard.requestId,
      });
      break;
    case "expand":
      result = expandProperty({ userId: ownerKey, requestId: guard.requestId });
      break;
    case "visit_policy":
      if (!d.policy) {
        result = { ok: false, error: "MISSING_POLICY" };
        break;
      }
      result = setVisitPolicy({ userId: ownerKey, policy: d.policy });
      break;
    case "enter":
      if (!d.homeId) {
        result = { ok: false, error: "MISSING_HOME" };
        break;
      }
      result = enterHomeInstance({ homeId: d.homeId, visitorId: ownerKey });
      break;
    case "visit_social":
      if (!d.homeId) {
        result = { ok: false, error: "MISSING_HOME" };
        break;
      }
      result = visitHomeSocial({
        homeId: d.homeId,
        visitorId: ownerKey,
        liked: d.liked,
        rating: d.rating,
        guestbookNote: d.guestbookNote,
      });
      break;
    case "build_start": {
      const home = getHomeForUser(ownerKey);
      if (!home) {
        result = { ok: false, error: "no_home" };
        break;
      }
      result = startBuildSession({ home, userId: ownerKey });
      break;
    }
    case "place": {
      const home = getHomeForUser(ownerKey);
      if (!home || !d.skuKey || !d.roomKey || d.x == null || d.y == null) {
        result = { ok: false, error: "MISSING_FIELDS" };
        break;
      }
      result = placeFurniture({
        home,
        userId: ownerKey,
        skuKey: d.skuKey,
        roomKey: d.roomKey,
        x: d.x,
        y: d.y,
        rotation: d.rotation,
        scale: d.scale,
      });
      break;
    }
    case "move": {
      const home = getHomeForUser(ownerKey);
      if (!home || !d.instanceId || d.x == null || d.y == null) {
        result = { ok: false, error: "MISSING_FIELDS" };
        break;
      }
      result = moveFurniture({
        home,
        userId: ownerKey,
        instanceId: d.instanceId,
        x: d.x,
        y: d.y,
        rotation: d.rotation,
      });
      break;
    }
    case "delete_furniture": {
      const home = getHomeForUser(ownerKey);
      if (!home || !d.instanceId) {
        result = { ok: false, error: "MISSING_FIELDS" };
        break;
      }
      result = deleteFurniture({ home, userId: ownerKey, instanceId: d.instanceId });
      break;
    }
    case "copy": {
      const home = getHomeForUser(ownerKey);
      if (!home || !d.instanceId || d.x == null || d.y == null) {
        result = { ok: false, error: "MISSING_FIELDS" };
        break;
      }
      result = copyFurniture({
        home,
        userId: ownerKey,
        instanceId: d.instanceId,
        x: d.x,
        y: d.y,
      });
      break;
    }
    case "undo": {
      const home = getHomeForUser(ownerKey);
      if (!home) {
        result = { ok: false, error: "no_home" };
        break;
      }
      result = undoBuild({ home, userId: ownerKey });
      break;
    }
    case "redo": {
      const home = getHomeForUser(ownerKey);
      if (!home) {
        result = { ok: false, error: "no_home" };
        break;
      }
      result = redoBuild({ home, userId: ownerKey });
      break;
    }
    case "storage_deposit": {
      const home = getHomeForUser(ownerKey);
      if (!home || !d.itemKey || !d.qty || !d.category) {
        result = { ok: false, error: "MISSING_FIELDS" };
        break;
      }
      result = depositToHomeStorage({
        home,
        userId: ownerKey,
        itemKey: d.itemKey,
        qty: d.qty,
        category: d.category,
        requestId: guard.requestId,
      });
      break;
    }
    case "storage_withdraw": {
      const home = getHomeForUser(ownerKey);
      if (!home || !d.slotId || !d.qty) {
        result = { ok: false, error: "MISSING_FIELDS" };
        break;
      }
      result = withdrawFromHomeStorage({
        home,
        userId: ownerKey,
        slotId: d.slotId,
        qty: d.qty,
        requestId: guard.requestId,
      });
      break;
    }
    case "event":
      if (!d.title || !d.kind) {
        result = { ok: false, error: "MISSING_FIELDS" };
        break;
      }
      result = scheduleHomeEvent({
        userId: ownerKey,
        title: d.title,
        kind: d.kind,
        hours: d.hours ?? 2,
      });
      break;
    case "ambience":
      result = setHomeAmbience({
        userId: ownerKey,
        musicAmbient: d.musicAmbient,
        lightingGlobal: d.lightingGlobal,
        roomKey: d.roomKey,
      });
      break;
    case "plant":
      if (!d.plotKey || !d.cropKey) {
        result = { ok: false, error: "MISSING_FIELDS" };
        break;
      }
      result = plantGardenCrop({
        userId: ownerKey,
        plotKey: d.plotKey,
        cropKey: d.cropKey,
      });
      break;
    case "riftling":
      if (!d.petId) {
        result = { ok: false, error: "MISSING_PET" };
        break;
      }
      result = assignRiftlingCare({
        userId: ownerKey,
        petId: d.petId,
        roomKey: d.roomKey,
      });
      break;
    case "blueprint_create":
      result = createBlueprint({
        userId: ownerKey,
        name: d.blueprintName ?? "Home Blueprint",
        listPriceCredits: d.listPriceCredits,
      });
      break;
    case "blueprint_buy":
      if (!d.blueprintId) {
        result = { ok: false, error: "MISSING_BP" };
        break;
      }
      result = purchaseBlueprint({
        buyerUserId: ownerKey,
        blueprintId: d.blueprintId,
        requestId: guard.requestId,
      });
      break;
    case "guild_hall":
      result = ensureGuildHall({
        userId: ownerKey,
        neighborhoodId: d.neighborhoodId,
      });
      break;
    case "admin_snapshot":
      result = { ok: true, ...housingAdminSnapshot() };
      break;
  }

  const res = NextResponse.json({
    ...result,
    requestId: guard.requestId,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
