# NPC Schedules

Daily routines are occupation-templated with per-slug overrides so Commons NPCs are not clones.

## Source of truth

- Templates + overrides: `src/game/npc-ai/schedules.ts`  
- Activity → Phaser behavior: `src/game/npc-ai/activities.ts`  
- Region HUD bridge: `src/game/living-world/npc-schedules.ts` → `npcsPresentAt()`

## Day phases

`dawn | day | dusk | night` from `resolveLivingWorldClock`.

## Role examples (Commons)

| Role | Day | Night |
|---|---|---|
| Guard / Captain | patrol / train | patrol (present) |
| Merchant | shop_open | shop_closed (present, wary) |
| Child | play | sleep (**hidden**) |
| Smith | work | sleep (hidden) |
| Hatchery | work | idle (present) |
| Animal Riftling | roam | sleep (present, curled) |

## Anchors

Schedule blocks may set `anchorOffset` from spawn home. Phaser updates `homeX/homeY`; existing wander/bob code continues on top (visual-audit movement preserved).

## Presence

`present: false` hides sprite + label + indicator (children/cooks sleeping, etc.). Merchants remain visible when closed.
