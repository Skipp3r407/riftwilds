# Comic commercials — music + AI narrator

Riftwilds promo videos are **comic-book cinematic** (colorful inked panels featuring catalog Riftlings — navy/cyan/amber + affinity colors) with a **music bed** and **AI voiceover** mixed under the narrator (ducking).

## Play on site

1. Run the app (`npm run dev`).
2. Open `/about` or the marketing home `#commercial` section.
3. Click **Play the commercial** — audio (music + narrator) is baked into each MP4. Captions are WebVTT tracks.

While the commercial dialog is open, site music/ambient buses are fully ducked so nothing stacks under the trailer.

## Regenerate voiceover

```bash
# Optional if ffmpeg is not on PATH:
set FFMPEG_PATH=C:\Program Files\Jellyfin\Server\ffmpeg.exe
set FFPROBE_PATH=C:\Program Files\Jellyfin\Server\ffprobe.exe

npm run commercials:vo
# or: node scripts/commercials/generate-vo.mjs
```

### Engine priority (automatic)

| Priority | Engine | Needs | Default voice |
|----------|--------|-------|----------------|
| 1 | OpenAI TTS | `OPENAI_API_KEY` | `onyx` (deep narrative) |
| 2 | ElevenLabs | `ELEVENLABS_API_KEY` | set `ELEVENLABS_VOICE_ID` |
| 3 | Microsoft Edge neural (`edge-tts`) | Python + `pip install edge-tts` | `en-US-ChristopherNeural` @ `-12%` |
| 4 | Windows SAPI | none | Microsoft David, slow rate |

Force an engine: `set COMMERCIAL_TTS=edge` (or `openai` / `elevenlabs` / `sapi`).

### Premium cloud TTS (when you have a key)

```bash
# OpenAI — cinematic male narrator
set OPENAI_API_KEY=sk-...
set OPENAI_TTS_VOICE=onyx
set OPENAI_TTS_MODEL=tts-1-hd
npm run commercials:vo
npm run commercials:build

# Or ElevenLabs
set ELEVENLABS_API_KEY=...
set ELEVENLABS_VOICE_ID=your-deep-narrative-voice-id
npm run commercials:all
```

Active engine is written to `public/assets/commercials/audio/VO_ENGINE.json`.

Outputs under `public/assets/commercials/audio/`:

- `riftwilds-commercial-60s-16x9-vo.m4a` (+ `.wav`)
- `riftwilds-commercial-30s-9x16-vo.m4a`
- `riftwilds-commercial-15s-9x16-teaser-vo.m4a`
- `riftwilds-commercial-25s-1x1-vo.m4a`

Scripts live in `public/assets/commercials/audio/VO_SCRIPT_*.txt` and `docs/marketing/RIFTWILDS_COMMERCIAL_SCRIPT.md`.

## Rebuild comic videos (panel motion + mix)

Requires `ffmpeg` / `ffprobe` (Jellyfin’s build works; or install `Gyan.FFmpeg` and put it on PATH).

```bash
npm run commercials:build
```

Pipeline:

1. Comic frames from `public/assets/commercials/storyboards/comic/`
2. Panel zoom / ink-flash cuts
3. Loop music beds from `public/sounds/music/` (high-passed, quieter under VO)
4. Sidechain-duck music under VO
5. Mux to `public/assets/commercials/video/*.mp4`

## Full regenerate order

```bash
npm run commercials:all
```

## Site ambience note (not the MP4)

Marketing pages no longer auto-start the procedural Web Audio menu drone + `menu.wav` loop (that was a site-wide hum after the first click). Live World still owns regional ambience. Ambient default volume is lower; menu recipe is noise-led.

## Music sources

| Track | Used in |
|-------|---------|
| `magic-space.mp3` | 60s cinematic |
| `airy.mp3` | 30s social, 25s square |
| `sector.mp3` | 15s teaser |

Project-owned beds under `public/sounds/music/` (see `public/sounds/MUSIC_CREDITS.md`). Clear licensing before paid ads if needed.

## Visual style notes

- Full-color comic cinematic — saturated navy/cyan/amber with affinity creature colors; selective ink accents OK
- Catalog Riftlings featured (Glowpup, Cindercub, Mossprig, Bubbloon, Voltkit, Riftpup, Luminara, Gearling, Wisplet)
- **Original Riftwilds IP only** — Riftlings, Gateways, Aeryndra — no Pokémon / Marvel character copies
- Frames: `storyboards/comic/comic-*.png`
