<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Local-only updates (no auto-deploy)

Work stays local only by default. Do NOT commit unless the user explicitly asks. Do NOT `git push`, deploy, or publish to remote after tasks — only when the user explicitly requests it.

## Patch notes (every push)

Before coordinating a push with user-visible changes, update `src/content/patch-notes.ts` (newest first) so `/patch-notes` stays accurate. Workflow: `docs/PATCH_NOTES_WORKFLOW.md`. Stub helper: `npm run patch-notes:add -- --title "…"`.
