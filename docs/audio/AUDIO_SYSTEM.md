# Riftwilds Audio System

Centralized adaptive audio for menus, TCG, companions, and Live World. Extends procedural SFX (`src/lib/audio/sfx.ts`) and CC0 music under `public/sounds/music/`.

Director brief / full cue matrix: [AUDIO_DESIGN_DOCUMENT.md](./AUDIO_DESIGN_DOCUMENT.md).

## Architecture

| Module | Role |
|--------|------|
| `manager.ts` | Master context unlock, mute-all, volume groups, ducking |
| `adaptive-engine.ts` | Soundscape modes, intensity, priority one-shots |
| `music.ts` | Dual-element crossfade music engine |
| `music-stems.ts` | Procedural combat/boss stem layers |
| `ambient.ts` | Procedural regional ambience + loop WAVs |
| `reverb.ts` | Convolver reverb zones |
| `positional.ts` | Distance + stereo pan (forge / portal / water) |
| `sfx.ts` | One-shot SFX (WAV-first + polished procedural fallback) |
| `registry.ts` | Extensible cue database |
| `voice-bus.ts` | Narrator / announcer / boss / companion VO slots |
| `riftling-cries.ts` | Per-species signature cries |
| `footsteps.ts` / `weather.ts` | Terrain + day/night / weather |
| `catalog.ts` | Region maps, event → bus, biome aliases |
| `prefs.ts` | localStorage + legacy migration |

Public barrel: `src/lib/audio/index.ts`.  
Page helper: `src/components/audio/soundscape-mount.tsx`.

## Volume groups

Master · Music · Environment (`ambient`) · UI · Effects (`sfx`) · Companions (`pet`) · Combat · Weather · Voice · Notifications (+ Mute all)

Settings UI: `/settings/audio`.

## Assets

- **ADD layout:** `public/audio/{ui,music,sfx,companions,bosses,world,housing,guild,arena,marketplace,events}/`
- **Runtime:** `public/sounds/{sfx,ambient,music}/`
- **Mirror:** `public/assets/audio/`
- Regenerate: `npm run assets:audio`
- Catalog: `docs/audio/SFX_CATALOG.json`

## License

Original / AI-generated / CC0 only. No copyrighted game audio. Marketplace SOL transfer SFX is cosmetic only.
