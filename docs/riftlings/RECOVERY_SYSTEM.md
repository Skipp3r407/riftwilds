# Recovery System

Seven recovery methods. **SOL is never required.**

| # | Method | Currency / cost |
|---|--------|-----------------|
| 1 | Credits Healer | Credits (bond + insurance modifiers) |
| 2 | Recovery Items | Spirit Crystal, Phoenix Feather, … |
| 3 | Spirit Quest | Gameplay in Spirit Realm |
| 4 | Loyalty Tokens | Non-transferable loyalty currency |
| 5 | Guild Assist | Assistant pays Credits |
| 6 | Friend Assist | Friend pays Credits |
| 7 | Instant Spirit Recall | Optional SOL — flat / level-tiered, max capped |

## SOL rules

- Never priced by rarity, emotion, market value, or owned pet count
- Level tiers example: 1–20 / 21–50 / 51+ with absolute max cap
- Flagged off by default (`SOL_SPIRIT_RECALL_ENABLED`)
- Empty pool → Credits substitute
- Wallet + treasury validation + requestId anti-dupe

## Insurance

Credits / guild / season policies: free recovery, reduced cost, extra timer.

## Equipment

Loadouts and cosmetics are snapshotted and preserved — nothing destroyed on recovery.

## Audit

Every recovery writes `RecoveryHistoryEntry` (method, spend, assistants, requestId).
