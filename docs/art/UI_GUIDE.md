# UI Guide — Medieval Fantasy Chrome

Tokens: `src/app/globals.css`. Live World HUD: `hud-chrome.tsx`, `.lw-hud-*` classes.

## Dual surface model

Riftwilds UI has two cooperating skins:

1. **Fantasy chrome (default brand)** — parchment, stone, bronze/gold, ink. Used for site panels, dialogue, menus, marketing.
2. **Glass HUD (Live World overlay)** — translucent navy glass so the world stays visible; **warmed** with parchment edge light, bronze borders, cyan/amber brackets — not cold tech-only.

Do not break readability: contrast and hit targets win over ornament.

## Materials

| Element | Treatment |
|---------|-----------|
| Panel fill | Dark ink-navy glass *or* warm parchment gradient |
| Border | Stone/bronze (`--stroke-bronze`) + soft cyan/amber corners |
| Title | Display font, wide tracking, gold or parchment cream |
| Body | Manrope / body font, `--text` or ink brown on light |
| Primary CTA | Cyan → amber gradient (`--grad-cta`) |
| Danger | Coral / danger red — never purple |
| Icons | Beveled metal/wood/ink illustrations; consistent 64–128px |

## Live World HUD rules

- Keep collapse/peek patterns (`CollapsibleHudPanel`) — coordinate with living-population HUD logic; **do not thrash slot layout**.
- Glass alpha high enough to read labels over midday grass and night navy.
- Prefer warm inset highlight over multi-layer neon glow.
- Minimap/clock chips: small metal frames, not floating neon pills clusters.

## Site panels (`.panel`)

Evolve toward:

- Warm scrim (brown-navy) instead of pure cold violet-navy
- Bracket accents remain cyan/amber (brand)
- Optional `panel--parchment` for lore/dialogue dense text

## Icon consistency

| Grade | Meaning |
|-------|---------|
| A | Custom illustrated, matches palette |
| B | Lucide/system icon with brand stroke — OK temporary |
| C | Obvious placeholder / mismatched style — regenerate |

Worst C icons: prioritize Arena, Loyalty, empty-state illustrations, any purple-glow leftovers.

## Motion

See [ANIMATION_GUIDE.md](./ANIMATION_GUIDE.md). UI motion: short fades, soft scale — no bounce spam. Respect `prefers-reduced-motion`.

## Anti-patterns

- Purple glass everywhere
- Dashboard card grids in marketing heroes
- Pill chip rows as decoration
- Emoji as primary iconography
