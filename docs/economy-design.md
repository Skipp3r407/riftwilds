# Economy Design — Competitive Battle-Deck Context

> Soft path is live. SOL path is scaffolded and **flag-gated OFF**.  
> Detail docs: `docs/economy/*` (especially `NO_PAY_TO_WIN_POLICY.md`, `CURRENCY_MODEL.md`, `SOL_ECONOMY_OVERVIEW.md`).

---

## 1. Currencies

| Currency | Role | Competitive impact |
|----------|------|--------------------|
| Credits / Gold | Soft spend, shop, Training Cup | Cosmetics / convenience — **not** power |
| Rift Shards | Soft prestige (in-memory scaffolding) | Non-P2W |
| SOL | Optional future real-value | All spend flags default **false** |

No guaranteed profit. No real-value wagering (`REAL_VALUE_WAGERING_ENABLED` hard false).

---

## 2. Competitive integrity

- Card power comes from play + collection earned through play/care — not paid power spikes.  
- Packs (when wired) grant collection variance under existing anti-gacha hard offs (`PAID_RANDOM_REWARDS_ENABLED` false).  
- Ranked rewards: cosmetics, binder frames, titles, Credits — never exclusive win-rate cards sold for cash.

---

## 3. Reward loops (sustainable)

1. **Daily / quest soft grants** — Credits, XP, care items (quest engine exists; product flag may be off).  
2. **Match completion** — training XP / quest metrics (hooks in battle UI).  
3. **Season pass** — Credits cosmetics (`season-pass.ts`, in-memory).  
4. **Tournaments** — Credits Training Cup live-config; SOL cups blocked.  
5. **Marketplace** — Credits listings path; SOL escrow blocked.

---

## 4. TCG-specific sinks / sources

| Flow | Status |
|------|--------|
| Pack → binder | Catalog UI exists; ownership ledger not fully wired |
| Craft / dust (`craftCost` / `sellValue` on cards) | Data present; economy loop later |
| Deck slots / binders cosmetics | Shop surfaces under `/shop/*` |
| Entry fees for ranked | Soft only when introduced |

---

## 5. Flags (must stay false unless explicitly enabled)

From `src/lib/economy/sol/flags.ts` / feature-flags:

- `SOL_WALLET_ENABLED`, `SOL_PURCHASES_ENABLED`, `SOL_MARKETPLACE_ENABLED`
- `SOL_TOURNAMENTS_ENABLED`, `SOL_MINTING_ENABLED`, `SOL_WITHDRAWALS_ENABLED`
- Related: `NFT_MINTING_ENABLED`, `ONCHAIN_COLLECTIBLES_ENABLED`, `REAL_MONEY_REWARDS_ENABLED`

---

## 6. Reuse, do not duplicate

Prefer `CurrencyLedger`, inventory, marketplace sale tables, PaymentIntent patterns. See GDD DB plan — no parallel TCG cash ledger.

---

## 7. Language rules

Never promise investment returns, “earn SOL by winning,” or pay-to-win advantages. Soft simulation UIs must label **simulation / not live**.
