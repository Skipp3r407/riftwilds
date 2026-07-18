# Riftwilds 2.5D + Immersive HUD Overhaul — Audit

> Phase 1 snapshot before / during the Commons visual + chrome pass.  
> Original IP only — aligns with [ART_DIRECTION.md](./ART_DIRECTION.md) and [LIVING_TOWNS.md](./LIVING_TOWNS.md).

## Preserve (do not regress)

Movement · multiplayer stubs · chat · World Pulse · nearby · daily tasks · Presence XP · minimap · currency · housing · neighborhoods · events · interactions · mobile/desktop.

## Priority backlog → status

| # | Item | Status |
|---|------|--------|
| 1 | Nearby → badge + drawer | Done |
| 2 | Daily tasks → max 3 pinned objectives | Done |
| 3 | Chat shrink + hide input until Enter | Done |
| 4 | Happening Now compact / auto-shrink; Pulse collapsible | Done |
| 5 | Exit → system menu; Fullscreen icon+tooltip | Done |
| 6 | Compact region/weather/time/channel | Done |
| 7 | Consolidated bottom action bar + orbs | Done |
| 8 | Collapse Level-2 panels by default | Done |
| 9 | No Hub scores / internal zone jargon in player UI | Done |
| 10 | Terrain blend / less tile grid | Done |
| 11 | Layered buildings (foundation/wall/roof/shadow) | Done |
| 12 | Streets / alleys / fences / courtyards | Done (procedural furniture) |
| 13 | Character +20% scale, shadows, depth sort | Done |
| 14 | Roof fade when occluding player | Done (extended) |

## Phases

1. **Audit** — this doc + `docs/rendering/DEPTH_SYSTEM.md`
2. **UI cleanup** — right column, chat, status, system menu, defaults
3. **Depth foundation** — bands, occluders, ground anchors
4. **Environment** — terrain blend, walls, street furniture
5. **Characters** — scale, shadows, actor-band Y-sort
6. **Quality presets** — Low default; Ultra opt-in
7. **Polish** — a11y toggles retained; HUD edit (drag) retained; tests

## Gaps / honest backlog

- Hand-authored multi-layer building sheets (foundation/wall/roof textures) still use procedural massing over facade cutouts.
- Nearby list remains hub-activity stubs until multiplayer nameplates ship (labels only — no scores).
- Ultra vegetation layers are budget-gated stubs pending denser prop packs.
