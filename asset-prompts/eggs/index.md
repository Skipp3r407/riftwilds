# Riftwilds Egg Art Prompts — Index

**Project:** Riftwilds · **Category:** Eggs · **Last updated:** 2026-07-17

Master prompt library for all egg-class assets: master renders, hatch frames, icons, hatchery cards, and silhouette-reveal effects.

## Shared resources

| File | Purpose |
|------|---------|
| [negative-prompt.md](./negative-prompt.md) | Shared negative prompts incl. Poké Ball / capsule bans |
| [hatching-animation-spec.md](./hatching-animation-spec.md) | Sprite sheet layout, frame order, Phaser config, alignment checklist |

## Global specs

| Asset type | Size | Notes |
|------------|------|-------|
| Master full egg | 1536 × 1536 | Hero / marketing / source reference |
| Hatch frames | 1024 × 1024 | Shared baseline; see animation spec |
| Inventory icon | 256 × 256 | Readable at 48 px |
| Hatchery card | 768 × 1024 | Portrait card, egg centered upper third |
| Silhouette reveal | 1024 × 1024 | Background FX layer; no creature baked in |

**Style:** Original 2D fantasy, subtle pixel influence, clean dark outlines, cel shading, transparent BG, centered, no text/logo, upper-left lighting, ≥10% padding.

## Egg class registry

| Class | Prompt file | Visual direction | Status |
|-------|-------------|------------------|--------|
| Wild | [wild.md](./wild.md) | Pale cream, irregular speckles, faint glow | pending |
| Ember | [ember.md](./ember.md) | Charcoal, orange cracks, ember particles | pending |
| Tide | [tide.md](./tide.md) | Pearl-blue, water markings, droplets | pending |
| Grove | [grove.md](./grove.md) | Bark texture, moss, tiny leaves, emerald runes | pending |
| Storm | [storm.md](./storm.md) | Blue-violet, lightning marks, static sparks | pending |
| Stone | [stone.md](./stone.md) | Mineral plates, crystal seams, heavy | pending |
| Frost | [frost.md](./frost.md) | Crystal shell, frost, snowflake fractures, mist | pending |
| Radiant | [radiant.md](./radiant.md) | Ivory/gold, sun-rays, halo, light motes | pending |
| Void | [void.md](./void.md) | Black-violet, light-absorbing, magenta fractures | pending |
| Alloy | [alloy.md](./alloy.md) | Brushed metal, segmented plates, cyan seams | pending |
| Spirit | [spirit.md](./spirit.md) | Semi-translucent, ghostly glow, runes, wispy mist | pending |
| Ancient | [ancient.md](./ancient.md) | Weathered stone, broken gold inlay, old symbols, moss | pending |
| Celestial | [celestial.md](./celestial.md) | Midnight cosmic, stars/nebula, gold constellation lines, orbiting particles | pending |
| Event | [event.md](./event.md) | Configurable theme; never bake date/title into art | pending |

## Per-egg asset checklist

Each class prompt file covers **15 assets**:

1. Full clean egg
2. Idle glowing egg
3. Left wobble
4. Right wobble
5. First crack
6. Second crack
7. Heavy cracks
8. Energy leaking through cracks
9. Shell beginning to separate
10. Bright hatch burst
11. Open shell
12. Empty shell fragments
13. Inventory icon
14. Hatchery-card image
15. Silhouette-reveal background effect

Plus assembled outputs:

- `egg-{class}-hatch-sheet.png` (4096 × 3072)
- `egg-{class}-hatch-atlas.json`

## Status legend

| Status | Meaning |
|--------|---------|
| pending | Prompt written; art not started |
| in-progress | Generation / edits underway |
| review | Awaiting art-direction sign-off |
| approved | Final assets exported and ingested |

## Workflow

1. Generate master full egg at 1536 × 1536
2. Derive hatch frames at 1024 × 1024 maintaining baseline alignment
3. Export icon and hatchery card from approved master
4. Assemble hatch sheet + atlas JSON per [hatching-animation-spec.md](./hatching-animation-spec.md)
5. Run alignment checklist before marking class **approved**
