# Third-Party Asset Style Fit Guide

Extends `art-direction/master-style-guide.md` and `docs/art/RIFTLING_GUIDE.md` for **external** candidates.

## Target look

Polished 2D illustrated + pixel hybrid: soft fantasy lighting, bold silhouettes, expressive faces, controlled saturation, midnight navy / cyan / amber accents.

## Style score (0–100)

| Band | Meaning |
|------|---------|
| 85–100 | Near drop-in after light tint / crop |
| 70–84 | Usable with recolor / outline pass |
| 50–69 | Prototype / placeholder only |
| 30–49 | Reference / material bake only |
| 0–29 | Reject on style (even if license OK) |

## Scoring checklist

1. Outline weight compatible with Riftwilds medium dark outline?
2. Reads at game scale (UI 24–48px, world ~36px companions)?
3. Palette can shift to regional earth + one accent?
4. Avoids generic “Kenney-only” recognition for hero surfaces?
5. Photoreal PBR? Cap score ≤45 unless heavily stylized.
6. Creature art? Prefer **reject** — Riftlings must be original IP.

## Consistency system

| Layer | Rule |
|-------|------|
| Brand UI | Prefer original / themed assets; third-party only for neutral chrome |
| Live World tiles | Match cozy pixel / painted hybrid; no sudden PBR grass |
| Audio | Procedural Riftling cries stay original; CC0 beds OK if credited |
| Creatures | Never import franchise or lookalike packs |

## Visual consistency gates before `IN_USE`

- [ ] Recolored to project palette variables where needed
- [ ] Nearest-neighbor for pixel; smooth for illustrated icons
- [ ] No mixed perspective language in one screen
- [ ] Credits updated if attribution required
