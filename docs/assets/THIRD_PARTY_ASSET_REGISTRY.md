# Third-Party Asset Registry

Canonical machine-readable registry:

```
assets/licenses/third-party-assets.json
```

Schema & validators live in:

- `src/lib/assets/third-party/schema.ts`
- `src/lib/assets/third-party/validate.ts`
- `src/lib/assets/third-party/registry.ts`

## Record fields (summary)

| Field | Purpose |
|-------|---------|
| `id` | Stable slug |
| `title` / `creator` / `kind` | Human browse |
| `sourceUrl` / `previewUrl` | Discovery links (no pack required) |
| `licenseName` / `licenseUrl` / `licenseCategory` | Legal |
| `status` | Pipeline gate |
| `styleScore` | 0–100 fit vs Riftwilds style |
| `riskNotes` | Reviewer flags |
| `fingerprint` / `sourcePackId` | Duplicate detection |
| `privatePath` | Staging under `private-assets/` |
| `runtimePath` | Only when `APPROVED` / `NEEDS_ATTRIBUTION` / `IN_USE` |

## Status meanings

| Status | Runtime? | Meaning |
|--------|----------|---------|
| DISCOVERED | No | Found via reputable source; metadata only |
| LICENSE_REVIEW | No | Needs human license confirmation |
| APPROVED | Eligible | Cleared; may process into runtime |
| NEEDS_ATTRIBUTION | Eligible | Cleared with credits obligation |
| IN_USE | Yes | Present in `public/` (or `/sounds/`) |
| REJECTED | No | Failed policy |
| RESTRICTED | No | High risk / unverified — hold |

## Admin browse

- UI: `/admin/assets/library`
- API: `GET /api/admin/assets/library` (admin role)
- Mutations stubbed until discovery approval

## Validation rules (tests)

- No license → cannot enter runtime statuses
- Restricted / rejected → no `runtimePath`
- Duplicate `id` / `fingerprint` / same source pack → fail

Run: `npx vitest run tests/unit/third-party-asset-registry.test.ts`
