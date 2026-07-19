# QA_CARD_SYSTEM_REPORT

Generated: 2026-07-19T16:50:12.874Z  
**Local only** — no commit/push/deploy.

## Simulation

| Metric | Value |
|--------|------:|
| Requested matches | 500 |
| Completed | 500 |
| Still ACTIVE (turn cap / guard) | 0 |
| Errors | 0 |
| Player wins | 343 |
| AI wins | 157 |
| Draws | 0 |
| Avg turns | 14.19 |

## Coverage notes

- Decks sampled from launch-pool UNIT/SPELL ids (30 cards each).
- Engine uses ATK/DEF/HP/Speed, keywords (Charge/Guardian/Flying/Bloom/Poison/Ward/Heal).
- 10k sims: set `TCG_SIM_COUNT=10000` when running locally if time allows.

## Unit identity spot-check

| Id | Present |
|----|---------|
| rotr-c-bramblefox | true |
| rotr-c-mossprig | true |
| rotr-c-ashwing | true |

## Verdict

PASS — no engine exceptions in batch.
