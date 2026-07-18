# Icon Consistency Audit — 2026-07-18 art-direction pass

## Method

Spot-check of `public/assets/ui/**`, `public/assets/placeholders/**` (~158 files), and component references (`GameImage` fallbacks, Arena, Credits, Pets tabs).

## Grades

| Grade | Count (est.) | Notes |
|-------|--------------|-------|
| A — illustrated, on-bible | Many Arena / button skins / credits | Keep; re-tint only if purple |
| B — SVG / system + brand stroke | Pets tabs, some nav | Acceptable interim |
| C — placeholder / style clash | Creature SVG fallbacks, some loyalty/economy empties | Regenerate under new `RIFTWILDS_STYLE_SUFFIX` |

## Worst offenders (regenerate next)

1. **`public/assets/placeholders/creature-*.svg`** — used as `GameImage` / battle fallbacks; silhouette language is early tech, not warm fantasy.
2. **Loyalty / treasury empty states** — dashboard-ish; need parchment + bronze frame (`/assets/ui/frames/icon-frame-bronze.png` now available as chrome reference).
3. **Marketplace category icons** — mixed bevel styles; unify metal/wood/ink.
4. **Ability icons with purple glow remnants** — retarget to cyan/amber/ember only.
5. **Mobile nav** — Lucide-only OK for hit targets; custom 24px set later.

## Shipped this pass

- Bronze/sandstone **icon frame** reference: `public/assets/ui/frames/icon-frame-bronze.png`
- UI tokens (`--stroke-bronze`, parchment, warmer glass) so new icons sit on correct chrome

## Do not block Commons showcase

Icons are secondary to world art for this pass. Track completion in [ART_BACKLOG.md](./ART_BACKLOG.md).
