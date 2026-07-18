# Airdrop QA

## Manual checklist

- [ ] `/loyalty` loads claim + streak UI
- [ ] Activity then daily claim succeeds; second claim same day fails
- [ ] Claim without activity → AFK deny
- [ ] Milestone 7 claimable once after 7 check-ins
- [ ] Shop purchase spends Loyalty Tokens; item is cosmetic
- [ ] Dev trigger storm → warning or active banner
- [ ] Participate with quest objective → score rises
- [ ] Login participation denied
- [ ] Wave roll requires score; duplicate wave blocked
- [ ] Cancel storm → phase CANCELLED
- [ ] Social share opt-in does not reveal wallet

## Automated

```bash
npx vitest run tests/unit/loyalty-system.test.ts
```

## Backlog (honest)

- Live World VFX polish (rift skies, particles, portals) — presentation flags exist; Phaser hooks not fully wired
- Admin role gate on `/api/loyalty/storm/trigger`
- Durable Prisma persistence for loyalty store
