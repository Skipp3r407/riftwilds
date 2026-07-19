# CARD_AUDIT_REPORT — Riftwilds TCG

Generated: 2026-07-19T16:49:31.158Z  
Local-only audit (no deploy).

## Counts

| Metric | Value |
|--------|------:|
| Total cards | 735 |
| By type | creature:116, companion:102, legendary:102, spell:112, equipment:115, relic:59, location:51, hero:41, token:1, weather:20, event:4, trap:4, quest:4, artifact:4 |
| Unit-like (creature/companion/legendary/token/hero) | 362 |
| Stat overlays (v2) | 697 |
| Units with overlay | 362/362 |
| Legacy baked faces on disk | 735 |
| cardImages.json entries | 735 |

## Missing / risks

| Issue | Count | Notes |
|-------|------:|-------|
| Missing art path entirely | 0 | Prefer clean `art.assetPath` |
| Units missing raw ATK/HP in JSON | 41 | Overlays + normalize fill gaps |
| Duplicate ids | 0 | none |
| Duplicate display names (sample) | 3 | Teaching/twins may share titles |

### Sample missing art ids
- none

### Sample units missing raw ATK/HP
- `rotr-h-npc-keeper-travel-cloak`
- `rotr-h-npc-keeper-plaza-coat`
- `rotr-h-npc-keeper-grove-vest`
- `rotr-h-npc-keeper-ember-apron`
- `rotr-h-npc-keeper-tide-slicker`
- `rotr-h-npc-keeper-frost-parka`
- `rotr-h-npc-keeper-storm-cape`
- `rotr-h-npc-keeper-stone-tabard`
- `rotr-h-npc-keeper-spirit-shawl`
- `rotr-h-npc-keeper-void-hood`
- `rotr-h-npc-keeper-alloy-harness`
- `rotr-h-npc-keeper-radiant-robe`
- `rotr-h-npc-npc-merchant`
- `rotr-h-npc-npc-guard`
- `rotr-h-npc-npc-gardener`
- `rotr-h-npc-npc-courier`
- `rotr-h-npc-npc-fisher`
- `rotr-h-npc-npc-smith`
- `rotr-h-npc-npc-scholar`
- `rotr-h-npc-npc-cook`
- `rotr-h-npc-npc-child`
- `rotr-h-npc-npc-elder`
- `rotr-h-npc-npc-bard`
- `rotr-h-npc-npc-healer`
- `rotr-h-npc-npc-farmer`

## Migration approach

- **Source JSON untouched** — `cards.json` preserved; backup under `data/migrations/backups/`.
- **Overlays** — `card-stats-v2.json` merges at normalize time (ATK/HP/DEF/Speed/role/keywords).
- **IDs / ownership / decks** — card ids unchanged; constructed lists remain valid.
- **Competitive vs collection** — finishes/founder cosmetics never alter engine defs.
- **Leftover non-combat types without overlay** (38): equipment/relics/locations etc. still collectible; practice filter keeps unsupported stubs out of randomized practice.

### Leftover type sample (no combat overlay)
- `rotr-s-root-snare`
- `rotr-s-stone-brace`
- `rotr-s-storm-sip`
- `rotr-s-crystal-ping`
- `rotr-s-shade-tax`
- `rotr-s-spirit-echo`
- `rotr-s-arc-latch`
- `rotr-s-star-dust`
- `rotr-s-null-veil`
- `rotr-s-bloom-draft`
- `rotr-s-forge-temper`
- `rotr-s-harbor-fog`
- `rotr-s-corrupt-whisper`
- `rotr-s-item-fresh-water-flask`
- `rotr-s-item-comfortable-nest`
- `rotr-s-item-nest-fluff-pillow`
- `rotr-s-item-starlit-lullaby-charm`
- `rotr-s-item-spirit-crystal`
- `rotr-s-item-phoenix-feather`
- `rotr-s-item-revival-herb`
- `rotr-s-item-moon-tear`
- `rotr-s-item-heart-flame`
- `rotr-s-item-ancient-bell`
- `rotr-s-item-revival-water`
- `rotr-s-item-spirit-lantern-charm`
- `rotr-s-item-void-pulse`
- `rotr-s-item-alloy-wave`
- `rotr-s-item-stone-guard`
- `rotr-s-item-spirit-protection`
- `rotr-s-item-eclipse-singularity`
- `rotr-x-lantern-night`
- `rotr-x-market-panic`
- `rotr-x-pack-opening`
- `rotr-x-guild-horn`
- `rotr-x-quest-first-bond`
- `rotr-x-quest-plaza-sweep`
- `rotr-x-quest-ember-trial`
- `rotr-x-quest-quiet-study`

## Template migration

- Canonical presentation: **dynamic MasterCardTemplate** (stats from data).
- Clean art preferred (`art.assetPath` / `cleanArtPath`); baked WebP faces are legacy fallback only.
- Target asset layout: `/assets/cards/{expansion}/{slug}/` (art, thumb, optional foil-mask) — resolver scaffolded; full file moves can follow without id changes.

## Engine integration

- Board units carry ATK/DEF/HP/Speed/keywords/statuses/exhausted.
- Combat: speed order, ATK−DEF (+element ±15%), min damage, Guardian/Flying/Charge/Bloom/Poison/Ward/Heal.
- Surfaces updated: collection, pack open, inspect modal, battle field overlay, admin Card Studio.

## Known gaps

- Equipment attach / full Echo / Awaken transform still partial or stub.
- Full physical relocate of 735 assets into `/assets/cards/...` not completed (paths still resolve via existing thumbs + legacy faces).
- Visual QA screenshots not auto-captured in CI yet.
