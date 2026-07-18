# Living World Admin

## UI

`/admin/living-world` — caps, flags, featured keepers, hub list, popular locations.

## Procedures

1. Review risk-restricted accounts (temporary social reward pauses)
2. Tune caps via config (`PRESENCE_XP_*`, `COMMUNITY_TOKENS_*`)
3. Disable features with flags without redeploying content
4. Do **not** apply Prisma migration `20260718080000_living_server_population` until approved

## Analytics events

`presence_xp_award`, `presence_afk_block`, `presence_idle_claim`, `presence_featured_award`, `presence_daily_task_claim`, `presence_performance_start`, …

## Alerts (ops backlog)

Spike in AFK blocks · token grant anomalies · reciprocal cluster score spikes
