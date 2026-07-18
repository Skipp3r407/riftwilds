# Patch Notes workflow

**Rule: every git push that ships user-visible changes must update the public Patch Notes page.**

Public URL: [`/patch-notes`](../src/app/(marketing)/patch-notes/page.tsx)  
Alias: `/updates` → redirects to `/patch-notes`  
Data source: [`src/content/patch-notes.ts`](../src/content/patch-notes.ts)

## Before every push

1. **Write the entry first** (or with the feature) — do not push and “add notes later.”
2. Prepend a new object at the top of `PATCH_NOTES` in `src/content/patch-notes.ts` (newest first).
3. Fill honest sections:
   - `added` — new player-facing features / pages / content
   - `changed` — behavior or UX changes that are not pure bugfixes
   - `fixed` — bugs and build/runtime failures players or deploy would notice
   - `knownIssues` — incomplete work, gated systems, or intentional limits
4. Use a real `date` (`YYYY-MM-DD`), a clear `title`, and either a short SHA (`version: "abc1234"`) or a calm semver-ish label when you bump one.
5. **Do not** list unfinished work as shipped (e.g. 2.5D overhaul stays out until it actually lands).
6. Link check: Community nav + Learn footer should already point at Patch Notes.

## Quick stub from CLI

```bash
npm run patch-notes:add -- --title "Short release title" --version abc1234
# optional:
npm run patch-notes:add -- --title "Hotfix" --date 2026-07-19 --id 2026-07-19-hotfix
```

This prepends a stub entry with empty section arrays. Edit the bullets before commit.

## Cursor / agent note (push coordinators)

When coordinating a multi-task push:

1. Confirm every shipping task that players can see has a matching bullet (or a dedicated entry).
2. Update `src/content/patch-notes.ts` **before** `git push`.
3. Prefer one release entry for a batch push; split only when the batch is hard to summarize honestly.
4. Leave WIP / unapproved overhauls in `knownIssues` or omit them entirely — never market them as live.

## Entry shape

```ts
{
  id: "2026-07-18-example",       // unique, used as #anchor
  date: "2026-07-18",
  title: "Human title",
  version: "abc1234",             // optional short SHA or label
  summary: "One sentence.",       // optional
  added: ["…"],
  changed: ["…"],
  fixed: ["…"],
  knownIssues: ["…"],             // omit empty arrays if you prefer
}
```

## What not to do

- Do not invent rewards, mint status, or “live” systems that are still gated.
- Do not dump every internal refactor — keep notes player-readable.
- Do not skip notes for “small” pushes that change Live World, economy framing, or public pages.
