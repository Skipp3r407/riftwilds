# Focus Mode

Focus Mode is the Battle Mode chrome state that collapses world UI and expands the battlefield.

## How to enter

1. Open an active match desk (`board=1`, `invite`, `encounter`, or `play=1` on `/tcg/battle`).
2. Focus Mode turns **on automatically**.
3. Toggle manually: Esc → Settings → Focus Mode checkbox, or open Settings from the battle header.

Leaving the board (Exit Match / hub) clears Focus Mode.

## What it does

- Collapses the game sidebar per Sidebar preference (default: Auto Collapse → icons)
- Shrinks / hides world mega-nav chrome in the site header (~25% shorter bar)
- Softens mobile bottom nav
- Removes the page `max-w-6xl` clamp so the console can use the viewport
- Hides the battle lede copy; keeps Deck / Codex / Settings / History / Exit
- Darkens the console wash slightly and boosts card contrast
- Does **not** remove Match Intel or Event Feed (unlike F11 fullscreen expand)

## Document attributes

Applied on `<html>` by `BattleLayoutProvider`:

| Attribute | Values |
|-----------|--------|
| `data-battle-active` | `true` / `false` |
| `data-battle-focus` | `true` / `false` |
| `data-battle-layout` | `classic` \| `expanded` \| `immersive` \| `ultra-wide` |
| `data-shell-sidebar` | `expanded` \| `collapsed` \| `peek` \| `hidden` |
| `data-battle-combat` | `true` while combat VFX play |

## Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Toggle / pin shell sidebar |
| `F11` | Toggle battle fullscreen expand |
| `Esc` | Open / close Battle Menu |
| `Space` | End turn (ignored while typing in inputs) |
