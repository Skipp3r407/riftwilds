# Synchronized Social Interactions

Paired emotes (handshake, high-five, hug, fist bump, sync dance) require **mutual consent**. They are cosmetic only.

## Flow

1. Initiator selects a social emote (panel or future target radial).
2. `ConsentStore.request` validates: emote requires consent, not self-target, target privacy allows requests, not muted/blocked, no duplicate pending.
3. Target sees consent toast (20s TTL).
4. Accept → both play via `runtime.play(..., { source: "consent" })` and bus event `consent_resolve`.
5. Decline / cancel / expire → no animation on either side.

## Phase 1 vs Phase 2

| Phase | Behavior |
|-------|----------|
| 1 (now) | Local stub; demo target `demo-keeper`; event bus + UI toast |
| 2 | WS `sendEmote` with server validation; real nearby player ids |

## Rules

- Never auto-accept.
- Never grant rewards, quest credit, or bond XP from social emotes.
- Hug / dance are family-safe authored animations only.
- Blocked or muted players cannot deliver requests.

## API shape (client)

```ts
emotes.requestSocial({ emoteKey, toId, fromLabel })
emotes.resolveConsent(id, "accepted" | "declined" | "cancelled")
```

Network stub: `MultiplayerClient.sendEmote({ emoteKey, actorId, targetId, at, requiresConsent })`.
