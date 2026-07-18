# Fullscreen / Immersive HUD QA

## Automated

```bash
npm run test:unit -- tests/unit/live-world-immersive.test.ts
npm run test:unit -- tests/unit/live-world-input.test.ts
```

Covers settings normalize/persist, HUD tick/reveal, fullscreen helpers, particle scale, photo toggle, keybind presence.

## Manual checklist

### Fullscreen

- [ ] Enter Live World → toolbar **Fullscreen** expands to fill display
- [ ] `F` and `Alt+Enter` toggle enter/exit
- [ ] Label switches Enter ↔ Exit
- [ ] Esc pause menu fullscreen toggle works
- [ ] Display settings fullscreen toggle works
- [ ] When API denied / unavailable, viewport-expand still fills (no letterbox bars)
- [ ] Exit world returns to page layout and leaves fullscreen
- [ ] Multi-monitor: host follows the monitor of the browser window (OS/browser behavior)

### HUD modes

- [ ] Standard shows status, minimap, chat, zoom, toolbar
- [ ] Minimal hides minimap / zoom extras
- [ ] Immersive auto-hides; mouse move reveals
- [ ] Cinematic stays clear until chat/dialogue/menu
- [ ] `U` cycles modes; preference persists after reload

### Chat / minimap

- [ ] Chat transparent / collapsed / expand stub
- [ ] Minimap collapse, hide, corner move, lock, opacity/size from Display panel

### Camera

- [ ] Wheel / +− zoom still works in fullscreen
- [ ] `Y` focuses companion; press again restores Keeper
- [ ] Photo mode (`N`) hides HUD; Esc exits photo without trapping

### Accessibility / performance

- [ ] Reduced motion lengthens auto-hide and skips fade
- [ ] Large UI / high contrast flags apply to HUD layers
- [ ] Particle budget minimal suppresses fireflies/rain when prefs set

### Regression

- [ ] Multiplayer / local movement / chat / emotes / map unaffected
- [ ] Esc still closes equipment → settings → pause in order
