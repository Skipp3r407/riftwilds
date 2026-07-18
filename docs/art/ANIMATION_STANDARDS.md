# Animation Standards (Live World)

> Art-direction intent: [ANIMATION_GUIDE.md](./ANIMATION_GUIDE.md)

## NPC sheets

- Layout: horizontal **4 × 128px** frames → `idle0 | walkL | contact | walkR`
- Built by `npm run assets:npc-sheets` from world-worthy `full-body.png` / `sprite.png`
- Phaser keys: `npc-<slug>-idle` (frames 0–1, ~2.2 fps, yoyo), `npc-<slug>-walk` (0–3, ~7 fps loop)

## Runtime motion (BlueprintRegionScene)

Every Commons NPC must move somehow — **no permanently frozen cast**:

| Layer | Behavior |
|-------|----------|
| Idle breathe | Vertical bob + display-scale pulse |
| Weight shift | Slow horizontal sway |
| Patrol / work | Sin/cos wander amplitude from `npcWanderAmplitude(behavior)` |
| Face player | FlipX when player within ~90px (soft pause) |
| Ambient SFX | Occasional `world.npc_work` near active workers |

Default `idle` still gets a small wander (~10px) so ambient NPCs never look glued.

## Player + companion (Commons premium)

- Keeper: idle breath scale when velocity ~0
- Pet Riftling: slightly stronger breath scale while following
- Emote / walk / run layers remain on the emote runtime (separate from NPC sheets)

## Backlog (not blocking Commons)

- Hand-authored 4-direction walk atlases for named 10
- Behavior-specific activity loops (forge hammer, tend eggs kneel, music sway)
- True blink frames (sheet currently procedural bob/sway only)