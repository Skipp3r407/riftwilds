# Riftwilds Commercial — Generation Report (Colorful Comic + Creatures)

**Date:** 2026-07-18  
**Style:** Colorful comic-book cinematic (navy/cyan/amber + affinity) + music + AI narrator  
**Git:** No commit / no push (awaiting explicit approval)

---

## Summary

Replaced noir/spot-color comic frames with **full-color graphic-novel panels** featuring recognizable catalog Riftlings (Glowpup hatchery companion + launch species art references). Rebuilt all cutdowns via `npm run commercials:build`, preserving existing VO pipeline and music+narrator ducking mix.

---

## Species featured

| Species | Role in commercials |
|---------|---------------------|
| Glowpup | Hatchery birth hero (ambient hatchery companion art) |
| Cindercub | Ember companion / battle |
| Mossprig | Grove companion / Live World explore |
| Bubbloon | Tide companion / plaza & explore |
| Voltkit | Storm battle opponent |
| Riftpup | Commons adventure companion |
| Luminara | Radiant floater / splash & poster |
| Gearling | Alloy explorer |
| Wisplet | Spirit marsh explore |

Reference art: `public/assets/pets/*.png` + `public/assets/npcs/riftwild-commons/riftling-hatchery-glowpup/`.

---

## Delivered

### Comic frames

`public/assets/commercials/storyboards/comic/`

- `comic-01-rift-splash.png` — colorful rift vista + Glowpup / Cindercub / Luminara / Mossprig
- `comic-02-hatch-panels.png` — Glowpup hatch sequence + Cindercub
- `comic-03-battle-action.png` — Cindercub vs Voltkit
- `comic-04-liveworld-page.png` — Live World page (Riftpup, Mossprig, Bubbloon, Luminara, Gearling, Wisplet)
- `comic-05-endcard-egg.png` — end card creature cluster
- Vertical + square variants (`comic-v*`, `comic-s01`)

### Video

| File | Spec | Audio |
|------|------|-------|
| `riftwilds-commercial-60s-16x9.mp4` | 60s · 1920×1080 | Magic Space + VO ducked |
| `riftwilds-commercial-30s-9x16.mp4` | 30s · 1080×1920 | Airy + VO |
| `riftwilds-commercial-15s-9x16-teaser.mp4` | ~15s · 1080×1920 | Sector + VO |
| `riftwilds-commercial-25s-1x1.mp4` | ~25s · 1080×1080 | Airy + VO |
| `riftwilds-header-loop-12s-16x9-muted.mp4` | 12s muted | none |

### Rebuild

```bash
# Frames already in storyboards/comic/ — rebuild video only (keeps current VO):
npm run commercials:build

# Full VO regenerate + build:
npm run commercials:all
```

---

## Coordination note

VO files under `public/assets/commercials/audio/*-vo.m4a` were left intact (parallel narrator work). This pass only replaced comic frames + remuxed MP4s.
