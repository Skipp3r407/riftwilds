# Content Architecture

Structured data lives under `src/content/*` and `src/lib/credits/*` — not hard-coded into React views.

```
src/content/
  map-goals/          # Region goals + starter recommendations
  regions/packs/      # Per-region quests, activities, sinks
  professions/        # Interdependent professions
  jobs/               # Job board definitions
  events/             # Public events
  goals/              # Daily / weekly goals
  npcs/               # Existing NPC catalog (authored dialogue)

src/lib/credits/      # Authoritative Credits ledger + faucets/sinks
src/game/npc-ai/      # Personality, memory, dialogue (no rewards)
src/lib/content/      # Validation pipeline
```

## UI consumers

| Surface | Data source |
|---------|-------------|
| `/economy/credits` | Config + wallet + MapGoalsPanel |
| Live World "Map goals" toggle | `/api/map-goals?starter=1` |
| `/admin/content` | Packs, jobs, events, rules (read-only) |
| `/admin/economy/credits` | Ledger health snapshot |

## Reward authority

1. Client/AI may **suggest** work.
2. Only `creditCredits` / `debitCredits` (via faucets/sinks helpers or `/api/credits/transact`) mutate balances.
3. `metadata.source === "ai_npc"` is always rejected.
