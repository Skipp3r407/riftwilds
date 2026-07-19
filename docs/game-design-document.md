# Riftwilds Competitive Battle-Deck — Game Design Document

> **Status:** Phase 1 foundation (local). Multiplayer / ranked / blockchain are **not shipped**.  
> **Authority for live rules:** `src/game/tcg/types.ts` (`TCG_DEFAULTS`) + `src/content/tcg/`.  
> **Companion docs:** [battle-system](./battle-system.md) · [card-system](./card-system.md) · [multiplayer-architecture](./multiplayer-architecture.md) · [economy-design](./economy-design.md) · [implementation-status](./implementation-status.md)

---

## 1. Vision

Riftwilds is an original-IP **competitive battle-deck game** set in the Living World of Aeryndra. Keepers bond Riftlings, build decks of creatures/spells/relics, and duel to protect their **Keeper Core** using **Rift Energy**. Soft currencies (Credits / Gold) and care progression remain primary; optional Solana/blockchain stays **off by default**.

**Product pillars**

1. **Readable skill** — affinity matchups, energy tempo, board presence (not RNG slot machines).
2. **World-grounded** — cards, commanders, and quests reference existing regions, NPCs, and Riftlings.
3. **No pay-to-win** — cosmetics / convenience only; see `docs/economy/NO_PAY_TO_WIN_POLICY.md`.
4. **Sustainable play** — rewards for engagement and mastery; no guaranteed-profit language.
5. **Optional chain** — collectible ownership may later mirror soft ownership; never required to compete.

---

## 2. Existing architecture summary (audit)

| Layer | Location | State |
|-------|----------|-------|
| Content pack (~735 cards, 14 keywords, 12 heroes, 12 decks) | `src/content/tcg/` | Mature data pipeline |
| Match engine (practice AI) | `src/game/tcg/match-engine.ts` | Playable Phase 1 |
| Battle console UI | `src/components/tcg/rift-battle-board.tsx` → `/tcg/battle` | Working Practice Board |
| Binder | `/tcg/collection` | Browse + inspect; in-memory |
| Deck builder | `/tcg/deck-builder` | Phase 1 prototype (this pass) |
| Arena pet battler | `src/game/arena/` | Soft-secondary; affinities reused |
| Live World | Phaser `src/game/live-world/` | Enterable; MP stub |
| Soft economy | Credits ledger + marketplace | Live soft path |
| SOL / real money | `src/lib/economy/sol/` | Scaffolded; flags default **false** |
| Quests | Catalog + demo store; Prisma models exist | `QUESTS_ENABLED` false |
| Persistence | Prisma → Neon/Postgres | Large schema; TCG matches **not** in DB yet |

---

## 3. Systems to reuse vs redesign

### Reuse (do not replace)

- Content pack + `tcg:generate` / `tcg:validate` pipeline
- Rift Energy module + affinity matrix (`EMBER` / `TIDE` / `GROVE` / `STORM` …)
- Battle console / command-desk UX
- Encounter bridge Live World → `/tcg/battle?...`
- Quest metric retarget toward TCG actions
- Soft Credits / inventory / CurrencyLedger patterns
- Narrative factions (`docs/story/FACTIONS.md`) as reputation hooks
- Arena affinity chart as combat modifiers

### Strengthen / complete (Phase 1–3)

- Commander (hero) selection wired into match start
- Keyword / effect interpreter (data exists; engine largely ignores ops)
- Unit HP + tactical board (today: keeper-face race + power sum)
- Deck builder + constructed validation loop
- Match / binder persistence (in-memory Maps today)

### Redesign later (do not ship prematurely)

- True multiplayer / ranked queues (see multiplayer doc)
- Snap-style multi-lane scoring (lanes today are UI chrome)
- On-chain minting / SOL cups (keep flags false)
- Parallel quest or economy engines (forbidden by existing docs)

---

## 4. Proposed game architecture

```
src/content/tcg/          # Data-first cards, keywords, heroes, factions, starter sets
src/game/tcg/             # Engine, deck validation, stores, schemas, adapters
src/components/tcg/       # Battle console, deck builder, card chrome
src/app/(game)/tcg/       # Routes: battle, collection, deck-builder
src/app/api/tcg/          # Match + collection + deck APIs (session/guest)
src/data/assets-manifest.ts  # Visual asset registry for TCG surfaces
docs/                     # GDD + system design (this tree)
```

**Runtime split:** rich content schema → thin engine defs via `card-catalog.ts` adapter.

---

## 5. Core loop

1. **Care / world** — hatch, bond, explore Live World, complete soft quests.
2. **Collect** — earn or craft cards (Credits packs later; demo binder unlocks catalog).
3. **Build** — construct 20–30 card decks with a commander (hero).
4. **Train** — Practice Board AI / Training Cup (Credits).
5. **Compete** (later) — casual → ranked → private rooms → seasonal tournaments.
6. **Progress** — binder mastery, season cosmetics, quests, Live World reputation.

Target match length: **5–12 minutes**.

---

## 6. Match format (Phase 1 target)

| Rule | Value |
|------|-------|
| Deck size | 20–40 legal; constructed target **20–30** |
| Opening hand | **4** |
| Max hand | **8** |
| Draw | 1 per turn (fatigue −1 Core when empty) |
| Resource | Rift Energy: start 1, +1/turn, cap 10 |
| Core HP | Keeper Core **20** (commander flavor, same pool Phase 1) |
| Board | Max **5** units / side; summon exhausted |
| Combat | Ready units deal affinity-modified damage to enemy Core |
| Timer | Soft **90s** turn timer (practice UX; not yet enforced server-side) |
| Surrender | Supported |
| Turns | Cap 30 |

---

## 7. Battle factions (playable) — original IP

Battle factions map to existing **affinities** and story hooks — they do **not** invent conflicting lore.

| Faction id | Display | Affinity | Story anchor | Commander (hero) |
|------------|---------|----------|--------------|------------------|
| `ember-forge` | Ember Forge League | EMBER | Forge / fire regions | Volta / fire heroes |
| `tideward-coast` | Tideward Compact | TIDE | Brine / Moonwater | Captain Brine |
| `grove-circle` | Grove Circle | GROVE | Commons / Elderwood | Elara Venn |
| `stormspire` | Spirewind League | STORM | Stormspire | related storm heroes |

Narrative factions (Commons Keepers, Hatchery Compact, Codex, etc.) remain reputation/social axes.

---

## 8. First 20-card starter showcase set

Curated from ROTR (`cards.json`) as `starter-showcase-20` — see `src/content/tcg/data/starter-set-20.json` and [card-system](./card-system.md#starter-showcase-20).

Mix: Ember / Tide / Grove / Storm creatures + 3 spells + 2 companions for teaching affinity and Riftbond.

---

## 9. Modes roadmap

| Mode | Phase | Notes |
|------|-------|-------|
| Practice / Training AI | 1 | `/tcg/battle` |
| Deck builder | 1 | `/tcg/deck-builder` |
| World encounters | 1–2 | URL bridge live |
| Casual / private MP | 3–4 | Server-authoritative |
| Ranked / seasons | 4–5 | Soft AP / cosmetics |
| Tournaments | 5–6 | Credits first; SOL cups flag-gated |
| Spectate / replays | 5–6 | Event stream → replay store |
| Campaign / SP | 6–7 | Scripted AI + story beats |
| Optional blockchain | 7–8 | Ownership mirrors only |

---

## 10. Phased checklist (Phase 1–8)

1. **Schemas, factions/commanders, deck builder, training battle, assets manifest** — in progress this pass  
2. **Keyword interpreter + unit HP / board tactics + commander passives**  
3. **Persistence (binder/decks/match history) via existing ledger patterns**  
4. **Casual realtime MP + private rooms**  
5. **Ranked ladder, seasons, soft tournaments**  
6. **Spectate/replays, campaign chapters**  
7. **Live ops tools, economy tuning, anti-cheat hardening**  
8. **Optional chain collectibles (flags remain off until explicit launch)**  

---

## 11. Visual assets required

See [art-direction](./art-direction.md) and [art-generation-prompts](./art-generation-prompts.md). Priority: commander portraits, faction banners, lane board readability, deck-builder chrome, remaining card faces for showcase set.

---

## 12. DB migration plan (inspect-first)

**Existing:** Prisma + Postgres/Neon (`prisma/schema.prisma`). Economy uses `CurrencyLedger`, inventory, Arena battle tables, Quest models. **No** `TcgCard` / `TcgDeck` / `TcgMatch` tables today.

**Do not duplicate.** When persisting TCG:

1. Card definitions stay in content JSON (versioned), not rows per card text.
2. Ownership → extend `InventoryItem` / collectible grant patterns / soft binder table **once approved**.
3. Match history → new thin tables or Arena-adjacent models only after product sign-off; prefer event log + publicId.
4. SOL sketches in `prisma/schema-proposals/sol-economy.prisma` remain proposals; extend existing payment/ledger tables.

Flags like `WORLD_PERSISTENCE_PRISMA_ENABLED` stay false until migration approved.

---

## 13. Constraints (binding)

- Local-only by default; no auto-deploy / no unsolicited commit or push  
- SOL / real-money / minting flags **false**  
- No pay-to-win; no guaranteed-profit claims  
- Original IP only  
- Preserve Live World, quests, characters, inventory, progression, wallet, token, community systems  

---

## 14. Success metrics (later)

- Practice match completion rate  
- Deck builder → battle conversion  
- Median match length 5–12 min  
- Soft reward claim without P2W pressure  
- Zero production SOL spends while flags off  
