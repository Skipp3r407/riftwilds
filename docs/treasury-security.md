# Treasury Ops Security

## Principles

- **Server signing only** — no private keys in client bundles or API responses.
- **Encrypted env stubs** — `TREASURY_OPS_SIGNER_SECRET_ENCRYPTED` / keypair path; never committed.
- **Demo-safe default** — without keys + `TREASURY_OPS_REAL_TRANSFERS`, payouts are simulated.
- **Idempotency / replay protection** — unique `idempotencyKey` + signature dedupe.
- **RBAC** — write APIs require `session.role === "admin"` (`requireTreasuryAdmin`).
- **Audit logs** — every pause/resume/rule/wallet/distribution mutation.
- **Rate limits** — `withApiGuard` buckets per route.
- **Multi-sig future-ready** — transfer module fails closed until sealed signer + multi-sig review.
- **Wallet verification** — live broadcast rejects `COMING_SOON` / seed addresses.

## Explicit non-goals

- Player-vs-player SOL escrow / gambling
- Automatic SOL payments to all token holders for holding
- Frontend exposure of treasury signing material

## Related

Arena security notes remain in [security.md](./security.md). Broader docs under `docs/security/*`.
