# ElevenLabs narration (comics + commercials)

Warm storytelling TTS for **Legends of the Rift** page voiceover and **comic commercial** VO tracks.

Runtime never calls ElevenLabs — clips are pre-generated into `public/`. Without an API key (or without regenerated files), the comic reader stays silent and commercials keep their existing Edge/SAPI VO.

## Setup

1. Copy `.env.example` → `.env` (never commit `.env`).
2. Add:

```bash
ELEVENLABS_API_KEY=your_key_here
# Optional — warm narrator (default: Rachel 21m00Tcm4TlvDq8ikWAM)
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
# Optional
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
```

3. Generate:

```bash
# Comics Issue #1 + commercial VO (ElevenLabs when key present)
npm run assets:narrate

# Dry-run (no API calls) — dumps scripts + pending manifest
npm run assets:narrate -- --dry-run

# Issue #1 comics only
npm run assets:narrate -- --comics --issue=the-first-rift

# All published issues
npm run assets:narrate -- --comics --issue=all

# Commercials only → then mux into MP4s
npm run assets:narrate -- --commercials
npm run commercials:build
```

Equivalent entry: `node scripts/audio/elevenlabs-narrate.mjs`.

## Voices

| Env | Default | Notes |
|-----|---------|--------|
| `ELEVENLABS_VOICE_ID` | `21m00Tcm4TlvDq8ikWAM` (Rachel) | Warm storytelling; pick any ElevenLabs voice you license |
| `ELEVENLABS_MODEL_ID` | `eleven_multilingual_v2` | Stable narrative model |

Tone: original Riftwilds IP only, kid-friendly where comics are family-oriented. Scripts are built from catalog narration/dialogue (SFX bubbles skipped).

## Outputs

| Path | Purpose |
|------|---------|
| `public/assets/audio/comics/{slug}/page-NN.mp3` | Per-page storybook VO |
| `public/assets/audio/comics/{slug}/SCRIPT.json` | Text used for that issue |
| `public/assets/audio/comics/MANIFEST.json` | Reader / tooling index |
| `.cache/elevenlabs/` | Temp dumps (gitignored) |
| `public/assets/commercials/audio/*-vo.m4a` | Commercial VO (via `COMMERCIAL_TTS=elevenlabs`) |

After commercial VO regen, run `npm run commercials:build` so MP4s pick up the new track (music bed + ducked VO). Site player: `/#commercial` or About commercial block — baked audio in the MP4.

## Comic reader

Open `/comics/the-first-rift`:

- **Narration On/Off** — persists in comic settings (`narrationEnabled`)
- **Play VO / Pause VO** — control current page clip
- **VO Audible / Muted** — mute without disabling auto-advance VO
- Page-turn SFX remains separate (`Page sound`)

Missing MP3 → “No clip for this page”; no error toast spam.

## Fallback

| Situation | Behavior |
|-----------|----------|
| No `ELEVENLABS_API_KEY` | Script writes pending manifest + `SCRIPT.json` only |
| `--dry-run` | Same, no synthesis |
| Clip 404 at runtime | Silent; reader controls show missing |
| Commercials without key | Existing Edge neural / SAPI VO left in place |

## Related

- Commercial audio pipeline: [docs/marketing/COMIC_COMMERCIAL_AUDIO.md](../marketing/COMIC_COMMERCIAL_AUDIO.md)
- Shared client: `scripts/audio/elevenlabs-client.mjs`
- Catalog text dump: `npx tsx scripts/audio/dump-comic-narration.ts the-first-rift`
