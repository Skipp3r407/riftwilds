# Player Emote System

Cosmetic social gestures for Live World. Emotes never grant combat power, Credits, SOL, loot, or progression advantages.

## Controls

| Input | Action |
|-------|--------|
| **T** (hold) | Open emote wheel · release to play highlighted slot |
| **Shift+T** | Full emote panel (solo / social / pings / unlocks / privacy) |
| **Esc** | Close wheel or panel |
| Mobile **Emote** | Open wheel · double-tap opens panel |
| Chat | `/wave`, `/emote <name>`, `/ping <kind>`, `/me wave` |

WASD movement never triggers slash emotes — only chat submit does (typing focus zeros movement).

## Architecture

```
React overlays (wheel / panel / consent)
        ↕ LiveWorldBridge.emotes (EmoteSystem)
Phaser BlueprintRegionScene (visual tweens + glyphs)
        ↕ EmoteEventBus (local)
MultiplayerClient.sendEmote (Phase 2 WS stub)
```

**Server-authoritative intent:** clients propose plays; Phase 2 WS must validate unlock, rate limit, consent, and privacy before broadcast. Phase 1 is local-authoritative with the same validation modules.

## Code map

| Path | Role |
|------|------|
| `src/game/live-world/systems/emotes/` | Catalog, runtime, consent, privacy, pings, reactions |
| `src/game/live-world/bridge.ts` | `emotes`, `emoteUi`, `consentPrompt` |
| `src/game/live-world/input/keybinds.ts` | `openEmoteWheel` / `openEmotePanel` |
| `src/game/live-world/systems/chat.ts` | Slash emote / ping parsing |
| `src/components/live-world/emote-*.tsx` | Wheel, panel, consent toast |
| `public/assets/game/emotes/` | Icons, previews, audio stubs, poses |

## Starter free set

Wave, Hello, Nod, Keeper Bow, Cheer, Clap, Laugh, Shrug, Think, Salute, Point, Sit, Dance, Celebrate, Ready, Not Ready, Thanks, Sorry — plus free pings and consent socials.

## Animation priority

`stun > portal > combat > emote > run > walk > idle`

Movement, combat, and portal layers cancel active emotes. Reduced motion uses a short static glyph bubble.

## Flag

`LIVE_WORLD_EMOTES_ENABLED` (default on).

## Related docs

- [SYNCHRONIZED_SOCIAL_INTERACTIONS.md](./SYNCHRONIZED_SOCIAL_INTERACTIONS.md)
- [EMOTE_MODERATION_AND_PRIVACY.md](./EMOTE_MODERATION_AND_PRIVACY.md)
- [EMOTE_SYSTEM_QA.md](../testing/EMOTE_SYSTEM_QA.md)
- [GROK_EMOTE_ASSET_MANIFEST.json](../GROK_EMOTE_ASSET_MANIFEST.json)
