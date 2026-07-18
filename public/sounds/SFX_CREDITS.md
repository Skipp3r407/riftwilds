# Sound effects credits

Short UI / game SFX under `public/sounds/sfx/` and ambient loops under `public/sounds/ambient/` for Riftwilds.

## Original procedural blips (this project)

All `.wav` files in these folders were **generated for Riftwilds** as original short tones (sine / triangle / square / saw / noise). They are not sampled from third-party libraries.

- **Author:** Riftwilds project
- **License:** CC0 1.0 Universal (public domain dedication)
- **Generator:** `node scripts/assets/generate-audio-sfx.mjs`
- **Runtime fallback:** `src/lib/audio/sfx.ts` synthesizes recipes via Web Audio if a file fails to load

### Core UI / game

| File | Used for |
|------|----------|
| `ui-click.wav` | Generic button click |
| `ui-modal-open.wav` / `ui-modal-close.wav` | Modal open / close |
| `ui-nav.wav` | Subtle navigation |
| `ui-error.wav` | Soft fail / error |
| `ui-map-open.wav` / `ui-map-close.wav` | World map |
| `ui-waypoint.wav` | Waypoint discovery |
| `ui-chat-open.wav` / `ui-chat-close.wav` / `ui-chat-send.wav` | Chat panel |
| `hatchery-claim.wav` / `hatchery-reveal.wav` | Hatchery |
| `pets-care.wav` / `pets-feed.wav` / `pets-water.wav` / `pets-play.wav` / `pets-clean.wav` / `pets-rest.wav` / `pets-heal.wav` / `pets-need-low.wav` / `pets-equip.wav` | Pet care bus |
| `quests-*.wav` | Quest board |
| `combat-*.wav` / `arena-start.wav` / `event-stinger.wav` | Arena / events |
| `shop-ok.wav` / `shop-fail.wav` | Shop / marketplace |
| `world-npc.wav` / `world-npc-greet.wav` / `world-npc-work.wav` | NPC stubs |
| `world-portal.wav` / `world-gather.wav` / `world-loot.wav` | World actions |
| `rewards-claim.wav` / `rewards-chime.wav` | Rewards |
| `weather-rain.wav` / `weather-thunder.wav` / `weather-wind.wav` | Weather cues |

### Ambient loops

`public/sounds/ambient/<region-slug>.wav` — short loopable beds for all 12 regions + `menu.wav`. Prefer Web Audio procedural layers; files are optional enhancement.

Ambient / spam-prone events (`hatchery.incubate_tick`, `world.footstep`, `rewards.estimate_tick`, weather) use longer cooldowns and respect reduced-motion preferences.
