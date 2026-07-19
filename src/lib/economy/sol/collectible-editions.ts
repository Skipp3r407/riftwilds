/**
 * Collectible editions — cosmetic ownership linked to TCG gameplay card IDs.
 * Editions NEVER equal gameplay power. Match/deck uses GameplayCard copies only.
 */

import { getCardById, resolveCardImagePath, TCG_CARDS } from "@/content/tcg";
import { grantEntitlement } from "@/lib/economy/sol/entitlements";
import { isSolMintingLive } from "@/lib/economy/sol/flags";

export type CollectibleTreatment =
  | "STANDARD_ART"
  | "ALTERNATE_ART"
  | "FOIL"
  | "ANIMATED"
  | "SIGNED"
  | "FOUNDER"
  | "SEASONAL"
  | "HOLIDAY";

export type CollectibleEditionDef = {
  editionId: string;
  /** Must reference `src/content/tcg` card id. */
  gameplayCardId: string;
  name: string;
  treatment: CollectibleTreatment;
  /** Always false — enforced by helpers. */
  grantsGameplayPower: false;
  supplyCap: number | null;
  mintable: boolean;
  tradeable: boolean;
  solPrice?: string;
  riftShardPrice?: number;
  goldPrice?: number;
};

export type OwnedCollectibleEdition = {
  ownershipId: string;
  userId: string;
  editionId: string;
  gameplayCardId: string;
  acquiredAt: string;
  mintRequestId: string | null;
  mintStatus: "NONE" | "QUEUED" | "BLOCKED" | "MINTED_DEVNET" | "FAILED";
};

/** Sample editions for first few TCG cards — cosmetics only. */
export function buildSeedCollectibleEditions(limit = 12): CollectibleEditionDef[] {
  const cards = TCG_CARDS.slice(0, limit);
  return cards.flatMap((card) => {
    const baseName = card.localization?.name ?? card.id;
    return [
      {
        editionId: `ce-${card.id}-alt`,
        gameplayCardId: card.id,
        name: `${baseName} — Alternate Art`,
        treatment: "ALTERNATE_ART" as const,
        grantsGameplayPower: false as const,
        supplyCap: 5000,
        mintable: false,
        tradeable: true,
        solPrice: "0.08",
        riftShardPrice: 40,
      },
      {
        editionId: `ce-${card.id}-foil`,
        gameplayCardId: card.id,
        name: `${baseName} — Foil`,
        treatment: "FOIL" as const,
        grantsGameplayPower: false as const,
        supplyCap: 2500,
        mintable: false,
        tradeable: true,
        solPrice: "0.12",
        goldPrice: 500,
      },
    ];
  });
}

export const COLLECTIBLE_EDITION_CATALOG: CollectibleEditionDef[] = buildSeedCollectibleEditions(8);

export function getCollectibleEdition(editionId: string): CollectibleEditionDef | undefined {
  return COLLECTIBLE_EDITION_CATALOG.find((e) => e.editionId === editionId);
}

/** Collectible editions never contribute ATK/HP/energy to the battle engine. */
export function collectibleAffectsGameplay(_edition: CollectibleEditionDef): false {
  return false;
}

export function assertEditionLinkedToGameplayCard(edition: CollectibleEditionDef): {
  ok: boolean;
  reason?: string;
} {
  if (edition.grantsGameplayPower !== false) {
    return { ok: false, reason: "edition_claims_power" };
  }
  const card = getCardById(edition.gameplayCardId);
  if (!card) {
    return { ok: false, reason: "unknown_gameplay_card" };
  }
  return { ok: true };
}

type Store = { owned: Map<string, OwnedCollectibleEdition[]> };

function store(): Store {
  const g = globalThis as unknown as { __riftwildsCollectibleEditions?: Store };
  if (!g.__riftwildsCollectibleEditions) {
    g.__riftwildsCollectibleEditions = { owned: new Map() };
  }
  return g.__riftwildsCollectibleEditions;
}

export function resetCollectibleEditionsForTests(): void {
  const g = globalThis as unknown as { __riftwildsCollectibleEditions?: Store };
  g.__riftwildsCollectibleEditions = { owned: new Map() };
}

export function grantCollectibleEdition(params: {
  userId: string;
  editionId: string;
  requestId: string;
}): { ok: true; ownership: OwnedCollectibleEdition } | { ok: false; error: string } {
  const def = getCollectibleEdition(params.editionId);
  if (!def) return { ok: false, error: "unknown_edition" };
  const link = assertEditionLinkedToGameplayCard(def);
  if (!link.ok) return { ok: false, error: link.reason ?? "invalid_edition" };

  const grant = grantEntitlement({
    userId: params.userId,
    kind: "COLLECTIBLE_EDITION",
    assetKey: def.editionId,
    gameplayCardId: def.gameplayCardId,
    requestId: params.requestId,
    source: "collectible_edition_grant",
    metadata: { treatment: def.treatment },
  });
  if (!grant.ok) return { ok: false, error: grant.error };

  const ownership: OwnedCollectibleEdition = {
    ownershipId: `own_${params.requestId}`,
    userId: params.userId,
    editionId: def.editionId,
    gameplayCardId: def.gameplayCardId,
    acquiredAt: new Date().toISOString(),
    mintRequestId: null,
    mintStatus: "NONE",
  };
  const list = store().owned.get(params.userId) ?? [];
  if (!grant.idempotentReplay) {
    list.push(ownership);
    store().owned.set(params.userId, list);
  }
  return { ok: true, ownership };
}

/**
 * Delayed / opt-in mint pipeline — always blocked while SOL_MINTING_ENABLED is false.
 * Never mints production assets from this scaffold.
 */
export function queueCollectibleMint(params: {
  userId: string;
  editionId: string;
  requestId: string;
}): {
  ok: true;
  status: OwnedCollectibleEdition["mintStatus"];
  note: string;
} {
  if (!isSolMintingLive()) {
    return {
      ok: true,
      status: "BLOCKED",
      note: "Minting pipeline opt-in only. SOL_MINTING_ENABLED / NFT_MINTING_ENABLED remain false. Devnet-only when enabled.",
    };
  }
  return {
    ok: true,
    status: "QUEUED",
    note: "Flags on but production mint not implemented — refusing mainnet mint.",
  };
}

export function listOwnedCollectibleEditions(userId: string): OwnedCollectibleEdition[] {
  return [...(store().owned.get(userId) ?? [])];
}

/** Gameplay card copies are unrelated to cosmetic edition ownership. */
export function gameplayCardEqualsCollectibleEdition(): false {
  return false;
}

export type CollectibleEditionBrowserItem = CollectibleEditionDef & {
  gameplayCardName: string;
  /** Existing TCG card face under public/assets/tcg/cards/ when present. */
  imagePath: string | null;
  owned: boolean;
  grantsGameplayPower: false;
  deckNote: string;
};

/** Browser rows for collectible UI — cosmetics only, linked to TCG gameplay cards. */
export function listCollectibleEditionBrowser(params?: {
  userId?: string;
}): CollectibleEditionBrowserItem[] {
  const ownedIds = new Set(
    params?.userId
      ? listOwnedCollectibleEditions(params.userId).map((o) => o.editionId)
      : [],
  );
  return COLLECTIBLE_EDITION_CATALOG.map((edition) => {
    const card = getCardById(edition.gameplayCardId);
    const imagePath = card ? resolveCardImagePath(card) ?? null : null;
    return {
      ...edition,
      gameplayCardName: card?.localization?.name ?? edition.gameplayCardId,
      imagePath,
      owned: ownedIds.has(edition.editionId),
      grantsGameplayPower: false as const,
      deckNote:
        "Cosmetic edition only. Use-in-deck uses the gameplay card copy — never this artwork variant’s power.",
    };
  });
}
