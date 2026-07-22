# Phone Portrait Battle

**Viewport:** `phone-portrait` (≈320–640 CSS px, portrait).

## Layout

1. **Top bar** — HP · Energy · Deck · Menu only
2. **Stage** — foe status → foe field → phase → your field → your status
3. **Hand** — horizontal carousel (never unreadably small)
4. **Floating dock** — Play / End / Cmd / Pass / Undo / Set / Menu
5. **Intel / Feed** — collapsible drawers (swipe R / L)

Scroll is allowed when content overflows; prefer collapsing panels over nested scroll traps.

## Landscape prompt

On match start in phone-portrait, a soft banner recommends rotating to landscape.  
**Never forced** — dismiss for session or “Don’t show again” (`sessionStorage` / `localStorage`).

## Preview

DevTools → iPhone SE or Pixel 5 portrait → `/tcg/battle?mode=practice&board=1`.
