# Responsive Battle Layout

Canonical detail: **[RESPONSIVE_LAYOUTS.md](./RESPONSIVE_LAYOUTS.md)** (mobile / tablet / desktop classes).

## Breakpoints (practical)

| Class | Target | Behavior |
|-------|--------|----------|
| `phone-portrait` | ≤640 portrait | Stacked; top vitals; dock; drawers |
| `phone-landscape` | ≤932 landscape | Preferred mobile — no-scroll stack |
| `tablet-portrait` | 768–1024 portrait | Board-dominant; drawers; FAB |
| `tablet-landscape` | 1024–1366 landscape | Centered board; larger cards; FAB |
| ≤1023 (legacy) | Mobile / tablet | Single column fallback |
| 1024–1439 | 1080p | 15 / 70 / 15 grid |
| 1440–1919 | 1440p | Taller stage under Focus Mode |
| `desktop` / ≥1920 | 4K / ultrawide | Flagship Immersive / Ultra Wide |
| `large` / ≥2560 | Ultrawide+ | Minor stage growth |

## Rules

- Prefer `minmax(0, fr)` columns so the center stage absorbs spare width
- Hand: desktop fan · tablet larger fan · phone carousel — do not shrink below readable widths
- Field card size (S–XL) remains a player preference (`riftwilds.battle.board-card-size`)
- Event Feed width is independently resizable on desktop (`riftwilds.battle.feed-width`, 140–420px)

## QA checklist

- [ ] 1080p: stage dominates; panels readable
- [ ] 1440p / ultrawide: board grows, cards not distorted
- [ ] Phone landscape: no page scroll; dock reachable
- [ ] Phone portrait: landscape prompt appears once; dismissible
- [ ] Tablet: FAB toggles intel/feed; larger hand cards
- [ ] Collapsed intel/feed do not clip the stage
