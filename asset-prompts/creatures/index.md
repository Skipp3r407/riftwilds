# Riftwilds Creature Prompt Index

All 18 starter Riftlings have complete image-generation prompt files. Asset status reflects prompt readiness only — no raster assets generated yet.

## Summary

| # | Creature | Slug | Affinity | Body Type | Status |
|---|----------|------|----------|-----------|--------|
| 1 | Cindercub | `cindercub` | Ember | Quadruped (feline-like coal cub) | Prompt written |
| 2 | Mossprig | `mossprig` | Grove | Quadruped (cervine-botanical) | Prompt written |
| 3 | Bubbloon | `bubbloon` | Tide | Floating (spherical amphibian in bubble) | Prompt written |
| 4 | Voltkit | `voltkit` | Storm | Quadruped (mustelid dart-runner) | Prompt written |
| 5 | Pebblit | `pebblit` | Stone | Biped (river-rock golem) | Prompt written |
| 6 | Wisplet | `wisplet` | Spirit | Floating (lantern wisp) | Prompt written |
| 7 | Frostuft | `frostuft` | Frost | Quadruped (lagomorph puffball) | Prompt written |
| 8 | Alloyfin | `alloyfin` | Alloy + Tide | Serpentine (ribbon-eel construct) | Prompt written |
| 9 | Sunmote | `sunmote` | Radiant | Floating (celestial disc) | Prompt written |
| 10 | Noxling | `noxling` | Void | Biped (void-mark imp) | Prompt written |
| 11 | Brambleback | `brambleback` | Grove + Stone | Quadruped (armored bark tank) | Prompt written |
| 12 | Zephyroo | `zephyroo` | Storm | Biped (windbound hopper) | Prompt written |
| 13 | Glimmermoth | `glimmermoth` | Spirit + Radiant | Insect (luminous moth) | Prompt written |
| 14 | Magmole | `magmole` | Ember + Stone | Quadruped (obsidian burrower) | Prompt written |
| 15 | Tiderune | `tiderune` | Tide + Spirit | Serpentine (pearl serpent) | Prompt written |
| 16 | Gearling | `gearling` | Alloy | Biped (mech-organic construct) | Prompt written |
| 17 | Bloomble | `bloomble` | Grove | Biped (seedling sprout) | Prompt written |
| 18 | Astralynx | `astralynx` | Void + Radiant | Quadruped (constellation stalker) | Prompt written |

## Body type diversity

| Body Type | Creatures |
|-----------|-----------|
| Quadruped | Cindercub, Mossprig, Voltkit, Frostuft, Brambleback, Magmole, Astralynx |
| Biped | Pebblit, Noxling, Zephyroo, Gearling, Bloomble |
| Floating | Bubbloon, Wisplet, Sunmote |
| Serpentine | Alloyfin, Tiderune |
| Insect | Glimmermoth |

## Required images per creature

Each creature needs **11 raster assets** (prompts ready in individual `.md` files):

| Asset | Dimensions | File pattern |
|-------|------------|--------------|
| Profile artwork | 2048×2048 | `creature-{slug}-profile.png` |
| Battle idle | 512×512 | `creature-{slug}-battle-idle.png` |
| Battle attack | 512×512 | `creature-{slug}-battle-attack-basic.png` |
| Happy care pose | 512×512 | `creature-{slug}-care-happy.png` |
| Sleeping pose | 512×512 | `creature-{slug}-care-sleep.png` |
| Creature icon | 256×256 | `creature-{slug}-icon.png` |
| Overworld walk (down) | 128×128 | `creature-{slug}-overworld-walk-down.png` |
| Overworld walk (up) | 128×128 | `creature-{slug}-overworld-walk-up.png` |
| Overworld walk (left) | 128×128 | `creature-{slug}-overworld-walk-left.png` |
| Overworld walk (right) | 128×128 | `creature-{slug}-overworld-walk-right.png` |
| Silhouette | 512×512 | `creature-{slug}-silhouette.png` |

**Total required images:** 18 creatures × 11 assets = **198 images**

## Creature files

| Creature | Prompt file |
|----------|-------------|
| Cindercub | [cindercub.md](./cindercub.md) |
| Mossprig | [mossprig.md](./mossprig.md) |
| Bubbloon | [bubbloon.md](./bubbloon.md) |
| Voltkit | [voltkit.md](./voltkit.md) |
| Pebblit | [pebblit.md](./pebblit.md) |
| Wisplet | [wisplet.md](./wisplet.md) |
| Frostuft | [frostuft.md](./frostuft.md) |
| Alloyfin | [alloyfin.md](./alloyfin.md) |
| Sunmote | [sunmote.md](./sunmote.md) |
| Noxling | [noxling.md](./noxling.md) |
| Brambleback | [brambleback.md](./brambleback.md) |
| Zephyroo | [zephyroo.md](./zephyroo.md) |
| Glimmermoth | [glimmermoth.md](./glimmermoth.md) |
| Magmole | [magmole.md](./magmole.md) |
| Tiderune | [tiderune.md](./tiderune.md) |
| Gearling | [gearling.md](./gearling.md) |
| Bloomble | [bloomble.md](./bloomble.md) |
| Astralynx | [astralynx.md](./astralynx.md) |

## Shared negative prompt

All creature files include the same negative prompt block:

```
Pokémon, Pikachu, Charizard, Eevee, Digimon, Palworld, Axie Infinity, Neopets, Tamagotchi, Hatchling Eggs, existing video-game monster, copyrighted character, fan art, mascot copy, human face, trainer, Poké Ball, capture ball, logo, text, watermark, signature, border, frame, cropped body, missing limbs, duplicated limbs, extra eyes, extra tail, extra ears, distorted anatomy, fused body parts, inconsistent perspective, low resolution, blurry details, photographic realism, 3D render, plastic toy, clay model, flat clip art, generic stock illustration, messy background.
```

## Style reference

- [Master style guide](../../art-direction/master-style-guide.md)
- [Creature prompt template](../templates/creature-prompt-template.md)
- [Asset naming guide](../../art-direction/asset-naming-guide.md)
