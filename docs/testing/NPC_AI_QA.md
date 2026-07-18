# NPC AI QA

## Automated

```bash
npx vitest run tests/unit/npc-living-ai.test.ts
```

Covers: schedules/presence, attention timeout + wave, relationships, killer stance/reactions, discovery mix.

## Manual Commons checklist

1. Enter Live World Commons — NPCs bob/wander (not frozen).  
2. Advance in-game clock / wait phases — children vanish at night; guards patrol; merchants stay.  
3. Watch for floating `!` (yellow/blue/gray) — ignore until timeout; talk clears.  
4. Talk to Rowan/Elara — mix of quest and non-quest chats.  
5. Set killer state (dev): raise `pvpKills` or flag `murderer` in live play state.  
   - Children: fear `!`, cower/flee, scared lines  
   - Tessa: wary, shop choice may disappear  
   - Rook: praise lines / amber `!`  
   - Orren: challenge warning  
6. Confirm ambient plaza chatter appears rate-limited in Nearby chat.  
7. Confirm relationship localStorage updates after talks / killer notice.

## Performance

- AI tick ~280ms, 8 buckets  
- Cull ~520px for social/killer  
- Indicator SVG preferred over large PNG  

## Backlog not in this pass

Navmesh perfection, cutscenes, server sync for relationships/killer score.
