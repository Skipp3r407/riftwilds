# CARD_REGENERATION_PLAN

## Principle

**Do not bake changing combat stats into source art.** Compose frame/labels/stats in UI from gameplay data.

## Phases

1. ✅ Dynamic MasterCardTemplate + field overlay
2. ✅ Stat overlays for all combat units (+ combat spells + equipment/terrain metadata)
3. ✅ Publish clean plates to `/assets/cards/{expansion}/{slug}/art.webp` (735/735)
4. ✅ Prefer published clean art via `card-asset-paths-v1.json`; legacy baked faces remain fallback
5. ✅ Specialized layouts: creature · spell · equipment · commander · terrain · trap
6. ✅ Engine: equipment attach · Echo · Awaken
7. ⏳ Optional foil-mask / finish layers (cosmetic only)
8. ⏳ Playwright visual regression matrix at full viewport set (manual checklist live in CARD_VISUAL_QA_REPORT)

## Commands

```bash
node scripts/tcg/generate-card-stats-v2.mjs
node scripts/tcg/publish-card-assets.mjs
node scripts/tcg/audit-card-system.mjs
node scripts/tcg/visual-qa-cards.mjs
npm run tcg:validate
npm run test:unit -- tests/unit/tcg-combat-stats.test.ts
npx vitest run tests/unit/tcg-equipment-echo-awaken.test.ts
```

## Surfaces

All call sites using `RiftCardFrame` now compose through `MasterCardTemplate` (adapter). Card Studio, collection, deck builder, pack open, Codex, inspect modal share one chrome.
