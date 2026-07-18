# Living Server Population System

Production-oriented social presence for Riftwilds Live World: **active idling**, hubs, Presence XP, Community Tokens, helpers, Riftling socialization, and anti-bot protection.

## Goals

- Make towns feel populated without rewarding open-browser AFK
- Best rewards require legitimate low-pressure activity
- **Never award SOL for idling**
- Soft cosmetics / Credits / Community Tokens only — capped, not P2W

## Architecture

| Layer | Location |
| --- | --- |
| Core services | `src/lib/social-presence/**` |
| Game stubs | `src/game/social-presence/**` |
| APIs | `/api/social-presence/*` |
| Live World HUD | `SocialPresenceHud`, `TownActivityPanel`, `FeaturedPlayerBanner` |
| Admin | `/admin/living-world` |
| Prisma (prepared) | `PlayerPresenceProfile`, `SocialHub`, `CommunityTokenLedger`, … |

Extends existing Live World, loyalty anti-AFK, save/logout rest zones, emotes, housing, and Credits ledger — does not rebuild multiplayer.

## Player presence states (server-authoritative)

`ACTIVE` · `CASUAL_ACTIVE` · `SOCIAL_ACTIVE` · `RESTING` · `IDLE` · `AFK` · `DISCONNECTED` · `RECONNECTING` · `SAFE_LOGOUT_PENDING` · `IN_COMBAT` · `IN_EVENT` · `IN_MINIGAME` · `IN_PRIVATE_INSTANCE`

Engagement tiers 0–4 gate reward eligibility. AFK / open browser → no valuable rewards.

## Related docs

- [PRESENCE_XP.md](./PRESENCE_XP.md)
- [SOCIAL_HUBS.md](./SOCIAL_HUBS.md)
- [COMMUNITY_EVENTS.md](./COMMUNITY_EVENTS.md)
- [HELPER_SYSTEM.md](./HELPER_SYSTEM.md)
- [RIFTLING_SOCIALIZATION.md](./RIFTLING_SOCIALIZATION.md)
- [PLAYER_PERFORMANCES.md](./PLAYER_PERFORMANCES.md)
- [HOME_SOCIAL_FEATURES.md](./HOME_SOCIAL_FEATURES.md)
- [../security/PRESENCE_ANTI_ABUSE.md](../security/PRESENCE_ANTI_ABUSE.md)
- [../economy/COMMUNITY_TOKEN.md](../economy/COMMUNITY_TOKEN.md)
- [../admin/LIVING_WORLD_ADMIN.md](../admin/LIVING_WORLD_ADMIN.md)
- [../testing/SOCIAL_SYSTEM_QA.md](../testing/SOCIAL_SYSTEM_QA.md)

## Feature flags

`LIVING_SERVER_POPULATION_ENABLED`, `SOCIAL_PRESENCE_*`, `COMMUNITY_TOKENS_ENABLED`, `SOCIAL_HELPER_SYSTEM_ENABLED`, `SOCIAL_PERFORMANCES_ENABLED`, `RIFTLING_SOCIALIZATION_ENABLED`

## Save / logout

Default remove-from-world on logout still applies. Rest hubs integrate with safe-logout zone kinds (`inn`, `home`, `camp`, …) for while-online rest bonuses only.
