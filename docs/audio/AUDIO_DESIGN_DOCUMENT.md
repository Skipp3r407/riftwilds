# Riftwilds Audio Design Document (ADD)

**Role:** Lead Audio Director + Technical Audio Programmer  
**Updated:** 2026-07-19 · **Local only** (not committed / not pushed)  
**Pillars:** Original IP · stereo adaptive engine · mute / reduced-sound respect · no ripped commercial game SFX · every shipped cue is layered synthesis (not beep stubs).

---

## 1. Creative direction

Riftwilds should feel like a **warm lantern-lit fantasy TCG / companion world** — soft magical UI, leather Codex pages, rift whooshes on card plays, elemental combat color, regional exploration beds, hatch rarity fanfares, and companion cries that never stomp the music bed.

**Reference feel (not samples):** Hearthstone / LoR clarity of feedback · WoW / Diablo IV weight on bosses · BG3 / Zelda regional mood · Pokémon creature personality · MTG Arena UI polish.  
**Hard rule:** no copyrighted game audio.

---

## 2. Engine architecture

| Layer | Path | Role |
|-------|------|------|
| Master bus | `src/lib/audio/manager.ts` | Unlock, mute-all, volume groups, ducking |
| Adaptive director | `src/lib/audio/adaptive-engine.ts` | Modes + intensity + priority cues |
| Music beds | `src/lib/audio/music.ts` | Dual-element CC0 crossfade |
| Music stems | `src/lib/audio/music-stems.ts` | Procedural pad/pulse/choir/tension under combat/boss |
| Ambient | `src/lib/audio/ambient.ts` | Regional pads + loop WAVs |
| Reverb zones | `src/lib/audio/reverb.ts` | Convolver IR zones (forest/cave/temple/arena/…) |
| Positional | `src/lib/audio/positional.ts` | Distance + stereo pan (HRTF mesh = future) |
| SFX | `src/lib/audio/sfx.ts` | File-first one-shots + procedural fallback |
| Registry | `src/lib/audio/registry.ts` | Extensible cue database |
| Voice bus | `src/lib/audio/voice-bus.ts` | Narrator / announcer / boss / companion VO slots |
| Cries | `src/lib/audio/riftling-cries.ts` | Per-species signature cries (pet bus) |
| Weather / footsteps | `weather.ts` / `footsteps.ts` | World clock + terrain surfaces |
| Mount helper | `src/components/audio/soundscape-mount.tsx` | Page-level mode entry |

Public barrel: `src/lib/audio/index.ts`.

### Volume groups (accessibility)

| Slider label | Bus key | Maps brief term |
|--------------|---------|-----------------|
| Master | `master` | Master |
| Music | `music` | Music |
| Environment | `ambient` | Environment |
| UI | `ui` | UI |
| Effects | `sfx` | Effects |
| Companions | `pet` | (creature VO/care) |
| Combat | `combat` | Effects (combat stem) |
| Weather | `weather` | Environment weather |
| Voice | `voice` | Voice |
| Notifications | `notifications` | Notifications |

Settings: `/settings/audio` (`AudioSettingsPanel`). Prefs: `riftwilds-audio-prefs`.

### Formats

- **Shipped cues:** WAV masters (44.1 kHz), mono short one-shots for size; stereo spatial via `StereoPannerNode` + reverb wet.
- **Music beds:** MP3 CC0 under `/sounds/music/` (streamed via `HTMLAudioElement`, looped, crossfaded).
- **Future CDN:** OGG/MP3 for long beds; keep WAV masters in repo for regeneration.
- **5.1 / 7.1:** documented stretch — browser Web Audio is stereo/HRTF-first; surround reserved for native clients.

### Performance

- Long music streamed (HTMLAudio), not decoded into huge AudioBuffers.
- Ambient loops reused per region; reduced-motion skips ambient spam.
- Peak limiting in generator + soft gains in engines to avoid clipping.
- Priority windows skip low-priority clicks under stingers.
- Duck music/ambient for combat / hatch / boss / cinematic.

---

## 3. Adaptive modes

| Mode | Posture |
|------|---------|
| `menu` / `login` / `shop` / `marketplace` / `codex` / `deck` / `collection` / `housing` / `guild` / `hatchery` | Menu theme + menu ambient + zone reverb |
| `explore` | Region theme + region ambient |
| `arena` / `tournament` | Pulse bed + combat stems |
| `battle` | Urgent bed + combat stems |
| `boss` | Menacing bed + boss stems + boss.enter |
| `victory` / `defeat` | Duck window + outcome SFX |
| `cinematic` | Stinger duck + cinematic.stinger |

API: `enterSoundscape(mode)`, `setSoundscapeIntensity(0–1)`, `playAdaptiveCue(id, { priority })`, `speakVoice({ slot })`.

---

## 4. Folder layout

```
public/audio/
  ui/  music/  sfx/  companions/  bosses/  world/
  housing/  guild/  arena/  marketplace/  events/
  MANIFEST.json

public/sounds/          # runtime (engine paths)
  sfx/  ambient/  music/

public/assets/audio/    # packaging mirror + CREDITS
docs/audio/
  AUDIO_DESIGN_DOCUMENT.md
  AUDIO_SYSTEM.md
  SFX_CATALOG.json      # machine catalog (duration, volume, looping, …)
```

Regenerate:

```bash
npm run assets:audio
```

---

## 5. Cue matrix (shipped this pass)

Full machine catalog: [`SFX_CATALOG.json`](./SFX_CATALOG.json) / `public/audio/MANIFEST.json`  
(fields: file, category, durationSec, volume, looping, spatial3d, priority, compression, description).

### Wired end-to-end (hear today)

| Surface | Mode / cues |
|---------|-------------|
| Site chrome | `ui.nav`, `ui.click` |
| Login | `login` soundscape · `login.enter` · `login.success` |
| Hatchery | hatchery soundscape · claim/crack/reveal · **rarity fanfares** · species cry |
| Deck atelier | `deck` · add/remove/save/error |
| Collection / Codex | `collection` / `codex` · page turns · discover · inspect |
| Battle | `battle` · stems · draw/play/summon/energy/attack · win/lose · announcer VO slots |
| Arena hub | `arena` · queue · match found · announcer.ready |
| Tournaments | `tournament` · tournament.start |
| Shop / Marketplace | `shop` / `marketplace` · purchase · **sol_transfer cosmetic only** |
| Housing | `housing` · enter · place/pickup |
| Guilds | `guild` · guild.open |
| Live World | region music/ambient · footsteps · weather · portals |
| Settings | all bus sliders including Notifications + Environment label |

### Catalogued / representative (not every NPC unique VO)

| Area | Status |
|------|--------|
| Elemental combat (6 affinities) | Shipped WAV + helpers |
| Companion moods (idle/happy/angry/attack/hurt) | Representative set + 100 species cries |
| Boss enter/phase/taunt/defeat | Shipped cues + `boss` mode |
| Voice bus slots | Narrator / announcer / boss.taunt wired |
| Biome beds (forest/volcano/ice/desert/temple/ocean) | Alias WAVs under `audio/world/biome-*` |
| Opening cinematic | `cinematic.stinger` / `cinematic.whoosh` (mode ready) |

### Deferred VO matrix (`voice-bus.ts` → `VO_MATRIX_DEFERRED`)

- Per-boss spoken intros / defeats  
- Full companion dialogue banks (beyond cries + mood SFX)  
- Per-NPC quest VO  
- Tournament bracket callouts  
- Full opening cinematic VO track  
- True multi-stem OGG music layers (procedural stems ship now)  
- Full HRTF / 5.1 mesh  

---

## 6. Accessibility & prefs

- Separate sliders: Master · Music · Environment · UI · Effects · Companions · Combat · Weather · Voice · Notifications  
- Mute-all from settings or floating player  
- `prefers-reduced-motion` / `prefers-reduced-data` softens ambient  
- Cooldowns on UI / world spam  
- Combat / discovery / hatch / boss duck music + ambient  

---

## 7. How to test (local)

1. `npm run dev` → `http://localhost:3000`  
2. Click once to unlock audio.  
3. `/settings/audio` — raise Master / Music / Effects / Environment / Voice / Notifications.  
4. Surfaces:
   - **UI:** click nav links — soft magical ticks  
   - **Login:** `/login` — hall enter pad  
   - **Hatchery:** `/hatchery` — hatch → crack + rarity fanfare + cry  
   - **Battle:** `/tcg/battle` — match start, play, attack, win/lose, stems under Urgent  
   - **Arena:** `/arena` — queue tick; `/arena/tournaments` — tournament horn  
   - **Deck / Codex / Collection:** atelier + page turns  
   - **Shop / Marketplace:** purchase ok/fail; SOL listing plays cosmetic transfer  
   - **Housing / Guilds:** enter beds  
   - **Live World:** region beds + footsteps  

---

## 8. License

Original procedural synthesis · optional AI cries (paid upgrade) · CC0 music beds only.  
No copyrighted game SFX. Marketplace SOL SFX is **cosmetic feedback only** — SOL wagering remains disabled.

---

## 9. Local-only confirmation

This pass is **local only**. No git commit, push, or deploy was performed as part of the soundscape delivery.
