# Animation Guide — Riftwilds

Extends [ANIMATION_STANDARDS.md](./ANIMATION_STANDARDS.md) with art-direction intent. Runtime stays gameplay-safe — **visual only** for this overhaul.

## Principles

1. **Presence over noise** — 2–3 intentional loops per scene beat, not every prop dancing.
2. **Weight** — medieval fantasy moves with soft inertia; avoid snappy UI-game juice on world actors.
3. **Readability** — motion must not hide interaction prompts or nameplates.
4. **Budget** — particle + tween counts respect immersive performance settings.

## Live World — actors

| Layer | Spec |
|-------|------|
| NPC sheet | 4×128: idle0 \| walkL \| contact \| walkR |
| Idle breathe | Vertical bob + slight scale pulse |
| Weight shift | Slow horizontal sway |
| Patrol | Sin/cos wander from behavior amplitude |
| Face player | FlipX within ~90px |
| Keeper idle | Subtle breath when velocity ~0 |
| Pet follow | Slightly stronger breath |

No permanently frozen Commons cast — default idle still gets tiny wander.

## Live World — environment

| Element | Motion |
|---------|--------|
| Trees / bushes / flowers | Soft scale sway (existing) |
| Campfire / crystal / lantern | Alpha pulse |
| Torches (atmosphere) | ADD glow pulse |
| Fireflies / rain / wind | Emitter on/off by weather + night |
| Cloud shadows | Slow drift |
| Water | Prefer baked caustics; optional future UV scroll stub |

## UI motion

- Panel enter: 120–180ms opacity + 4px rise.
- Buttons: border/background only — no elastic bounce.
- CTA glow: gentle, not strobing.
- Respect `prefers-reduced-motion` (globals already collapse durations).

## Site / marketing

Ship **2–3 intentional motions** on branded surfaces (e.g. riftstone pulse, soft parallax, CTA sheen) — never a dashboard of competing loops.

## Backlog (animation)

- Hand-authored 4-dir walk atlases for named Commons 10
- Behavior activity loops (forge hammer, egg tend, music sway)
- True blink frames
- Water UV shimmer at LOD-friendly rate
