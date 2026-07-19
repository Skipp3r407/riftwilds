# Security — Rift Arena addendum

> Broader project security docs remain under `docs/security/*`. This file covers Arena / TCG match surfaces.

## Authoritative play

- Match state lives server-side (`match-store` on `globalThis` for local demo)
- Clients submit actions only; engine applies rules
- Opponent hands hidden via viewer-aware snapshots

## Threat notes (Phase 1 local)

| Threat | Mitigation |
|--------|------------|
| Forged damage | Server engine only |
| Match ID guessing | Owner/seat keyed lookup |
| Turbopack empty store | `globalThis` shared maps |
| SOL stake bypass | Flags + hard wagering false |
| Win trading (future ranked) | Signals + admin review (scaffold) |

## Admin

- `/admin/arena` + `PATCH /api/rift-arena/admin` for pause / soft caps
- Role + audit logging still TBD with Neon admin auth

## Invite lobbies

- Room codes are local-process secrets — not cross-server multiplayer
- Do not market as production-grade MP until dedicated realtime infra

---

## Project Treasury Ops

See **[treasury-security.md](./treasury-security.md)** for encrypted signer stubs, RBAC, idempotency, and demo-safe transfer rules.
