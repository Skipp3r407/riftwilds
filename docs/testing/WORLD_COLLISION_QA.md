# World Collision QA

Manual + automated checks for containment, transitions, and locked seals.

## Automated

```bash
npm run test -- tests/unit/world-boundaries.test.ts
npm run validate:boundaries
npm run validate:maps
```

Expect:

- All 12 blueprints pass edge-wall + open-edge audit
- Commons has deep water + transition zones
- Spawn clamp clears solids on every region

## Manual — Commons

1. Enter Live World Commons
2. Walk into each map edge — should stop (no void)
3. Walk into the fishing pond — blocked (deep water)
4. Toggle collision debug (F3) — see walls (magenta), water (blue), transitions (cyan), playable inset (green)
5. Approach a **locked** portal — amber seal; E or walk-in shows contextual seal/bridge/gate copy (not “can’t go there”)
6. Unlock / use an open portal — E travel and walk-in transition both arrive clamped near destination spawn
7. Sprint around buildings — companion stays on-map; NPCs do not wander past edges

## Manual — enterable stubs

Repeat edge + hazard checks in Ember Crater, Moonwater Coast, Elderwood Forest (lava/cliff/deep water).

## World map

1. Open M — locked regions show teasers / unmet reqs, not a travel CTA that pretends the route is open
2. Pathway guidance skips `locked` pathways
3. Fast travel only offers activated Gateway destinations

## Regression watchlist

- Saved position inside a building after layout change → should clamp on load
- Transition center under edge wall → `validate:boundaries` critical
- Adding portals without re-running finalize → missing transitions (auto-derive covers this)
