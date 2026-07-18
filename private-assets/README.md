# private-assets

Staging area for third-party packs that are **not** part of the public game runtime.

| Folder | Purpose |
|--------|---------|
| `discovered/` | Downloaded candidates awaiting license review (gitignored binaries) |
| `approved/` | Human-approved, license-cleared sources before runtime process |
| `rejected/` | Packs that failed policy (gitignored; metadata stays in registry) |
| `restricted/` | High-risk / unclear ownership holds (gitignored) |

Rules:

1. Never put restricted raw packs under `public/`.
2. Registry status must be `APPROVED` or `NEEDS_ATTRIBUTION` before any copy into runtime.
3. Prefer links + metadata in `assets/licenses/third-party-assets.json` until approval.
4. See `docs/assets/ASSET_IMPORT_PIPELINE.md` and `docs/assets/ASSET_SECURITY.md`.
