# Visual QA Report — Commons NPC / World Art pass

**Date:** 2026-07-18  
**Scope:** Riftwild Commons Live World actors, sheets, hatchery/guild facades  
**Git:** Changes staged locally only — **awaiting approval** (no commit/push/deploy)

## Acceptance checklist

| Criterion | Result |
|-----------|--------|
| Commons Live World: no floating-head NPCs | **PASS** — audit `0/24` floating-head risk |
| Named + ambient have full bodies | **PASS** — dedicated kits + rebuilt sheets |
| Idle + walk/patrol at minimum | **PASS** — sheet anims + runtime bob/wander for all behaviors |
| Buildings not unmasked photo rectangles (fixable) | **PASS** — Hatchery + Guild cutouts; others backlog |
| Honest backlog documented | **PASS** — see `docs/art/ASSET_AUDIT.md` |

## Automated checks run

```text
npm run assets:audit:npc-world          → Floating-head world risk: 0/24
npx vitest run tests/unit/npc-overworld-fullbody.test.ts
npx vitest run tests/unit/npc-assets.test.ts
→ tests passed
```

## Manual QA (recommended before merge)

1. Open Live World → Riftwild Commons at default zoom.
2. Confirm **Hatcher (Mira)** is a full-body figure near Hatchery, not a bust circle.
3. Confirm ambient NPCs bob/walk; guards patrol visibly.
4. Confirm Hatchery + Guild facades have transparent edges (no sky plate).
5. Open Mira dialogue — portrait still a quality bust (dialogue-only).

## Known residual issues

- Procedural walk frames (bob/sway), not hand-posed gait.
- Other region NPC world kits may still be portrait-derived until those hubs are showcase targets.
- Some Commons facades beyond Hatchery/Guild may still need cutout remasters.