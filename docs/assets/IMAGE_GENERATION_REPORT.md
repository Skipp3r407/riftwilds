# Riftwilds — Image Generation Report

**Session:** 2026-07-18  
**Authorization:** FULL IMAGE GENERATION (autonomous)  
**Git:** no commit / push / deploy (awaiting explicit approval)

## Verdict

Visual asset pipeline is **scan-clean**: `pending=0`, `generated=546`, `legacy=12`.  
Ambient NPC portrait stubs are gone; OG, terrain masters, tileset, empty states, and missing catalog item icons are filled and wired. Unit asset suites pass (186 tests including new image specs).

## Audit summary (Keep / Optimize / Replace / …)

| Action | Count (approx) | Notes |
|--------|----------------|-------|
| Keep | majority of ~3.2k files under `public/assets` | Named NPCs, worlds, pets, enemies, bosses, premium `game/` pack from terrain agent |
| Optimize | applied this session | 112 NPC kits recompressed (~167MB saved); terrain/OG/empty/map surfaces (~40MB saved) |
| Regenerate | 58 ambient NPC portraits | Were 70-byte stubs → full painted portraits |
| Replace | 65 catalog item icons | Missing weapon/armor/potion/material paths filled (4 painted hero weapons + procedural rest) |
| Missing → closed | OG, terrain BootScene masters, tileset, empty states, world map overview | |
| Leave for later | Dedicated full-body/sprite sheets for ambient NPCs; battle animation sheets; further wallpaper WebP pass | Documented below |

Parallel agents: **did not overwrite** `public/assets/game/**` premium terrain/props/buildings. Map overview PNGs under `public/assets/maps/` coexist with this session’s `world-overview.png`.

## Generated / upgraded this session

### NPCs (58 ambient portraits)
All region ambient casts that were 70-byte stubs now have real `portrait.png` (≥20KB after optimize), plus derived `thumbnail.png`, `sprite.png`, `full-body.png` (portrait-derived until dedicated sheets), and `portrait.webp`.

Regions covered: Commons (14), Ember, Moonwater, Elderwood, Stormspire, Stoneheart, Frostveil, Radiant Citadel, Void Hollow, Alloy Ruins, Spirit Marsh, Celestial Rift.

Ambient Riftlings: `riftling-plaza-emberkit`, `riftling-hatchery-glowpup`, `riftling-market-pouchling`.

### Site / Live World surfaces
| Asset | Path |
|-------|------|
| Open Graph | `/assets/marketing/og-default.png` (+ brand copy) — wired in `src/app/layout.tsx` |
| Terrain masters | `/assets/terrain/terrain-{grass,path,water,lava,cliff,safe,hazard}.png` |
| Tileset | `/assets/tilesets/commons-tileset.png` |
| World map art | `/assets/maps/world-overview.png` |
| Empty states | `/assets/ui/empty-states/{pets,inventory,quests}.png` — wired into `EmptyState` + collection/profile |

### Items
- 65 missing catalog icons created under `weapons|armor|potions|materials/icons/`
- Painted upgrades: ember-spark-claws, tide-fin-blade, spirit-lantern-orb, aurora-focus-prism

## Wiring changes
- `src/lib/assets/asset-manifest.ts` — NPC paths use `/{regionId}/{slug}/portrait.png` (fixes false “missing” scan)
- `src/app/layout.tsx` — `openGraph` / `twitter` images
- `src/components/shared/page-header.tsx` — `EmptyState` optional `imageSrc` / `imageAlt`
- Collection + profile empty pets use empty-state art

## Scripts added
- `scripts/assets/derive-ambient-npc-art.mjs`
- `scripts/assets/optimize-site-surfaces.mjs`
- `scripts/assets/fill-missing-item-icons.mjs`
- `scripts/assets/build-image-asset-manifest.mjs`

## Tests
| File | Role |
|------|------|
| `tests/unit/image-assets.spec.ts` | Manifest + critical surfaces + no NPC stubs |
| `tests/unit/npc-image-consistency.spec.ts` | Catalog portrait contract |
| `tests/unit/riftling-assets.spec.ts` | Pets / ambient Riftlings / affinities |
| `tests/unit/map-assets.spec.ts` | Worlds, terrain, tileset, premium pack |
| `tests/unit/site-visuals.spec.ts` | Wallpapers, OG wiring, empty states |

Run: `npm run test:unit -- tests/unit/image-assets.spec.ts tests/unit/npc-image-consistency.spec.ts …`  
Result this session: **all unit suites green (186)**.

## Performance budget
- Ambient portraits compressed from ~1.4–2.5MB → ~120–350KB each
- Terrain tiles ~2.5MB → ~250KB @ 512px
- OG ~2.3MB → ~339KB @ 1200×675
- Empty states ~1.2MB → ~115–130KB
- Remaining heavy folders (quest art, some wallpapers, affinities) are **Keep/Optimize backlog** — not deleted to avoid breaking parallel work

## Blockers / honest leftovers
1. **Ambient full-body & overworld sheets** — still portrait-derived; Live World prefers `overworld-sheet.png` where BootScene loads Commons slugs.
2. **Most of the 61 procedural item icons** — unique silhouettes, not full painted masters (4 weapons painted). Economy agent can upgrade further.
3. **Battle animation sheets** — still outside this session’s generation budget (scan no longer lists them as pending in current registry).
4. **Wallpaper WebP delivery** — PNG masters remain large; next optimize pass can emit WebP + `srcset` without deleting PNGs.

## Acceptance checklist
- [x] No ambient NPC 70-byte portrait stubs
- [x] `npm run assets:scan` → pending 0
- [x] OG + empty states wired
- [x] BootScene terrain path files present
- [x] Manifest + report under `docs/assets/`
- [x] Unit tests for image / NPC / Riftling / map / site visuals
- [ ] Git commit — **waiting for explicit approval**

## Proposed commit message

```
feat(assets): fill ambient NPC art, terrain, OG, and catalog icons

Replace 58 stub ambient portraits with painted masters, compress NPC kits,
add BootScene terrain/tileset/OG/empty-state art, fill 65 missing item icons,
fix region-scoped asset scan paths, and add image asset unit coverage.
```
