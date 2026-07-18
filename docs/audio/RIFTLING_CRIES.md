# Riftling species cries

Every launch Riftling (100 species) has a unique signature vocalization.

## Default: local procedural (no key)

Cries ship from the procedural WAV pipeline (`scripts/assets/generate-riftling-cries.mjs` / `npm run assets:riftling-cries`) — the same approach as UI/pet SFX. **No `XAI_API_KEY` required.**

Optional paid upgrade via xAI TTS (`POST https://api.x.ai/v1/tts`) if you want it:

```bash
set XAI_API_KEY=...
set RIFTLING_CRIES_ENGINE=grok
npm run assets:riftling-cries
```

Failed TTS calls fall back to procedural per species.

## Design

- Affinity-flavored (ember crackle, tide chirp, frost chime, alloy tick, void hum, etc.)
- Unique deterministic seed per `slug` (not Pokémon cry copies)
- Plays on the **pet** volume bus only — does not duck commercial music beds
- Mood variants at playback (`cry` / `idle` / `happy`) via gain + playbackRate on one signature file

## Wiring

| Surface | Trigger |
|---------|---------|
| Pet care | Care action success + portrait tap |
| Hatchery | Hatch reveal |
| Live World | Idle chance while standing + pet emote reactions |
| Codex | “Hear signature cry” button |

See also: [AUDIO_SYSTEM.md](./AUDIO_SYSTEM.md).
