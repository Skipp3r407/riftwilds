# Project Treasury System (Automated Distribution)

## Architecture

```
Pump.fun Creator Wallet
        ↓  (creator fees — conceptual; single landing)
Project Treasury Wallet
        ↓
Treasury Monitoring Service  (poll + RPC failover + dedupe)
        ↓
Distribution Engine  (% rules, approval threshold)
        ↓
Transfer Engine  (simulate by default · real sign behind flags)
        ↓
Dev / Marketing / Tournament / Creator / Community / Liquidity / Emergency
(+ Operations, Cold Storage, Backup, unlimited CUSTOM wallets)
```

**Critical rule:** Pump.fun does **not** split to multiple recipients in this product model. All creator fees land in **one** Project Treasury Wallet; Riftwilds distributes afterward.

## Product constraints

| Constraint | Status |
|------------|--------|
| No player SOL wagering / P2W / battle escrow | Enforced — arena stakes stay off |
| Tournament prizes may be treasury-funded (ops) | Supported as `TOURNAMENT` wallet |
| No holder dividend autopay | Enforced — Community wallet funds events/grants only |
| Wallet optional for core play | Treasury is admin/ops finance |
| Private keys never on frontend | Server-only encrypted env stubs |

## Default split (configurable, must sum 100%)

| Wallet | % |
|--------|---|
| Development | 35 |
| Marketing | 20 |
| Tournament | 15 |
| Community | 10 |
| Creator | 10 |
| Emergency | 5 |
| Liquidity | 5 |

## Local persistence

- Runtime store: `src/lib/treasury-ops/` + `.data/treasury-ops/state.json`
- Prisma proposal: `ProjectTreasury*` models at end of `prisma/schema.prisma`
- Feature flags: `TREASURY_OPS_ENABLED`, `TREASURY_OPS_REAL_TRANSFERS` (off), `TREASURY_OPS_MONITOR_ENABLED`

## Surfaces

| Surface | Path |
|---------|------|
| Admin ops dashboard | `/admin/treasury` |
| Public community treasury (separate product surface) | `/treasury` |
| API root | `/api/treasury-ops` |

## Related docs

- [distribution-engine.md](./distribution-engine.md)
- [monitoring-service.md](./monitoring-service.md)
- [treasury-security.md](./treasury-security.md)
- [treasury-api.md](./treasury-api.md)
- [treasury-database.md](./treasury-database.md)
- [admin-dashboard.md](./admin-dashboard.md)
- [treasury.md](./treasury.md) — community treasury overview

## Demo vs automated

| Capability | Local default |
|------------|---------------|
| Seed sample revenue | Automated on first load |
| Pump.fun fee ingest | **Simulated** via monitor tick / ingest API |
| Categorize + queue + % plan | Automated |
| Approval threshold | Automated (queue vs pending approval) |
| On-chain SOL transfers | **Simulated** until keys + `TREASURY_OPS_REAL_TRANSFERS` |
| Marketplace fee hook | Soft-hook after Credits purchase (ops ledger) |
