# Admin · Rift Stakes

Route: `/admin/rift-stakes` · API: `/api/rift-stakes/admin`

## Controls

- Set fee bps (hard reject if > 500)
- Pause: stakes / treasury / matchmaking
- Activate promotional 0% fee events
- View fee history + treasury tx + queue size

VIP tiers are configurable in store (`vipTiers`); resolution in `fee-resolver.ts`.
