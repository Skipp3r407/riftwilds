# Grok Game Art Direction — Live World

Original Riftwilds IP only. No Pokémon / Zelda / WoW / FF / RuneScape / Genshin / Disney / Marvel / DC / anime-franchise clones.

## Presentation

- **Perspective:** elevated isometric / three-quarter for overworld actors, props, buildings
- **Physics:** axis-aligned arcade tiles (32px) — art sells the iso read; no diamond-tile rewrite
- **Silhouette first:** readable at ~40px display height for NPCs, ~28px for pets
- **Backgrounds:** pure white or solid studio for sprites/props → flood-fill mask to RGBA
- **No baked UI text** on sprites, props, buildings, or minimap icons

## Commons showcase palette

| Role | Notes |
|------|--------|
| Teal/cyan rift energy | Accents, portals, crystals |
| Warm stone + moss | Plaza, monuments, paths |
| Soft painterly grass | Layered terrain variants |
| Leather + teal trim | Keeper / guard outfits |

## Pipeline

1. **Generate** via Cursor `GenerateImage` (Grok) into project `assets/` or `public/assets/game/_sources/`
2. **Review** silhouette, IP originality, perspective match
3. **Mask** `node scripts/assets/mask-npc-black.mjs --all-png <paths>`
4. **Install** `node scripts/assets/install-live-world-showcase-art.mjs` and/or `install-premium-world-art.mjs`
5. **Sheets** `npm run assets:npc-sheets`
6. **Integrate** BootScene keys + `asset-keys.ts` + spawn helpers
7. **Test** Live World Commons — collision, dialogue portraits, minimap

## Actor keys

| Key | Path |
|-----|------|
| Player | `public/assets/game/actors/player-keeper.png` |
| Pet follower | `public/assets/game/actors/pet-riftling.png` |
| Commons NPCs | `public/assets/npcs/riftwild-commons/<slug>/` |

## Honesty

Mark `artStatus: generated` only when portrait + full-body + sprite are real PNGs (>2KB). Catalog generator detects this from disk.
