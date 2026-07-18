# Rise of the Rift — Foundational Set

**Code:** ROTR  
**Cards:** ~735 (data, regenerated from world sources)  
**Heroes:** 12 (of 40 planned)  
**Starter / NPC decks:** 12  
**Keywords:** 14  

## Story hook

After the Fracture, Keepers gather in **Riftwild Commons**. Formal Rift Duels teach that conflict resolves with **Rift Energy**, not blades — while the Living World remains the social hub.

## Riftling coverage

**Every species in `src/content/pets/lore`** has at least:

- 1× `creature` card (`rotr-c-{slug}`, `riftlingSlug` set)
- 1× `companion` stub (`rotr-comp-{slug}`)
- 1× `legendary` evolution stub when lore includes evolved-stage text (`rotr-evo-{slug}`)

Art prefers existing pet thumbs: `/assets/pets/thumbs/{slug}.webp` via `art.assetPath` (prompt retained as fallback).

## Other world assets → cards

| Source | Card types |
|--------|------------|
| Region packs | `location` (`rotr-l-region-*`) |
| Weapon / armor catalogs | `equipment` (`rotr-e-item-*`) |
| Potion / ability catalogs | `spell` (`rotr-s-item-*`) |
| Materials catalog | `relic` (`rotr-r-mat-*`) |
| Game library NPCs / keepers | `hero` (`rotr-h-npc-*`) |
| Stalls, gates, docks, props, weather FX | `location` / `relic` / `equipment` / `weather` |

## Starter decks

Nature, Fire Aggro, Water Healing, Storm Control, Earth Guardian, Crystal Mage, Shadow Corruption, Light Protection, Spirit Combo, Celestial Legends, plus Mira / Kael NPC teaching decks. Decks prefer Riftling creatures of the archetype element.

## Regenerate

```bash
npm run tcg:generate
npm run tcg:validate
```

Generator: `scripts/tcg/generate-foundational-set.mjs`  
Sources helper: `scripts/tcg/content-sources.mjs` (read-only lore/items/regions/library)

## Next content waves

- Remaining heroes → 40  
- 100 NPC battle decks  
- 20 boss decks  
- Expansion sets 2–8 as data shells already listed in `expansions.json`

## Approval checklist

- [ ] Keyword names locked  
- [ ] Curve/balance playtest notes accepted  
- [ ] Hero biographies OK vs About lore  
- [ ] Permit commit of `src/content/tcg/**`  
- [ ] Permit art generation from prompts when `assetPath` is missing (original only)  
