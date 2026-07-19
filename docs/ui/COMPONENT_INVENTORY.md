# Riftwilds AAA UI — Component Inventory

Reusable presentation primitives for the dark-fantasy TCG. Prefer these over ad-hoc `rounded-xl border bg-black` boxes.

## Foundation

| Component | Path | Role |
|-----------|------|------|
| `RiftPanel` | `src/components/ui/rift-panel.tsx` | Obsidian / marble / gold / arcane material panels + filigree |
| `RiftButton` | `src/components/ui/rift-button.tsx` | Gold / arcane / obsidian / ghost CTAs |
| `RiftPageShell` | `src/components/ui/rift-page-shell.tsx` | Per-route atmosphere (library, atelier, battle, merchant, hearth) |
| Motion presets | `src/components/ui/rift-motion.ts` | Framer Motion fade/scale/modal/stagger (use with `useReducedMotion`) |
| Tokens + materials CSS | `src/app/globals.css` | `--mat-*`, `--rarity-*`, `.rift-material-*`, `.rift-btn`, `.rift-page-*` |
| Cursors | `src/components/shared/rift-cursor.tsx` + `public/assets/ui/cursors/` | Thematic fine-pointer cursors |

## TCG surfaces

| Component | Path | Role |
|-----------|------|------|
| `RiftCardFrame` | `src/components/tcg/rift-card-frame.tsx` | AAA card chrome (~70% art, rarity glow, finishes) |
| `RiftCodexShell` | `src/components/tcg/rift-codex/rift-codex-shell.tsx` | Premium leather/parchment Collection Book |
| `CodexFamilySpread` | `src/components/tcg/rift-codex/codex-family-spread.tsx` | Two-page family lore + variants |
| `CodexCardViewer` | `src/components/tcg/rift-codex/codex-card-viewer.tsx` | Tilt/foil inspect surface |
| `MuseumHall` | `src/components/tcg/rift-codex/museum-hall.tsx` | Museum Mode exhibit shell |
| `CollectionBook` | `src/components/tcg/collection-book.tsx` | Species tiles + Flat Binder (embeddable) |
| `CodexPageView` | `src/components/tcg/codex-page.tsx` | Legacy single-column Codex journal |
| `TcgCardDetailModal` | `src/components/tcg/tcg-card-detail-modal.tsx` | Lore Journal inspect (never empty) |
| `DeckBuilder` | `src/components/tcg/deck-builder.tsx` | Deck Atelier command center |
| `PackOpeningShell` | `src/components/tcg/pack-opening.tsx` | Merchant pack ritual reveal |
| `RiftBattleBoard` | `src/components/tcg/rift-battle-board.tsx` | Practice battle console |

## Legacy (still valid; migrate opportunistically)

| Primitive | Notes |
|-----------|-------|
| `.panel` / `.btn-primary` | Existing HUD glass — keep for Live World / older routes |
| `ImageButton` | Skinned buttons with asset backs |
| `PageHeader` | Shared kicker/title/status |
| `HudAtmosphere` | Site-wide vignette + cursor glow |

## Usage rules

1. New TCG / meta screens: `RiftPageShell` + `RiftPanel` + `RiftButton`.
2. Card faces: always `RiftCardFrame` (binder, deck, packs, battle inspect).
3. Inspect: always `TcgCardDetailModal` Lore Journal — never a blank dialog.
4. Motion: import presets from `rift-motion.ts`; skip when `useReducedMotion()`.
5. Comics routes: do not restyle unless explicitly requested.
