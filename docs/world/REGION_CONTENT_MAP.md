# Region Content Map

Every Live World region has an authored content pack (`src/content/regions/packs/`) plus a blueprint (`src/game/world-maps/blueprints/`). Commons stays richest; other maps are intentionally distinct starter packs — not empty Commons clones.

Credits only for basic content (never SOL unlocks).

## Coverage

| Region | Pack | Theme snapshot | Signature POIs | Local cast (sample) | Music |
|--------|------|----------------|----------------|---------------------|-------|
| Riftwild Commons | full | Warm lantern plaza, teal rift haze | Keeper Plaza, Hatchery, Portal Circle | Elara, Mira, Bram, Rowan | `music-commons` |
| Ember Crater | full | Ash haze, lava bridges, forge orange | Entrance Camp, Lava Bridges, Molten Forge | Kael, Vessa, Malrec | `music-ember` |
| Moonwater Coast | full | Moonlit fog, wet sand, lighthouse | Coastal Village, Moonlit Beach, Beacon Rock | Luma, Finn, Selene | `music-tide` |
| Elderwood Forest | full | Canopy mist, moss arches, root paths | Grove Camp, Heartwood, Moss Arch | Sylvi, Elden, Fenn | `music-grove` |
| Stormspire Peaks | full | Lightning glare, wind scrub, beacons | Wind Camp, Storm Spire, Wind Trials | Aeron, Volt, Ilya | `music-storm` |
| Stoneheart Canyon | full | Ochre cliffs, quarry dust, fossil shelves | Settlement, Fossil Shelf, Quarry Paths | Doran, Petra, Korr | `music-stone` |
| Frostveil Basin | full | Aurora ribbons, ice bloom, warm lodge | Village, Aurora Cairn, Frozen Lake | Freya, Jori, Varek | `music-frost` |
| Radiant Citadel | full | Gold temple light, healing gardens | Golden Gate, Sun Dial, Healing Gardens | Aurex, Lyra, Cassian | `music-radiant` |
| Void Hollow | full | Violet distortion, null obelisks | Entrance Camp, Null Obelisk, Portal Labyrinth | Neris, Omen, Veya | `music-void` |
| Alloy Ruins | full | Cyan conduits, scrap, gear court | Salvager Settlement, Gear Court, Foundry | Pax, ARI-7, Knox | `music-alloy` |
| Spirit Marsh | full | Lantern mist, reeds, shrine posts | Lantern Village, Memory Lantern, Whispering Bog | Amara, Grey, Sio | `music-spirit` |
| Celestial Rift | full | Starfall shimmer, floating islands | Landing, Star Anchor, Astral Observatory | Caelis, Seraphine, Orion | `music-celestial` |

## Per-region identity checklist

Each pack includes:

- **Theme** — lighting, default weather, vegetation, architecture notes
- **POIs** — ≥2 named landmarks (blueprint decorations + pack entries)
- **NPC spawn ids** — ≥3 ambient / quest cast members
- **Quests / hooks** — region-tagged chain + survey / deep / daily stubs
- **Resources** — biome gather nodes (defs + blueprint spawns)
- **Enemies / danger zones** — biome foes + zone ids
- **Portal identity** — named gateway + arrival note
- **Music / ambiance** — keys aligned with `docs/audio/REGIONAL_SOUND_DESIGN.md`
- **Jobs / events / restoration** — Credit-economy sinks (no SOL)

## Honest backlog

Starter-tier density is intentional. Still open for AAA depth:

- Denser dungeon room loops and scripted boss fights
- Full dialogue trees for every ambient NPC
- Seasonal weather scripted set pieces beyond stubs
- Peer trail content between regions (see `docs/REGION_PROGRESS.md`)

## Source of truth

- Packs: `src/content/regions/`
- Blueprints: `src/game/world-maps/blueprints/region-factory.ts` (+ Commons blueprint)
- Resources / enemies: `src/game/world-maps/defs/`
- Map goals: `src/content/map-goals/regions.ts`
- Validation: `assertRegionPackCoverage` + `tests/unit/region-content-packs.test.ts`
