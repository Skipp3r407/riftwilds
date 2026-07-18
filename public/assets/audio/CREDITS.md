# Audio assets (`public/assets/audio/`)

Mirror of runtime clips for packaging clarity. Primary playback paths remain under `public/sounds/`.

## License

- **SFX / ambient WAVs:** Original procedural tones generated for Riftwilds (`scripts/assets/generate-audio-sfx.mjs`). **CC0 1.0**.
- **Riftling cries:** Original per-species WAVs from `scripts/assets/generate-riftling-cries.mjs` (procedural default, no API key; optional xAI/Grok TTS is a paid upgrade only). **CC0 1.0** / original IP — not Pokémon cries or third-party packs. See `riftlings/MANIFEST.json`.
- **Comic storybook narration:** Optional ElevenLabs MP3s under `comics/{issueSlug}/` from original Legends of the Rift catalog text (`npm run assets:narrate`). See `docs/audio/ELEVENLABS_NARRATION.md` and `comics/MANIFEST.json`.
- **Music:** Not duplicated here — see `public/sounds/MUSIC_CREDITS.md` (all CC0 from OpenGameArt authors).

No copyrighted game audio or commercial sample libraries are used. Creature SFX are separate from commercial video music beds.
