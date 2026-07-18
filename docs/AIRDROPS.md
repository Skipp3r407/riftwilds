# Airdrops

Weighted airdrops for daily loyalty claims and Rift Storm waves. Not equal-odds lottery — streak tier multiplies rare weights; pity protects long dry spells.

## Daily airdrop

1. Record meaningful activity (quest, combat, craft, care, etc.).
2. Check-in advances daily streak.
3. Claim rolls `DAILY_AIRDROP_TABLE` with tier multipliers + pity.
4. Idempotent claim key: `daily:{userId}:{UTC day}`.

## Rift Storm airdrops

See `docs/rewards/RIFT_STORM_EVENTS.md`. Waves use `STORM_WAVE_TABLES` with participation score gates.

## Duplicate protection

All grants use claim keys in the loyalty store. Milestone days and storm wave rolls cannot be claimed twice.

## Analytics stubs

`loyalty_airdrop_claim`, `rift_storm_roll`, `rift_storm_participate` in `src/lib/analytics/events.ts`.
