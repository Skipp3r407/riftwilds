# UI Guidelines — Reborn (TCG + Living World)

**Status:** Extends [UI_GUIDE.md](./UI_GUIDE.md) · [HUD_LAYOUTS.md](../gameplay/HUD_LAYOUTS.md)  
**Scope:** Product UX for **TCG-first launch**; preserve Live World immersive HUD for the future release.

## Principles

1. **TCG first** — Play hub, binder, and Rift Battle lead navigation; Living World stays linked/enterable in development (optional Coming Soon via flag before release).  
2. **Readable energy** — Rift Energy meter always visible during matches.  
3. **One job per panel** — hand, board, log; avoid dashboard clutter on the battle screen.  
4. **Brand / world art** — use Riftwilds affinity colors; avoid generic purple-glow defaults.  
5. **Accessibility** — large hit targets, reduced-motion respect (Framer patterns already in Arena UI).  
6. **No SOL pressure** — never show “connect wallet to play” on battle entry.  
7. **Soft-gate polish** — when Live World is closed, `/live-world` shows a clear future-update surface with CTAs back to TCG (never a 404).

## Surfaces

| Surface | Route | Notes |
|---------|-------|-------|
| Play hub | `/play` | TCG-first dashboard |
| TCG battle | `/tcg/battle` | Primary combat |
| Binder | `/tcg/collection` | Collection / decks |
| Live World | `/live-world` | Open in development; optional Coming Soon via `LIVE_WORLD_PUBLIC_ACCESS_ENABLED=false` |
| Arena (legacy) | `/arena/*` | Soft-secondary |

## Asset policy

UI chrome may use approved library / original art only. Third-party packs require registry approval; Kenmi-quality is a **bar**, not a license.
