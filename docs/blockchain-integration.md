# Blockchain Integration — Optional / Off by Default

> **Mandate:** SOL and on-chain features remain optional. Competitive play must work fully offline of chain.  
> Code: `src/lib/economy/sol/`, `src/lib/solana/`, SIWS auth helpers.  
> Docs: `docs/economy/SOL_*.md`, `docs/security/SOL_THREAT_MODEL.md`.

---

## 1. Principles

1. **Soft-first** — Credits binder and matchmaking never require a wallet.  
2. **Flags default false** — no accidental mainnet or production spends.  
3. **Ownership mirror** — on-chain collectibles (future) reflect soft grants; they do not create exclusive competitive power.  
4. **No pay-to-win / no guaranteed profit.**  
5. **Devnet / localnet** for any simulation; never assume mainnet.

---

## 2. What exists today

| Piece | State |
|-------|-------|
| Wallet Center `/wallet` | Soft UI; SOL connect gated |
| Purchase orders | `SOFT_SIMULATION` / `PRODUCTION_BLOCKED` modes |
| Collectible editions | Types + browser; minting off |
| Marketplace SOL settle | Blocked |
| Tournament SOL cups | Blocked |
| SIWS | Auth identity, not spends |
| Schema proposals | `prisma/schema-proposals/sol-economy.prisma` (commented) |

---

## 3. Future integration map (Phase 7–8)

```
Soft binder ownership ──optional mirror──► Collectible edition / mint (flag)
Credits cosmetics     ──never──► on-chain power
Match results         ──never──► automatic SOL payout (wagering forbidden)
```

Any mint must:

- Pass legal / regional controls  
- Use restricted keys + treasury architecture docs  
- Remain disableable instantly via flags  

---

## 4. Explicit non-goals for Phase 1–5

- On-chain match settlement  
- NFT-gated ranked access  
- Player-funded prize pools in SOL  
- Automatic withdrawal of match rewards  

---

## 5. Operator checklist before enabling any SOL flag

1. Legal review (`docs/legal/LEGAL_REVIEW_CHECKLIST.md`)  
2. Threat model pass  
3. Production blocked modes cleared intentionally  
4. Observability / reconciliation runs green  
5. Product + eng sign-off recorded in implementation-status  

Until then: **keep all SOL/real-money flags false.**
