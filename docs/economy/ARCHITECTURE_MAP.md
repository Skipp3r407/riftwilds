# Economy Architecture Map (as of Phase 0)

Current-state data flow for Credits, SOL, inventory, and marketplace. Target Phase 1+ unifies around a Master Economy Core facade without requiring SOL for play.

---

## Credits / SOL / inventory / marketplace (today)

```mermaid
flowchart TB
  subgraph Client
    LW[Live World Phaser]
    ShopUI[Shop UI]
    MktUI[Marketplace UI]
    HatchUI[Hatchery UI]
    LoyUI[Loyalty UI]
  end

  subgraph SoftCurrency
    PlayState[demoCredits play-state]
    Ledger[Credits ledger memory]
    PrismaSC[PlayerProfile.softCurrency]
    PrismaCL[CurrencyLedger]
  end

  subgraph OptionalSOL
    EarnedSol[In-game earned SOL local]
    Wallet[SIWS wallet]
    Flags[SOL_* flags OFF]
    Escrow[SOL escrow NOT IMPLEMENTED]
  end

  subgraph Assets
    Inv[InventoryItem / InventoryLedger]
    Pets[Creature / Egg]
    Equip[PetLoadout / equipment]
  end

  LW -->|mirror / flush pending| Ledger
  LW --> PlayState
  HatchUI -->|EGG_PURCHASE debit| Ledger
  LoyUI -->|airdrop / storm soft| Ledger
  ShopUI -->|IN_GAME_SOL| EarnedSol
  ShopUI -.->|WALLET_SOL blocked| Flags
  MktUI -->|demo listings memory| MktMem[demo-listings store]
  MktUI -.->|SOL mode| Escrow
  Ledger -->|optional sync| PrismaCL
  Ledger -->|optional sync| PrismaSC
  Wallet -->|auth only| Session[Session / User]
  Ledger --> Inv
  HatchUI --> Pets
  Equip --> Pets
```

---

## Target Master Economy Core (Phase 1+)

```mermaid
flowchart LR
  UI[Game / Shop / Market / Hatch / Spirit / Loyalty]
  Facade[economy/core SettlementService]
  Credits[CreditsAdapter - required play]
  SolOpt[SolAdapter - flagged optional]
  LoyaltyTok[LoyaltyTokenAdapter - cosmetics]
  ArenaPts[ArenaPointsAdapter - non-transferable]
  Persist[Prisma CurrencyLedger + softs]

  UI --> Facade
  Facade --> Credits
  Facade --> SolOpt
  Facade --> LoyaltyTok
  Facade --> ArenaPts
  Credits --> Persist
  SolOpt -->|PaymentIntent only when flags on| Chain[Treasury-safe programs]
```

---

## Ownership transfer (marketplace intended)

```mermaid
sequenceDiagram
  participant Seller
  participant API as Marketplace API
  participant Core as SettlementService
  participant Ledger as Credits Ledger
  participant Assets as Egg/Pet/Item

  Seller->>API: Create listing Credits
  API->>Assets: Lock / verify ownership
  Note over API: Buyer purchase
  API->>Core: settlePurchase requestId
  Core->>Ledger: debit buyer + fee burn/treasury
  Core->>Ledger: credit seller net
  Core->>Assets: transfer ownership
  API-->>Seller: sale notification
```

Today the purchase route updates the in-memory listing and returns allocation math but **does not** call the Credits ledger.

---

## Spirit Recovery vs Care vs Shop Recovery

```mermaid
flowchart TB
  Down[Riftling Downed]
  Spirit[src/game/spirit recovery-service]
  Care[Care Credits sinks]
  ShopRec[/shop/recovery SOL catalog]
  Credits[Credits ledger]

  Down --> Spirit
  Spirit -->|SERVICE_FEE / Credits| Credits
  Care --> Credits
  ShopRec -.->|should become Credits SKU Phase 8-9| Credits
```

Integrate in Phase 8; do not duplicate Spirit logic.
