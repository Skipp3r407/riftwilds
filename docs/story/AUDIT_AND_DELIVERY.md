# Story Bible — Audit Constraints & Delivery Report

**Status:** Complete for review. **No commit / push / merge / deploy** performed.

---

## 1. Audit summary (existing canon)

| Area | What exists | Constraint |
|---|---|---|
| About origin | `src/content/about/riftwilds-origin.ts` | Single SoT for cinematic chapters, Elara, Fracture, Soft Exodus, Commons, Call |
| Regions | 12 Live World packs | Themes/NPCs/events must match; no overwrite |
| Starter quests | `starter-q1`…`q8` | Keys/names/objectives immutable |
| Seed story quests | Sproutfall / Cindercrag | Soft conflict → sub-locales |
| Pet lore | 50 species + eras | Expand; fold eras into Ages |
| NPCs | Commons + regional named casts | Bios match roles; Elara = First Keeper + historian |
| Reputation | Multi-axis + role factions | Narrative factions map onto hooks |
| Gateway Network | Stones per region | Hearts ≠ Stones ≠ Riftstone (terminology clarified) |
| Story engine | `first_rift_light` | Keep; Celestora = scholarly tradition |
| Decade plan | Expansion registries | Foreshadow only |

---

## 2. Soft conflicts resolved (by expansion)

1. **Sproutfall / Cindercrag** → Elderwood fringe / Ember outer basin.  
2. **Elara longevity** → First Riftling bond-bleed; still present in Commons.  
3. **Heart / Stone / Riftstone** → living cores / travel shards / Commons Prime fragment.  
4. **Celestora** → Radiant–Celestial manuscript school, not world rename.  
5. **Battle culture** → later survival/training; origin remains preservation.

---

## 3. Deliverables checklist

| # | Deliverable | Path |
|---|---|---|
| — | Master index | `docs/story/STORY_BIBLE.md` |
| 1 | World structure | `WORLD_HISTORY.md` |
| 2 | Creation myth | `CREATION_MYTH.md` |
| 3 | Ages | `AGES_OF_AERYNDRA.md` |
| 4 | Main campaign | `MAIN_CAMPAIGN.md` |
| 5 | Villains | `VILLAINS.md` |
| 6 | Riftling lore | `RIFTLING_LORE.md` |
| 7 | Regional stories | `REGIONAL_LORE.md` |
| 8 | NPC biographies | `NPC_BIOGRAPHIES.md` |
| 9 | Factions | `FACTIONS.md` |
| 10–11 | Moral frameworks + world events | `FACTIONS.md` + `WORLD_EVENTS.md` |
| 12 | Books catalog | `BOOKS_AND_LORE.md` (~526 planned; 16 full first-wave) |
| 13 | Cutscenes | `CUTSCENES.md` |
| 14 | Future expansions | `FUTURE_EXPANSIONS.md` |
| 15 | Timeline | `TIMELINE.md` |

### Light integration (additive)

| Surface | Path |
|---|---|
| Academy lore lessons | `src/game/academy/lessons/lore-path.ts` (wired into catalog) |
| Codex world entries | `src/content/codex/world-lore.ts` |
| World Codex page | `/codex/world` → `src/app/(marketing)/codex/world/page.tsx` |

**Not touched:** quest IDs, starter dialogue keys, region pack quest lists, About chapter bodies (expanded only via docs + Academy/Codex).

### Art generated

| Asset | Public path |
|---|---|
| Age of Gateways | `public/assets/story/timeline/age-of-gateways.png` |
| Present Awakening | `public/assets/story/timeline/present-awakening.png` |
| Commons Keepers banner | `public/assets/story/factions/banner-commons-keepers.png` |
| Hatchery Compact banner | `public/assets/story/factions/banner-hatchery-compact.png` |
| Ember loading | `public/assets/story/cinematics/loading-ember-crater.png` |
| Fracture loading | `public/assets/story/cinematics/fracture-loading.png` |

---

## 4. Approval asks

1. Approve story bible as canon expansion of About.  
2. Approve shipping `/codex/world` + Academy lore lessons as-is.  
3. Decide whether campaign Act quests (`awakening-main` chain) may be implemented next (additive keys only).  
4. Optional: generate remaining RR-* book stubs via script; more faction banners / loading art per region.

---

## 5. Consistency validation notes

- About slogan preserved.  
- Eleven affinities match birth vignettes.  
- Twelve regions covered in `REGIONAL_LORE.md`.  
- Villains do not make Void/Ember “evil affinities.”  
- Mira / Rowan / Bram / Solen / Orren / Pip / Cal Reed roles match content files.  
- Ending forks keep Celestial call ambiguous until player choice (About Ch. VII).
