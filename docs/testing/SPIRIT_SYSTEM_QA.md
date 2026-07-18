# Spirit System QA

## Automated

```bash
npx vitest run tests/unit/spirit-system.test.ts
```

Covers: Downed vs death, countdown, Credits recover, SOL optional + rarity-invariant fees, marketplace block, anti-dupe, Hardcore gate, insurance, ancestor non-combat, equipment preserve, Spirit quest step completion.

## Manual checklist

- [ ] Downed state UI on pet overview (particles / dialogue)
- [ ] Credits healer recovers companion
- [ ] Recovery item path with inventory qty
- [ ] Spirit Realm page loads quests + NPCs
- [ ] Rescue quest advances steps then recovers
- [ ] Loyalty / guild / friend assist paths
- [ ] SOL recall flagged off → substitute or clear error; never required copy visible
- [ ] Hardcore enable blocked without checkboxes
- [ ] Memorial garden tribute
- [ ] Marketplace rejects Downed pet listing
- [ ] Reduced motion: particle animation respects `prefers-reduced-motion`

## Performance

Spirit store is in-memory Maps (same pattern as hatchery). No per-frame work beyond CSS pulse on Downed panel. Spirit Realm page is static content + images.
