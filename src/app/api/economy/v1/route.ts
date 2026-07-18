/**
 * Unified economy v1 router — Phases 3–16 surfaces.
 * Credits play path; SOL never required.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionContext } from "@/lib/auth/session";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import {
  createCreatorListing,
  listCreatorListings,
  purchaseCreatorListing,
} from "@/lib/economy/creator-marketplace";
import { claimLandParcel, listLandParcels, transferLandParcel } from "@/lib/economy/land";
import {
  buyFurniture,
  createHomestead,
  getHomestead,
  unlockHomesteadRoom,
  FURNITURE_CATALOG,
} from "@/lib/economy/housing-service";
import {
  contributeToGuild,
  createGuild,
  getGuildForUser,
  guildPayout,
} from "@/lib/economy/guild-bank";
import {
  addSeasonPassXp,
  claimSeasonPassReward,
  getSeasonPass,
  seasonPassTier,
  unlockSeasonPassPremium,
} from "@/lib/economy/season-pass";
import {
  buyFromPlayerShop,
  listInPlayerShop,
  listOpenPlayerShops,
  openPlayerShop,
} from "@/lib/economy/player-shops";
import {
  listTournaments,
  payoutTournamentDemo,
  registerForTournament,
} from "@/lib/economy/tournament";
import {
  buyCollectible,
  COLLECTIBLE_CATALOG,
  grantCollectible,
  listOwnedCollectibles,
} from "@/lib/economy/collectibles";
import {
  createSolPaymentIntent,
  listSolPaymentIntents,
  verifySolPaymentIntentDryRun,
} from "@/lib/economy/sol-adapter";
import {
  adminGrantCredits,
  adminRevokeCredits,
  getEconomyAdminSnapshot,
  isMarketplaceFrozen,
  isShopFrozen,
  setEconomyFreeze,
} from "@/lib/economy/admin-ops";
import {
  listOwnedPremium,
  listPremiumSkus,
  purchasePremiumSku,
} from "@/lib/economy/premium-store";
import { getEconomyHealth } from "@/lib/credits/ledger";

const bodySchema = z.object({
  op: z.string(),
  demoUser: z.string().min(2).max(80).optional(),
  requestId: z.string().min(8).max(200).optional(),
  // loose payload — validated per-op
  payload: z.record(z.unknown()).optional(),
});

function rid(fallback: string, requestId?: string) {
  return requestId && requestId.length >= 8 ? requestId : fallback;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    playCurrency: "CREDITS",
    solNeverRequired: true,
    frozen: { marketplace: isMarketplaceFrozen(), shop: isShopFrozen() },
    health: getEconomyHealth(),
    ops: [
      "creator.list",
      "creator.create",
      "creator.buy",
      "land.list",
      "land.claim",
      "land.transfer",
      "housing.get",
      "housing.create",
      "housing.unlock_room",
      "housing.buy_furniture",
      "guild.get",
      "guild.create",
      "guild.contribute",
      "guild.payout",
      "season_pass.get",
      "season_pass.unlock",
      "season_pass.xp",
      "season_pass.claim",
      "player_shop.list",
      "player_shop.open",
      "player_shop.stock",
      "player_shop.buy",
      "tournament.list",
      "tournament.register",
      "tournament.payout_demo",
      "collectibles.catalog",
      "collectibles.owned",
      "collectibles.buy",
      "collectibles.grant",
      "premium.catalog",
      "premium.buy",
      "sol.intent",
      "sol.verify_dry_run",
      "sol.list",
      "admin.snapshot",
      "admin.freeze",
      "admin.grant",
      "admin.revoke",
      "rift_storm.treasury_hook",
    ],
    spiritCanonical: {
      recovery: "/api/pets/[publicId]/recovery",
      status: "/api/pets/[publicId]/spirit",
      compat: "/api/spirit/recover",
      realm: "/spirit-realm",
    },
  });
}

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const session = await getSessionContext();
  const userId = session?.userId ?? parsed.data.demoUser ?? "demo-keeper";
  const requestId = rid(`eco_${Date.now().toString(36)}`, parsed.data.requestId);
  const p = parsed.data.payload ?? {};
  const op = parsed.data.op;

  try {
    switch (op) {
      case "creator.list":
        return NextResponse.json({ ok: true, listings: listCreatorListings() });
      case "creator.create": {
        if (!isFeatureEnabled("CREATOR_MARKETPLACE_ENABLED")) {
          return NextResponse.json({ error: "DISABLED" }, { status: 403 });
        }
        const publicId = String(p.publicId ?? `creator_${Date.now().toString(36)}`);
        const r = createCreatorListing({
          publicId,
          creatorUserId: userId,
          title: String(p.title ?? "Creator cosmetic"),
          itemKey: String(p.itemKey ?? "cosmetic-skin"),
          priceCredits: Number(p.priceCredits ?? 100),
          category: (p.category as "COSMETIC") ?? "COSMETIC",
        });
        return NextResponse.json(r.ok ? { ok: true, publicId } : r, { status: r.ok ? 200 : 400 });
      }
      case "creator.buy": {
        const r = purchaseCreatorListing({
          publicId: String(p.publicId),
          buyerUserId: userId,
          requestId,
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }

      case "land.list":
        return NextResponse.json({ ok: true, parcels: listLandParcels() });
      case "land.claim": {
        const r = claimLandParcel({
          parcelId: String(p.parcelId),
          userId,
          requestId,
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }
      case "land.transfer": {
        const r = transferLandParcel({
          parcelId: String(p.parcelId),
          fromUserId: String(p.fromUserId ?? userId),
          toUserId: String(p.toUserId),
          priceCredits: Number(p.priceCredits),
          requestId,
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }

      case "housing.get":
        return NextResponse.json({
          ok: true,
          homestead: getHomestead(userId),
          furnitureCatalog: FURNITURE_CATALOG,
        });
      case "housing.create": {
        const r = createHomestead({
          userId,
          name: String(p.name ?? "Homestead"),
          requestId,
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }
      case "housing.unlock_room": {
        const r = unlockHomesteadRoom({
          userId,
          roomKey: String(p.roomKey),
          requestId,
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }
      case "housing.buy_furniture": {
        const r = buyFurniture({
          userId,
          furnitureKey: String(p.furnitureKey),
          requestId,
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }

      case "guild.get":
        return NextResponse.json({ ok: true, guild: getGuildForUser(userId) });
      case "guild.create": {
        const r = createGuild({
          userId,
          name: String(p.name ?? "Guild"),
          requestId,
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }
      case "guild.contribute": {
        const r = contributeToGuild({
          userId,
          amount: Number(p.amount),
          requestId,
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }
      case "guild.payout": {
        const r = guildPayout({
          officerUserId: userId,
          toUserId: String(p.toUserId),
          amount: Number(p.amount),
          requestId,
          reason: String(p.reason ?? "Guild payout"),
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }

      case "season_pass.get": {
        const pass = getSeasonPass(userId, String(p.seasonKey ?? "season-0"));
        return NextResponse.json({ ok: true, pass, tier: seasonPassTier(pass) });
      }
      case "season_pass.unlock": {
        const r = unlockSeasonPassPremium({
          userId,
          requestId,
          seasonKey: typeof p.seasonKey === "string" ? p.seasonKey : undefined,
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }
      case "season_pass.xp": {
        const pass = addSeasonPassXp(userId, Number(p.xp ?? 0), String(p.seasonKey ?? "season-0"));
        return NextResponse.json({ ok: true, pass, tier: seasonPassTier(pass) });
      }
      case "season_pass.claim": {
        const r = claimSeasonPassReward({
          userId,
          tier: Number(p.tier),
          track: p.track === "premium" ? "premium" : "free",
          seasonKey: typeof p.seasonKey === "string" ? p.seasonKey : undefined,
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }

      case "player_shop.list":
        return NextResponse.json({ ok: true, shops: listOpenPlayerShops() });
      case "player_shop.open": {
        const r = openPlayerShop({
          userId,
          name: String(p.name ?? "My Shop"),
          requestId,
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }
      case "player_shop.stock": {
        const r = listInPlayerShop({
          ownerUserId: userId,
          itemKey: String(p.itemKey),
          priceCredits: Number(p.priceCredits),
          quantity: Number(p.quantity ?? 1),
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }
      case "player_shop.buy": {
        const r = buyFromPlayerShop({
          shopPublicId: String(p.shopPublicId),
          listingId: String(p.listingId),
          buyerUserId: userId,
          requestId,
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }

      case "tournament.list":
        return NextResponse.json({ ok: true, tournaments: listTournaments() });
      case "tournament.register": {
        const r = registerForTournament({
          tournamentId: String(p.tournamentId ?? "tourney-training-cup"),
          userId,
          requestId,
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }
      case "tournament.payout_demo": {
        const winners = (Array.isArray(p.winnerUserIds) ? p.winnerUserIds : [userId]) as string[];
        const r = payoutTournamentDemo({
          tournamentId: String(p.tournamentId ?? "tourney-training-cup"),
          winnerUserIds: [winners[0]!, winners[1], winners[2]],
          requestId,
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }

      case "collectibles.catalog":
        return NextResponse.json({ ok: true, catalog: COLLECTIBLE_CATALOG });
      case "collectibles.owned":
        return NextResponse.json({ ok: true, owned: listOwnedCollectibles(userId) });
      case "collectibles.buy": {
        const r = buyCollectible({
          userId,
          key: String(p.key),
          requestId,
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }
      case "collectibles.grant": {
        const r = grantCollectible(userId, String(p.key));
        return NextResponse.json(r.ok ? { ok: true } : r, { status: r.ok ? 200 : 400 });
      }

      case "premium.catalog":
        return NextResponse.json({
          ok: true,
          skus: listPremiumSkus(),
          owned: listOwnedPremium(userId),
        });
      case "premium.buy": {
        if (isShopFrozen()) {
          return NextResponse.json({ error: "SHOP_FROZEN" }, { status: 403 });
        }
        const r = purchasePremiumSku({
          userId,
          skuKey: String(p.skuKey),
          requestId,
          method: p.method === "WALLET_SOL" ? "WALLET_SOL" : "CREDITS",
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }

      case "sol.intent": {
        const intent = createSolPaymentIntent({
          userId,
          lamports: BigInt(String(p.lamports ?? "0")),
          purpose: String(p.purpose ?? "generic"),
          requestId,
        });
        return NextResponse.json({ ok: true, intent, playPath: "Use Credits instead" });
      }
      case "sol.verify_dry_run": {
        const r = verifySolPaymentIntentDryRun(String(p.intentId));
        return NextResponse.json(r);
      }
      case "sol.list":
        return NextResponse.json({ ok: true, intents: listSolPaymentIntents(userId) });

      case "admin.snapshot":
        return NextResponse.json({ ok: true, ...getEconomyAdminSnapshot() });
      case "admin.freeze": {
        const freeze = setEconomyFreeze({
          adminId: userId,
          marketplaceFrozen: Boolean(p.marketplaceFrozen),
          shopFrozen: Boolean(p.shopFrozen),
          reason: String(p.reason ?? "admin freeze"),
        });
        return NextResponse.json({ ok: true, freeze });
      }
      case "admin.grant": {
        const r = adminGrantCredits({
          adminId: userId,
          userId: String(p.targetUserId),
          amount: Number(p.amount),
          reason: String(p.reason ?? ""),
          requestId,
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }
      case "admin.revoke": {
        const r = adminRevokeCredits({
          adminId: userId,
          userId: String(p.targetUserId),
          amount: Number(p.amount),
          reason: String(p.reason ?? ""),
          requestId,
        });
        return NextResponse.json(r, { status: r.ok ? 200 : 400 });
      }

      case "rift_storm.treasury_hook": {
        // Phase 13 — soft metrics hook; loyalty/Rift Storm engine remains source of claims.
        return NextResponse.json({
          ok: true,
          note: "Rift Storm soft rewards settle via loyalty → Credits. SOL storm stays flagged off.",
          riftStormEnabled: isFeatureEnabled("RIFT_STORM_ENABLED"),
          riftStormSolEnabled: isFeatureEnabled("RIFT_STORM_SOL_ENABLED"),
          loyaltyClaimApi: "/api/loyalty/claim",
          stormApis: ["/api/loyalty/storm", "/api/loyalty/status"],
          treasuryMetricsApi: "/api/economy/treasury-metrics",
        });
      }

      default:
        return NextResponse.json({ error: "UNKNOWN_OP", op }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json(
      { error: "ECONOMY_OP_FAILED", message: e instanceof Error ? e.message : "unknown" },
      { status: 500 },
    );
  }
}
