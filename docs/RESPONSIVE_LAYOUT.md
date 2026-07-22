# Responsive Battle Layout

Battle Mode expands the board with viewport width instead of stretching cards awkwardly.

## Breakpoints (practical)

| Class | Target | Behavior |
|-------|--------|----------|
| ≤1023px | Mobile / tablet | Single column; stage first; intel + feed stack |
| 1024–1439 | 1080p | 15 / 70 / 15 grid |
| 1440–1919 | 1440p | Taller stage under Focus Mode; Ultra Wide unlocks more width |
| ≥1920 | 4K / ultrawide | Immersive / Ultra Wide grow stage min-height; Ultra Wide drops max-width clamp |

## Rules

- Prefer `minmax(0, fr)` columns so the center stage absorbs spare width
- Hand fan scrolls horizontally when 8–10 cards overflow — do not shrink below readable widths
- Field card size (S–XL) remains a player preference (`riftwilds.battle.board-card-size`)
- Event Feed width is independently resizable (`riftwilds.battle.feed-width`, 140–420px)

## QA checklist

- [ ] 1080p: stage dominates; panels readable
- [ ] 1440p / ultrawide: board grows, cards not distorted
- [ ] Mobile: no overlap; hand still playable
- [ ] Collapsed intel/feed do not clip the stage
