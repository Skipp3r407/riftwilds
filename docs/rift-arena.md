# Rift Arena

Skill-based card competition hub. **Default experience = free play.** SOL Arena is a clearly separate optional mode and stays feature-flagged **OFF**.

## Principles

- Skill determines the winner — no gambling, slots, roulette, or SOL loot boxes
- No pay-to-win competitive power
- Fully playable without SOL / wallet
- Never promise guaranteed earnings
- Participation is optional

## Surfaces

| Surface | Path | Status |
|---------|------|--------|
| Hub | `/arena` | Live (browse, CTAs, scaffolds) |
| Practice / AI | `/tcg/battle` | Live |
| Private invite | `/tcg/battle?invite=CODE` | Live (same-process local) |
| Free matchmaking | Hub queue → private lobby | Live local stub |
| Ranked ladder | `/arena/ranked` + API | Scaffold |
| Spectate | `/arena/spectate` | Stub |
| Legacy pet Arena | `/arena/training` | Secondary |

## Match types

`FREE` · `TRAINING` · `PRIVATE` · `FRIEND` · `RANKED` · `GUILD` · `TOURNAMENT` · `CUSTOM`

See `src/game/rift-arena/types.ts`.

## Flags

- `RIFT_ARENA_HUB_ENABLED` — default **true**
- `RIFT_ARENA_FREE_MATCHMAKING_ENABLED` — default **true**
- `RIFT_ARENA_RANKED_SCAFFOLD_ENABLED` — default **true**
- `RIFT_ARENA_SOL_STAKES_ENABLED` — default **false**
- `RIFT_ARENA_SOL_ESCROW_ENABLED` — default **false**
- `REAL_VALUE_WAGERING_ENABLED` — hard **false** (`src/lib/config/arena.ts`)

## Related docs

- `docs/arena-economy.md`
- `docs/escrow.md`
- `docs/tournaments.md`
- `docs/security.md` (Arena section)
- `docs/replays.md`
- `docs/esports.md`
- `docs/api.md` (Rift Arena APIs)
