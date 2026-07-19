# Riftwilds TCG — Database Schema

**Phase now:** Content is JSON + in-memory binder/match stores.  
**Next:** Persist binder, craft ledger, Codex, and ranked stats in Postgres (Prisma).

## Content (file-backed, not DB)

| Entity | Location |
|--------|----------|
| Cards | `cards.json` |
| Families | `card-families.json` |
| Expansions | `expansions.json` |
| Formats | `formats.json` |
| Live ops | `live-ops.json` |
| Launch pool | `launch-pool.json` |
| Heroes / decks / keywords | respective JSON |

Runtime views: `normalizeCard`, `buildCardRegistry`.

## Proposed Prisma models (scalable to 5k+ cards)

Proposals live under `prisma/schema-proposals/` (do **not** migrate without approval).

### Already proposed

- `TcgCodexProgress`, `TcgCodexTitle`, `TcgMuseumVisit` — `rift-codex.prisma`

### AAA additions (proposal)

```prisma
model TcgBinderCard {
  id        String   @id @default(cuid())
  userId    String
  cardId    String   // gameplay or variant id
  baseCardId String  // for cosmetic collapse
  finish    String   @default("standard")
  count     Int      @default(0)
  updatedAt DateTime @updatedAt
  @@unique([userId, cardId])
  @@index([userId, baseCardId])
  @@map("tcg_binder_cards")
}

model TcgDeckList {
  id              String   @id @default(cuid())
  userId          String
  name            String
  formatId        String   @default("standard")
  commanderHeroId String
  cardIds         String[] // length 30
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@index([userId, formatId])
  @@map("tcg_deck_lists")
}

model TcgCraftWallet {
  userId            String   @id
  gold              Int      @default(0)
  riftShards        Int      @default(0)
  ancientFragments  Int      @default(0)
  updatedAt         DateTime @updatedAt
  @@map("tcg_craft_wallets")
}

model TcgCraftLedger {
  id        String   @id @default(cuid())
  userId    String
  cardId    String
  path      String   // soft_currency | duplicates | mixed
  gold      Int
  riftShards Int
  ancientFragments Int
  createdAt DateTime @default(now())
  @@index([userId, createdAt])
  @@map("tcg_craft_ledger")
}

model TcgCardStatsDaily {
  id         String   @id @default(cuid())
  cardId     String
  formatId   String
  day        DateTime @db.Date
  plays      Int      @default(0)
  wins       Int      @default(0)
  @@unique([cardId, formatId, day])
  @@map("tcg_card_stats_daily")
}

model TcgLiveOpsOverride {
  id        String   @id @default(cuid())
  key       String   @unique
  payload   Json
  updatedAt DateTime @updatedAt
  @@map("tcg_live_ops_overrides")
}
```

## Indexing strategy (5,000+ cards)

- Content registry stays in process memory (Map by id + facet indexes)
- DB stores **ownership / decks / economy / telemetry**, not full art blobs
- Variants: store finish rows keyed by `baseCardId` to avoid duplicating rules text

## Crypto policy

No table should require a wallet signature for craft or ladder deck legality. Optional NFT cosmetics (if ever) must map to finish rows only.
