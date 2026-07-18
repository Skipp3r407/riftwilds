# Style Guide — Riftwilds

Canonical companion to [ART_DIRECTION.md](./ART_DIRECTION.md).

## Medium & resolution

| Asset class | Medium | Typical size | Notes |
|-------------|--------|--------------|-------|
| Terrain tiles | Painterly top-down | 128–256px | Soft edges, warm baked light |
| Props | Cutout illustration | 128–176px | RGBA, bottom-origin in world |
| Building facades | Soft-isometric cutout | ~768px | Height-capped vs NPC scale |
| Overworld actors | Full-body illustration → sheet | 128px frames | 4-frame horizontal sheets |
| Dialogue portraits | Bust illustration | 256–512px | Never used as world sprite |
| UI icons | Stylized metal/wood/ink | 64–128px | Consistent bevel + rim |

## Line & form

- **Silhouette first:** shapes must read at 32–50% scale.
- **Soft contour, not hard ink outlines** (avoid cel-anime linework).
- **Chunky readable forms** over filigree — RuneScape clarity, Ultima weight.
- Cloth and leather: matte painted folds; metal: small specular, not chrome mirrors.

## Perspective language

- **World:** soft top-down / 3/4 isometric hybrid (existing Commons facades).
- **Characters:** front three-quarter standing pose for kits; sheets fake walk via squash.
- **Marketing heroes:** cinematic 3/4 environment OK; still original IP.

## Material vocabulary

| Material | Look |
|----------|------|
| Timber | Warm oak/chestnut, visible grain hints, not photoreal |
| Stone | Sandstone + moss joints; plaza medallions OK |
| Thatch / tile roofs | Warm terracotta or slate — avoid neon |
| Leather | Chocolate / russet; cyan rivets for Keepers |
| Rift crystal | Translucent cyan/teal, internal glow, sharp facets |
| Metal | Bronze/brass gold for UI; iron for tools |

## Costume & culture (Commons)

- Keepers: travel leathers, scarves, pouches — practical explorers, not plate knights.
- Merchants: richer dyes, banners, stall cloth.
- Scholars: ink-stained sleeves, muted blues/greys with amber trim.
- Guards: structured leather + small metal, gold rank accents — not sci-fi armor.
- Ambient Riftlings: compact creature silhouettes with regional crystal accents.

## Site vs Live World

- **Live World** carries densest environmental storytelling.
- **Site chrome** echoes world materials (parchment panels, stone borders, gold hinges) while keeping glass HUD readable over the canvas.
- Do not force neon cyberpunk panels onto fantasy pages.

## Style suffix for generators

Use `RIFTWILDS_STYLE_SUFFIX` in `src/lib/assets/image-provider.ts`. Update that string when this guide changes — do not drift prompts ad hoc.
