# Map Generation Security

`src/lib/world-expansion/security.ts`

## Rules

1. **Client cannot create maps** — `create_map` / `generate` / client `seed` → 403.  
2. **Seeds are server-only** (`srv_…` from `createRequestId`).  
3. **Rate limits** — `withApiGuard` on `/api/world-expansion` and `/relocate`.  
4. **Idempotent relocation** — duplicate `idempotencyKey` returns same request.  
5. **Public directory** strips seeds, generator internals, validation IDs.  
6. **No permanent housing on overflow** — enforced in validation + relocation.  
7. **Founders** — cosmetics only; never SOL / P2W.

## Abuse notes

- Force-generate is admin-path only (audited).  
- Occupied maps refuse destructive overwrite.  
- Furniture locks prevent dupe during moves.
