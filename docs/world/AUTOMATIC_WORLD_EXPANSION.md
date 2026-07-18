# Automatic World Expansion

> Marker doc for the Automatic World Expansion workstream.  
> Runtime: `src/lib/world-expansion/` · Admin: `/admin/world-expansion` · API: `/api/world-expansion`

## Philosophy

- **Permanent generated neighborhoods** for ownership and deeds.
- **Temporary overflow maps** for festival / boss crowds.
- **Never** assign permanent housing to temporary instances.

## Audit (existing systems extended)

| System | Path | Extension |
|--------|------|-----------|
| Neighborhoods | `src/lib/neighborhoods/` | `housing-expansion` materializes new nbhds |
| Housing | `src/lib/housing/` | Relocation snapshots furniture IDs |
| World maps | `src/game/world-maps/` | Templates align Living Towns districts |
| Social presence | `src/lib/social-presence/` | Crowd labels; no fake players |
| Persistence | Prisma prepare-only | Flag `WORLD_EXPANSION_PRISMA_ENABLED` |
| Feature flags | `feature-flags.ts` | `WORLD_EXPANSION_ENABLED` (on) / Prisma (off) |

## Capacity

- Soft / hard player + plot ratios (`config.ts`).
- Metrics: players, plots, visitors, entities, tick latency stubs.
- Rolling averages — festival spikes → **overflow**, not permanent cities.

## Lifecycle

`PLANNED → QUEUED → GENERATING → VALIDATING → PENDING_REVIEW → APPROVED → SEEDING → OPEN`  
Terminal: `PAUSED`, `ARCHIVING → ARCHIVED → RETIRED`, `FAILED`, `ROLLED_BACK`  
Players never see maps until `OPEN` (after validation).

## Templates

Forest, Coastal, Mountain, Farming, Merchant, Harbor, Beginner, Guild, Island, Rift-Edge (overflow).  
Data-driven: biome, roads, plots, districts, hubs, performance budget, housing styles.

## Generation

Server-only seeds. Stages: roads → landmarks → districts → plots → hubs → validation.  
Living Towns: no empty field scatter; road-adjacent plots only.

## Assignment priority

Owned property → party → friends → guild → region → latency → population → housing.  
New players → active (not empty) maps. NPCs/events seed new maps — never fake accounts.

## Founders

Cosmetics / titles / furniture only. **No SOL**, combat power, rare Riftlings, or land speculation.

## Overflow

`rift_edge_outpost` template · TTL · no deeds · no neighborhood link.

## Relocation

Transactional snapshot + furniture locks · idempotent keys · guild approval stub.  
Refuse overflow destinations for permanent housing.

## Admin

`/admin/world-expansion` — approve / pause / force / retry / archive / rename (audited).

## Prisma

Migration `20260718140000_world_expansion` — **prepare only**. Do not deploy until approved.

## Related docs

- [CAPACITY_AND_THRESHOLDS.md](./CAPACITY_AND_THRESHOLDS.md)
- [MAP_TEMPLATES.md](./MAP_TEMPLATES.md)
- [GENERATION_PIPELINE.md](./GENERATION_PIPELINE.md)
- [PLAYER_ASSIGNMENT.md](./PLAYER_ASSIGNMENT.md)
- [OVERFLOW_INSTANCES.md](./OVERFLOW_INSTANCES.md)
- [RELOCATION.md](./RELOCATION.md)
- [docs/admin/WORLD_EXPANSION_ADMIN.md](../admin/WORLD_EXPANSION_ADMIN.md)
- [docs/security/MAP_GENERATION_SECURITY.md](../security/MAP_GENERATION_SECURITY.md)
- [docs/testing/WORLD_EXPANSION_QA.md](../testing/WORLD_EXPANSION_QA.md)
- [docs/art/LIVING_TOWNS.md](../art/LIVING_TOWNS.md)

## Honest backlog

- Full multiplayer stress / real GPU preview renders / regional orchestration.
- Cores are playable stubs with real APIs, state machines, and tests.
