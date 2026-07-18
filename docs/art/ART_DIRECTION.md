# Riftwilds Art Direction — Master Bible

> **Authority:** This document is the source of truth for all visual work.  
> Companion guides: [STYLE_GUIDE](./STYLE_GUIDE.md) · [COLOR_PALETTE](./COLOR_PALETTE.md) · [LIGHTING_GUIDE](./LIGHTING_GUIDE.md) · [ENVIRONMENT_GUIDE](./ENVIRONMENT_GUIDE.md) · [RIFTLING_GUIDE](./RIFTLING_GUIDE.md) · [UI_GUIDE](./UI_GUIDE.md) · [ANIMATION_GUIDE](./ANIMATION_GUIDE.md) · [LIVING_TOWNS](./LIVING_TOWNS.md) · [ASSET_PIPELINE_2D3D](./ASSET_PIPELINE_2D3D.md)  
> Living audit: [ASSET_AUDIT](./ASSET_AUDIT.md) · [ART_BACKLOG](./ART_BACKLOG.md)

## Reference mood

Commons target look (Grok concept, original IP): `commons-mood.png` in this folder and `/assets/art/direction/commons-mood.png`.

## North star

Riftwilds is a **browser MMORPG** with a hybrid classic-fantasy identity:

| Influence (feel only — never copy assets) | Weight | What we take |
|-------------------------------------------|--------|--------------|
| Ultima Online–era medieval atmosphere | ~60% | Settled earth, timber & stone towns, lived-in clutter, warm day cycle |
| Classic RuneScape readability | ~30% | Clear silhouettes, saturated local color, distinct districts at a glance |
| Diablo-like lighting drama | ~10% | Torch bloom at night, rim light, deep shadows in interiors/ruins |
| Zelda-like clarity | support | Interaction affordances, readable water/paths, friendly creature shape language |

**Modernize for browser:** painterly 2D / soft-isometric sprites, not hyper-real 3D, not pixel art, not voxel, not anime, not generic asset-store PBR.

## Original IP — hard rules

1. **Never** copy, trace, or prompt for copyrighted characters, logos, UI chrome, or map layouts from other games.
2. Prompts may describe *feel* (“readable medieval town hub”, “warm torchlit night”) — **never** franchise names in generation prompts.
3. Riftlings are **original companion fauna** — crystal-rift biology, not mascot clones of other creature IPs.
4. Architecture is **Riftwild Commons vernacular**: timber + stone + cyan rift accents, not franchise landmark pastiche.

## Visual pillars

1. **Warm earth first** — greens, browns, sandstone, moss, gold leaf. Cyan + amber are *accents* (rift energy + hearth), not the whole UI.
2. **Lived-in world** — barrels, stalls, lanterns, path wear, vegetation density. Empty plazas fail the Ultima test.
3. **Readable at game scale** — actors ~40–54px tall in Commons; silhouette > micro-detail.
4. **Atmosphere without mud** — night is cool navy + warm torch pools; day is golden-green, not grey fog soup.
5. **Performance-aware beauty** — LOD, particle budgets, streaming stubs; polish Commons first as the showcase.

## Surface hierarchy

| Surface | Role | Art bar |
|---------|------|---------|
| **Commons Live World** | Primary showcase | Premium terrain, cutout buildings, dense props, full-body NPCs, day/night/weather |
| Marketing / About / Hatchery site | Brand immersion | Same palette tokens; parchment/stone chrome; hero art follows pillars |
| Other hubs (Ember, Moonwater, …) | Expand later | Same bible; assets may still be interim |
| Combat / Arena UI | Clarity first | Same accents; avoid purple glow clutter |

## Generation prompt contract

Every image job must end with (or include) the shared suffix from `src/lib/assets/image-provider.ts` (`RIFTWILDS_STYLE_SUFFIX`), which encodes this bible. Additional rules:

- Full-body world actors: feet visible, clean silhouette, transparent or pure studio plate for masking.
- Terrain: top-down orthographic, tileable, painterly, warm greens/browns.
- Buildings: isometric cutout facade, no opaque scenic rectangle, door readable at distance.
- No text, watermarks, UI frames, or third-party logos in source art.

## Anti-patterns (reject / regenerate)

- Purple-on-black “AI fantasy” default
- Flat cream + terracotta “AI landing page” look
- Hyper-real skin pores / Unreal Engine screenshot aesthetic
- Anime eyes / chibi proportions for Keepers or Riftlings (except intentional child NPCs)
- Floating busts as overworld sprites
- Opaque photo plates behind buildings/props
- Empty grass deserts with no clutter

## Performance notes (standing)

- Commons prop scatter is deterministic; prefer more *variety* over unbounded particle counts.
- Atmosphere particles respect immersive settings density.
- Terrain is tiled images + light elevation faces — no runtime mesh generation.
- Non-Commons regions may use fallback terrain until premium packs ship (streaming stub pattern).
- Living Towns depth bands + occluder fade: see [LIVING_TOWNS](./LIVING_TOWNS.md); keep canopy counts district-anchored.

## Living Towns (urban design)

Commons is the **city-builder showcase**: districts, walls/gates, road→plaza hubs, alleys, and 2.5D occlusion — not a field of random buildings. Extend the warm Ultima/RS hybrid; do not invent a purple theme.

## Success criteria for art passes

A pass is “done enough” when:

1. Docs in this folder match what players see in Commons + primary UI chrome.
2. A screenshot of Commons reads as **warm medieval hub with rift accents**, not tech dashboard over grass.
3. Named Commons NPCs pass floating-head audit (`npm run assets:audit:npc-world`).
4. Backlog honestly lists what remains — do not claim whole-game art completion.
