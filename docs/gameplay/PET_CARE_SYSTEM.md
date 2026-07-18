# Pet Care System

Companion care for Riftlings — needs, actions, bond, and recovery. Basic care is **Credits-only** (never SOL).

## Stats (0–100, shown as rounded %)

| Stat | Meaning |
|------|---------|
| Health | Vitality; low → sick / critical |
| Hunger | Food need |
| Thirst | Drink need |
| Happiness | Mood |
| Hygiene | Cleanliness |
| Energy | Stamina (Adventure spends this) |
| Bond | Relationship depth |
| Stress | Tension (high is bad) |

UI bars use color thresholds (critical → great) with smooth width transitions.

## Actions

Free: **Pet**, **Rest**, **Sleep**.  
Energy (not Credits): **Adventure**.  
Credits sinks: Feed, Water, Play, Clean, Brush, Train, Walk, Groom, Cook Meal, Treat, Vet, Exercise, Learn Trick, Meditate, Socialize, Decorate, Heal, Medicine, Recovery, Encourage, …

Each action has credit cost, cooldown, expected deltas, duration label, and Care XP (see `src/game/creatures/care-catalog.ts`).

## Decay

Server-side on pet read/write. Full rate for the first 8 elapsed hours; additional offline hours at 35%. Health damage only after long neglect. Permanent death stays feature-flagged off by default.

## Bond & stress

- High bond: capped discovery bonus (≤12%) and mild train effectiveness.
- High stress: dampens happiness/bond gains (≤15%).
- Need lines (thirsty / hungry / tired…) are rate-limited (~45s client-side).

## Progress

- **Care XP / level** — per successful action
- **Care streak** — calendar days with care; milestones at 7 / 14 / 30 / 90 / 365 → titles, badges, cosmetics (**not** unlimited Credits)
- **Care journal** — timeline of recent actions
- **Pet inventory** — food / medicine / toys / accessories scaffolding with shop & craft hooks

## API

- `GET /api/pets/[publicId]/care` — action previews, catalog, Credits balance
- `POST /api/pets/[publicId]/care` — `{ action, requestId?, catalogItemId? }` → ledger debit then effects

Authoritative path: `performCareAction` in `src/game/creatures/care-service.ts`.

## UI

Pet detail page (`/pets/[publicPetId]`) → `LiveCarePanel` Care tab: meters, action grid with tooltips, inventory, journal, Credits balance, CSS care FX + SFX hooks.
