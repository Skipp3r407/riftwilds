# Live World HUD Layouts

## Modes

| Mode | Behavior |
|------|----------|
| **Standard** | Full chrome; opacity slider applies |
| **Minimal** | Status, toolbar, chat only |
| **Immersive** | Auto-hide all chrome; mouse / key / combat / message / quest reveals |
| **Cinematic** | HUD opacity 0 unless combat/message/quest/menu briefly reveals |

Cycle with toolbar **HUD** or keybind `U` (`cycleHudMode`).

## Auto-hide

Implemented in `hud-visibility.ts` + `useHudAutoHide`:

- Reveal reasons: `pointer`, `key`, `combat`, `message`, `damage`, `quest`, `menu`, `manual`
- Delay from settings (`autoHideDelayMs`, min 4s when reduced motion)
- Fade transition skipped when reduced motion is on

### Floating center chips

World clock, interact prompt, and Happening Now use `floating-chip-fade.ts` + `FloatingHudChip`:

- Idle-fade to ~5–15% opacity (mode-dependent) while staying hoverable via hit-slop
- Hover / focus / tap restores full opacity and resets the timer
- Content changes (new interact target, weather/region, event phase) flash fully visible
- Forced in Immersive / Cinematic; Standard only when Auto-hide HUD is enabled
- Bottom HUD peek stays more persistent (`max(opacity, 0.45)` when collapsed)

### Site nav on `/live-world`

`site-nav-autohide.ts` + `SiteHeader`: after ~2.8s idle the command bar slides up / fades; a thin top hot-zone (or hover near the top) reveals it again. Dropdowns and the mobile drawer pin the nav open while in use.

## Chat modes

| Mode | Behavior |
|------|----------|
| pinned | Open by default; stays open (header pin toggle) |
| auto-hide | Peek tab by default; Enter / peek / `/` opens compose; idle (~6s), Esc, or click-outside returns to peek; new messages flash an unread badge on the peek (do not force the panel open) |
| transparent | Same auto-hide behavior with lower panel opacity |
| collapsed | Starts closed |

Expand/Shrink is a float/resize stub on the chat header. `typingFocused` is set only while the compose `<input>` is focused so WASD keeps working when the log is visible.

## Collapsible chrome

Persisted on `riftwilds-live-world-immersive-v1`:

| Flag | Widget |
|------|--------|
| `toolbarCollapsed` | Bottom immersion toolbar → peek tab |
| `presenceHudCollapsed` | Presence / social (bottom-left) |
| `townActivityCollapsed` | World pulse (mid-left) |
| `statusChromeCollapsed` | Location / weather (top-left) |
| `minimapCollapsed` | Minimap (existing) |

Display settings can apply a mode-matched layout via `suggestedChromeCollapseForHudMode` (Immersive / Cinematic prefer peek tabs). Manual collapse toggles still persist across sessions. Auto-hide fades chrome; the toolbar peek stays faintly available in Immersive mode.

## Reference composition (Reliquary HUD)

See root `UI_AUDIT.md` for the full AAA redesign brief.

| Slot | Content |
|------|---------|
| Top center | **Top command bar** — region, weather/time, credits, notifications, goals, fullscreen, menu |
| Top under-bar | Happening Now (secondary) |
| Mid-left | World Pulse (world-events + community stubs) |
| Bottom-left | Chat (7 tabs) + presence peek (`flex-col-reverse` stack) |
| Right column | Minimap (compass/coords/weather) → nearby → **quest tracker** → presence |
| Bottom-center | Player status + vitals orbs + tiered action hotbar |
| Bottom-right | Radial menu — primary shortcuts + expandable secondary |

Center stays clear for the world. Site nav auto-hide on `/live-world` and floating-chip idle-fade remain coordinated (do not revert).

## Right column + mid-left stacks

When the minimap corner is **top-right**, it docks in the **right column** with nearby/tasks/status via `hud-slots.ts`. **World Pulse** docks **mid-left** (not under the minimap). Status chrome reserves right padding on desktop.

## Free-form panel drag

Major chrome panels can be repositioned by dragging the header grip (mouse or touch):

| Panel | Id |
|-------|----|
| Minimap | `minimap` |
| World pulse | `townActivity` |
| Chat | `chat` |
| Presence / XP | `presence` |
| Immersion toolbar | `toolbar` |

Positions persist on `riftwilds-live-world-immersive-v1` under `hudPanelLayout` (`{ x, y }` px relative to the game host). Panels clamp to the viewport and soft-snap to edges. Collapse / peek tabs and button clicks stay interactive (`data-no-drag`). **Reset layout** in Display settings clears custom positions and restores the top-right minimap dock.

## In-world nameplates

Hub / portal / building / NPC labels use `world-nameplates.ts`: distance fade (hubs farther than NPCs) + deterministic vertical stacking when anchors overlap. No random jitter; offsets lerp softly.

## Minimap

Settings + on-widget controls:

- Hide / collapse / opacity / size
- Corner cycle (move)
- Lock (disables click-to-map + mode buttons)

## Accessibility hooks

- **Reduced motion** — longer auto-hide, no opacity transition
- **Large UI** — scales HUD layers (~1.12)
- **High contrast** — CSS contrast/brightness bump on HUD layers

## Code map

| Piece | Path |
|-------|------|
| Types / defaults | `src/game/live-world/systems/immersive/types.ts` |
| Persist | `…/settings.ts` |
| Visibility | `…/hud-visibility.ts` |
| Shell wiring | `src/components/live-world/live-world-shell.tsx` |
| Settings UI | `immersive-settings-panel.tsx` |
