# Main Campaign — The Awakening Path

Wraps existing starter chain and regional packs. **Does not rename or rekey** `starter-q1`…`q8` or region quest stubs.

**Player premise:** You arrive in the Commons during the Present Awakening. Riftlings hear a distant call. Hearts stir. Someone wants the network forced whole again — or sealed forever. You choose how the world remembers itself.

---

## Act 0 — Arrival (existing starter, immutable)

| Quest key | Story beat |
|---|---|
| `starter-q1-awakening` | Rowan → Elara; you are named a Keeper-in-practice |
| `starter-q2-fragments` | Elara’s Fracture telling; Solen opens Codex |
| `starter-q3-waiting-heart` | Mira + Hatchery; first egg |
| `starter-q4-new-bond` | Name, care, equip companion |
| `starter-q5-first-steps` | Orren; first combat as defense, not glory |
| `starter-q6-tools` | Bram; craft as respect for the world |
| `starter-q7-broken-marker` | Pip; maps before portals |
| `starter-q8-world-beyond` | Elara authorizes Ember / Coast / Elderwood |

**Theme:** Care before conquest. Trust before titles.

Optional personal arc (already stubbed): `first_rift_light` — aurora choice (wildfolk vs wardens).

---

## Act I — Three Paths Outward (early regional)

Player may order freely after portal unlock; narrative “critical path” recommends:

1. **Ember Crater** — heat blooms, forge ethics, first hint of Lattice remnants in slag-glass.
2. **Moonwater Coast** — tide gates, twin-moon charts; a drowned Activation diary.
3. **Elderwood Forest** — Elara’s root-paths; Sproutfall Grove as memory of first refuge roads.

**Climax I:** Stabilize a minor Heart-echo (not full Heart) in one region; Riftling dreams show the Celestial call as a **question**, not an order.

**Villain touch:** **Archivist-General Serae Quill** (Radiant) withholds Fracture ledgers “for the world’s safety.”

---

## Act II — The Spine of Storm and Stone

- **Stormspire Peaks** — wind trials; League aerie politics; sky-rift that answers only bonded pairs.
- **Stoneheart Canyon** — fossil songs; proof that some “ruins” are future-echoes (time-skew).
- **Frostveil Basin** — aurora cairn reveals a missing verse of the Soft Exodus.

**Climax II:** Party (solo-capable) seals a **corrupt Heart node** — player chooses: purify (Radiant/Spirit lean), quarantine (Void lean), or harvest power (Alloy/temptation lean). Reputation forks.

---

## Act III — Light, Hush, and Gear

- **Radiant Citadel** — Living-Core chamber revisited; Celestora manuscripts; Serae’s full motive.
- **Void Hollow** — null labyrinth; meet **Null-Shepherd Veyra** (wants silence so nothing can break again).
- **Alloy Ruins** — machines restart; **Conductor Hex** believes forced reconnection is mercy 2.0.

**Climax III:** Triad confrontation — Serae / Veyra / Hex are not a cartoon trio; each can become ally or foe based on Act II choice. Player learns the Celestial call contains **both** help-signal and completion-signal (Prime’s wound arguing with itself).

---

## Act IV — Lantern and Star

- **Spirit Marsh** — “missing memory” named: the Prime’s own fear of being alone after perfection. Marsh vigil questline.
- **Celestial Rift** — observatories; floating trials; First Riftling mystery threads (never forced reveal).

**Climax IV (finale options):**

| Ending key | Condition spirit | Outcome sketch |
|---|---|---|
| `harmony_reweave` | High trust + mercy + multi-faction cooperation | Network reharmonizes as layered-but-listening; Rifts calm; call becomes song |
| `chosen_layers` | High wildfolk/explorer + respect for Void hush | World stays intentionally layered; travel harder; identity richer |
| `sealed_prime` | Fear of repeat + Veyra alliance lean | Prime quieted; some affinities dim; safety with grief |
| `forced_lattice` | Hex alliance / power harvest path | Short golden age → instability risk; expansion “Lattice Fall” foreshadow |
| `elara_path` | Keep Elara’s refusal of titles; care-first metrics | Soft best-ending hybrid; First Riftling silhouette acknowledged, not captured |

Post-credits: Riftstone shows a map that does not exist yet (expansion tease).

---

## Post-game (Age X epilogue systems)

- Regional restoration arcs (civ restoration hooks already in decade plan).
- Reputation masteries with factions (`FACTIONS.md`).
- Personal Riftling memory quests from biography hooks.
- World events rotate (`WORLD_EVENTS.md`).
- New Gateway Stone discoveries on peer trails.
- Optional: seek First Riftling without resolving Elara’s mystery against player will.

---

## Expansion campaign hooks (do not ship as Act V yet)

See `FUTURE_EXPANSIONS.md`: Tidehold Deep, Gearwild Crown, Mirror Commons, Second Moon Dark, etc.

---

## Quest wiring policy

- **Additive** chain keys suggested: `campaign-act1-*`, `campaign-act2-*`, … under new chainKeys (`awakening-main`).
- Never mutate `starter-*` requires/objectives without separate approval.
- Seed story keys (`story-first-steps`, `story-ember-call`, `story-rift-compass`) remain as alternate/tutorial tracks mapped to Sproutfall/Cindercrag sub-locales.
