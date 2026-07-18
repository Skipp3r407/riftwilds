# Riftwilds Commercial Shot List

Production notes for edit / re-render. Durations match `scripts/commercials/build-commercials.mjs`.  
**Style (v3):** colorful comic-panel cinematic featuring catalog Riftlings — frames in `storyboards/comic/`. Audio: music + VO with ducking. See `COMIC_COMMERCIAL_AUDIO.md`.

## A. 60s cinematic · 1920×1080 · 30fps

| # | Shot | Duration | Move | Source | Audio |
|---|------|----------|------|--------|-------|
| A01 | Rift vista open | 7.0s | zoom in | sb-01 | VO line 1 + Magic Space bed |
| A02 | Hatchery egg | 5.5s | pan right | sb-02 | VO line 2 |
| A03 | First hatch | 5.5s | zoom in | sb-03 | VO line 3 |
| A04 | Live World commons | 6.5s | pan left | sb-04 | VO line 4 |
| A05 | NPC quest | 5.0s | pan right | sb-05 | VO line 5 |
| A06 | Battle arena | 5.0s | zoom in | sb-06 | VO line 6 |
| A07 | Crafting | 4.0s | pan left | sb-07 | VO line 7 |
| A08 | Housing | 4.0s | pan right | sb-08 | VO line 8 |
| A09 | Guild event | 5.0s | pan up | sb-09 | VO line 9 |
| A10 | Player market | 5.0s | pan left | sb-10 | VO line 10 |
| A11 | End card egg | 7.5s | soft zoom | sb-11 | VO CTA |

**Deliverable:** `video/riftwilds-commercial-60s-16x9.mp4`  
**Captions:** `captions/riftwilds-commercial-60s.vtt`

## B. 30s social · 1080×1920

| # | Shot | Duration | Source |
|---|------|----------|--------|
| B01 | Vertical rift | 5s | sb-v01 |
| B02 | Vertical hatch | 5s | sb-v02 |
| B03 | Vertical explore | 5s | sb-v03 |
| B04 | Battle | 5s | sb-06 (reframed) |
| B05 | Guild | 5s | sb-09 |
| B06 | End card | 5s | sb-11 |

**Music:** `airy.mp3` bed  
**Deliverable:** `video/riftwilds-commercial-30s-9x16.mp4`

## C. 15s teaser · 1080×1920

| # | Shot | Duration | Source |
|---|------|----------|--------|
| C01 | Vertical rift | 4s | sb-v01 |
| C02 | Hatch | 4s | sb-v02 |
| C03 | Explore | 3.5s | sb-v03 |
| C04 | End card | 3.5s | sb-11 |

**Music:** `sector.mp3` bed  
**Deliverable:** `video/riftwilds-commercial-15s-9x16-teaser.mp4`

## D. 25s square · 1080×1080

| # | Shot | Duration | Source |
|---|------|----------|--------|
| D01 | Square hero | 5s | sb-s01 |
| D02 | Hatch | 5s | sb-03 |
| D03 | Square battle | 5s | sb-s02 |
| D04 | Commons | 5s | sb-04 |
| D05 | End card | 5s | sb-11 |

**Music:** `airy.mp3` bed  
**Deliverable:** `video/riftwilds-commercial-25s-1x1.mp4`

## E. 12s muted header · 1920×1080

| # | Shot | Duration | Source |
|---|------|----------|--------|
| E01 | Loop sky | 6s | sb-header-loop-sky |
| E02 | Rift vista | 6s | sb-01 |

**Audio:** none (muted)  
**Deliverable:** `video/riftwilds-header-loop-12s-16x9-muted.mp4`  
**Site use:** atmospheric background in `#commercial` section (`CommercialHeaderLoop`)

## Pickup / future live-action plates

When Live World / Hatchery are stable for recording:

1. Hatchery UI reveal (honest alpha UI, no fake polish overlay claiming finished systems)  
2. Live World walk in Riftwild Commons  
3. World map / region transition  
4. Mix under cinematic plates — never replace unfinished systems with misleading faux UI  

## Rebuild

```bash
node scripts/commercials/build-commercials.mjs
```
