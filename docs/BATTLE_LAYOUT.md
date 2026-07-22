# Battle Layout

Immersive **Battle Mode** for active Rift Battle matches (Practice Board, invite, encounter).

## Goals

- Maximize battlefield space (~15% Match Intel | ~70% stage | ~15% Event Feed)
- Auto Focus Mode when entering an active match desk
- Collapsible game sidebar (icons by default in battle)
- Preserve gameplay, art style, hub tabs, energy, inventory separation

## Entry

Open any active desk, e.g.:

- `/tcg/battle?mode=practice&board=1`
- `/tcg/battle?invite=CODE`
- `/tcg/battle?encounter=…`

Battle Hub (mode tabs) stays at `/tcg/battle` without board/invite/encounter.

## Layout presets

Stored in `localStorage` key `riftwilds.battle.layout-preset`:

| Value | Behavior |
|-------|----------|
| `classic` | Fixed side rails (~180px / ~200px) |
| `expanded` | 15 / 70 / 15 grid |
| `immersive` | Default — darker console, compact header, Focus Mode |
| `ultra-wide` | Wider stage on 1440p+ / ultrawide |

Change via Esc → Settings, or the Settings util on the battle header.

## Primary files

- `src/lib/tcg/battle-layout-prefs.ts` — prefs + route detection
- `src/components/tcg/battle-layout-context.tsx` — Focus Mode + shortcuts
- `src/components/game/game-shell-chrome.tsx` — shell Focus Mode classes
- `src/components/game/game-sidebar.tsx` — rail / pin / peek
- `src/components/tcg/rift-battle-board.tsx` — console layout
- `src/components/tcg/battle-event-feed.tsx` — compact / resize / auto-hide
- `src/components/tcg/battle-mode-menu.tsx` — Esc menu + settings
- `src/app/globals.css` — grid, Focus Mode, hand fan, menus

See also: `FOCUS_MODE.md`, `SIDEBAR_SYSTEM.md`, `RESPONSIVE_LAYOUT.md`, `BATTLE_UI_GUIDELINES.md`, `IMMERSIVE_MODE.md`.
