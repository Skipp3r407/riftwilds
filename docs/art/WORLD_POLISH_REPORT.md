# World Polish Report — Commons showcase

## Goals met

1. **No floating-head NPCs** in Commons Live World — full-body sheets for all 24 blueprint actors.
2. **Movement** — idle breathe/weight-shift + patrol/work wander for every behavior (including default idle).
3. **Scale** — NPC display heights tuned (humans ~52px, guards ~54, children ~44, Riftlings ~42); player Keeper 50×60; pet 36²; facades bottom-origin Y-sorted with height cap.
4. **Building crops** — Hatchery, Guild, **Market, Arena, Academy, Portal Circle** are masked isometric cutouts (no opaque scenic rectangle).
5. **Terrain / props** — Upgraded soil tiles + commons tileset masters; sharper barrel/crate/sign/crystal/stall/banner/ruin/watchtower props with true RGBA.

## Facade status

| Building | Status |
|----------|--------|
| Hatchery | Cutout |
| Guild | Cutout |
| Market | Cutout (this pass) |
| Arena | Cutout (this pass) |
| Academy | Cutout (this pass) |
| Portal circle | Cutout (this pass) |
| Library / Workshop / Recovery / Homestead | Prior cutouts; OK |

## Scale notes

- Premium buildings use `~1.08×` blueprint width with **max height `1.35×` blueprint** so tall square cutouts do not dwarf NPCs.
- Props use per-key world scales (flowers ~0.36, barrels ~0.38, towers/bridges ~0.55).
- NPC feet sit on tile via origin `(0.5, 1)` + foot-biased physics body.

## Atmosphere (art-direction pass follow-up)

Warm day wash, gold dusk, expanded hearth torches, pond caustic shimmer, denser vegetation scatter, warmer terrain tints — see [ART_DIRECTION_PASS_REPORT.md](./ART_DIRECTION_PASS_REPORT.md) and [LIGHTING_GUIDE.md](./LIGHTING_GUIDE.md).

## Re-run polish install

```bash
npm run assets:install:commons-polish
npm run assets:audit:npc-world
```

## Non-Commons backlog

| Area | Status |
|------|--------|
| Ember Forge / Moonwater / other hubs | Portrait kits exist; world sheets often bust-derived |
| Hand-authored 4-dir walk sheets | Procedural sheets still interim |
| Enemy overworld sprites | Partial (wilds) |
| Remaining legacy `public/assets/terrain/*` masters | Optional; premium path uses `public/assets/game/terrain` |
