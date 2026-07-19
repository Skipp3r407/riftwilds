# Hatchery Economy

> Free-to-play first. Wallet / SOL / `$RIFT` never required to claim, incubate, or hatch.

## Core loop

1. **Starter Egg** — every new keeper gets one account-bound Common Rift Egg (guaranteed).
2. **Incubate** — demo timer ~30s (or skip in demo); production timers per egg type.
3. **Hatch** — server-side rarity + species roll; cinematic reveal hooks.
4. **Companion ↔ card** — hatched species grants a matching binder card when catalogued; Codex family hint.
5. **Earn more eggs** — quests, bosses, login, guild, battle pass (free track), exploration, events, achievements.
6. **Optional Credits egg** — soft sink after starter claimed (never SOL).

## Egg types

Catalog: `src/game/eggs/egg-types.ts`  
Earn paths: `src/game/eggs/earn-paths.ts`  
Supply caps (design): `src/lib/economy/egg-supply.ts`

## Anti-P2W

- No paid gacha (`PAID_RANDOM_REWARDS_ENABLED: false`).
- No wallet gate on hatchery APIs.
- Token holder perks = cosmetics only (`docs/economy/TOKEN_COSMETIC_PERKS.md`).
- Never promise guaranteed earnings from eggs or hatches.

## APIs

| Route | Role |
|-------|------|
| `GET /api/hatchery/eggs` | List eggs/pets + F2P messaging |
| `POST /api/hatchery/claim` | Free starter |
| `POST /api/hatchery/purchase` | Credits premium egg |
| `POST /api/hatchery/hatch` | Hatch + companion card grant |
| `POST /api/hatchery/earn` | Gameplay egg grants |
| `GET /api/onboarding/starter` | First-login package |

## Preview

- Hatchery: `http://localhost:3000/hatchery`
- Starter package API: `http://localhost:3000/api/onboarding/starter`
- Play hub: `http://localhost:3000/play`
