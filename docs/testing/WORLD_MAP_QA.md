# World Map QA

**Date:** 2026-07-18

## Automated

```bash
npx vitest run tests/unit/world-exploration.test.ts
npx vitest run tests/unit/live-world-maps.test.ts
npm run validate:maps
```

Covered:

- Quest markers from catalog (no locked spoilers)
- Undiscovered treasures have no coordinates
- Discovery reveals name + coords
- Custom pin search
- Region completion snapshot
- Minimap nearby sync

## Manual checklist

1. Enter Live World → press **M** → World view shows 12 regions + completion %
2. Zoom region → fog cells + player pin present
3. Filter **quests** → active/available quests visible; locked secrets absent
4. Accept/advance a quest on Quest Board → reopen map → progress subtitle updates
5. Walk near a chest/hidden area → discovery SFX + log entry; pin appears
6. Before discovery, only vague “Uncharted lead” (if clue unlocked) — no secret name/coords
7. Legend toggles persist across reopen
8. Search finds a custom pin after Drop pin
9. Minimap shows nearby quest/discovery icons; click opens region map
10. Fast travel preview uses Credits language only (never SOL)
11. Discovered habitat/POI detail shows Codex / World link when available
12. World event pin appears only when Living World disaster is active for affinity regions

## Backlog (honest)

| Item | Status |
|------|--------|
| Phaser chest open / loot VFX | Partial — discovery via proximity; full loot UI TBD |
| Boss defeat → map state from combat | Progress API ready; combat hook may be stubbed |
| Server sync of exploration progress | Phase 1 localStorage only |
| Icon art polish / transparent matte | Generated originals present; may need mask pass |
