# Riftwilds Reborn — Project Vision

**Status:** Binding product direction (2026-07)  
**Codename:** RIFTWILDS REBORN  
**Launch emphasis:** TCG / Rift Battles first · Living World = future release  
**Related:** [ROADMAP.md](./ROADMAP.md) · [GAMEPLAY_LOOP.md](../gameplay/GAMEPLAY_LOOP.md) · [CARD_SYSTEM.md](../gameplay/CARD_SYSTEM.md)

## One-sentence vision

Riftwilds is an expanding online fantasy universe centered on a **strategic collectible card game** — hatch Riftlings, build decks, duel with Rift Energy — with a **Living World social habitat planned as a later release** (walk, house, quest, meet players) that must stay MMO-compatible.

## Pillars

| Pillar | Role | Launch |
|--------|------|--------|
| TCG / Rift Battles | Primary competitive / PvE loop | **Phase 1 — core** |
| Riftlings | Living companions + card identity source | Phase 1 |
| Quests | Guided progression into collection + story | Soft / progressive |
| Seasons | Card sets + narrative beats | Progressive |
| Marketplace | Credits-first trade (cosmetics / collectibles) | Progressive |
| Living World | Social hub, exploration, towns, presence | **Future release** (code preserved) |
| Social | Friends, parties, presence, performances | Progressive / stubs |
| Housing | Homes, neighborhoods, expression | Progressive / stubs |
| Guilds | Shared goals, banks, future team events | Later |
| Future MMO | Deeper instances, raids, kingdoms — **extend**, never “replace the MMO” | Later |

## Design north stars (inspire, don’t copy)

- **Accessibility** like Marvel Snap — short sessions, readable choices, escalating resource feel  
- **Strategic depth** like Magic: The Gathering — affinity, sequencing, deck construction  
- **Living-world feel** like RuneScape — towns that feel inhabited, long-term place attachment (**post-launch**)  

Do **not** copy protected mechanics, card text, UI layouts, or franchise IP.

## Non-negotiables

1. **Do not delete functioning systems** — soft-deprecate, flag, or Coming Soon; never rip out Live World / Phaser.  
2. **Do not rebuild what exists** — Live World, pets, quests, housing, marketplace, Credits economy stay for the future release.  
3. **No duplicate engines** — one overworld (`BlueprintRegionScene` + bridge), one Credits ledger, one quest catalog source.  
4. **SOL is optional** — never required for play, progression, or battle. Cosmetics / marketplace convenience only.  
5. **MMO-compatible** — TCG battles are matches inside a universe; architecture must allow future multiplayer authority.  
6. **Original IP / licensed assets** — Kenmi and similar packs stay restricted until license-verified (`docs/assets/THIRD_PARTY_ASSET_POLICY.md`).  
7. **No real-value wagering** — competitive rewards stay Credits / AP / cosmetics.

## Product framing

- **TCG = the launch game** — collection, decks, Rift Battle board are the primary entry and combat loop.  
- **Living World ≠ required for launch** — accessible during development (`LIVE_WORLD_PUBLIC_ACCESS_ENABLED` default on). Optional pre-release Coming Soon gate: set the flag to `false` when you choose.  
- **Arena pet battler ≠ dead** — soft-secondary behind flags; affinities, kits, rewards, and compliance reused by the TCG.  
- **Cards ≠ printables alone** — printables remain merch; gameplay card **data** lives in `src/content/tcg/`, runtime in `src/game/tcg/`.

## Success for Phase 1 launch

Players can grow a **card collection**, build decks, play **Rift Energy TCG** matches, hatch/care for Riftlings, and trade cosmetics on Credits — without ever connecting a wallet or spending SOL. Living World enter is optional / future; when it opens, encounters hand off into the same TCG board.
