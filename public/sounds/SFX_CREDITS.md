# Sound effects credits

Short UI / game SFX under `public/sounds/sfx/` for Riftwilds.

## Original procedural blips (this project)

All `.wav` files in this folder were **generated for Riftwilds** as original short tones (sine / triangle / square / saw blips). They are not sampled from third-party libraries.

- **Author:** Riftwilds project
- **License:** CC0 1.0 Universal (public domain dedication) — free to reuse with or without attribution
- **Runtime fallback:** `src/lib/audio/sfx.ts` synthesizes the same recipes via Web Audio if a file fails to load

| File | Used for |
|------|----------|
| `ui-click.wav` | Generic button click |
| `ui-modal-open.wav` / `ui-modal-close.wav` | Modal open / close |
| `ui-nav.wav` | Subtle navigation |
| `ui-error.wav` | Soft fail / error |
| `hatchery-claim.wav` | Claim starter egg |
| `hatchery-reveal.wav` | Hatch reveal |
| `pets-care.wav` | Feed / care actions |
| `pets-equip.wav` | Equip / save loadout |
| `quests-accept.wav` | Accept quest |
| `quests-objective.wav` | Objective progress |
| `quests-complete.wav` | Quest complete |
| `combat-hit.wav` / `combat-ability.wav` | Arena hit / ability |
| `combat-win.wav` / `combat-lose.wav` | Arena outcome |
| `shop-ok.wav` / `shop-fail.wav` | Shop / marketplace purchase |
| `world-npc.wav` | NPC dialogue open |
| `world-portal.wav` | Portal travel |
| `world-gather.wav` / `world-loot.wav` | Gather / loot |
| `rewards-claim.wav` | Reward claim |
| `rewards-chime.wav` | Verified estimate tick (subtle) |

Ambient / spam-prone events (`hatchery.incubate_tick`, `world.footstep`, `rewards.estimate_tick`) prefer procedural playback with longer cooldowns and respect reduced-motion preferences.
