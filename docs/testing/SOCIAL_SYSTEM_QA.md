# Social System QA

## Automated

```bash
npx vitest run tests/unit/social-presence.test.ts
```

Covers: Presence XP math, rest hubs, anti-AFK, scripted repetition, idle Credits (never SOL), featured titles, home visits, status, presence state/tiers, Community Tokens, diminishing returns, helpers, hubs.

## Manual checklist

- [ ] Live World Presence HUD shows tier / level / CT / caps
- [ ] Motionless AFK earns nothing after threshold
- [ ] Wave / sit / campfire grant XP when engaged
- [ ] Idle claim after genuine activity grants Credits ± CT, message includes “never SOL”
- [ ] Featured banner / Social Hub Town Featured updates after activity
- [ ] Welcome Center recommended for new players
- [ ] Helper opt-in + assist capped
- [ ] Performance start/join works
- [ ] Fullscreen / mobile / keyboard still usable with HUD
- [ ] Crowded hub LOD stubs do not crash

## Honest backlog

Synced performance animations, social minigame polish, Prisma persistence wiring for presence profiles.
