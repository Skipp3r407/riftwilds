# Rift Storm Reward Tables

Defined in `STORM_WAVE_TABLES` (`src/lib/loyalty/rift-storm-config.ts`).

| Wave | Table id | Intent |
|------|----------|--------|
| WAVE_1 | `storm_wave_1` | Small Credits / LT / mats / badges |
| WAVE_2 | `storm_wave_2` | Rare maps, cosmetics, emotes, coupons |
| WAVE_3 | `storm_wave_3` | Major prizes, titles, housing, skins, egg stubs, optional SOL ticket |
| FINAL | `storm_wave_final` | Guaranteed participation gift |

Tier weight boosts multiply entry weights. Pity can force UNCOMMON+. Extremely rare Riftling stubs are scarce and tier-gated.

SOL promo tickets call `attemptStormSolGrant` — see anti-abuse doc.
