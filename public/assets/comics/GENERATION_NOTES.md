# Comics art

- Covers: Cursor GenerateImage — 10 issue covers in `covers/` (regenerated 2026-07-22)
- Reader lettered pages: `public/assets/comics/<slug>/issue-00N/pages/page-00N.webp`
- Clean AI art staging: `artifacts/comics/generated/<slug>/` + Cursor assets `issue00N-page-00N.png`
- Install: `node scripts/comics/install-cursor-generated.mjs <slug> <issueNum> --pages=A-B`
- Letter: `node scripts/comics/seed-illustrated-and-letter-all.mjs --issues=N --pages=A-B --skip-composites` (after deleting public pages so cached-raw is used)
- Lettering is programmatic — generate art WITHOUT painted dialogue text; leave balloon-safe corners

## Session progress (2026-07-22 Cursor GenerateImage)

- Issue #1 the-first-rift: COMPLETE 32/32 AI sequential pages lettered
- Issue #2 sparks-journey: COMPLETE 38/38 AI sequential pages lettered
- Issue #3 the-traveling-circus: COMPLETE 38/38 AI sequential pages lettered
- Issue #4 the-lost-city: 25/25 story + cover/credits/title/teaser/back lettered; pages 31–37 still legacy
- Issues #5–#10: covers regenerated; interior pages still need Cursor GenerateImage upgrades
- Canon: Mira Eggwarden (not Cal Reed); Cael Vesper = traitor arc; Aurelia Voss = Merchant; Nova hatches #9; Vol Two starts #10

Preview: `/comics`, `/comics/the-first-rift`, `/comics/sparks-journey`, `/comics/the-traveling-circus`
LOCAL ONLY — no commit/push
