# Emote System QA

## Automated

```bash
npx vitest run tests/unit/emote-system.test.ts
```

Covers: catalog safety, runtime cooldown/cancel/spam/reduced-motion, consent + block/mute, pings, riftling/NPC reactions, unlocks, chat slash, keybinds, controller stubs.

## Manual checklist

- [ ] Enter Live World → hold **T** → wheel appears → release plays wave/cheer glyph on player
- [ ] **Shift+T** opens panel; Esc closes
- [ ] Move during emote cancels gesture
- [ ] Chat `/wave` while focused plays emote; WASD alone does not
- [ ] `/ping help` rate-limits on repeat
- [ ] Near NPC → wave → NPC wave-back line in nearby chat
- [ ] Pet shows reaction bubble after player emote
- [ ] Social tab → handshake → consent toast Accept plays; Decline does not
- [ ] Privacy: disable social requests → request fails
- [ ] Mobile Emote button opens wheel
- [ ] `prefers-reduced-motion: reduce` → short static bubble
- [ ] Credits unlock tab labels premium as cosmetic-only
- [ ] `/admin/emotes` loads catalog table

## Regression

- Chat, map, dialogue, movement still work
- T no longer reserved for unused targetNearest (rebindable)
- Feature flag `LIVE_WORLD_EMOTES_ENABLED=false` hides UI
