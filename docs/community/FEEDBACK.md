# Player feedback & bug reports

Public form: **`/feedback`** (alias **`/bugs`** → redirects).

## Submit

1. Open `/feedback` (no wallet / SOL required).
2. Choose **Bug report** or **Feedback / idea**.
3. Fill required fields and submit.
4. API: `POST /api/feedback` with JSON body (`kind: "bug" | "feedback"`).

## Anti-spam

- In-memory rate limit: **5 requests / minute / IP** (`withApiGuard` bucket `feedback`).
- Honeypot field `website` — filled bots get a silent success (not stored).

## Persistence

- **Runtime:** in-memory ring buffer (`src/lib/feedback/store.ts`) + `[feedback-stub]` console log.
- **Prepared:** Prisma model `PlayerFeedback` in `schema.prisma` — apply migration only after approval. Do not call Prisma from the route until then.

## Privacy

Feedback is used to improve the game. Optional email is for follow-up only. See the privacy note on the page and `/legal/privacy`.

## Nav entry points

- Site footer → Learn → Feedback
- Header Help drawer → Feedback / Bug Report
- Live World pause menu → Feedback / Bug Report
- Patch Notes header CTAs
