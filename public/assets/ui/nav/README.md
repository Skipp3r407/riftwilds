# Riftwilds HUD navbar chrome

Legacy decorative PNGs from an earlier image-based command bar experiment.

| File | Role |
| --- | --- |
| `navbar-frame.png` | Desktop bezel / frame with transparent center cutout. |
| `navbar-bg.png` | Desktop plate texture. |
| `navbar-mobile.png` | Compact mobile bar plate. |

**Not wired into `SiteHeader`.** Stretching these full-bleed (`object-fit: fill`) warps the end-caps into glitch streaks and hurts link contrast. The live header uses a dark glass CSS HUD instead (`globals.css` → `.hud-nav`). Paths remain in `src/lib/assets/paths.ts` if you want sliced/fixed-width accents later.
