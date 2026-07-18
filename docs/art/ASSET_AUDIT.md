# Visual Asset Audit — 2026-07-18 pass

## Scope

Commons Live World showcase first (NPCs, facades, actor bob). Broader catalog documented as backlog.

## Floating heads (priority 1) — FIXED for Commons

**Root cause:** `derive-ambient-npc-art.mjs` + install fallbacks wrote portrait crops into `sprite.png` / `full-body.png`; `build-npc-overworld-sheets.mjs` then animated those busts → “Hatcher” floating head in world.

**Fix this pass:**

- Generated dedicated full-body kits for all **10 named Commons NPCs**
- Installed via `scripts/assets/install-commons-named-fullbodies.mjs`
- Sheet builder now **prefers full-body** and **rejects bust metrics**
- Derive script **preserves** `spriteDistinct` / `fullBodyDistinct` kits
- QC: `npm run assets:audit:npc-world` → **0/24 floating-head risk**
- Test: `tests/unit/npc-overworld-fullbody.test.ts`

## Replaced this pass

| Asset | Action |
|-------|--------|
| Named Commons 10 × full-body + sprite + overworld-sheet | Regenerated + masked |
| Hatchery / Guild facades | Cutout isometric |
| Market / Arena / Academy / Portal facades | Cutout isometric (visual polish pass) |
| Terrain soil + commons tileset | Sharper masters + variants |
| Props (barrel, crate, sign, crystal, stall, banner, ruin, watchtower) | Resliced + RGBA mask |
| Ambient Commons sheets | Rebuilt (lanczos + sharpen) |

## Still good / kept

- Ambient human full-bodies (Cal, Reo, Mim, Jot, Ana, Kel, Uma, Sip, guards)
- Ambient Riftlings (Glowpup, Emberkit, Pouchling) — full creatures; squat aspect is expected
- Dialogue portraits for named cast (restored after accidental mask; busts OK in dialogue only)

## Broader backlog

| Area | Status | Notes |
|------|--------|-------|
| Non-Commons named NPCs (Ember/Moonwater/…) | Portrait kits exist; world sheets often bust-derived | Expand when those hubs go premium |
| Hand-authored 4-dir walk sheets | Not started | Procedural sheets are interim |
| Remaining building facades outside Commons | Mixed | Commons market/arena/academy/portal cutouts done |
| Terrain / tileset polish | Commons upgraded this pass | Reuse `assets:install:commons-polish` pipeline for other regions |
| Enemy overworld sprites | Partial | Wilds zones |
| UI icons / emotes | Mostly present | Spot-check only |
| Player/pet multi-frame sheets | Static PNG + runtime breath | Optional atlas later |

## Commands

```bash
npm run assets:audit:npc-world
npm run assets:install:named-fullbodies
npm run assets:npc-sheets
npx vitest run tests/unit/npc-overworld-fullbody.test.ts
```