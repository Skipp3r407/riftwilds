# Living NPC System

**Scope:** Commons-first living world AI — schedules, attention indicators, ambient social, killer notice, memory/relationship stubs.  
**Extends:** `@/game/npc-ai`, `@/game/living-world`, Live World Phaser actors (does not rebuild NPC art or dialogue trees).

## Architecture

| Layer | Path | Role |
|---|---|---|
| Catalog | `src/content/npcs` | Named + ambient defs, dialogue nodes, occupations |
| AI core | `src/game/npc-ai/*` | Schedules, attention, relationships, killer, multi-axis reputation, gossip, witnesses, rumors, discovery |
| Clock | `src/game/living-world/clock.ts` | Day phase + weather for gates |
| Phaser | `BlueprintRegionScene` | Applies schedule anchors, presence, `!` indicators, ambient chat |
| Persistence | `play-state` + `relationships` localStorage | Killer stats + relationship stubs |

## Runtime tick

Every ~280ms (bucket-staggered):

1. Resolve day phase / weather from living clock  
2. Per NPC (LOD-culled): schedule → home anchor + behavior + presence  
3. Sparse discovery attention (`!` quest/story/chat)  
4. Social / reputation notice (gossip-lagged axes) — killer path is one axis among many  
5. Occasional NPC–NPC ambient lines + weather/combat reactions  

Far NPCs (>520px) skip social/killer work; still get schedule when their bucket fires. See `REPUTATION_SYSTEM.md`.

## Interaction mix

Not every chat is a quest. Discovery rolls prefer greetings, tips, lore, and rumors. Optional quest offers are sparse and gated (time / weather / rep / status). Quest defs stay in the existing quest catalog — discovery only references keys.

## Killer notice

See relationship + killer docs. Scared / praise / challenge / condemn by occupation + personality. Children cower; merchants may refuse shop; guards warn; arena/bandit types praise.

## Honest backlog

- Full navmesh pathfinding / door enter-exit cutscenes  
- Perfect multi-waypoint patrol graphs  
- Server-authoritative relationship + killer reputation  
- Unique ambient art for every regional citizen  
- Cutscene directors for first-meet killer reactions  

## Indicators

`public/assets/ui/npc-indicators/{quest,story,chat,fear,praise,respect,wary}.svg` (+ large PNG variants where present). Loaded in `BootScene` as `npc-ind-*` textures.
