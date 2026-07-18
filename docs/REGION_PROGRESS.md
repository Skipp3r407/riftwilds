# Region Progression

## Continent spine

Primary story corridor (walking + portals):

`Commons → Elderwood → Stoneheart → Stormspire → Radiant`

Hub spokes from Commons reach all other launch regions. Peer links (Ember↔Stoneheart, Coast↔Frostveil, Elderwood↔Spirit Marsh, Radiant↔Alloy, Alloy↔Void, Void↔Celestial, Spirit↔Void) are logical routes for future trail content.

## Unlock requirements

Gates live in `REGION_UNLOCK_GATES` (`src/game/world-maps/regions.ts`). Evaluated by `isRegionUnlocked` / `isRegionUnlockedLocally` against travel progress:

| Kind | Field | Example |
|------|-------|---------|
| Story | `storyChapter` | `chapter-2` |
| Level | `playerLevel` | `10` |
| Visit | `regionVisit` | `elderwood-forest` |
| Boss | `bossDefeat` | `radiant-sentinel` |
| Restoration | `gatewayRestored` | `world-rift-gate` |
| Reputation | `reputationMin` | `["forgebound", 10]` |
| Quest | `questComplete` | quest key |

**Never paid.** No SOL, no paid pet, no paid region pass.

## Starter open regions

Always enterable from Commons Portal Circle:

- Riftwild Commons
- Ember Crater
- Moonwater Coast
- Elderwood Forest

## Locked UI

World map (M) still lists sealed regions with:

- Teaser blurb
- Checklist of unmet requirements
- Note that unlocks are story/progression based

## Progress inputs

`src/game/world-travel/progress.ts` stores player level (also grown from exploration XP), chapters, bosses, restored gateways, reputation, and completed quests. Demo helpers: `markStoryChapter`, `markBossDefeated`, `markGatewayRestored`, `setReputation`, `setPlayerLevel`.
