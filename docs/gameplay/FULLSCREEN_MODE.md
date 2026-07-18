# Live World Fullscreen & Immersive Display

Client-side presentation for filling the display, auto-hiding HUD chrome, and cinematic camera prefs. Multiplayer networking is untouched — this layer is React overlay + light camera focus queues.

## Entry points

| Surface | Control |
|---------|---------|
| Live World toolbar | Fullscreen / HUD / Photo / Display |
| Corner chrome | Compact fullscreen + Exit world |
| Esc pause menu | Enter/Exit fullscreen, Display & HUD |
| Keybinds panel | Compact fullscreen toggle |
| Display settings | Window preference + all HUD knobs |

## Shortcuts

| Input | Action |
|-------|--------|
| `F` | Toggle fullscreen (rebinding supported) |
| `Alt+Enter` | Toggle fullscreen |
| `F11` | Browser-owned; we sync after change when permitted |
| `U` | Cycle HUD mode |
| `Y` | Focus Riftling camera / restore Keeper |
| `N` | Photo mode |
| `Esc` | Exit photo → close panels → pause (never traps) |

Controller mappings are documented stubs in `controller-stubs.ts`.

## Window modes

1. **browser-fullscreen** — Fullscreen API on the Live World host (`requestFullscreen`), with vendor prefixes.
2. **viewport-expand** — Fallback / preference: `fixed inset-0` host so the Phaser `Scale.RESIZE` canvas fills the viewport with no letterbox.
3. **windowed** — Embedded panel (`min(72vh, 720px)`).

If the Fullscreen API is missing or denied, enter falls back to viewport-expand.

## Persistence

`localStorage` key `riftwilds-live-world-immersive-v1` stores HUD mode, opacity, auto-hide, window preference, chat/minimap prefs, accessibility, and particle budget.

## Exit safety

- Esc exits photo mode before pause.
- Leaving the world calls `exitFullscreen()`.
- Browser Esc / chrome exit is honored via `fullscreenchange`.

## Related

- [HUD_LAYOUTS.md](./HUD_LAYOUTS.md)
- [PHOTO_MODE.md](./PHOTO_MODE.md)
- [FULLSCREEN_QA.md](../testing/FULLSCREEN_QA.md)
