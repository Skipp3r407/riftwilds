# Admin · Third-Party Asset Library

## Surfaces

| Surface | Path |
|---------|------|
| UI stub | `/admin/assets/library` |
| API | `GET /api/admin/assets/library` |
| Mutations | `POST /api/admin/assets/library` (**stubbed**) |
| Registry file | `assets/licenses/third-party-assets.json` |

## Auth

Requires session `role === "admin"` (same pattern as `/api/admin/sessions`).

## Browse behavior

- Lists registry metadata (title, status, license, style score, preview links).
- Does **not** stream files from `private-assets/restricted` or `rejected`.
- `RESTRICTED` / `REJECTED` private paths are stripped from browsable payloads.

## Approve / reject (future)

POST body (planned):

```json
{ "action": "approve" | "reject" | "request_license_review", "id": "disc-kenney-ui-pack" }
```

Currently returns `{ stub: true, accepted: false }` until discovery report approval unlocks writes.

## Operator checklist

1. Review [ASSET_DISCOVERY_CANDIDATES.md](../assets/ASSET_DISCOVERY_CANDIDATES.md)
2. Confirm license on source page
3. Only then enable approve writes / download to `private-assets/`
4. Run `node scripts/assets/third-party/import-gate.mjs`
5. Run `npx vitest run tests/unit/third-party-asset-registry.test.ts`
