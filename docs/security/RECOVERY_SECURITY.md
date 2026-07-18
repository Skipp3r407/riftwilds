# Recovery Security

## Anti-exploit

| Threat | Mitigation |
|--------|------------|
| Recovery duplication | `requestId` processed set; loyalty/credits ledgers also idempotent |
| Multiple recoveries | Life state must be recoverable; healthy pets rejected |
| Wallet replay | SOL recall requires unique requestId + wallet + treasury validation |
| Fake recoveries | Server-authoritative `recoverRiftling` only |
| Item duplication | Inventory qty decremented before finalize |
| Quest skipping | Steps advance one-at-a-time; completion required |
| Recovery farming | Costs Credits/items/tokens; SOL capped; no rarity pricing exploit |
| Spirit farming | Quest rewards use ledger requestIds; not combat power |

## SOL Instant Spirit Recall

- Feature-flagged off by default
- Pool empty → substitute Credits (never invent SOL)
- Fraud risk gate (≥ 0.7 rejects)
- Quotes ignore rarity / emotion / market value / pet count (unit-tested)

## Marketplace

`validateListingCreate` + `canListPetOnMarketplace` block DOWNED, SPIRIT_FORM, CRITICAL, WEAK, memorialized, permadead, quest-locked.
