# Factions — Ranks & Reputation Hooks

Narrative factions expand guild/politics without deleting existing NPC `faction` strings or `FACTION_VALUES` social axes.

---

## Mapping narrative → systems

| Narrative faction | Existing hooks | Reputation axes to lean on |
|---|---|---|
| Commons Keepers Circle | `commons-keepers`, `riftkeepers` | town, hero, trust, honor |
| Plaza Wardens / Guard | `commons_guard` | honor, town; fear notoriety |
| Hatchery Compact | Mira, care quests | mercy, trust, hatchery (story) |
| Codex & Celestora Scribes | Solen, Citadel archives | trust, explorer |
| Merchant Fairway | `merchant_guild`, Tessa | merchant, trust |
| Ember Forge League | Vessa, forge jobs | town, honor |
| Rootcrown Rangers | Elderwood cast | wildfolk (story), mercy |
| Spirewind League | Storm guards | honor, monsterHunter |
| Stillwinter Lodge Pact | Frostveil | town, mercy |
| Radiant Conclave Remnant | Aurex, temple | mercy, temple values |
| Lanternfold Vigil | Spirit Marsh | mercy, spirit trust |
| Alloy Salvage Compact | Pax/Ferrum | merchant, explorer |
| Hollow Sealers | Void seal jobs | trust vs notoriety split |
| Lattice Revivalists | Hex-leaning | power / criminal risk if forced bonding |
| Wildfolk Paths | story `wildfolk` | explorer, wildfolk |
| Black Market Veil | `black_market` | criminal, notoriety |
| Arena Cohorts | Rook, mercenary values | monsterHunter, honor-or-notoriety |

---

## Rank ladders (design targets)

Ranks are **content hooks** for future reputation thresholds (`reputationMin` already exists on travel unlocks).

### Commons Keepers Circle

1. Visitor  
2. Probationary Keeper  
3. Bonded Keeper (after first hatch)  
4. Pathkeeper (multi-region)  
5. Circle Voice (council soft veto on Compact breaches)

### Hatchery Compact

1. Nest-Guest  
2. Shell-Sitter  
3. Bond-Guide  
4. Compact Signatory (NPC title; players get ceremonial badge)

### Codex & Celestora

1. Page-Turner (Cal Reed tier)  
2. Index Aide  
3. Fragment Archivist  
4. Living-Core Scholar (Citadel clearance — Serae conflict)

### Spirewind League

1. Groundling  
2. Harnessed  
3. Trial-Flown  
4. Beacon Peer

### Alloy Salvage Compact

1. Scrap-Runner  
2. Circuit Hand  
3. Foundry Peer  
4. Conductor’s Rival / Ally (branch)

---

## Moral choice frameworks (faction-facing)

Every major choice should move **at least two** axes in tension:

| Framework | Example | Axes |
|---|---|---|
| Mercy vs Order | Spare Tidecutter vs turn in | mercy ↔ town/honor |
| Truth vs Safety | Publish Fracture ledger vs seal | trust/explorer ↔ town |
| Connection vs Hush | Purify Heart vs quarantine | hero/trust ↔ void calm |
| Scale vs Care | Hex rebuild vs Compact limit | merchant/power ↔ mercy |
| Wild vs Warden | Follow Riftling aurora vs report | wildfolk ↔ wardens |

Never auto-fail a faction to zero for one choice; use gossip lag (`docs/npc/REPUTATION_SYSTEM.md`).

---

## Guild wars (decade backlog)

Full faction wars remain stubbed. Narrative may foreshadow **Beacon Schism** (Coast) and **Aerie Duel Season** (Stormspire) without shipping PvP politics yet.
