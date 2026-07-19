# Battle System — Riftwilds TCG

> Runtime authority: `src/game/tcg/match-engine.ts`, `src/game/tcg/types.ts`, `src/game/tcg/rift-energy.ts`.  
> UI: `src/components/tcg/rift-battle-board.tsx` (`/tcg/battle`).

---

## 1. Goals

- Fast, readable practice duels (5–12 minutes).
- Preserve the **battle console / Practice Board** command-desk UX.
- Adapt to strongest existing rules: **Rift Energy**, affinity modifiers, Keeper Core HP.
- Scaffold commander + soft turn timer without throwing away the playable demo.

---

## 2. Match state

`TcgMatchState` (`src/game/tcg/types.ts`):

- `publicId`, `turn`, `status` (`ACTIVE` | `COMPLETED`), `phase`
- `activeSideId`, `winnerId`
- `players: [player, opponent]` — each with Core HP, Rift Energy, deck/hand/board/discard
- Optional `encounter` metadata (Live World handoff)
- Phase 1+: optional `commanderId` per side (hero content id)

Phases: `DRAW | MAIN | COMBAT | END | OPPONENT | FINISHED` — engine primarily uses MAIN → COMBAT → END → (AI) → MAIN.

---

## 3. Resources & tempo

| System | Behavior |
|--------|----------|
| Rift Energy | Max = min(turn, 10); refill at turn start; spend to play |
| Draw | 1 card at turn start; hand full → burn; empty deck → fatigue −1 Core |
| Opening hand | 4 (Phase 1 target) |
| Max hand | 8 |
| Board | Max 5 units; enter exhausted |
| Turn timer | Soft 90s client cue in Practice Board (server enforcement later) |

---

## 4. Combat model (Phase 1)

Current engine (honest):

1. Player plays UNITs to board and SPELLs for direct Core damage.
2. On `END_TURN`, all **ready** units sum `power × affinityModifier` vs defender lead affinity → damage **enemy Keeper Core**.
3. Units do **not** yet fight each other; unit `health` from content is not applied.
4. AURAs (weather/location) are stub-discarded.

**Battlefield layout:** UI shows two readable lanes (you vs challenger) over a single board row each — mobile-first, tactical chrome. True multi-lane scoring is Phase 2+.

**Affinity:** content `element` → Arena `AffinityName` via `card-catalog.ts` (fire→EMBER, water→TIDE, nature→GROVE, storm→STORM, …). Modifiers from `src/game/creatures/affinity.ts`.

---

## 5. Actions

| Action | API | Notes |
|--------|-----|-------|
| `PLAY_CARD` | `/api/tcg/match/turn` | Requires MAIN + afford + board space |
| `END_TURN` | same | Triggers combat then AI |
| `SURRENDER` | same | Opponent wins |

Match create: `/api/tcg/match/start` — uses binder `activeDeck`, guest/session cookie ownership. In-memory `match-store`.

---

## 6. AI (training)

`applyAiTurn`: greedy cheapest affordable plays (≤8), then combat. Suitable for Practice Board. Difficulty curves from hero `difficulty` are **not** wired yet.

---

## 7. Commanders

Content heroes in `heroes.json` (Elara, Mira, Kael, Captain Brine, …). Phase 1 wires optional `commanderId` onto sides for UI/identity; passives/ultimates execute in Phase 2 keyword interpreter.

---

## 8. Win / lose

- Core HP ≤ 0 → opponent wins  
- Turn cap 30 → higher Core wins (draw if tied)  
- Surrender → opponent wins  

Match history hooks: emit `MATCH_END` events; persist later (no Prisma TcgMatch table yet).

---

## 9. Integration

- Live World: `encounter-bridge.ts` → `/tcg/battle?encounter&region&returnTo`
- Quests: `recordQuestMetric` from battle UI
- Arena: soft-secondary; do not delete; adapters exist

---

## 10. Phase 2 battle upgrades

1. Unit HP + unit targeting  
2. Keyword ops (`ward`, `charge`, `guardian`, …)  
3. Commander passive/ultimate  
4. Server turn timer + reconnect  
5. Optional lane slots (2–3) if product confirms  
