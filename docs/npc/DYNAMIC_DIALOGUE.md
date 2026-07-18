# Dynamic Dialogue

## Layers

1. **Authored trees** — `NpcDef.dialogueNodes` (shops, starter quests, lore)  
2. **AI stub** — `generateNpcDialogue` (never grants rewards)  
3. **Living prefixes** — killer reactions, occasional rumors injected in `startNpcDialogue`  
4. **Ambient bubbles** — NPC–NPC chatter + weather/combat lines via Live World chat

## Rules

- AI / ambient lines never mint Credits, items, or quest completions  
- Killer lines prepend when `knownAsKiller`  
- Wary merchants strip `open_shop` choices while scared of killers  
- Rumors are vague region hints — no secret coordinates  

## Emotes

Existing `npc-reactions.ts` still handles player emote responses (cooldown 8s). Living AI does not replace that path.
