# Grok Generation Report — NPC Art

**Date:** 2026-07-17  
**Model / tool:** Cursor GenerateImage (Grok-family image generation)  
**Style brief:** Premium fantasy adventure, stylized detailed, strong silhouettes, navy/cyan/amber Riftwilds cohesion, original IP only, no text/watermarks/logos.

## Summary

| Status | Count |
|--------|------:|
| Named portraits generated & installed | 54 / 54 |
| Dedicated full-body generations | 3 (Elara, Rowan, Mira) |
| Rejected / regenerated | 0 (first-pass accepted for playability) |
| External blockers | None |

## Prompts used

Each named NPC used a Grok-style brief of the form:

> `{Name} portrait bust, {visual traits}, {clothing}, {expression}, {regional palette} Riftwilds fantasy, premium stylized detailed fantasy adventure, no text no watermark`

Full structured character data (biography, clothing, accessories, dialogue, quests) lives in:

- `scripts/npcs/generate-npc-catalog.mjs` (authoring)
- `src/content/npcs/catalog.generated.ts` (runtime)
- Per-NPC `imagePrompts` fields + `public/assets/npcs/{region}/{slug}/metadata.json`

## Install pipeline

```bash
node scripts/npcs/generate-placeholders.mjs   # ambient stubs
# GenerateImage tool → ~/.cursor/.../assets/{slug}-portrait.png
node scripts/npcs/install-generated-portraits.mjs
```

Portrait files are also copied to `thumbnail.png`, `sprite.png`, and `full-body.png` when dedicated variants are missing so the engine never hits empty paths.

## Images generated (named cast)

Commons: elara-venn, rowan-vale, mira-shellbright, bram-ironroot, tessa-windmere, archivist-solen, captain-orren, nyla-brook, pip-gearwhistle, rook-emberfall  

Ember: kael-ashwalker, forgekeeper-vessa, cinder-sage-malrec, warden-pyra  

Coast: luma-tidecrest, finn-coralhand, oracle-selene, marina-drift  

Elderwood: warden-sylvi, mosskeeper-elden, fenn-quickbranch, grandmother-willowmere  

Stormspire: aeron-cloudstep, engineer-volt, skywarden-ilya, hermit-thane  

Stoneheart: doran-flint, petra-stoneveil, marshal-korr, gemwright-opal  

Frostveil: freya-snowmark, jori-icebloom, hunter-varek, aurora-linn  

Radiant: chancellor-aurex, scholar-lyra, sentinel-cassian, curator-verin  

Void: shadecaller-neris, watcher-omen, veya-dusk, keeper-null  

Alloy: tinker-pax, unit-ari-7, salvager-knox, professor-ferrum  

Spirit: medium-amara, ferryman-grey, lantern-keeper-sio, echo-child-nimi  

Celestial: astronomer-caelis, guardian-seraphine, starforger-orion, nameless-witness  

## Final asset status

**PLAYABLE for portraits:** every named NPC has a real generated portrait in `public/assets/npcs/`.  
**Follow-up:** dedicated transparent full-body + walk-cycle sprite sheets per NPC (portrait stand-ins currently fill those slots).
