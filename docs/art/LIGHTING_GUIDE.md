# Lighting Guide — Riftwilds

Implementation: `src/game/live-world/systems/premium/atmosphere.ts` + terrain tint in `layered-terrain.ts`.

## Goals

1. **Day** feels golden-green and inviting (Ultima outdoors).
2. **Night** feels cool navy with warm torch pools (Diablo drama, soft).
3. **Readability** never collapses — keepers/NPCs stay legible (Zelda clarity).
4. **Weather** tints the world without hiding path/interaction cues.

## Day cycle

- Default Commons cycle: **~8 minutes** full loop (hub feel, not real-time).
- `dayFactor` 0 → night, 1 → midday (smooth sine curve).
- Midday: minimal overlay; warm terrain tint bias (slight gold in grass shade).
- Dusk/dawn: brief warmer overlay before navy night.

## Night recipe

| Layer | Behavior |
|-------|----------|
| Global overlay | Cool navy (`~0x0a1830`–`0x121a28`), alpha scales with `(1 - dayFactor)` |
| Torches / lanterns | Warm ADD circles; visible when `dayFactor < ~0.55`; pulse gently |
| Portal / hatchery | Cool cyan pools (rift identity) — sparse |
| Fireflies | Night + clear/fog; green-gold motes; density from immersive settings |
| Cloud shadows | Soft ellipses; stronger on clear days |

## Weather tints

| Weather | Overlay bias | Particles |
|---------|--------------|-----------|
| clear | Cycle only | Cloud shadows, fireflies at night |
| rain | Cooler slate + extra alpha | Rain streaks |
| fog | Grey-blue haze | Reduced cloud contrast |
| wind | Slight dust | Horizontal motes |
| ash | Warm brown (Ember/Void hubs) | Ash motes |

## Building & prop lighting

- Campfires / crystals / lantern props: alpha pulse (existing tweens).
- Do not flood ADD lights — **≤ ~8 torch spots** in Commons unless LOD allows.
- Interior stubs: darker rectangle + single warm source when buildings become enterable.

## Site / UI lighting metaphors

- Panels: soft top edge highlight (parchment/metal catchlight), not neon bloom spam.
- CTAs: cyan→amber gradient OK; keep glow radius modest.
- Prefer **warm inset shadows** over multi-layer purple glows.

## Performance

- Particle emitters toggle via immersive density; never emit at full rate on “low”.
- Torch list is static; do not spawn per-prop lights for every barrel.
- Prefer baked tile shading + few runtime lights over per-pixel lighting.
