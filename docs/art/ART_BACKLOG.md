# Art Backlog — Honest Inventory

This pass ships a **master art bible**, **theme tokens**, and a **Commons showcase shift** — not 100% of every asset in the game.

## Shipped this art-direction pass

- [x] Master docs (`ART_DIRECTION`, `STYLE_GUIDE`, `COLOR_PALETTE`, `LIGHTING_GUIDE`, `ENVIRONMENT_GUIDE`, `RIFTLING_GUIDE`, `UI_GUIDE`, `ANIMATION_GUIDE`)
- [x] CSS / theme tokens toward warm fantasy + cyan/amber accents
- [x] Commons atmosphere lighting (warmer day/night, torch polish)
- [x] Terrain tint + vegetation/prop density bump
- [x] Live World HUD glass → parchment/stone-leaning chrome (layout preserved)
- [x] Generator style suffix aligned to bible
- [x] Icon audit notes + priority list (below)

## Commons — remaining polish

| Item | Priority | Notes |
|------|----------|-------|
| Hand-authored 4-dir walk sheets (named 10) | High | Procedural sheets interim |
| Behavior activity loops | Medium | Forge / market / hatchery |
| Water UV shimmer | Medium | LOD-safe |
| Enterable building interiors art | Medium | Gameplay stubs exist |
| More unique tree/bush variants | Low | Density up; variety still limited |

## Non-Commons hubs

| Hub | Status |
|-----|--------|
| Ember Forge / Moonwater / Elderwood / … | Portrait kits often exist; world sheets may be bust-derived |
| Enemy overworld sprites | Partial |
| Region premium terrain packs | Not started (reuse Commons pipeline) |

## Site-wide assets

| Area | Status |
|------|---------|
| Marketing heroes / About comic | Mixed quality; re-prompt under new suffix |
| Hatchery UI illustrations | Functional; warm chrome next |
| Item / weapon icons | Many exist; spotty style consistency |
| Ability / effect VFX | Placeholders remain |
| Emote art | Manifest-driven; continue under bible |

## Icon consistency — worst placeholders (regenerate next)

1. Generic Lucide-only clusters on loyalty / treasury where custom icons expected  
2. Any purple-glow ability icons leftover from early tech theme  
3. Empty-state illustrations that look like stock dashboards  
4. Mismatched marketplace category icons  
5. Mobile nav icons if still monochrome system-only  

Grade A target: illustrated metal/wood/ink set matching [UI_GUIDE](./UI_GUIDE.md).

## Performance backlog

- Prop LOD by camera distance  
- Chunk streaming for props outside view  
- Atlas packing for NPC sheets  
- Further particle caps on mobile “low”

## Definition of “whole game art done” (future)

Not claimed now. Requires: all hubs premium, all species kits, combat VFX pass, full icon set grade A, interiors, and hand-authored locomotion for key cast.
