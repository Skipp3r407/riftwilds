# Friends & private messages

Server-authoritative social graph for Riftwilds keepers. **Credits ≠ SOL** — no wallet required for basic friends / PMs (guest `ownerKey` works).

## URLs

| Surface | Path |
| --- | --- |
| Social Hub | `/social` |
| Deep link — friends | `/social?tab=friends&add=<handle>` |
| Deep link — whisper | `/social?tab=messages&with=<handle>` |
| Friends API | `/api/social/friends` |
| Messages API | `/api/social/messages` |
| Nav badge summary | `/api/social/summary` |

## Flags

- `FRIENDS_AND_PM_ENABLED` (default **true**) — feature on/off
- `FRIENDS_AND_PM_PRISMA_ENABLED` (default **false**) — Prisma path prepare-only
- `ECOSYSTEM_SOCIAL_HUB_ENABLED` — page shell

## Identity

Uses `resolvePersistenceOwner()` → stable `user_<id>` or `guest_<token>`. Never trust client-supplied friend lists.

## Rules (enforced server-side)

1. Cannot friend / message yourself
2. Block either direction blocks friend requests and PMs
3. Default PM privacy: **friends only** (configurable per profile: `friends_only` | `anyone`)
4. Friend + pending request limits; message length ≤ 500; rate limits on send / request
5. Body sanitized (control chars, tags, stub profanity)

## Persistence

- Hot path: in-memory `globalThis` store (`src/lib/social/store.ts`)
- Prisma models + migration `20260718160000_friends_and_pm` are **prepared only** — do not apply without approval
- Town keepers seeded for onboarding: `keeper_mira`, `captain_reed`, `archivist_echo` (auto-accept requests)

## Live World hooks

Nearby drawer actions deep-link into Social Hub:

- Add friend → `/social?tab=friends&add=…`
- Whisper → `/social?tab=messages&with=…`
- Invite → party stub via friends API (`party_invite`)

Real peer `ownerKey` resolution waits on multiplayer Phase 2.

## Notifications

`/api/social/summary` returns unread PM + incoming request counts. Sidebar Social link and header Social badge poll every ~45s.

## Moderation stubs

- Block / unblock stored server-side
- Report logs `[social-report-stub]` + in-memory row (not the public Feedback form)
- Full moderation queue / Prisma `ModerationReport` wiring is backlog

## Honest backlog — real-time delivery

| Item | Status |
| --- | --- |
| REST send / poll inbox | **Shipped** |
| WebSocket push for new PMs | Backlog (multiplayer transport) |
| Cross-instance shared store | Backlog (Redis / Prisma after migrate) |
| Typing indicators / online from WS | Backlog |
| Distributed rate limits | Backlog (memory limiter today) |

Until WS lands, clients refresh via hub fetches and the summary poller.

## Tests

```bash
npx vitest run tests/unit/friends-and-pm.test.ts
```

## Related

- Presence / town reputation: `docs/social/LIVING_WORLD_PRESENCE.md`
- Live World chat (local whisper parse): `src/game/live-world/systems/chat.ts` — not the PM transport
