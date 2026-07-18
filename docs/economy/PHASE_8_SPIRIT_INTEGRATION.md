# Phase 8 — Spirit Recovery Integration (no rebuild)

**Date:** 2026-07-18

Spirit & Recovery shipped in parallel. Economy Phase 8 **integrates** that system.

## Canonical surfaces (owned by Spirit agent)

| Surface | Path |
|---------|------|
| Recovery API | `POST /api/pets/[publicId]/recovery` |
| Spirit status | `GET /api/pets/[publicId]/spirit` |
| Hardcore | `/api/pets/[publicId]/hardcore` |
| Memorials | `/api/memorials` |
| Spirit Realm UI | `/spirit-realm` |
| Engine | `src/game/spirit/**` |
| Docs | `docs/riftlings/*` |

## Economy compatibility

| Surface | Role |
|---------|------|
| `GET/POST /api/spirit/recover` | Thin facade → same `recoverRiftling` / `getRecoveryOptions`. Points clients at canonical pets APIs. |
| Credits sinks | Spirit uses existing `spendServiceFee` / Credits healer (not a second ledger). |
| `SOL_SPIRIT_RECALL_ENABLED` | Defined in feature flags, default **false**. |
| Shop `/shop/recovery` | Catalog SKUs; recovery orchestration stays in Spirit engine. |

## Rules

1. Do **not** create a second Spirit Realm or duplicate recovery methods 1–7.
2. SOL Instant Recall remains optional and flagged off.
3. Equipment preservation / memorials / hardcore stay in `src/game/spirit`.
