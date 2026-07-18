# Riftwilds Audio System

Centralized audio for the website, menus, and Live World. Extends the existing procedural SFX engine (`src/lib/audio/sfx.ts`) and CC0 music under `public/sounds/music/` — it does not replace them.

## Architecture

| Module | Role |
|--------|------|
| `src/lib/audio/manager.ts` | Master context unlock, mute-all, volume groups, ducking |
| `src/lib/audio/sfx.ts` | One-shot SFX (procedural + optional WAV), category routing |
| `src/lib/audio/ambient.ts` | Procedural regional ambience + optional loop WAVs |
| `src/lib/audio/music.ts` | Dual-element crossfade music engine |
| `src/lib/audio/footsteps.ts` | Terrain / region footstep surfaces |
| `src/lib/audio/positional.ts` | Distance-based forge / portal / water stubs |
| `src/lib/audio/weather.ts` | Day/night + weather multipliers & cues |
| `src/lib/audio/catalog.ts` | Region → music/ambient maps, event → bus |
| `src/lib/audio/prefs.ts` | localStorage + legacy migration |

Public barrel: `src/lib/audio/index.ts`.

## Volume groups

Master · Music · Ambient · UI · SFX · Pet · Combat · Weather (+ Mute all)

Settings UI: `/settings/audio` (`AudioSettingsPanel`).

Legacy keys `riftwilds-sfx-prefs` / `riftwilds-music-prefs` migrate once into `riftwilds-audio-prefs`.

## Autoplay & accessibility

- `AudioContext` / HTMLAudio unlock on first pointer/key/touch (`audioManager.unlock`).
- `prefers-reduced-motion` / `prefers-reduced-data` skip ambient beds and spam-prone events.
- Cooldowns on UI and world events — do not fire SFX on every hover.
- Combat/quest stingers briefly duck music + ambient.

## Live World flow

1. Enter world → region ambient + region theme crossfade.
2. Footsteps use terrain cell + region bias.
3. Positional loops near portals, water, forges.
4. World clock chip syncs day phase / weather multipliers.
5. Exit → menu ambient + menu theme.

## Website / menu

- Floating `MusicPlayer` drives `musicEngine` playlist.
- Soft menu ambience pad starts with the player (procedural + `menu` loop).
- UI SFX remain intentional (nav, modals, shop, quests) — not every click.

## Assets

- Runtime paths stay under `public/sounds/` (`music/`, `sfx/`, `ambient/`).
- Mirror copies under `public/assets/audio/` for clear packaging.
- Regenerate short WAVs: `node scripts/assets/generate-audio-sfx.mjs`
- Credits: `public/sounds/MUSIC_CREDITS.md`, `public/sounds/SFX_CREDITS.md`, `public/assets/audio/CREDITS.md`

## Riftling species cries

Every launch species (100) has a unique signature cry:

| Path | Role |
|------|------|
| `public/assets/audio/riftlings/{slug}.wav` | Canonical packaging |
| `public/sounds/sfx/riftlings/{slug}.wav` | Runtime mirror |
| `src/lib/audio/riftling-cries.ts` | Catalog + `playRiftlingCry` / `playCompanionCry` |

Playback hooks (pet volume bus only — **never** ducks commercial music beds):

- Pet care actions + portrait tap (`live-care-panel`)
- Hatch reveal (`hatchery-dashboard`)
- Live World idle chance + pet emote reactions
- Codex “Hear signature cry” button

Regenerate:

```bash
npm run assets:riftling-cries
# Optional Grok/xAI TTS (paid upgrade only — not required):
# RIFTLING_CRIES_ENGINE=grok XAI_API_KEY=... npm run assets:riftling-cries
```

Default engine is **procedural** original synthesis (affinity-flavored, unique per slug). No API key required. xAI TTS is an optional paid upgrade when `XAI_API_KEY` is set.

## Comic storybook + commercial VO (ElevenLabs)

Pre-generated TTS only (no browser API calls). See [ELEVENLABS_NARRATION.md](./ELEVENLABS_NARRATION.md).

```bash
npm run assets:narrate
# npm run assets:narrate -- --dry-run
```

## License policy

Original / AI-generated / CC0 only. No copyrighted game audio or commercial sample packs.
