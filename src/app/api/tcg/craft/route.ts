import { NextResponse } from "next/server";
import { z } from "zod";
import { getCardById } from "@/content/tcg";
import {
  CRAFT_POLICY,
  craftCostForCard,
  quoteCraft,
  type CraftWallet,
} from "@/content/tcg/framework/craft";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  attachTcgGuestCookie,
  resolveTcgOwnerKey,
} from "@/game/tcg/owner-key";
import { getCollection } from "@/game/tcg/collection-store";

/**
 * Craft API scaffolding — soft currencies only.
 * Never requires SOL / crypto for competitive cards.
 */

const globalForCraft = globalThis as unknown as {
  __riftwildsTcgCraftWallets?: Map<string, CraftWallet>;
};

function wallets(): Map<string, CraftWallet> {
  if (!globalForCraft.__riftwildsTcgCraftWallets) {
    globalForCraft.__riftwildsTcgCraftWallets = new Map();
  }
  return globalForCraft.__riftwildsTcgCraftWallets;
}

function ensureWallet(ownerKey: string): CraftWallet {
  let w = wallets().get(ownerKey);
  if (!w) {
    // Demo F2P grant — enough for a ladder deck without spending.
    w = { gold: 2500, riftShards: 400, ancientFragments: 3 };
    wallets().set(ownerKey, w);
  }
  return w;
}

export async function GET(req: Request) {
  if (!featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
    return NextResponse.json({ error: "TCG_DISABLED" }, { status: 403 });
  }
  const { key, guestToken } = await resolveTcgOwnerKey();
  const url = new URL(req.url);
  const cardId = url.searchParams.get("cardId");
  const wallet = ensureWallet(key);
  const collection = getCollection(key);
  const owned = new Map(collection.cards.map((c) => [c.defId, c.count]));

  if (!cardId) {
    return attachTcgGuestCookie(
      NextResponse.json({
        policy: CRAFT_POLICY,
        wallet,
        note: CRAFT_POLICY.competitivePath,
      }),
      guestToken,
    );
  }

  const card = getCardById(cardId);
  if (!card) {
    return NextResponse.json({ error: "UNKNOWN_CARD" }, { status: 404 });
  }
  const quote = quoteCraft(card, wallet, owned.get(cardId) ?? 0);
  return attachTcgGuestCookie(
    NextResponse.json({
      policy: CRAFT_POLICY,
      wallet,
      cost: craftCostForCard(card),
      quote,
    }),
    guestToken,
  );
}

const postSchema = z.object({
  action: z.literal("quote"),
  cardId: z.string().min(1).max(80),
});

export async function POST(req: Request) {
  if (!featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
    return NextResponse.json({ error: "TCG_DISABLED" }, { status: 403 });
  }
  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }
  const { key, guestToken } = await resolveTcgOwnerKey();
  const card = getCardById(parsed.data.cardId);
  if (!card) {
    return NextResponse.json({ error: "UNKNOWN_CARD" }, { status: 404 });
  }
  const wallet = ensureWallet(key);
  const collection = getCollection(key);
  const owned =
    collection.cards.find((c) => c.defId === parsed.data.cardId)?.count ?? 0;
  const quote = quoteCraft(card, wallet, owned);

  // Phase 3: execute craft + ledger. Quote-only for now.
  return attachTcgGuestCookie(
    NextResponse.json({
      ok: quote.ok,
      quote,
      wallet,
      todo: "Execute craft against Credits/shards ledger (no crypto).",
    }),
    guestToken,
  );
}
