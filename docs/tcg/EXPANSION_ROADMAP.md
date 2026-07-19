# Riftwilds TCG — Expansion Roadmap

**Architecture goal:** Unlimited expansions without schema rewrite. Each expansion is a packaged JSON set + optional art/SFX manifests.

## Launch architecture

| Horizon | Gameplay cards (target) | Notes |
|---------|-------------------------|--------|
| Launch | ~330 curated competitive pool | From migrated ROTR content (`launch-pool.json`) |
| Year 1 | ~500 | Frozen Kingdom + Azure Bay waves |
| Year 2 | ~800 | Shadow Eclipse + Titans |
| Year 3 | ~1200 | Festival + Crystal Wars |
| Year 5 | ~2500 | Multi-region seasons |
| Year 10 | **5000+** | Continuous live ops |

Total content catalog (including lore/prop/NPC shells) may exceed competitive counts — that is intentional for Codex collectability.

## Named expansions (data)

| Order | Code | Name | Status |
|------:|------|------|--------|
| 1 | ROTR | Rise of the Rift | foundational / live-as-data |
| 2 | FRZN | Frozen Kingdom | planned |
| 3 | AZURE | Pirates of Azure Bay | planned |
| 4 | ECLS | Shadow Eclipse | planned |
| 5 | TITN | Ancient Titans | planned |
| 6 | LANN | Festival of Lanterns | planned |
| 7 | CRYS | Crystal Wars | planned |
| 8 | DRGN | Dragon Rebellion | planned |

Source: `src/content/tcg/data/expansions.json`

## Packaging convention

```
src/content/tcg/data/
  cards.json              # or cards/{expansionId}.json (future split)
  expansions.json
  formats.json            # legal sets + rotation
  launch-pool.json        # curated competitive subset
  card-families.json
  live-ops.json
```

Future: per-expansion shards `cards/rotr.json`, `cards/frzn.json` merged by registry builder. Registry already indexes by `expansionId`.

## Format rotation

- **Standard:** current + previous two majors (configured in `formats.json`)
- **Wild / Eternal:** broader legality
- Rotation edits are live-ops config — not engine rewrites

## Regenerating framework artifacts

```bash
npm run tcg:aaa
npm run tcg:validate
```

Preserves existing art paths and lore; placeholders only fill competitive gaps if the pool is short.

## F2P competitive promise

Every Standard-legal competitive card remains craftable with soft currencies. Expansions must not introduce crypto-only ladder cards.
