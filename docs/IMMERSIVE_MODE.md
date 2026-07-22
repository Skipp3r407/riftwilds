# Immersive Mode

Immersive Mode is the default Battle Layout preset (`immersive`) plus Focus Mode chrome.

## Layers

1. **Focus Mode** — shell chrome collapse (sidebar / header / mobile nav)
2. **Immersive preset** — 15/70/15 console, darker wash, compact header, hand fan
3. **Combat Mode** — temporary fade of intel/feed (+ sidebar) while VFX play; hover restores
4. **Fullscreen expand (F11)** — existing `battle-console--expanded` path; hides side panels for maximum stage

## Enter animations

On board mount (unless reduced motion):

- Console slight zoom-in (`battle-console--enter`)
- Hand cards slide up in fan order

## localStorage keys

| Key | Purpose |
|-----|---------|
| `riftwilds.battle.layout-preset` | `classic` \| `expanded` \| `immersive` \| `ultra-wide` |
| `riftwilds.battle.sidebar-mode` | `always-open` \| `auto-collapse` \| `hidden-during-battle` |
| `riftwilds.battle.feed-width` | Event Feed width px |
| `riftwilds.battle.feed-collapsed` | `1` / `0` |
| `riftwilds.battle.intel-collapsed` | `1` / `0` |
| `riftwilds.battle.board-card-size` | Field card size `s` \| `m` \| `l` \| `xl` |

## Preview

`/tcg/battle?mode=practice&board=1`
