# Phase 1 — SOL Economy Audit Report

**Date:** 2026-07-18  
**Scope:** Card battle, deck, collection, auth, inventory, quests, marketplace, currencies, wallet/blockchain, Prisma, APIs, shop, seasons, guilds, housing, Riftlings, tournaments, security, UI, docs.  
**Hard rules:** Do not delete functioning systems. Do not duplicate Credits/marketplace/payment stacks. Core play never requires SOL. All real-money SOL flags default **false**.

---

## Executive summary

Riftwilds already ships a **Credits-first soft economy** (`src/lib/credits/`), Master Economy settlement (`src/lib/economy/core/`), Credits marketplace paths, SIWS wallet auth, shop/PaymentIntent shells, tournament Credits stubs, and off-chain collectibles. The SOL optional layer must **extend** these surfaces with Gold / Rift Shards naming, collectible-edition separation from TCG gameplay cards, and flagged SOL marketplace/tournament/mint scaffolding — **without** enabling live payments or mainnet.

| Domain | Status | Reuse / extend |
|--------|--------|----------------|
| TCG cards (735) | Live content `src/content/tcg/` | Link collectible editions → `card.id`; never mint power |
| Deck / battle | Framework + world encounters | No SOL gate |
| Collection API | `/api/tcg/collection` | Soft inventory stays off-chain |
| Auth / SIWS | `/api/auth/nonce`, `/api/auth/verify`, `siws.ts` | Extend for wallet challenges; never trust client address alone |
| Credits ledger | Production soft path | **Gold** = player-facing alias of Credits |
| Marketplace | Credits write path + SOL 501 | Add SOL listing types behind flags |
| Shop / packs | Browse + Credits checkout | Standard packs soft; premium collector SOL optional |
| Tournaments | Credits entry stub | Free first; SOL entry architecture flagged off |
| Prisma | CurrencyLedger, PaymentIntent, Marketplace* | Prefer extend; migrate drafts only |
| Live World | Owner-accessible | Not the economy focus |

---

## 1. Card battle / TCG

| Path | Role |
|------|------|
| `src/content/tcg/data/cards.json` | ~735 gameplay cards |
| `src/content/tcg/types.ts`, `index.ts` | Schema + loaders |
| `docs/tcg/CARD_SYSTEM.md`, `docs/gameplay/CARD_SYSTEM.md` | Specs |
| Feature flags `TCG_*` | Framework on |

**Gap:** No first-class **CollectibleEdition** type separate from gameplay card ownership.  
**Action:** Add edition registry keyed by `gameplayCardId` (TCG id); cosmetics only.

## 2. Deck / collection

| Path | Role |
|------|------|
| `src/content/tcg/data/decks.json` | Starter / sample decks |
| `src/app/api/tcg/collection/route.ts` | Collection API (flagged) |

**Action:** Keep collection off-chain; entitlements grant gameplay copies via soft currency or quests.

## 3. Auth / wallet

| Path | Role |
|------|------|
| `src/lib/auth/siws.ts` | Nonce, SIWS message, ed25519 verify |
| `src/app/api/auth/nonce/route.ts` | Issues nonce → Prisma `AuthNonce` |
| `src/app/api/auth/verify/route.ts` | Signature + expiry + single-use |
| Flags `AUTH_WALLET_SIWS_ENABLED`, `AUTH_WALLET_OPTIONAL_PLAY` | Wallet optional for play |

**Security:** Correct pattern already (signed nonce).  
**Action:** Add economy wallet-challenge helpers that call into SIWS; add `SOL_WALLET_ENABLED` (default false) for SOL-spend UX — distinct from SIWS identity.

## 4. Inventory / entitlements

| Path | Role |
|------|------|
| Prisma `InventoryItem`, `InventoryLedger` | Item inventory |
| `src/lib/economy/collectibles.ts` | Off-chain badges/titles (Credits) |
| Equipment / loyalty shops | Cosmetics |

**Gap:** Unified entitlement grant with idempotency across packs/marketplace/SOL.  
**Action:** `entitlements.ts` + EconomyLedger append-only events.

## 5. Quests / seasons / guilds / housing / Riftlings

| Area | Path | Economy note |
|------|------|--------------|
| Quests | `docs/gameplay/QUEST_SYSTEM.md`, quest pages | Credits faucets |
| Seasons | `src/lib/economy/season-pass.ts` | Credits premium track |
| Guilds | `src/lib/economy/guild-bank.ts` | Credits bank |
| Housing | `src/lib/economy/housing-service.ts` | Credits sinks |
| Riftlings | hatchery / care / spirit | Credits care; SOL recall flagged off |

**Action:** Leave intact; SOL never required.

## 6. Marketplace / shop

| Path | Role |
|------|------|
| `src/lib/marketplace/*` | Categories include CARDS/PACKS; Credits settle |
| `src/lib/marketplace/integrity.ts` | Wash stubs; SOL settlement blocked |
| `src/lib/economy/sol-adapter.ts` | Dry-run PaymentIntent |
| `src/lib/shop/*`, premium-store | Credits checkout |

**Action:** Extend categories for `COLLECTIBLE_EDITION`; SOL listing fee helpers behind `SOL_MARKETPLACE_ENABLED`.

## 7. Currencies (pre-Phase-2)

| Asset | Today | Target |
|-------|-------|--------|
| Credits | Authoritative soft play money | **Gold** display alias (same ledger) |
| Loyalty tokens | Soft cosmetics | Unchanged |
| Arena Points | Non-transferable | Unchanged |
| Earned SOL / shop lamports | Local / flagged | Keep gated |
| Rift Shards | **Missing** | Soft secondary currency |
| SOL | Optional intent only | Flagged real-money path |

## 8. Wallet / blockchain

| Path | Role |
|------|------|
| `src/lib/solana/` (if present), SIWS | Identity |
| `projectConfig.SOLANA_NETWORK = "devnet"` | Dev default |
| `REAL_SOL_MARKETPLACE_ENABLED`, `SOL_PURCHASES_ENABLED`, `NFT_MINTING_ENABLED` | All false |
| Revenue vault / holder rewards | Soft + claim flags off |

**Action:** Add explicit SOL_* flag set from mandate; no mainnet default; no production keys.

## 9. Prisma (economy-relevant)

**Reuse:** `User`, `Wallet`, `AuthNonce`, `Session`, `CurrencyLedger`, `MarketplaceListing/Sale`, `PaymentIntent`, `PaymentVerification`, `IdempotencyKey`, treasury models.

**Propose only (do not migrate deploy):** RiftShard balance/ledger, CollectibleEditionOwnership, EconomyLedgerEvent, SolMarketplaceOrder state, mint request pipeline.

## 10. APIs

Credits, marketplace, shop, hatchery, loyalty, economy admin shells exist.  
**Gap:** Admin SOL economy status API; pack odds transparency API stubs; SOL order state machine endpoints (stubs returning blocked).

## 11. Tournaments

`src/lib/economy/tournament.ts` — Credits entry Training Cup; `TOURNAMENTS_ENABLED=false`.  
**Action:** Free tournament seed; SOL entry config stub behind `SOL_TOURNAMENTS_ENABLED`; no spectator betting.

## 12. Feature flags (conflicts / gaps)

Existing SOL-related flags (all false where risky): `SOL_PURCHASES_ENABLED`, `SOL_ITEM_PURCHASES_ENABLED`, `REAL_SOL_MARKETPLACE_ENABLED`, `NFT_MINTING_ENABLED`, `ONCHAIN_COLLECTIBLES_ENABLED`, `CRAFTING_SOL_FEES_ENABLED`, `RIFT_STORM_SOL_ENABLED`, `SOL_SPIRIT_RECALL_ENABLED`.

**Missing mandate names:** `SOL_WALLET_ENABLED`, `SOL_MARKETPLACE_ENABLED`, `SOL_TOURNAMENTS_ENABLED`, `SOL_MINTING_ENABLED`, `SOL_WITHDRAWALS_ENABLED`, `SOL_CREATOR_MARKETPLACE_ENABLED`, `SOL_COMMUNITY_FUNDING_ENABLED`.

**Action:** Add flags (default false). Keep legacy flags; new helpers OR both for gate checks.

## 13. Security

- SIWS nonce expiry + single-use: good  
- Marketplace integrity wash stubs: present  
- Risk: client-trusted wallet for claims in some pet reward paths — verify before SOL spend  
- No spectator betting flag should remain impossible (`COMMUNITY_PREDICTIONS_ENABLED` false)

## 14. Admin / UI / docs

Admin economy pages under `/admin/economy/*`. Docs under `docs/economy/*` (Credits-era).  
**Action:** SOL doc set + admin SOL panel stub + threat model / legal checklist.

---

## Recommended architecture (Phase 2+)

```
Gameplay soft: Gold (= Credits ledger) + Rift Shards (new soft ledger)
Optional: SOL intents → verify → EconomyLedger → Entitlement (never client-only grant)
TCG GameplayCard (content id) ≠ CollectibleEdition (cosmetic ownership)
Marketplace Credits path unchanged; SOL path flagged + settlement state machine
Minting: delayed opt-in pipeline, SOL_MINTING_ENABLED=false
```

## Conflicting systems

| Conflict | Resolution |
|----------|------------|
| Credits vs “Gold” naming | Alias: Gold is the UX name for Credits; ledger currency stays `CREDITS` with `GOLD` display |
| `REAL_SOL_MARKETPLACE_ENABLED` vs `SOL_MARKETPLACE_ENABLED` | Both must be true for live SOL market (belt + suspenders) |
| Collectibles.ts badges vs TCG editions | Separate modules; editions link TCG ids |
| Tournament Credits fee vs free | Add free cup; keep Credits cup; SOL cup config only |

## Security risks (pre-implementation)

1. Enabling SOL flags without escrow review  
2. Double-settle if idempotency skipped  
3. Treating collectible rarity as competitive power  
4. Mainnet RPC / private keys in env  
5. Client-reported payment success

## Blockchain dependencies

None required for core play. Optional: Solana wallet adapter (devnet), RPC read verify, future mint program — all flagged off.

## Database changes

Schema **proposals** only in this wave — see `prisma/schema-proposals/sol-economy.prisma` draft. Do not run `migrate deploy`.

---

## Phase gate

Phase 1 audit complete. Proceed to Phase 2 foundation + Phases 3–6 scaffolding with all SOL live paths **disabled**.
