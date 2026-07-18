# Keyboard Controls Report

**Date:** 2026-07-18

## Architecture

Centralized `LiveWorldInputManager` (`src/game/live-world/input/`) captures `keydown`/`keyup` once. Phaser scenes read movement desire + edge pulses — no scattered HUD keydown handlers for hotkeys.

Persistence: `localStorage` key `riftwilds-live-world-keybinds-v1`.

Settings UI: `/settings/keybinds`, Profile → Settings → Remap keys, in-world F2.

## Defaults

| Action | Keys |
|--------|------|
| Move | WASD + Arrows |
| Sprint | Shift |
| Interact | E / Space |
| World Map | M |
| Inventory / Pets / Journal / Skills / Character | I / P / J / K / C |
| Guild / Housing / Quests / Bag / Social | G / H / L / B / O |
| Target / Reply | T / R |
| Chat | Enter (`/` opens command mode) |
| Close | Esc |
| Hotbar | 1–9 |
| Help / Settings / Collision debug | F1 / F2 / F3 |

## Safety

- Movement/hotkeys disabled while chat input focused (WASD types letters)
- Modal panels (map, settings, interaction) block movement
- **Never steals** Ctrl/Cmd+C/V/R/L/T/W or F5
- F3 collision debug restricted in production unless `riftwilds-debug-allowed=1`

## Chat

- Enter focuses chat; Esc blurs/closes
- `/` slash commands: help, who, invite, leave, party, w/whisper, me, clear
- Sanitize (strip tags, length cap), client rate-limit stub
- Tabs: nearby / party / whisper / system

## Interaction menus

E near NPC/building/portal opens contextual menu (Talk / Inspect / Enter / Leave) instead of immediate single action where multi-option.

## Tests

`tests/unit/live-world-input.test.ts` — defaults, conflicts filter, protected chords, typing/modal movement lock.
