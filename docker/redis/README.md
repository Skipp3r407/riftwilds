# Redis (local)

Redis runs in `docker-compose.yml` as `redis` on host port **6379**.

## Why Redis is included

- **Nakama core does not require Redis** — Postgres is the only required store.
- Redis is useful for:
  - Local Next.js rate-limit / cache experiments (`UPSTASH_REDIS_*` is the managed prod path)
  - Future Nakama Go/Lua runtime modules that want a shared cache
  - Queue / presence scratch pads during multiplayer prototyping

## Choice summary

| Service | Required for Nakama? | Included? | Reason |
| --- | --- | --- | --- |
| Postgres (`nakama-postgres`) | Yes | Yes | Nakama persistence |
| Redis | No | Yes | Optional local cache / future modules |
| CockroachDB | Alternative to Postgres | No | Prefer Postgres to match existing Nest/Prisma familiarity |

Point app code at Redis with `REDIS_URL=redis://127.0.0.1:6379` when experimenting locally.
Do not commit production Redis passwords.
