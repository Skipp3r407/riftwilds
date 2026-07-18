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
| pinned | Open by default |
| auto-hide | Opens on new messages / Enter |
| transparent | Lower panel opacity |
| collapsed | Starts closed |

Expand/Shrink is a float/resize stub on the chat header.

## Collapsible chrome

Persisted on `riftwilds-live-world-immersive-v1`:

| Flag | Widget |
|------|--------|
| `toolbarCollapsed` | Bottom immersion toolbar → peek tab |
| `presenceHudCollapsed` | Presence / social (bottom-left) |
| `townActivityCollapsed` | World pulse / population (top-right) |
| `statusChromeCollapsed` | Map status chips (top) |
| `minimapCollapsed` | Minimap (existing) |

Display settings can apply a mode-matched layout via `suggestedChromeCollapseForHudMode` (Immersive / Cinematic prefer peek tabs). Manual collapse toggles still persist across sessions. Auto-hide fades chrome; the toolbar peek stays faintly available in Immersive mode.

## Top-right stack

When the minimap corner is **top-right**, it shares a vertical column with **World pulse** (popular hubs / population) via `hud-slots.ts` — minimap above, pulse below — so they never paint on top of each other. Status chips reserve right padding on desktop. Moving the minimap to another corner leaves World pulse alone in the stack.

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
