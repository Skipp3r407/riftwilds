# Riftwilds Pet Lore & Biographies

Original-IP species lore and deterministic personal backstories for every launch Riftling.

## Layers

1. **Species lore** — shared encyclopedia text for a species (authored content).
2. **Personal biography** — unique story assembled at hatch from seed + templates (never LLM on page load).

## Content locations

| Path | Purpose |
|------|---------|
| `src/content/pets/lore/{slug}.ts` | Full species lore for each of 50 launch species |
| `src/content/pets/lore/index.ts` | Lookup helpers |
| `src/content/pets/backstories/*` | Template libraries (origins, memories, habits, …) |
| `src/lib/pets/lore-types.ts` | Zod schemas + types |
| `src/lib/pets/backstory-generator.ts` | Deterministic generator |
| `src/lib/pets/seed-rng.ts` | Seeded PRNG |

Regenerate species lore files:

```bash
npx tsx scripts/pets/generate-species-lore.ts
```

## Word targets

| Field | Target |
|-------|--------|
| Short bio | 40–70 words |
| Standard bio | 150–250 words |
| Full lore | 500–900 words (soft floor ~450) |

## Hatch wiring

When `PET_LORE_ENABLED` is on, `hatchEgg` in `src/game/eggs/hatchery-store.ts`:

- Calls `generatePetBiography(...)`
- Stores `pet.biography` + `biographyVersion`
- Attaches first-memory narrative onto the hatch memory

Biographies are **not** regenerated on page load. Version bumps are required for intentional regenerations (admin/dev only).

### Origin safety

- `eggOriginSource: "BREEDING"` only selects templates tagged `bred`
- Wild / starter / shop / event sources never invent parents
- Family history paragraph is bred-only

## Routes

| Route | Role |
|-------|------|
| `/codex/riftlings` | Public species index |
| `/codex/riftlings/[speciesSlug]` | Full lore + kit |
| `/pets/[publicPetId]` | Care UI + biography tabs |
| `/admin/pets/lore` | Completeness / word-count table |
| `GET /api/lore/species/[slug]` | Species lore JSON |
| `GET /api/pets/[publicId]` | Pet + biography + unlocked lore preview |

## Marketplace

Pet listings may include:

- `shortBio` (species)
- `personalBioPreview` / `originStory` / `uniqueHabit` (personal)

Seller notes must stay separate from verified generated history.

## Validation & reports

```bash
npm run validate:pet-lore
npm run generate:pet-biographies
npm run report:pet-lore
```

Artifacts land in `artifacts/reports/pet-lore/`.

## Feature flag

`PET_LORE_ENABLED` (default `true`) in `src/lib/config/feature-flags.ts`.

## Personal quests

`personalQuestHooks` on each biography are data-ready stubs for a future quest board. They must not contradict origin (especially bred vs wild).
