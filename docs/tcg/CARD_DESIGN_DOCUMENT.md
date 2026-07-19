# Riftwilds TCG — Card Design Document

**Status:** AAA framework (Phase 1–2 live as data + UI; Phase 3 admin scaffolding)  
**Principle:** Deep strategy, massive collectability, F2P-competitive ladders. **Never require crypto/SOL for crafting or competitive decks.**

## Card as a game object

Every gameplay card exposes (directly or via `normalizeCard()`):

| Field | Notes |
|-------|--------|
| Unique ID | Stable string, e.g. `rotr-c-ashwing` |
| Name | Localization |
| Creature Family | `family-{slug}` when Riftling-bonded |
| Evolution Stage | shellseed → ascendant |
| Element | Fire/Water/…/Crystal (+ extended) |
| Rarity | common → mythic (+ cosmetic rarity tags) |
| Card Type | creature, spell, equipment, … |
| Role | striker, tank, support, controller, … |
| Health / Attack / Defense / Speed | Defense/Speed derived when absent |
| Energy Cost | Rift Energy (not mana) |
| Passive / Active / Ultimate | Via `abilities[]` + timing |
| Weaknesses / Strengths | Element matchup hints |
| Faction / Region | Faction id + region slug |
| Lore / Flavor | Localization |
| Artist / Voice / Anim / VFX / SFX | Presentation hooks |
| Unlock Method | starter, pack, craft, quest, … |
| Craft Cost | Gold + Rift Shards + Ancient Fragments + dupes |
| Collection Number | `collectorNumber` |
| Expansion Set | `expansionId` |

Source of truth: `src/content/tcg/data/cards.json`  
Runtime enrichment: `src/content/tcg/framework/normalize-card.ts`  
Indexed registry: `src/content/tcg/framework/registry.ts`

## Types

creature, companion, legendary, hero, spell, equipment, relic, artifact, trap, location, weather, token, event, quest.

**Competitive eligibility:** weather / quest / event / world props / NPC shells default to non-constructed. Cosmetics never change stats.

## Elements ↔ battle affinities

Design elements map to engine affinities (`framework/element-map.ts`). Example: Crystal → FROST until a dedicated CRYSTAL affinity ships. Adding elements is data-only; unmapped → SPIRIT.

## Rarities & copy limits (constructed)

| Rarity | Max copies |
|--------|------------|
| Common / Uncommon | 3 |
| Rare / Seasonal / Holiday | 2 |
| Epic / Legendary / Mythic | 1 |

## Creature families & evolution

Bond-lines in `card-families.json` (one family per species at launch architecture). Stages: Shellseed → Softling → Companion → Keeper → Riftmarked → Awaken → Ascendant. Branches at Awaken may be gameplay or cosmetic-only.

## Cosmetic variants

Finishes: standard, foil, gold, crystal, animated (+ signed/collector as live-ops).  
**Power-neutral.** Copy limits resolve to `baseCardId`. Capacity target: finishes × gameplay cards → tens of thousands of binder rows without new balance sheets.

## Deck rules (Standard)

- **30 cards** exact + **1 Commander** (hero, separate)
- Copy limits by rarity
- Soft-currency craft path for every competitive card
- Formats: Standard, Wild, Eternal, Draft (planned), Practice

## Acquisition (no crypto gate)

Starter grants, packs, quests, hatch companion hooks, season rewards, **craft** (Gold / Rift Shards / Ancient Fragments / duplicates). SOL wagering is out of scope for TCG competitive.

## Rift Codex

Family pages, completion %, lore chapters, museum — cosmetic rewards only. See `docs/tcg/RIFT_CODEX.md`.

## Related docs

- [Expansion Roadmap](./EXPANSION_ROADMAP.md)
- [Balance Guide](./BALANCE_GUIDE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [API Design](./API_DESIGN.md)
