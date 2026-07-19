# Docker (local)

Compose file lives at the repo root: `docker-compose.yml`.

```powershell
docker compose up -d
docker compose ps
docker compose logs -f nakama
docker compose down
```

See [docs/nakama.md](../docs/nakama.md) for Windows Docker Desktop install steps, ports, and env vars.

No custom app Dockerfile is required for Nakama — official images are used:

- `postgres:16.8-alpine`
- `redis:7.4-alpine`
- `heroiclabs/nakama:3.22.0`
