# Riftwilds TCG — Balance Guide

## Goals

- Healthy archetype diversity (aggro / midrange / control / combo / tempo / ramp)
- Match length ~5–12 minutes at 30-card constructed
- No pay-to-win: cosmetics and monetization never alter stats
- Soft-currency catch-up so new players reach ladder decks without crypto

## Stats axes

| Axis | Use |
|------|-----|
| Attack / Health | Primary combat |
| Defense | Derived soak axis (tank/wall bias) |
| Speed | Tempo / Charge interaction |
| Energy Cost | Rift Energy curve |
| Role | Deck composition health checks |
| powerScore | 0–100 watch metric (`normalizeCard` / balance module) |

## Power bands

| Band | Score | Action |
|------|------:|--------|
| Weak | &lt; 35 | Buff candidates / limited support |
| Fair | 35–64 | Default healthy band |
| Strong | 65–84 | Monitor play rate |
| Outlier | ≥ 85 | Watchlist — patch or restrict |

See `src/content/tcg/framework/balance.ts` and `GET /api/tcg/stats`.

## Copy limits as balance valves

Higher rarities are scarce in-deck (1–2 copies). Do not solve power issues by forcing crypto scarcity — nerf numbers or keywords instead.

## Archetype checklist (30-card shell)

1. Curve center appropriate (aggro ~2, mid ~3.5, control ~4+)
2. At least some interaction (controller/support/removal)
3. Clear win condition (finisher / board / combo)
4. Commander synergy without being mandatory-legendary locked behind paywall

## Patch process

1. Playtest / telemetry → watchlist
2. Adjust JSON stats/effects only
3. Tag `balance.patchTag` (e.g. `ROTR-B2`)
4. Update `/patch-notes` when shipping user-visible changes (see `docs/PATCH_NOTES_WORKFLOW.md`)

## Keywords

Keep keyword identities stable; change numbers and targets first. Full list: `src/content/tcg/data/keywords.json`.

## What not to do

- Do not gate competitive power behind SOL / NFT mints
- Do not give cosmetic finishes different ATK/HP
- Do not ship expansion bombs without Standard rotation plan
