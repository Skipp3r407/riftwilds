# SOL Threat Model

**Status:** Scaffold mitigations documented. Live SOL spend disabled.

| Threat | Mitigation |
|--------|------------|
| Wallet impersonation | Signed nonce challenge; never trust client address alone |
| Signature replay | Single-use nonce / challenge; expiry TTL |
| Client price manipulation | Server-side price + fee calc; ignore client amounts for settle |
| Transaction spoofing | Server RPC verify before FINALIZED |
| RPC poisoning | Pin trusted RPC; compare multiple endpoints later |
| Double spending / double settle | requestId idempotency + settlement state machine |
| Duplicate entitlement grants | Entitlement map keyed by requestId |
| Marketplace front-running | Escrow program design (future); listings locked on purchase start |
| Listing substitution | Asset key bound at order create |
| Unauthorized minting | `SOL_MINTING_ENABLED` + NFT flags false; queue blocked |
| Treasury theft | No production keys in repo; withdrawals flagged off |
| Admin compromise | Role-gated admin APIs; audit log stubs |
| Secret leakage | Env-only secrets; never commit |
| Creator fraud | Mandatory review before publish |
| Wash trading | Integrity stubs in marketplace module |
| Bot attacks | Rate limits via `withApiGuard`; Founder per-wallet limits |
| Tournament collusion | Manual review hooks; SOL entry off |
| Malicious metadata | Review pipeline for creator products |
| Dependency compromise | Lockfile + CI; pin Solana libs when added |

## Residual risk

Until escrow + legal review land, keep all SOL_* flags **false**.
