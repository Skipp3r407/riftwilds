# Riftling Visual Guide

Original companion fauna of Riftwilds. See also [NPC_VISUAL_GUIDELINES.md](./NPC_VISUAL_GUIDELINES.md) for world-kit rules.

## What a Riftling is

- Living creature bonded to Gateway / rift residue.
- Clear animal silhouette + **rift crystal accents** (cyan/teal/amber by region).
- Friendly readability first; menace reserved for wild/enemy variants.

## Hard avoid

- Franchise lookalikes (no “electric rodent”, “fire starter lizard” clones, etc.).
- Anime chibi faces as the default adult companion look.
- Hyper-real fur photography.
- Humanoid mascot suits unless a specific species lore requires it.

## Shape language

| Trait | Guidance |
|-------|----------|
| Silhouette | One read at 36px — ear/horn/tail signature |
| Proportions | Compact body; expressive head; readable feet |
| Crystals | Faceted, translucent, internal glow — growths, not jewelry spam |
| Eyes | Soft glow OK; avoid dead black pits for companions |
| Palette | Regional earth base + one accent family |

## Scale in Live World

- Companion pet display ~**36×36** (Commons premium).
- Ambient Commons Riftlings ~**42px** height.
- Dialogue / Hatchery art may be larger and more detailed.

## Species accent map (examples)

| Affinity / region | Accent |
|-------------------|--------|
| Commons / Grove | Soft cyan + leaf green |
| Ember | Amber / ember crystal |
| Moonwater | Tide blue pearls |
| Storm | Pale electric cyan (sparing) |
| Frost | Ice white + frost cyan |
| Void | Desaturated body + sharp cyan cracks (rare purple OK here only) |

## Kits

Per species / stage under `public/assets/pets/…` (and ambient under `public/assets/npcs/…`):

- Full creature sprite for world
- Portrait / thumb for UI
- Optional overworld sheet when animated

World sprites must be **full creature**, not bust crops.

## Expression pass checklist

1. Silhouette unique vs nearest three species.
2. Accent color ≤ ~15% of pixels.
3. Transparent cutout, no studio plate.
4. Reads as cute/curious or noble — not horror — unless enemy variant.
5. Matches [COLOR_PALETTE](./COLOR_PALETTE.md) earth-first rule.
