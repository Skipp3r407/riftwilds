# Regional Sound Design

Each Live World region has a unique ambience recipe (procedural Web Audio) plus a mapped CC0 exploration theme. Optional short loop WAVs live at `public/sounds/ambient/<region-slug>.wav`.

## Region map

| Region | Mood | Music (CC0) | Ambient layers |
|--------|------|-------------|----------------|
| Riftwild Commons | Soft plaza magic | Sector | Warm drone + light pad |
| Ember Crater | Low lava rumble | Urgent | Saw drone + ash noise |
| Moonwater Coast | Surf wash + tide | Airy | Soft drone + bandpass wash |
| Elderwood Forest | Leaf canopy hush | Magic Space | Triangle canopy + pad |
| Stormspire Peaks | Wind + thunder | Pulse | Wind noise + bright LFO |
| Stoneheart Canyon | Stone echo hollow | Transmission | Deep sine hollow |
| Frostveil Basin | Crystalline cold | Space Graveyard | High sine + air noise |
| Radiant Citadel | Temple light choir | Sirens in Darkness | Bright stacked sines |
| Void Hollow | Uneasy void pulse | Dark Things | Low saw + dark noise |
| Alloy Ruins | Machine hum | Menacing Otherworld | Square hum + sparks |
| Spirit Marsh | Lantern mist | Magic Space | Triangle mist + pad |
| Celestial Rift | Starfield shimmer | Sirens in Darkness | High shimmer pad |
| Menu (site) | Soft magical | Magic Space | Gentle menu pad |

## Footstep bias

When terrain is generic ground, regions bias surface:

- Commons / Elderwood → grass  
- Ember / Stormspire / Stoneheart / Radiant → stone  
- Moonwater → sand  
- Frostveil → snow  
- Alloy → metal  
- Spirit → wood  
- Void / Celestial → void  

Terrain cells override bias (`water`, `lava`, `path`, etc.).

## Weather & day/night

`syncWorldClockAudio` (from `WorldClockChip`) scales ambient/music by day phase and weather, and plays sparse rain/wind/thunder cues (long cooldowns, ambient-flagged).

## Positional stubs

Near player distance attenuation for:

- **portal** — sine hum  
- **water** — filtered noise  
- **forge** / smith buildings — saw + noise  

## Credits

Music: see `public/sounds/MUSIC_CREDITS.md` (all CC0).  
SFX / ambient WAVs: original procedural generation for Riftwilds (CC0).
