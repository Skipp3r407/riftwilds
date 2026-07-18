# Audio QA Checklist

## Automated

```bash
npm run test:unit -- tests/unit/audio-manager.test.ts
```

Covers: volume math, mute-all, region catalog completeness (12 regions + menu), bus routing, distance gain, footstep surfaces.

## Manual — Settings

1. Open `/settings/audio`.
2. Move each slider; confirm floating music player music volume tracks **Music**.
3. **Mute all** silences music, ambient, and SFX; unmute restores.
4. Refresh — prefs persist (`riftwilds-audio-prefs`).

## Manual — Autoplay / a11y

1. Hard reload; without interacting, no audio should start.
2. Click once — unlock; music play + menu ambience OK.
3. Enable OS reduced motion — regional ambient beds should not start / should stop; spam ambient SFX skipped.

## Manual — Website UI (no spam)

1. Nav / shop / quests / hatchery play intentional one-shots only.
2. Rapid clicking respects cooldowns (no machine-gun UI).

## Manual — Live World

1. Enter Commons — unique ambience + theme crossfade.
2. Portal to Ember, Coast, Elderwood — each region sounds distinct.
3. Walk path / near water — footstep surface changes; water positional rises.
4. Near portal — soft positional hum; fades with distance.
5. Open/close map (M) — map open/close SFX once each.
6. Discover waypoint — single waypoint chime.
7. Open chat, send message, close — chat SFX.
8. Talk to NPC — greet; inspect — talk variant.
9. World clock weather change (or wait) — subtle weather cue, not spam.
10. Exit world — returns toward menu ambience.

## Manual — Pet care / combat

1. Care actions: Feed / Water / Play / Clean / Rest / Heal play distinct pet bus sounds.
2. Need banner (non-content) — `pets.need_low` with long cooldown.
3. Training arena start — arena + combat stinger; hit/ability/win/lose on combat bus.

## Performance

- No new AudioContext per SFX (shared manager context).
- Ambient crossfade tears down previous oscillators.
- Positional clear on scene shutdown.
- File cache for WAV clones; missing files fall back to procedural once.

## License

Confirm no third-party copyrighted game audio was added. Credits present under `public/sounds/` and `public/assets/audio/CREDITS.md`.
