# Battle Performance Profile

Scaffolding for adaptive graphics / motion on compact devices.

Stored: `riftwilds.battle.perf-profile` → `auto` \| `high` \| `balanced` \| `battery`.

Resolved onto `html[data-battle-perf]`:

| Profile | Behavior |
|---------|----------|
| `high` | Full enter animation, hand fan motion, Focus contrast filters |
| `balanced` | Default on phone/tablet Auto — softer transitions, no enter anim |
| `battery` | Minimal motion; console glow idle; lighter card shadows |

**Auto** picks `balanced` on phone/tablet viewports and `high` on desktop/large.

This is presentation-only scaffolding — it does not change match rules, draw, or VFX event payloads.
