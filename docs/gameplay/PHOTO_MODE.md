# Live World Photo Mode

Presentation stub for capturing scenic frames without leaving the session.

## Behavior

- Toggle: toolbar **Photo**, keybind `N` (`togglePhotoMode`), or Display stubs
- Hides HUD chrome; shows a single **Exit photo mode** control
- Sets bridge `photoMode` + cinematic flags so iso-camera uses smoother follow
- Capture stub returns a logical `shotId` (canvas export / achievement hook later)
- Achievement catalog already has `photo_mode_shot` for a future unlock

## Exit (never trapped)

- Esc
- `N` again
- Exit photo button
- Exit world (also clears fullscreen)

## Camera stubs (not yet wired)

Documented in `camera-enhancements.ts`:

- Free look pan
- Orbit rotate (presentation only)
- Cinematic dolly paths

**Live today:** smooth zoom (existing), Riftling focus (`Y` → `bridge.queueCameraFocus("riftling")`).

## Related

- [FULLSCREEN_MODE.md](./FULLSCREEN_MODE.md)
- Achievement key: `photo_mode_shot` in `src/game/achievements/catalog.ts`
