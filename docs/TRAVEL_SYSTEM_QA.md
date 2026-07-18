# Travel System QA

## Automated

```bash
npx vitest run tests/unit/world-travel.test.ts
npx vitest run tests/unit/live-world-maps.test.ts
```

Coverage includes: continent spine, Gateway activation, free early fees, unlock teasers, one-time discovery rewards, fast-travel blocks, blueprint Gateway objects, streaming stubs, party invite stubs, transition plans.

## Manual checklist

1. Enter Live World Commons → Gateway activation dialogue once; stone visible near portal plaza.
2. Press **M** → world completion line + continent cards; sealed regions show requirements.
3. Walk / portal to Ember Crater → Gateway activates; map lists both stones.
4. From map, preview Ember↔Commons → **Free early travel** → Travel succeeds.
5. Open map during combat stub (enemy zone) → travel blocked message.
6. Sealed portal (e.g. Void) → “sealed until story progresses” — no SOL mention as requirement.
7. Rediscover Ember → no second Credits/XP spam.
8. Minimap shows amber Gateway pin; regional filter **gateways** highlights stones.
9. Confirm fee path for mid/late destinations uses Credits only when both stones are active and region unlocked.

## Regression watch

- Existing portal ring + return portals still work.
- Fog / waypoint guidance unchanged for walking.
- Credits travel sink (`TRAVEL_FEE`) remains available for economy actions; Live World demo debits `demoCredits` for fast travel.
- Feature flag `PLAYABLE_LIVE_WORLD_ENABLED` still gates entry.
