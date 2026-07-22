# Responsive Battle Layouts

Intentional layouts by viewport class (`data-battle-viewport` on `<html>` and `.battle-console`).

## Classes

| Class | Typical band | Layout intent |
|-------|--------------|---------------|
| `phone-portrait` | 320–640, portrait | Stacked panels; scroll only if needed |
| `phone-landscape` | 640–932, landscape | **Preferred mobile:** enemy / board / player / hand / action bar — no scroll |
| `tablet-portrait` | 768–1024, portrait | Board-dominant; hand bottom; intel/feed drawers; swipe |
| `tablet-landscape` | 1024–1366, landscape | Centered board; larger cards; collapsible panels; FAB |
| `desktop` | 1920–2559 (also 1367–1919 fallback) | Flagship Focus Mode 15/70/15 |
| `large` | 2560+ | Flagship + minor stage growth |

Resolver: `src/lib/tcg/battle-viewport.ts` → `resolveBattleViewport()`.

## Document attributes

| Attribute | Values |
|-----------|--------|
| `data-battle-viewport` | classes above |
| `data-hand-mode` | `fan` \| `tablet-fan` \| `carousel` |
| `data-battle-perf` | `high` \| `balanced` \| `battery` |
| `data-battle-large-card` | `true` / `false` |
| `data-battle-one-hand` | `true` / `false` |
| `data-battle-high-contrast` | `true` / `false` |
| `data-battle-hand-expanded` | `true` / `false` |

Existing Focus Mode attrs (`data-battle-focus`, `data-battle-layout`, …) are unchanged.

## Preview in DevTools

1. Open `/tcg/battle?mode=practice&board=1`
2. DevTools → Toggle device toolbar
3. Suggested presets:
   - iPhone SE / 390×844 → phone-portrait
   - iPhone 14 Pro landscape (~932×430) → phone-landscape
   - iPad Mini portrait (768×1024) → tablet-portrait
   - iPad landscape (1180×820) → tablet-landscape
   - Responsive 1920×1080 → desktop
   - Responsive 2560×1440 → large

## CSS entry

`src/app/globals.css` — section **Mobile & Tablet Battle Experience**.
