# AAA UI Roadmap — Riftwilds Full-Game Presentation

> **Status:** Phase A complete + Phase B largely shipping locally (2026-07-18).  
> **Constraint:** Local only — no commit/push/deploy unless requested.  
> **Tone:** Dark fantasy · ancient magical civilization · cinematic · handcrafted materials.  
> **Non-goals:** Copyrighted frames/logos; pay-to-win chrome; comics route rewrites (parallel workstream).

---

## 1. Audit summary (current → target)

| Area | Today (local) | Target |
|------|---------------|--------|
| Tokens | Material + rarity + motion + z-layers in `globals.css` | Keep; expand finish tokens as needed |
| Panels / buttons | `RiftPanel` / `RiftButton` materials | Migrate remaining `.panel` TCG surfaces |
| Nav | Soft glow on active + bar depth | Optional brand-mark asset polish (Phase D) |
| Route atmosphere | `RiftPageShell` moods | Per-surface illustration plates (Phase D) |
| Cards | `RiftCardFrame` on binder / deck / packs / journal | Same frame in battle hand tiles |
| Collection | Collection Book + Flat + Codex | Done for Phase B |
| Card inspect | Lore Journal modal (filled) | Done for Phase B |
| Deck builder | Atelier with AAA cards + materials | Drag-drop polish remains |
| Battle | Atmosphere shell + existing console | Lane / energy material pass |
| Shop packs | Merchant hall + pack ritual | Catalog card skins |
| Meta | Play / Profile / Quests shells | Guild / tournaments / settings |

---

## 2. Design system locations

| Asset | Path |
|-------|------|
| CSS tokens + materials | `src/app/globals.css` |
| Shared primitives | `src/components/ui/rift-panel.tsx`, `rift-button.tsx`, `rift-page-shell.tsx` |
| Motion helpers | `src/components/ui/rift-motion.ts` |
| Card chrome | `src/components/tcg/rift-card-frame.tsx` |
| Collection / Codex | `src/components/tcg/collection-book.tsx`, `codex-page.tsx` |
| Lore Journal | `src/components/tcg/tcg-card-detail-modal.tsx` |
| Pack ritual | `src/components/tcg/pack-opening.tsx` |
| Inventory doc | `docs/ui/COMPONENT_INVENTORY.md` |
| UI art prompts | `docs/ui/ASSET_PROMPTS.md` |

---

## 3. Phased plan

### Phase A — Foundation ✅ (this session)
1. Tokens: materials, rarity, motion durations, z-layers  
2. `RiftPanel` / `RiftButton` / `RiftPageShell`  
3. Nav glow polish  
4. Screen atmospheres via shell `mood`  
5. Thematic cursors (prior)  

### Phase B — TCG surfaces ✅ / polish remaining
1. ✅ Collection Book / Flat + AAA cards  
2. ✅ Codex bond-line pages  
3. ✅ Card detail → Lore Journal  
4. ✅ Deck Atelier material + `RiftCardFrame` catalog  
5. ⬜ Battle console deeper material pass (atmosphere done)  
6. ✅ Pack opening + merchant framing  

### Phase C — Meta screens (partial)
- ✅ Play hub, Profile, Quests shells started  
- ⬜ Guild, Tournaments, Leaderboards, Settings  

### Phase D — Asset fill
Generate banners / icons / desk plates from `docs/ui/ASSET_PROMPTS.md` via asset pipeline.

---

## 4. Performance rules

- Prefer CSS materials over heavy canvas  
- Framer Motion with `useReducedMotion`  
- Flat binder grids: slice / virtualize beyond ~120 tiles  
- Lazy-load Codex art; keep card faces `object-fit: cover`  
- Do not block TCG APIs on presentation components  

---

## 5. Preview URLs (local)

| Surface | URL |
|---------|-----|
| Play hub | http://localhost:3000/play |
| Collection Book | http://localhost:3000/tcg/collection |
| Codex example | http://localhost:3000/tcg/codex/family-ashwing |
| Deck Atelier | http://localhost:3000/tcg/deck-builder |
| Practice Board | http://localhost:3000/tcg/battle |
| Merchant + pack ritual | http://localhost:3000/shop/packs |
| Quests | http://localhost:3000/quests |
| Profile | http://localhost:3000/profile |

---

## 6. Acceptance bar

- First viewport of Collection/Battle/Deck reads as one crafted composition  
- Cards: ~70% art, compact info, rarity glow  
- No empty “flat popup” inspect  
- Finishes labeled cosmetic  
- Functionality (battle actions, deck save, binder load) unchanged  

---

## 7. Remaining work (priority)

1. Battle hand / lane tiles → `RiftCardFrame`  
2. Virtualize flat binder >120  
3. Guild / tournament / settings material pass  
4. Phase D UI illustration generation  
5. Optional: migrate Live World HUD to materials (separate stream)  
