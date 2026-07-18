# Riftwilds Reborn — Roadmap

**Status:** Active implementation plan  
**Launch product:** TCG / Rift Battles  
**Future release:** Living World (systems preserved; soft-gated)  
**Invariant:** Repurpose existing systems; soft-deprecate obsolete combat assumptions; no git publish from this plan alone.

## Audit snapshot (reuse first)

| System | Reuse | Soft-deprecate / demote |
|--------|-------|-------------------------|
| TCG framework + board | **Primary combat loop** | — |
| Live World Phaser + bridge | Future social hub (keep code) | Public enter until Living World release |
| Arena training engine | Affinity, kits, rewards, compliance | Action-menu battler as *primary* loop |
| Credits / marketplace | Economy spine | SOL-required paths (already off) |
| Quests + map bridge | Progression | Battle metrics tied only to pet-spar |
| Pets / hatchery / genetics | Card faces + companions | Pets-as-only fighters model |
| Housing / neighborhoods | Homes layer (later) | — |
| Festivals / season pass / clock | Seasonal scaffolding | — |
| Guild bank / social | Future guild TCG events | Empty guild battle stubs as battler PvP |

## Phase order (launch-first)

### Phase 1 — TCG launch (current focus)

1. **Card framework** — definitions, Rift Energy, decks, collection  
2. **Match UX** — board, binder, practice / demo matches  
3. **Convert combat** — practice matches resolve as TCG; Arena soft-secondary  
4. **Quests** — card packs / TCG objectives in existing catalog  
5. **Riftlings** — species → card mapping, care loops feed collection  
6. **Marketplace** — Credits card/cosmetic listings (extend categories)  
7. **Seasons / live events** — set drops + limited cards  
8. **UI / perf / docs** — board polish, payload budgets, vision current  

### Later — Living World release

9. **World public access** — habitat stays open in development; before a public release, optionally set `LIVE_WORLD_PUBLIC_ACCESS_ENABLED=false` for Coming Soon, then flip back on for the Living World release  
10. **Encounter handoff** — world → `/tcg/battle` → return (already flagged)  
11. **NPCs / housing displays** — duel tutors, deck trophies (no new housing engine)  
12. **Guilds / MMO depth** — bank + team formats; multiplayer authority  

## Phase 1 foundations (status)

- [x] Audit + vision docs (TCG-first framing)  
- [x] Consume existing `src/content/tcg/` pack (do not fork a second catalog)  
- [x] `src/game/tcg/` runtime (Rift Energy, adapter, deck, match engine, stores)  
- [x] Live World systems preserved; enterable during development (optional pre-release soft-gate)  
- [x] Soft-route legacy instant combat behind `LIVE_WORLD_LEGACY_INSTANT_COMBAT_ENABLED`  
- [x] Demo match API + playable board UI  
- [ ] Full keyword/effect interpreter (content already defines effects)  
- [ ] Prisma Card/Deck models (later — memory stores first, like Arena training)  
- [ ] Full quest/NPC/housing/marketplace card surfaces (later)  
- [ ] Living World public launch (future phase)

## Soft-deprecation / soft-gate policy

- Keep code and routes; gate with feature flags.  
- Living World: `LIVE_WORLD_PUBLIC_ACCESS_ENABLED` (default on for development; set `false` before a public release for Coming Soon) + `LIVE_WORLD_DEV_PREVIEW_ENABLED` (non-prod fallback when public access is off).  
- Prefer adapters (`src/game/tcg/adapters/`) over deletion.  
- Update docs to point new work at TCG; leave Arena docs as historical + shared affinity reference.

## Cross-links

- **Player + product roadmap (TCG · coin · Living World):** [PRODUCT_ECONOMY_ROADMAP.md](./PRODUCT_ECONOMY_ROADMAP.md) · public `/roadmap`  
- Economy: `docs/economy/MASTER_ECONOMY_ROADMAP.md`  
- Live World: `docs/LIVE_WORLD_PLAYABLE.md`  
- Arena (legacy primary combat): `docs/ARENA_ARCHITECTURE.md`  
- Assets: `docs/assets/THIRD_PARTY_ASSET_POLICY.md`
