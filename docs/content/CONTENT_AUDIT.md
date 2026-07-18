# Content Audit — Riftwilds

**Date:** 2026-07-18  
**Scope:** Game content, Credits economy, NPCs, map goals, quests, events, sinks.

## Summary

| Area | Status | Notes |
|------|--------|-------|
| Soft Credits ledger | **IMPLEMENTED** | Memory hot path + optional Prisma (`CREDITS_PRISMA_ENABLED`) |
| Prisma `CurrencyLedger` / `softCurrency` | **Wired** | Persist when User exists; demo keepers memory-only |
| Live World shop / quest Credits | **Server ledger** | `/api/economy/credits-action`; localStorage mirrors balance |
| Map goals | **IMPLEMENTED** | Commons + all regions; 3 starter recommendations |
| Regional packs | Commons + Ember + Moonwater + Elderwood **full**; others scaffold | |
| AI NPC dialogue | **IMPLEMENTED** (template + authored fallback) | Never grants Credits/items/completions |
| Quests (starter + catalog) | Existing + Credits via ledger actions | |
| Job board / public events | **IMPLEMENTED** (content + action API) | |
| Professions | **Scaffold** with interdependence | |
| Restoration sinks | Content + `RESTORATION_DONATION` burn | |
| NPC shops anti-loop | Sell-back 35% + daily caps | |
| Marketplace fee sinks | BPS fee + abuse stubs | |
| Riftling bonuses | Hard daily/pet caps | |
| Daily/weekly goals | Content + actions | |
| Achievements Credits | Small one-time map | |
| Content validation | `npm run validate:content` | |
| Admin Content Studio | `/admin/content` shell | |
| Economy Credits guide | `/economy/credits` | |
| Live World Credits chip | HUD mirror of server balance | |
| Pet care Credits | Care service debits ledger before effects | |
| Image assets (Credits/map goals UI) | Generated SVGs | `public/assets/ui/credits`, `map-goals` |

## Gaps / blockers (honest)

1. Prisma persistence requires a real `User` row — anonymous demo keepers remain process-memory.
2. External LLM for NPC AI is stubbed (deterministic templates); authored fallback always available.
3. Eight regions remain **scaffold** packs (complete structure, less authored flavor).
4. No git push performed; await user approval for commit/push.

## Credits ≠ money

Credits are soft gameplay currency. They are **not** SOL, **not** the community token, and never a guaranteed profit instrument.
