# Riftwilds — Product & Economy Roadmap

**Audience:** Keepers (players) + team  
**Status:** Public-facing plan (aligned with engineering docs)  
**Public page:** [`/roadmap`](../../src/app/(marketing)/roadmap/page.tsx)  
**Binding vision:** [PROJECT_VISION.md](./PROJECT_VISION.md) · [ROADMAP.md](./ROADMAP.md)  
**Economy detail:** [MASTER_ECONOMY_ROADMAP.md](../economy/MASTER_ECONOMY_ROADMAP.md) · [CURRENCY_MODEL.md](../economy/CURRENCY_MODEL.md) · [NO_PAY_TO_WIN_POLICY.md](../economy/NO_PAY_TO_WIN_POLICY.md)

---

## Honest framing

Riftwilds launches as a **strategic collectible card game** (Rift Battles). The Living World — walk, meet friends, house, explore — is a **later release**. Systems for that world stay in the product; they are not scrapped.

**Credits (Gold)** power everyday play. **SOL is optional**, never required for battles, decks, quests, or progression, and never buys competitive power (no pay-to-win). Nothing here is investment advice; collectibles and optional wallet features are entertainment cosmetics / convenience, not a promise of profit.

---

## Phase overview

| Phase | Name | Keeper takeaway |
|-------|------|-----------------|
| **Now** | Rift Battles core | Binder, practice, quests, packs, Credits |
| **Next** | Coin & economy expansion | Stronger Gold sinks/faucets, Rift Shards, optional SOL (flagged) |
| **Later** | Living World release | Social hub, exploration, housing — built on TCG progress |

---

## Now — Rift Battles (live core)

This is the game you play today.

### What is live

- **Rift Battles / card deck** — Rift Energy board, practice matches, deck construction  
- **Card Binder** — collection browse and legal decks  
- **Quests** — guided progression into battle, packs, hatchery, and care  
- **Packs & shop** — Credits sinks for collection growth  
- **Credits (Gold)** — required soft currency for shop, marketplace listings, and everyday sinks  
- **Riftlings** — companions that feed card identity and care loops  

### What is secondary / preview

- **Arena** (legacy pet battler) — soft-secondary; affinities and rewards still inform the TCG  
- **Live World** — enterable in development / preview; not the launch product. Public release comes later  

### Success for this phase

Keepers can grow a collection, build decks, duel, claim quests, and spend Credits — with **no wallet** and **no SOL**.

Engineering checklist and soft-gate policy: [ROADMAP.md](./ROADMAP.md).

---

## Next — Coin & economy expansion

Expand the soft economy around the TCG without making wallets or real money a gate.

### Currencies (player language)

| Name | Ledger / role | Required to play? |
|------|---------------|-------------------|
| **Gold** (Credits) | Primary soft currency (`CREDITS`) | Yes — shop, packs, care, Credits marketplace |
| **Rift Shards** | Secondary soft currency (`RIFT_SHARDS`) | No — prestige / cosmetics / convenience |
| **SOL** | Optional wallet path | **Never** for core play or card power |

See [CURRENCY_MODEL.md](../economy/CURRENCY_MODEL.md).

### Gold / Credits — sinks & faucets

Keep Credits meaningful by pairing rewards with spends.

**Faucets (earn):** quests, daily/weekly goals, battle/quest rewards, events (capped), achievements.  
**Sinks (spend):** packs, shop, marketplace fees, care/repair, housing prep, craft/travel, restoration donations.

Balance tables: [FAUCET_SINK_BALANCE.md](../economy/FAUCET_SINK_BALANCE.md).

### Rift Shards

- Earn through play milestones and selective rewards  
- Spend on cosmetics, convenience, or prestige — **not** exclusive competitive card power  
- Not required for TCG matches, starter decks, or Live World entry  
- Not transferable P2P in early shards phases  

### Optional SOL (flagged)

When enabled behind feature flags:

- Cosmetics, collectible *editions* (alt art / foil framing), marketplace convenience  
- Never required for essential competitive cards  
- Never required for progression, matches, or quests  
- Collectible editions do **not** grant ATK/HP/energy or exclusive competitive effects  

Policy: [NO_PAY_TO_WIN_POLICY.md](../economy/NO_PAY_TO_WIN_POLICY.md).  
Phased engineering work: [MASTER_ECONOMY_ROADMAP.md](../economy/MASTER_ECONOMY_ROADMAP.md) (settlement → marketplace → premium → season pass → optional SOL scaffolding).

### Economy expansion sub-phases (product view)

1. **Credits spine** — settlement, naming (Gold = Credits), honest shop/marketplace  
2. **TCG sinks** — packs, binder cosmetics, battle-adjacent spends  
3. **Rift Shards** — secondary ledger + earn/spend surfaces  
4. **Season / pass tracks** — free track viable; premium = cosmetics/convenience  
5. **Optional SOL** — flagged adapters only; Credits path always works  

---

## Later — Living World release

Living World is **not cancelled**. Code and routes stay; we soft-gate or preview until the release is ready.

### What Keepers get later

- **Social hub** — presence, friends, shared spaces  
- **Exploration** — regions, discovery, world events (retention systems already scaffolded)  
- **Housing / neighborhoods** — expression and visits  
- **TCG handoff** — world encounters return to the same Rift Battle board  

### How it builds on the TCG

- Decks, collections, and Credits progress carry forward  
- World content adds places to show off trophies, meet duel tutors, and run guild/team formats later  
- No second combat engine — Living World feeds into Rift Battles  

Retention ideas and systems inventory: [LIVING_WORLD_RETENTION_ROADMAP.md](../world/LIVING_WORLD_RETENTION_ROADMAP.md).  
Playable / flag notes: `docs/LIVE_WORLD_PLAYABLE.md` (when present).

---

## Non-negotiables (every phase)

1. Do not delete Live World / housing / social systems — soft-deprecate or Coming Soon.  
2. Credits remain the required play currency.  
3. SOL never required for play, progression, or battle power.  
4. No real-value wagering.  
5. No investment / profit promises for SOL, tokens, or collectibles.  
6. Extend existing engines — do not fork a second TCG, ledger, or overworld.

---

## Cross-links

| Topic | Doc / route |
|-------|-------------|
| Vision | [PROJECT_VISION.md](./PROJECT_VISION.md) |
| Engineering phase order | [ROADMAP.md](./ROADMAP.md) |
| Master economy phases | [MASTER_ECONOMY_ROADMAP.md](../economy/MASTER_ECONOMY_ROADMAP.md) |
| Player Credits guide | `/economy/credits` |
| Fairness | `/fairness` |
| Help | `/help` |
| Public roadmap | `/roadmap` |
