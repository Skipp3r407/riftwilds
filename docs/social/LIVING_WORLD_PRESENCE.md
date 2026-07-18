# Living World Social Presence (legacy index)

> **Superseded by** [LIVING_SERVER_POPULATION.md](./LIVING_SERVER_POPULATION.md) for the full Living Server Population System.

Presence XP, rest hubs, social density, community events, idle participation, and Town Featured titles — while online in Live World / towns.

## Principles

- **Not an AFK farming simulator.** Motionless standing earns nothing meaningful.
- **Presence XP** for meaningful social/rest activity only.
- **Never reward SOL** for idling. Soft Credits / cosmetics / decor only, capped.
- **Logout still removes you from the world** by default. Rest hubs are while-online bonuses (and logout-friendly benches for calm UI), not AFK camping persistence.
- Coordinate with loyalty anti-AFK, Rift Storm participation, NPC living AI, immersive HUD.

## Presence XP actions

Town visit · market browse · NPC talk · chat · emote · pet care · home visit/like/guestbook · fish · campfire rest · public/community events · music · trade · help newbies · festival · sit/wave/dance.

## Rest hubs

Catalog in `src/lib/social-presence/config.ts` (`REST_HUB_CATALOG`). Reuses `safe_zone` semantics from world maps plus inn / campfire / homestead / logout_rest / market / festival / dock.

Rest bonuses are a small % of base XP, capped with density bonuses (`MAX_COMBINED_BONUS_PERCENT`).

## Anti-AFK

Requires recent engagement signals: `MOVE`, `CAMERA`, `INTERACT`, `CHAT`, `EMOTE`, `UI`, `PET`, etc.

Blocks:

- No signal in window
- Motionless standing
- Scripted repetition (same action spam / A-B loops)
- Soft multi-account fingerprint XP share reduction

## Idle participation

Every **15–30 minutes** of genuine activity (capped daily): tiny Credits via faucet `PRESENCE_IDLE` + optional cosmetic stub. Never SOL.

## Town Reputation & Featured Player

Every hour, genuinely active social-hub keepers can earn cosmetic titles:

- **Town Hero** — helps, events, plaza presence
- **Master Merchant** — trade / market activity
- **Community Favorite** — emotes, likes, guestbook, campfire social

Profile highlights only — **no combat power**.

## APIs

| Route | Purpose |
| --- | --- |
| `GET /api/social-presence/status` | Player snapshot (XP, AFK, prompts, featured…) |
| `POST /api/social-presence/heartbeat` | Engagement signals + rest zone |
| `POST /api/social-presence/action` | Earn Presence XP |
| `POST /api/social-presence/claim-idle` | Soft idle participation claim |
| `GET /api/social-presence/featured` | Hourly featured + popular locations |
| `POST /api/social-presence/home-visit` | Likes / guestbook / rating stubs |

## Feature flags

- `SOCIAL_PRESENCE_ENABLED`
- `SOCIAL_PRESENCE_IDLE_REWARDS_ENABLED`
- `TOWN_FEATURED_PLAYER_ENABLED`
- `SOCIAL_HOME_VISITS_ENABLED`
- `SOCIAL_COMMUNITY_EVENTS_ENABLED`

## UI

- Live World: `SocialPresenceHud`, `TownActivityPanel`, `FeaturedPlayerBanner`
- Social Hub: Town Featured section
- Hook: `useSocialPresence`

## Related code

- `src/lib/social-presence/**`
- `src/game/social-presence/**` (Riftling rest, activities, ambience, crowd LOD stubs)
- Credits faucet: `PRESENCE_IDLE`
- Analytics: `presence_*` events
