# Riftwilds Story Bible

Master index for narrative design. **Canon source of truth for About-page origin:** `src/content/about/riftwilds-origin.ts`. This bible **expands and unifies** — it does not overwrite quest keys, NPC IDs, region packs, or gameplay systems.

---

## Audit constraints (do not break)

| Constraint | Source | Rule |
|---|---|---|
| World name **Aeryndra** → fractured **Riftwilds** | About chapters | Keep; expand continents beneath regions |
| **Gateway Hearts**, **Prime Gateway**, living cores | About | Hearts = living network; Stones = playable fast-travel remnants |
| **Fracture** via Great Activation overload | About | Coalition of rulers/engineers/scholars; not a single cartoon villain |
| **Riftlings** = living archives from fragments + bond + eggs | About + pet lore | Not weapons-first; battle is later survival culture |
| **Elara Venn** = First Keeper (courier) + in-game Founder Historian | About + `commons.ts` | Same person; still present in Commons |
| **Commons Riftstone** from Prime Gateway fragment | About | Central mystery; maps of unfound places |
| **Present Awakening** / Celestial call | About Ch. VII | Main campaign endgame hook |
| 12 Live World regions + affinities | Region packs / birth vignettes | Regional stories must match themes/NPCs |
| Starter chain `starter-q1`…`q8` | `starter-quests.ts` | Names/keys immutable; campaign wraps around them |
| Seed quests Sproutfall / Cindercrag | `quest-catalog.ts` | Soft conflict → sub-locales (see below) |
| Pet lore eras **First Fractures**, **Hatchery Compact** | Species lore files | Fold into Ages |
| Reputation axes / role factions | `npc-ai/` | Narrative factions map onto these hooks |
| Story arc `first_rift_light` | `sample-branching.ts` | Keep; **Celestora** = scholarly tradition, not world rename |
| Original IP only | Project rules | No copying named IPs; spirit-depth only |

### Soft conflicts → expansion resolutions

1. **Sproutfall Grove / Cindercrag Basin** — Treated as named sub-locales: Sproutfall = Elderwood fringe trail used in early seed tutorials; Cindercrag = Ember Crater outer basin. Quest keys unchanged.
2. **Elara “first years after Fracture” vs present play** — Bond with the First Riftling slowed her aging (Spirit/Celestial bleed). She is living memory, not a statue.
3. **Gateway Heart vs Gateway Stone vs Riftstone** — Hearts = original living cores; Stones = stabilized shards for travel (`docs/GATEWAY_NETWORK.md`); Riftstone = Commons hub shard of the Prime.
4. **“Celestora”** in sample arcs — Pre-Fracture Radiant–Celestial research school / manuscript tradition. Not a second planet name.
5. **NPC faction strings** (`commons-keepers`) vs social `FACTION_VALUES` — Narrative factions below; gameplay IDs stay as authored.

---

## Document map

| Doc | Contents |
|---|---|
| [CREATION_MYTH.md](./CREATION_MYTH.md) | Before people, Hearts, First Song |
| [AGES_OF_AERYNDRA.md](./AGES_OF_AERYNDRA.md) | Named ages + Hatchery Compact |
| [WORLD_HISTORY.md](./WORLD_HISTORY.md) | Continents, kingdoms, Fracture politics |
| [TIMELINE.md](./TIMELINE.md) | Chronology aligning About + campaign |
| [MAIN_CAMPAIGN.md](./MAIN_CAMPAIGN.md) | Act structure, post-game, expansion hooks |
| [VILLAINS.md](./VILLAINS.md) | Antagonists with moral complexity |
| [RIFTLING_LORE.md](./RIFTLING_LORE.md) | Affinity, eggs, evolution, etiquette |
| [REGIONAL_LORE.md](./REGIONAL_LORE.md) | All 12 regions + sub-locales |
| [NPC_BIOGRAPHIES.md](./NPC_BIOGRAPHIES.md) | Cal Reed, Mira, Elara, regional leads |
| [FACTIONS.md](./FACTIONS.md) | Ranks, reputation hooks |
| [WORLD_EVENTS.md](./WORLD_EVENTS.md) | Seasonal / rift / restoration narratives |
| [BOOKS_AND_LORE.md](./BOOKS_AND_LORE.md) | Collectible catalog + first-wave texts |
| [CUTSCENES.md](./CUTSCENES.md) | Cinematic designs |
| [FUTURE_EXPANSIONS.md](./FUTURE_EXPANSIONS.md) | Foreshadowing without spoiling shipped About |

### Art assets (story)

| Path | Use |
|---|---|
| `public/assets/story/` | Timeline, faction banners, loading art |
| `public/assets/about/` | Existing About cinematic masters (do not overwrite without approval) |

### Light code integration (additive only)

| Surface | Path |
|---|---|
| Codex world entries | `src/content/codex/world-lore.ts` |
| Academy lore lessons | `src/game/academy/lessons/lore-path.ts` |
| This index | Linked from Academy / docs when wired |

---

## Slogan (canon)

> Riftlings preserve pieces of the world. Riftkeepers give those pieces a future.

---

## Delivery report

See [AUDIT_AND_DELIVERY.md](./AUDIT_AND_DELIVERY.md) for audit constraints, soft-conflict resolutions, art paths, and approval asks.

## Approval gate

Story bible is presented for review. **Do not commit / push / merge / deploy** until explicitly approved. Quest IDs, dialogue keys, and region packs remain untouched unless additive patches are separately approved.
