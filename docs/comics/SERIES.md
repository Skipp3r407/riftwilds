# Legends of the Rift

Storybook voiceover (optional ElevenLabs page clips): see [docs/audio/ELEVENLABS_NARRATION.md](../audio/ELEVENLABS_NARRATION.md) and `npm run assets:narrate`.

Official ten-issue Riftwilds comic series (original IP).

**Publishing engine:** see [PUBLISHING_ENGINE.md](./PUBLISHING_ENGINE.md).

## Routes

- `/comics` — Lore Library (archive shelves, filters, continue reading)
- `/lore` — alias redirect → `/comics`
- `/comics/[issueSlug]` — publisher-grade reader
- `/admin/comics` — Comic Studio

## Issues

1. The First Rift  
2. Spark's Journey  
3. The Traveling Circus  
4. The Lost City  
5. The Storm King  
6. The Merchant's Secret  
7. The Traitor's Gate  
8. The Last Guardian *(teaser destination in #7: The Forge of Rifts — forthcoming retitle)*  
9. Festival of Lights  
10. The Shadow Beyond  

## Progress & rewards

Local persistence: `riftwilds-comics-progress-v1` (Academy-style). Unlocks are Credits/cosmetic stubs only — never SOL / crypto for core story.

## Performance / a11y

Lazy-loaded page art, responsive reader, keyboard + swipe nav, hotspot labels, high-contrast toggle, guided panel reading, screen-reader page announcements.
