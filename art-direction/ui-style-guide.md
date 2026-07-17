# UI Art Style Guide

## Prefer CSS

Panels, modals, nav, tooltips, leaderboard rows, inventory grids — build with design tokens in `globals.css`. Raster art only for decorative corners, textures, icons, rarity FX.

## Raster UI set

Creature / egg / marketplace cards · quest panels · battle action icons · HP / energy / XP / bond bars (track + fill ends) · rarity frames · modal textures · inventory slots · map frame · dialogue box · toast · profile badges · loading art · nav ornaments  

**Never bake text into PNGs.**

## Rarity visuals

| Tier | Look |
|------|------|
| Common | Soft neutral glow, minimal particles |
| Uncommon | Green-tinted energy, leaf-like motes |
| Rare | Blue crystalline glow, light streaks |
| Epic | Violet aura, star particles |
| Legendary | Gold energy, rays, floating runes |
| Mythic | Iridescent layers, subtle distortion |
| Celestial | Cosmic halo, constellation particles |

Effects must not obscure creature art.

## Affinity icons

Simple silhouette · readable at 24px · distinct without color alone · no letters · masters at 512 with exports 128/64/32/24  

## Mobile / desktop

Bottom game nav · desktop sidebar · safe-area padding · touch targets ≥ 44px · checkerboard preview only in admin tools  
