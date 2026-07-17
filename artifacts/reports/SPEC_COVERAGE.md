# Spec coverage vs full Riftwilds testing requirements

Honesty map for this pass. Items marked DONE have executable coverage; others are tracked in `tests/system-registry.json`.

| Theme | Status this pass |
|-------|------------------|
| System registry inventory | DONE |
| Pet factory across LAUNCH_SPECIES | DONE |
| Species portrait asset validation | DONE |
| Hatch duplication safety tests | DONE |
| Care transition tests | DONE |
| Breeding rules / caps / fee split tests | DONE |
| Breeding egg mint + SOL charge | NOT_IMPLEMENTED |
| Marketplace fees / listings / egg supply | DONE |
| SOL escrow settlement | NOT_IMPLEMENTED (flagged OFF) |
| Ranked normalization tests | DONE |
| Ranked matchmaking / seasons | STUB |
| Battle balance sim (practical scale) | DONE (10k–25k; 1M supported) |
| Revenue / holder vault integer math | DONE |
| Holder claims / automatic settlement | STUB (flags OFF) |
| Inventory reconciliation helpers | DONE |
| Economy multi-horizon simulator | DONE |
| Admin simulator / health / testing pages | DONE (shells + artifact-driven) |
| validate:all fails closed | DONE |
| Artifacts + HTML summary | DONE |
| Playwright full e2e journeys | STUB |
| Prisma persistence for hatchery/marketplace | PARTIAL (schema only) |
| Guilds / homestead / live world / quests | STUB |
| Evolution / NFT / VRF / paid gacha | NOT_IMPLEMENTED |
| On-chain atomic split / treasury addresses | NOT_IMPLEMENTED / STUB |
| Docs: TESTING_AND_ECONOMY.md | DONE |

Financial simulator outputs are **assumptions** (SOL price, synthetic cohorts, illustrative burn). They are not live treasury truth.
