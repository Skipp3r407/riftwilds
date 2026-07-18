# Rift Storm QA

## Automated coverage (`tests/unit/loyalty-system.test.ts`)

- Activation (skip warning → ACTIVE)
- AFK / login deny
- Participation scoring + diminishing returns
- Tier weight boosts
- Wave score gate + no duplicate wave
- Emergency cancel
- SOL flag-off substitute
- Newly qualified helper

```bash
npx vitest run tests/unit/loyalty-system.test.ts
```

## Manual

1. POST trigger with `skipWarning: false` — warning copy + timer
2. Wait / advance — ACTIVE, temp quests present
3. Participate several actions — community bar moves
4. Roll WAVE_1 → claim animation on `/loyalty`
5. Cancel — phase CANCELLED, further participate fails
6. Regional storm without regionId — denied when `mustTravel`

## Backlog

- Phaser world weather / particles / portals wiring
- NPC `!` temp quest markers in Live World
- Admin auth on trigger route
