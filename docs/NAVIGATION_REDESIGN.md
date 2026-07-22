# Navigation redesign — Battle Hub IA

## Goal

Fewer clicks, no duplicated mode entries. **Play → Rift Battle** is the single combat entry. Rift Stakes is not a sibling in the main sidebar.

## Sidebar groups

Defined in `sidebarNavGroups` (`src/lib/config/nav.ts`), rendered by `GameSidebar`:

| Group | Highlights |
|-------|------------|
| **PLAY** | Play hub, **Rift Battle**, Arena (free), Dashboard, Quests |
| **CARDS** | Deck Atelier, Rift Codex, Card Binder, Museum, Card Shop |
| **WORLD** | World, Live World, Restoration, Homestead, Guilds, Ecosystem |
| **COLLECTION** | Hatchery, Pet Collection, Inventory, Profile |
| **MARKET** | Exchange, Marketplace, shops, auctions |
| **COMMUNITY** | Social, Creators, Fan Kit, Comics, Leaderboards |
| **TREASURY** | Community Treasury, Rewards, Loyalty, Economy, Token, Transparency, Stakes Fee Treasury (deep link into hub) |
| **Account** | Help, Roadmap, Academy, Account, Nakama |

Removed from primary sidebar: standalone **Rift Stakes**.

## Header mega-menu

- **Play** lists Rift Battle once; Rift Stakes appears only as a Battle Hub deep link (`/tcg/battle?mode=stakes`).
- **Rift Battles** group lists hub mode tabs (Practice → Stakes), not a parallel stakes app.

## Flat `primaryNav`

Still exported for validators. Does **not** include `/rift-stakes` as a sidebar item.

See [SIDEBAR_ARCHITECTURE.md](./SIDEBAR_ARCHITECTURE.md) and [PLAYER_FLOW.md](./PLAYER_FLOW.md).
