# Riftwilds Revenue Allocation — Architecture

## Compliance

- No guaranteed income, returns, profits, or fixed payouts to holders.
- Network fees are **not** project revenue.
- All amounts in **integer lamports**. Remainder after integer division → Growth Reserve by default.
- Policies are **versioned**; never rewrite historical ledger rows.
- Phase 1 records ledger allocations only — no automatic vault transfers.

---

## 1. Payment and allocation architecture

```
User pays → Collection vault (Strategy A: ledger)
         → Verify finalized tx
         → AllocationLedgerEntry per destination (immutable)
         → Item/service delivery
         → Pet-holder share accrues to current RewardEpoch (not micro-paid)
         → Settlement batch job (Phase 2+) moves vault balances
```

`PAYMENT_SPLIT_STRATEGY="ledger"` (default). Atomic on-chain split is Phase 4 after audit.

---

## 2. Recommended wallet structure

| Vault key | Purpose |
|-----------|---------|
| PAYMENT_COLLECTION_VAULT | Incoming payments |
| GROWTH_RESERVE_VAULT | Growth / promotions / development expansion |
| PET_HOLDER_REWARD_VAULT | Community Reward Treasury (epoch pool) — not automatic Pump.fun buy income |
| OPERATIONS_VAULT | Dev & ops |
| COMMUNITY_EVENT_VAULT | Events |
| MARKETPLACE_ESCROW_VAULT | P2P sale escrow |
| EMERGENCY_RESERVE_VAULT | Incidents |

Production: multisig. Never put treasury keys in frontend, env public vars, DB, or git.

---

## 3. Direct-shop allocation (launch)

| Destination | BPS |
|-------------|----:|
| Growth Reserve | 7000 |
| Community Reward Treasury | 1500 |
| Development and Operations | 1000 |
| Community Events | 500 |
| **Total** | **10000** |

---

## 4. Marketplace allocation (launch)

| Destination | BPS |
|-------------|----:|
| Seller | 9000 |
| Growth Reserve | 500 |
| Community Reward Treasury | 300 |
| Operations | 100 |
| Community Events | 100 |
| **Total** | **10000** |

Crafting / upgrade / listing fees use separate `RevenueSourcePolicy` rows (defaults inherit shop or marketplace patterns).

---

## 5. Holder eligibility (Model A launch)

Living pet + min token balance + reward-active selection + care score + not sick/dormant/deceased/listed + ownership & token hold duration + not fraud-blocked.  
Max 3 reward-bearing pets/wallet. Weight 1.00 each.  
Eggs: Model B, `EGG_HOLDER_REWARDS_ENABLED=false` (weight 0.25 when enabled, max 2).

Reward weight must **not** scale with rarity, SOL spent, wins, or cosmetics.

---

## 6. Epoch calculation flow

1. Accrue vault deposits into open epoch  
2. At schedule (default 24h): snapshot eligibility  
3. `walletReward = pool × walletWeight ÷ totalWeight` (lamports, remainder rules)  
4. Finalize → claimable balances  
5. Pull-based claims (Phase 3; `REWARD_CLAIMS_ENABLED=false` now)

---

## 7. Settlement strategy

Batch hourly or by threshold. Strategy A ledger → settlement job. Store batch IDs, signatures, retries. Emergency pause supported.

---

## 8. Claim strategy

Pull-based. Min claim, 90-day availability, expired → return to Pet Holder Reward Vault (not personal project revenue). No auto micro-transfers.

---

## 9. Rounding rules

Integer division per destination; leftover lamports → Growth Reserve.  
Invariant: `sum(allocations) === gross`.

---

## 10. Refund-adjustment flow

Never delete ledger rows. Post offsetting entries. If epoch already finalized, adjust future epoch; reconcile carefully — no silent negative balances after claim without review.

---

## 11. Database migration plan

Append `RevenueAllocationPolicy` / `Entry`, `AllocationLedgerEntry`, `SettlementBatch*`, vault keys, epoch extensions. Soft-launch with flags; historical purchases keep `policyVersion`.

---

## 12. Security threat model

| Threat | Mitigation |
|--------|------------|
| Fake browser success | Finalized RPC verify |
| Replay signature | Unique constraint |
| Wrong amount/dest | Exact match on intent |
| Float drift | Lamports bigint only |
| Retroactive policy edit | Immutable versions + dual approval (prod) |
| Dust spam rewards | Epoch batching + eligibility caps |

---

## 13. Devnet testing plan

Duplicate webhooks, under/overpay, wrong mint, rounding, refunds, settlement failure, ineligible claim, policy transition. Claims/settlements only after verification.

---

## 14. Implementation checklist

- [x] Architecture doc  
- [x] Phase 1 policies + ledger math + UI + admin shell + tests  
- [ ] Phase 2 verified payments + settlement batches  
- [ ] Phase 3 claims  
- [ ] Phase 4 audited atomic split + mainnet  
