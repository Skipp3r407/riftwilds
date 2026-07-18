# Presence Anti-Abuse

Protects Living Server Population rewards from bots, macros, and multi-account farms.

## Layers

1. **Engagement signals** — MOVE / CAMERA / INTERACT / CHAT / EMOTE / UI / PET within window
2. **State machine** — IDLE → AFK stops rewards
3. **Scripted repetition** — same-action spam / A-B loops
4. **Risk scoring** — perfectly timed intervals, 18h+ sessions, reciprocal clusters, chat spam
5. **Multi-account fingerprint** — soft XP share reduction (households not auto-banned)
6. **Caps + diminishing returns** — hour/day XP, Community Token day/week
7. **Idempotent grants** — requestId on Credits / Community Tokens

## Responses (escalating)

Reduce eligibility → require variety → pause Presence XP → temporary social-reward restriction → admin flag → moderation action with evidence

Exact thresholds are **not** shown to players.

## Never

Instant ban on a single soft signal · Punish shared household Wi‑Fi alone · Award SOL
