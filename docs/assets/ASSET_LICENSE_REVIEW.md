# Asset License Review Checklist

Use this for every candidate before status leaves `LICENSE_REVIEW`.

## Reviewer checklist

1. **Source page** — open the original listing (not a random mirror).
2. **License text** — screenshot / quote the license paragraph into `notes` or credits.
3. **Commercial game use** — explicitly allowed?
4. **Attribution** — required? exact wording? where will it appear (`MUSIC_CREDITS.md`, site credits, in-game)?
5. **ShareAlike / copyleft** — if SA/GPL on art, escalate; usually **reject** for closed commercial content.
6. **NC / personal** — **reject**.
7. **Trademark / character** — any franchise resemblance? **reject**.
8. **AI / unclear rights** — if unclear, `RESTRICTED` until resolved.
9. **ToS / robots** — download method respects site terms?
10. **Style score** — still worth integrating after legal clear?

## Decision → status

| Outcome | Status |
|---------|--------|
| Clear allowed license, no attribution | `APPROVED` |
| Clear allowed license, attribution required | `NEEDS_ATTRIBUTION` |
| Failed policy | `REJECTED` (+ `rejectReason`) |
| Incomplete facts | stay `LICENSE_REVIEW` |
| High risk / unverified commercial pack | `RESTRICTED` |

## Already in use (grandfathered)

See `public/sounds/MUSIC_CREDITS.md` and registry rows with `status: IN_USE`. New imports must follow this checklist even if older music was credited under CC0.

## Kenmi Cute Fantasy

**Do not approve** until the specific itch/store page license is verified for commercial use in this game. Style aspiration ≠ license.
