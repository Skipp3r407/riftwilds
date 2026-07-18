# Social Hubs

Configurable hubs that attract keepers and grant small Presence multipliers.

## Hub types

Town square · marketplace · tavern · inn · park · beach · fishing dock · library · guild hall · festival grounds · home district · campground · Riftling park · music stage · arena viewing · crafting plaza · port · sanctuary · public farm · **new-player welcome center**

Catalog: `REST_HUB_CATALOG` / `listSocialHubs()` in `src/lib/social-presence/`.

## Hub fields

ID, name, region, type, capacity, presence multiplier, allowed activities, crowd thresholds, welcome-new-player flag, low-pop ambience stub.

## Population UX

- Popular location scores (structure + live bumps)
- Population-by-region display (null until multiplayer authority)
- New players directed to Welcome Center
- Crowd LOD stubs for performance

## Rest / active idling

Approved rest activities occasionally need light interactions (feed, turn page, choose song) — no captchas. Logout still removes characters from the world by default.
