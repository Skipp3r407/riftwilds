# Community Rewards Ecosystem

Riftwilds is a **Pump.fun meme coin on Solana** with a creature game. Pet rewards are framed as a **community rewards ecosystem**, not as automatic income from buying the coin.

## What we do **not** claim

- Buying or trading the Pump.fun coin does **not** automatically generate SOL for pet owners.
- Each token purchase is **not** a direct pay-to-pets income stream.
- Estimated Rewards never tick up on a timer without verified treasury deposits.

## How it works

1. **Own a Riftling** → unlock access to the Pet Reward system.
2. **Community Reward Treasury** receives funds only from **approved, project-controlled sources**:
   - Game revenue
   - Marketplace fees (when settled)
   - Optional creator allocations (verified deposits)
   - Other transparent funding the project controls
3. Players complete **quests / events / participation** to stay eligible.
4. Eligible pet owners see **Estimated / Claimable / Lifetime** rewards on the pet profile, plus today’s community activity and the next distribution countdown.

## Honesty rules (server)

| Rule | Behavior |
|------|----------|
| Estimates | Share of the open treasury epoch pool; update only on `recordVerifiedVaultDeposit` |
| Claimable | Moves only via epoch finalization or claim |
| Token buys | Not an automatic deposit path into the vault |
| Metrics | Blank / N/A when mint or indexers unset — never fabricate reward SOL |

Implementation: `src/lib/rewards/`, deposit injector `POST /api/economy/reward-vault/deposit`.

## Pump.fun community dashboard

Route: `/community` (also linked from `/token`).

Env:

```bash
NEXT_PUBLIC_PUMPFUN_MINT=
NEXT_PUBLIC_PUMPFUN_URL=
```

| Feature | Status when mint unset | Status when mint set |
|---------|------------------------|----------------------|
| Chart embed | Empty state | DexScreener iframe + external link (Pump.fun may block iframes) |
| Market cap / price | N/A | Best-effort DexScreener |
| Holders | N/A | N/A until holder indexer |
| Bonding curve | N/A | N/A until Pump.fun indexer |
| Burns | 0 / N/A | Honest — no burn tokenomics wired |
| Whales / top holders | Empty | Empty until holder API |
| Milestones | Progress from game counters; holders pending | Content config in `src/content/community/milestones.ts` |
| Activity feed | Game + community + token channels | Same |

API: `GET /api/community/metrics`.

## Related docs

- `docs/ECONOMY_LOOP.md` — flywheel stages
- `docs/REVENUE_ALLOCATION.md` — allocation BPS (ledger destinations; labels use Community Reward Treasury)
- Public FAQ: `/economy` Economy FAQ
