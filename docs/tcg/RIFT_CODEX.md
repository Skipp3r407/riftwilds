# Rift Codex — Collection Book

> Premium interactive collection book (family-first). Original Riftwilds IP.  
> **Local session (2026-07-18):** playable shell shipped; Museum 3D + Neon tables deferred.

---

## Routes

| URL | Role |
|-----|------|
| `/tcg/codex` | Rift Codex book (TOC, species, stats, map, museum, binder) |
| `/tcg/codex/[familyId]` | Family two-page spread |
| `/tcg/collection` | Collection Book entry — same Codex shell |
| `/tcg/museum` | Museum Mode shell (exhibit placeholders) |

Classic flat binder remains as the **Binder** tab inside the Codex shell (and via Collection Book toolbar link).

---

## Architecture

| Layer | Path |
|-------|------|
| Book shell UI | `src/components/tcg/rift-codex/` |
| Family progress | `src/game/tcg/card-families.ts` |
| Local discovery store | `src/game/tcg/codex-progress.ts` (`localStorage`) |
| Stats + map | `src/game/tcg/codex-stats.ts` |
| Family content | `src/content/tcg/data/card-families.json` |
| Card chrome | `src/components/tcg/rift-card-frame.tsx` |
| DB proposal | `prisma/schema-proposals/rift-codex.prisma` (**not applied**) |

### Audio hooks

Interactive nodes expose `data-audio-cue` attributes for the audio bus, e.g.:

- `codex.book.open`
- `codex.page.turn`
- `codex.discovery.reveal`
- `codex.card.inspect`
- `codex.reward.claim`
- `codex.museum.enter`

Wire these in `docs/audio/AUDIO_SYSTEM.md` when SFX packs land.

---

## Product rules

- Structure may feel Pokédex-like; **no** Pokémon names, art, or mechanics copies.
- Completion rewards are **cosmetic / lore / titles only** (no P2W).
- Finishes (foil, goldleaf, crystal, animated) never grant competitive power.
- Respect `prefers-reduced-motion` for page-turn and card tilt.
- Long TOC lists scroll; portraits use `loading="lazy"`.

---

## Phased / deferred

| Item | Status |
|------|--------|
| Leather/parchment book + TOC % | Shipped |
| Family spreads + locked silhouettes | Shipped |
| Premium tilt card viewer | Shipped |
| Discovery cinematic (first open) | Shipped (short banner) |
| Stats + collection map shell | Shipped |
| Museum Mode polished shell | Shipped |
| Museum full 3D walkthrough | Deferred |
| Neon `TcgCodex*` tables | Proposal only — do not migrate prod |
| Server-synced discovery | Deferred (localStorage today) |
| Virtualized binder for 700+ cards | Partial (flat list capped at 120) |

---

## Preview (localhost)

- Codex: `http://localhost:3000/tcg/codex`
- Family: `http://localhost:3000/tcg/codex/family-ashwing`
- Museum: `http://localhost:3000/tcg/museum`
- Collection: `http://localhost:3000/tcg/collection`
