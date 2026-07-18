# Credits + Content Implementation Summary

## Delivered (Phases 2–28)

1. **Authoritative Credits ledger** — `src/lib/credits/` (integer, idempotent, capped faucets/sinks, AI block, health alerts).
2. **Optional Prisma persistence** — `persistence.ts` + `persist-bridge.ts` sync `CurrencyLedger` + `PlayerProfile.softCurrency` when User exists.
3. **Economy actions API** — `POST /api/economy/credits-action` (quest, job, event, shop, travel, restore, goals).
4. **Live World wiring** — shop buys debit server ledger; quest completions flush pending grants; HUD Credits chip.
5. **Content architecture** — map goals, regional packs, professions, jobs, events, daily/weekly goals.
6. **Full packs** — Commons, Ember Crater, Moonwater Coast, Elderwood Forest; others scaffold.
7. **AI NPC layer** — personality, memory, dialogue + authored fallback; never grants rewards.
8. **APIs** — `/api/credits/*`, `/api/map-goals`, `/api/npc-ai/dialogue`, `/api/economy/credits-action`.
9. **UI** — `/economy/credits`, `/admin/content`, `/admin/economy/credits`, wallet + map goals + Credits chip.
10. **Pet care** — care service spends Credits via ledger (never SOL).
11. **Validation + sims + tests** — green as of 2026-07-18 (`test:credits` 15/15).
12. **Docs** — `docs/content/*`, `docs/economy/*`, `docs/testing/CREDIT_ECONOMY_TESTS.md`, `PHASES_2_28_STATUS.md`.

## Blockers (documented, not hidden)

- Demo keepers without DB User rows stay in-memory (reset on deploy).
- External LLM for NPC dialogue still stubbed.
- Eight regions remain scaffold flavor packs.

## Git

No commit/push performed. Await explicit user approval.
