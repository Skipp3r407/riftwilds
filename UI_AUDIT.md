# Live World HUD — UI Audit & AAA Redesign Brief

**Scope:** `/live-world` in-game chrome (authenticated player assumed).  
**Constraint:** Local-only redesign of HUD/map/CSS/components. Auth/middleware untouched.  
**Date:** 2026-07-20

---

## 1. Current state (before)

### Composition (edge-docked widgets)

| Slot | Module | Weight issue |
|------|--------|--------------|
| Top-left | `status-bar` (region/weather) | Isolated chip; no currency/player merge |
| Top-center | Credits + Happening Now | Competing with status + utils |
| Top-right | Goals / Fullscreen / Menu pills | Equal visual weight to primary info |
| Mid-left | World Pulse | Extra floating card when collapsed peek still exists |
| Right column | Minimap → Nearby → Objectives → Presence | Stack of similar glass cards; objectives flat list |
| Bottom-left | Chat + Presence | Chat tabs incomplete; peek competes with presence |
| Bottom-center | Vital orbs + Action hotbar | Hotbar slots equal weight; no primary/secondary |
| Bottom-right | Radial icon row | 8 equal circles — no hierarchy |
| Overlay | Immersion toolbar (collapsed peek) | Third bottom chrome layer |

### Pain points (user + audit)

1. **Widget salad** — each panel is independently framed; no shared “magical device” language beyond basic glass.
2. **Equal-weight icons** — radial menu and hotbar treat Inventory and Wave the same.
3. **Minimap disconnected** — no compass ring, coords, day/night, weather, zoom, or ping chrome.
4. **Objectives thin** — daily-task list without rarity, distance, rewards, pin, or completion FX.
5. **Top bar fragmented** — area / weather / time / credits / notifications / utils live in 3 docks.
6. **Chat incomplete** — Nearby/Party/Whisper/System only; no Guild/Trade/Combat; limited link chrome.
7. **Terrain noise** — per-tile grass hash creates speckled pixel tiling vs hand-painted meadow patches.
8. **Hierarchy flat** — character, objectives, minimap, action bar, and chat compete at similar opacity/size.
9. **Motion** — limited enter/exit; few glow/pulse cues; reduced-motion only partially covered.

---

## 2. Target design language

**Name:** Rift Reliquary HUD  
**Metaphor:** Every panel is the same magical device — rounded fantasy glass, soft ink gradients, gold trim, animated border sheen, soft magical glow, depth shadow, subtle transparency.

### Tokens (CSS)

- `--lw-panel-bg` / `--lw-panel-bg-strong`
- `--lw-gold` / `--lw-gold-dim` / `--lw-trim`
- `--lw-glow-amber` / `--lw-glow-cyan` / `--lw-glow-emerald`
- `--lw-depth-1` … `--lw-depth-3` (shadow stacks)
- Hierarchy opacity: primary `1` → secondary `0.92` → tertiary `0.78`

### Motion

- Enter: fade + 6–10px slide + scale `0.97→1` (~220ms ease-out)
- Hover: soft gold glow pulse (not harsh pop)
- Quest complete / rare loot: scale + glow burst
- `@media (prefers-reduced-motion: reduce)` → opacity-only fades

### Visual hierarchy (reading order)

1. Character / interact prompt  
2. Objectives tracker  
3. Minimap cluster  
4. Action bar + vitals  
5. Chat  
6. Secondary (pulse, presence, radial, toolbar peek)

---

## 3. Module redesign map

| Module | File(s) | Change |
|--------|---------|--------|
| Design system | `globals.css` `.lw-hud-*` | Reliquary glass, animated trim, glow, depth, a11y |
| Chrome primitives | `hud-chrome.tsx` | `FantasyHudPanel`, tier classes, slot tiers |
| Top command bar | `top-command-bar.tsx` + shell | Merge area/weather/time/currency/notifs/utils |
| Status (legacy) | `status-bar.tsx` | Kept as collapsed fallback; shell prefers top bar |
| Minimap | `minimap.tsx` | Compass, coords, region, day/night, weather, zoom, ping |
| Objectives | `quest-tracker.tsx` + right column | Rarity, progress, distance, pin, rewards, FX hook |
| Player status | `player-status-dock.tsx` + vitals | Keeper HP/Energy, XP, companion, buffs, region |
| Action bar | `action-hotbar.tsx` | Primary / quick / utility tiers + cooldowns/DnD hooks |
| Radial | `world-radial-menu.tsx` | Primary ring vs secondary overflow |
| Chat | `chat-panel.tsx` + `chat.ts` | Guild/Trade/Combat tabs, opacity/font scale, links |
| FX layer | `hud-fx-layer.tsx` | Damage/heal, quest complete, loot, happiness |
| Interact | `dialogue-overlay.tsx` | Hold cue + distance/context chrome |
| Terrain | `premium-logic.ts`, `layered-terrain.ts` | Patch grass, softer blend, tree shadows, fog wash |
| Slots | `hud-slots.ts` | Top-bar + ultrawide/tablet/mobile spacing |
| Shell | `live-world-shell.tsx` | Wire modules; preserve gameplay bridges |

---

## 4. Accessibility & performance

- Focus rings on all interactive HUD controls (`focus-ring` / cyan outline)
- Large UI + high contrast settings respected via `HudLayer`
- Reduced motion: disable border sheen, scale, pulse
- Target 60fps: CSS animations only (no layout thrash); terrain patch logic is O(cells) once at paint
- Touch targets ≥ 44px on mobile for primary slots

---

## 5. Responsive targets

| Viewport | Notes |
|----------|-------|
| 1080p | Reference composition |
| 1440p / 4K | Scale via large-UI + slightly wider right column |
| Ultrawide | Top bar max-width centered; side stacks stay edge-docked |
| Tablet | Collapse radial secondary; hotbar wraps one row |
| Mobile | Peek tabs; vitals+primary slots; chat peek |

---

## 6. Before → after (summary)

| Before | After |
|--------|-------|
| Separate floating chips | Unified Reliquary panels |
| Flat minimap square | Framed compass device with metadata strip |
| Task list | Animated quest tracker with rarity/progress |
| 3 top docks | One top command bar |
| Equal hotbar icons | Primary / secondary / utility tiers |
| 4 chat tabs | 7 channels + chrome controls |
| Speckled grass tiles | Soft meadow patches + painterly blend |

---

## 7. Preview

1. Run `npm run dev`
2. Sign in (auth gate may apply)
3. Open **`/live-world`** → Enter the Live World
4. Inspect top command bar, minimap frame, objectives, bottom dock, chat tabs

**Local only** — no commit / push / deploy from this workstream.
