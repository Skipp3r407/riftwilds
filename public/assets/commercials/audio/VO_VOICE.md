# Commercial VO voice

| Field | Value |
|-------|--------|
| Provider | ElevenLabs |
| Voice name | Rachel |
| Voice ID | `21m00Tcm4TlvDq8ikWAM` |
| Model | `eleven_multilingual_v2` |
| Why | Warm storytelling / cinematic mid-tempo — matches “warm wonder, not salesy” commercial tone |

Set via `ELEVENLABS_VOICE_ID` in `.env` (never commit the API key). Regenerate with:

```bash
npm run assets:narrate -- --commercials
npm run commercials:build
```
