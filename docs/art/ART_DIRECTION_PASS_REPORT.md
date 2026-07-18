# Art Direction Overhaul — Pass Report

**Date:** 2026-07-18  
**Scope:** Visual only — art bible + theme tokens + Commons Live World showcase + HUD chrome  
**Git:** **No commit / push / merge / deploy** — awaiting approval  

## Verdict

Master art bible is established. Commons atmosphere, terrain tint, vegetation density, water shimmer, HUD/dialogue chrome, and generator prompts now follow a warm Ultima + readable RuneScape + soft Diablo night hybrid with cyan/amber accents. **This is not “every asset in the game”** — see [ART_BACKLOG.md](./ART_BACKLOG.md).

## Acceptance checklist

| Criterion | Status |
|-----------|--------|
| Written art bible for future agents | ✅ 8 master docs + backlog + icon audit |
| Visible Commons / UI shift | ✅ atmosphere, props, tints, HUD, dialogue, loading |
| No copyrighted clones | ✅ original prompts; franchise names banned in suffix |
| Performance notes | ✅ docs + particle/torch budgets preserved |
| Full report + proposed commit | ✅ this file |

## What changed

### 1. Master art docs (`docs/art/`)

- `ART_DIRECTION.md` — north star, pillars, anti-patterns  
- `STYLE_GUIDE.md` — medium, materials, costume  
- `COLOR_PALETTE.md` — earth-first + accent map  
- `LIGHTING_GUIDE.md` — day/night/weather recipe  
- `ENVIRONMENT_GUIDE.md` — Commons terrain/vegetation/buildings  
- `RIFTLING_GUIDE.md` — creature IP rules  
- `UI_GUIDE.md` — parchment/stone/metal + glass HUD  
- `ANIMATION_GUIDE.md` — motion intent (extends ANIMATION_STANDARDS)  
- `ART_BACKLOG.md` — honest remaining work  
- `ICON_AUDIT.md` — worst placeholders  
- `commons-mood.png` + `public/assets/art/direction/commons-mood.png` — Grok moodboard  

### 2. Theme tokens & site chrome

- `src/app/globals.css` — warmer `--bg-*`, bronze stroke, parchment panel, grove/leather, body gradients, `.panel--parchment`, `.lw-hud-glass`, footer  
- `src/lib/assets/image-provider.ts` — `RIFTWILDS_STYLE_SUFFIX` rewritten to bible  

### 3. Commons Live World

- `atmosphere.ts` — warmer day wash, gold dusk, more hearth torches (guild gold not purple), water caustic ellipses, firefly tints  
- `layered-terrain.ts` — warm meadow tint, warmer cliff faces, stronger path wash  
- `premium-logic.ts` — denser forest/market/residential prop rings + path trees; lusher grass bias  
- `public/assets/game/props/tree-small.png` — regenerated cutout  

### 4. HUD / UI (layout preserved)

- `hud-chrome.tsx` — bronze borders, warm fills (collapse slots untouched)  
- `dialogue-overlay.tsx` — warm fantasy glass  
- `loading-screen.tsx` — grove→cyan→amber bar  

### 5. Generated assets (Grok)

- Commons moodboard  
- Tree prop v2 (installed)  
- Bronze icon frame (installed under `public/assets/ui/frames/`)  

## Performance notes

- Prop count increased (still deterministic scatter; no per-frame spawn).  
- Torch spots ~12 ADD circles with existing pulse — OK for desktop hub; immersive particle density still gates emitters.  
- Water shimmer = 3 ellipses + tweens (not per-tile UV).  
- Terrain remains tiled images + light elevation faces.  
- Future: camera-distance prop LOD, atlas packing (see backlog).  

## Tests run

```bash
npx vitest run tests/unit/live-world-premium.test.ts
# 6/6 passed
```

## Honest backlog (not done)

- Hand-authored 4-dir walk sheets for named Commons NPCs  
- Full icon grade-A set  
- Non-Commons hub premium terrain  
- Enterable interior art  
- Whole-catalog species / VFX polish  

## Proposed commit (do not run until approved)

```
docs(art): establish Riftwilds art bible and warm Commons showcase

Codify Ultima/RuneScape/Diablo/Zelda hybrid direction, shift CSS and
Live World atmosphere toward earth-first fantasy with cyan/amber accents.
```

### Suggested staged paths

```
docs/art/**
src/app/globals.css
src/lib/assets/image-provider.ts
src/game/live-world/systems/premium/atmosphere.ts
src/game/live-world/systems/premium/layered-terrain.ts
src/game/live-world/systems/premium/premium-logic.ts
src/components/live-world/hud-chrome.tsx
src/components/live-world/dialogue-overlay.tsx
src/components/live-world/loading-screen.tsx
public/assets/game/props/tree-small.png
public/assets/game/_sources/prop-tree-small-v2.png
public/assets/ui/frames/icon-frame-bronze.png
public/assets/art/direction/commons-mood.png
```

Avoid staging `.next/**` and unrelated env noise.
