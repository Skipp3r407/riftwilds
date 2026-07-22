# Mobile UI Guidelines (Battle)

Dedicated **Mobile & Tablet Battle Experience** — not a shrunk desktop console.

## Principles

- Desktop (≥1920) remains the flagship Immersive / Focus Mode layout
- Phone landscape is the **preferred** mobile battle posture
- Touch targets ≥ **48×48** CSS px
- Hand must stay readable: desktop fan · tablet larger fan · phone carousel
- Preserve Focus Mode, energy affordability dimming, mulligan overlay, site docks

## Breakpoints

See [RESPONSIVE_LAYOUTS.md](./RESPONSIVE_LAYOUTS.md).

## Surfaces by class

| Surface | Desktop | Tablet | Phone |
|---------|---------|--------|-------|
| Match Intel / Event Feed | Side rails | Collapsible + FAB | Drawers + swipe |
| Hand | Fan | Larger fan | Horizontal carousel |
| Actions | Command bar | Floating dock | Floating dock |
| Top chrome | Full header utils | Compact header | HP · Energy · Deck · Menu |

## Do / Don’t

**Do:** use `data-battle-viewport`, safe-area insets, landscape recommend (never force).  
**Don’t:** scale the 15/70/15 desktop grid onto a phone, shrink hand cards unreadably, or change match-engine / draw rules for layout.

## Related

- [TOUCH_CONTROLS.md](./TOUCH_CONTROLS.md)
- [PHONE_LANDSCAPE.md](./PHONE_LANDSCAPE.md) · [PHONE_PORTRAIT.md](./PHONE_PORTRAIT.md)
- [TABLET_LAYOUTS.md](./TABLET_LAYOUTS.md)
- [ACCESSIBILITY_MOBILE.md](./ACCESSIBILITY_MOBILE.md)
- [PERFORMANCE_PROFILE.md](./PERFORMANCE_PROFILE.md)
