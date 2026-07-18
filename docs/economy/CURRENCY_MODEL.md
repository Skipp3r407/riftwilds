# Currency Model

## Gold

- Player-facing name for the existing **Credits** soft currency.
- Ledger key remains `CREDITS` in `CurrencyLedger` / Credits module.
- Settlement via `SettlementService` (`src/lib/economy/core/settlement.ts`).
- Required for core sinks/faucets (shop, care, TCG rewards, Credits marketplace).

## Rift Shards

- Secondary soft currency (`RIFT_SHARDS`).
- In-memory ledger: `src/lib/economy/sol/rift-shards.ts`.
- Prisma proposal: extend `CurrencyLedger` or `RiftShardBalance` (see `prisma/schema-proposals/sol-economy.prisma`).
- Not required for TCG matches, Live World entry, or starter decks.
- Not transferable P2P in v1.

## SOL

- Optional real-money path (lamports).
- Cosmetics, collectible editions, marketplace, tournaments, creators, campaigns only.
- Never required for competitive card power or essential cards.
- All spends behind mandate flags + regional/age stubs.

## Resolution helper

`resolveCurrency()` in `src/lib/economy/sol/currencies.ts` maps Credits/Demo aliases → Gold.
