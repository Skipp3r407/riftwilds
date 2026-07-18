# World Expansion Admin

## UI

`/admin/world-expansion` — maps, templates, jobs, audit.

## API actions (`POST /api/world-expansion`)

| Action | Purpose |
|--------|---------|
| approve | Open after validation |
| pause / resume | Traffic control |
| force_generate | Admin-planned map |
| retry | Failed job |
| archive | Begin / complete consolidation |
| rename | Public name |
| tick | Run capacity orchestrator |
| admin_snapshot / audit | Ops view |

## Procedures

1. Review `PENDING_REVIEW` maps before open.  
2. Prefer overflow for festival spikes.  
3. Never force-archive maps with unmigrated owned plots.  
4. Do **not** apply Prisma migration `20260718140000_world_expansion` until approved.  
5. Keep `WORLD_EXPANSION_PRISMA_ENABLED` false until migrate deploy.
