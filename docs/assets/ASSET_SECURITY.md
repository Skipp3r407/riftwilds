# Asset Security

## Threat model

| Risk | Mitigation |
|------|------------|
| Malicious zip / installer in “free pack” | Never run pack scripts; scan; stage under `private-assets/` only |
| License laundering via mirrors | Prefer upstream Kenney / OGA / Poly Haven pages |
| Accidental ship of restricted packs | gitignore discovered/rejected/restricted; validators block `runtimePath` |
| Admin API abuse | Admin role + rate limit + audit (`/api/admin/assets/library`) |
| Path traversal into private packs | API returns metadata only — no file streaming of raw packs |
| Franchise / scraped IP | Policy reject + similarity review for creatures |

## Rules

1. Do **not** put restricted raw source packs in `public/`.
2. Do **not** execute scripts bundled inside untrusted asset zips.
3. Do **not** bypass paywalls, logins, robots, ToS, or rate limits.
4. Downloads (when approved) use browser / official download buttons — not scrapers.
5. Hash approved binaries into `fingerprint` for duplicate / integrity checks.
6. Keep secrets out of registry JSON (no API keys).

## Runtime boundary

```
private-assets/  →  human gate  →  processed derivatives  →  public/
```

`import-gate.mjs` fails if a non-runtime status still declares `runtimePath`.
