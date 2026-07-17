# RIFTWILDS — 10-YEAR EXPANSION PLAN

Living MMORPG architecture for decade-scale growth **without rewrites**.  
This document is the roadmap + gap analysis for foundations shipped in the Core Decade pack.

Related: `docs/MMO_ARCHITECTURE.md`, `docs/LIVE_WORLD_PLAYABLE.md`, `docs/ARCHITECTURE.md`, `docs/ECOSYSTEM_TRANSITION.md` (post–Pump.fun platform phases + wallet-optional onboarding)

---

## 1. Design principles

1. **Extend, never replace** — append Prisma models, feature-flag new systems, keep hatchery/care/arena/marketplace working.
2. **Plugin-style content** — expansion packs register into content registries (`src/game/expansion/`).
3. **Pure logic first** — clocks, story, genetics, achievements are deterministic TypeScript; persistence/UI follow.
4. **Entertainment disclaimers** — economy/reward surfaces never use investment/gambling language.
5. **Original Riftwilds IP only** — lore, species, regions, festivals stay in-universe.
6. **Fail closed** — risky SOL/raid/multiplayer features stay flagged off until authority exists.

---

## 2. Modular architecture

```
Browser (Next.js UI + Phaser Live World)
    │ REST (+ future WS)
    ▼
API routes (rate-limited, audited)
    │
    ├── Content registries ← Expansion packs (region / festival / story / …)
    ├── Living World clock / disasters / NPC schedules
    ├── Story engine · Civilization · Achievements · Expeditions
    ├── Genetics 2.0 · Riftling AI · Timeline · Archivist
    ├── Housing / Festivals / Endgame scaffolds / Social stubs
    └── Postgres (Prisma) + future Redis (presence, rate limits)
```

### Expansion packs

| Piece | Path |
|-------|------|
| Manifest types | `src/game/expansion/types.ts` |
| Registry | `src/game/expansion/registry.ts` |
| Core pack | `src/game/expansion/packs/core-decade-pack.ts` |
| Ecosystem snapshot | `src/game/expansion/ecosystem.ts` |

Future **region packs** declare `regionPack.regionSlugs` + map blueprint paths without touching core combat/economy.

---

## 3. Phased roadmap (impact / deps / risk)

### Phase A — Foundations (shipped now) · Years 0–1

| System | Impact | Deps | Risk | Status |
|--------|--------|------|------|--------|
| Expansion registries | Unlocks all content DLC | — | Low | **Implemented** |
| Living world clock | Atmosphere + modifiers | Region weather keys | Low | **Implemented** (HUD + API) |
| Story engine | Branching personal/world arcs | Flags | Low | **Implemented** (sample arcs) |
| Civilization restoration | Permanent world changes | Clock, timeline | Med | **Implemented** (in-memory + Prisma model) |
| Achievement universe | Retention meta | Metrics bus | Low | **Implemented** (catalog + evaluator + hatch hook) |
| Procedural expeditions | Infinite exploration stub | Clock | Low | **Implemented** (generator API) |
| Housing data model | Homestead depth | Homestead schema | Low | **Implemented** (catalog; editor deferred) |
| Festival framework | Recurring events | Clock | Low | **Implemented** |
| Genetics 2.0 | Breeding depth | Hatchery seeds | Low | **Implemented** (types + API) |
| AI Archivist | Lore onboarding | Species lore | Low | **Implemented** (deterministic stub) |
| Living timeline | Chronicle UX | Story/civ hooks | Low | **Implemented** (in-memory) |
| Ecosystem dashboard | Discoverability | All above | Low | **Implemented** (`/ecosystem`) |
| Security api-guard | Abuse resistance | Rate limit | Low | **Implemented** (memory) |
| Analytics admin shell | Ops visibility | Events buffer | Low | **Implemented** |
| Docs + validate:expansion | Discipline | — | Low | **Implemented** |

### Phase B — Living World depth · Years 1–3

| System | Impact | Deps | Risk | Status |
|--------|--------|------|------|--------|
| Dynamic weather FX in Phaser | Immersion | Clock, assets | Med | **Deferred** |
| Wildlife / resource sim authority | Economy sinks | Live World WS | High | **Blocked** (multiplayer service) |
| Evolving region overlays | Civ visual payoff | Civ + art pipeline | Med | **Foundation** (effects ops + art jobs) |
| NPC schedule live presence | World feel | WS presence | High | **Stub** (schedule data only) |
| Riftling idle env AI in-world | Companion life | Riftling AI + Phaser | Med | **Stub** (pure state ready) |
| Discovery nodes | Exploration rewards | Expeditions | Med | **Deferred** |

### Phase C — Social & housing live · Years 2–5

| System | Impact | Deps | Risk | Status |
|--------|--------|------|------|--------|
| Homestead layout editor | Housing gameplay | Prisma furniture | Med | **Deferred** |
| Friend visits | Social | Auth, visit policy | Med | **Deferred** |
| Guilds live | Retention | Prisma Guild* | Med | **Shell** (schema + page) |
| Trading / mail / emotes | Social economy | Integrity checks | High | **Stub** |
| Mentors | Onboarding | Story | Low | **Stub** |
| Chat authoritative | Social | WS | High | **Blocked** |
| Photo mode / galleries / contests | Community | CDN | Med | **Stub** (flags off) |

### Phase D — Endgame & marketplace evolution · Years 3–7

| System | Impact | Deps | Risk | Status |
|--------|--------|------|------|--------|
| World bosses live | Endgame | Live World PvE | High | **Scaffold** |
| Raids | Endgame social | Party WS | High | **Blocked** |
| Endless Rift | Longevity | Combat balance | Med | **Floor generator stub** |
| Marketplace pet history cards | Trust/transparency | Genetics/AI/timeline | Med | **Model shipped** |
| Cinematics in Live World | Polish | Phaser | Low | **Script framework** |
| Procedural art jobs | Content scale | Asset scripts | Med | **Pipeline hooks** |

### Phase E — Persistence, ops, scale · Years 1–10 (ongoing)

| System | Impact | Deps | Risk | Status |
|--------|--------|------|------|--------|
| Prisma-backed civ/timeline/metrics | Durability | Migrations | Med | **Models appended; runtime still memory** |
| Redis rate limits / presence | Scale | Infra | Med | **Blocked** (env stubs exist) |
| Warehouse analytics | Product decisions | Privacy review | Med | **Deferred** |
| Anti-cheat on ranked/economy | Integrity | Arena/market | High | **Signal stubs** |
| Region pack DLC drops | Revenue-safe content | Packs | Low | **Manifest-ready** |

---

## 4. What shipped vs deferred / blocked

### Shipped (foundation level)

- Content registries + `core-decade-foundations` pack
- Living world clock, disasters, NPC schedules, region living state
- Story engine + 2 branching sample arcs + encounter catalog
- Civilization milestones (13) + contribute API + world effect ops
- Achievement catalog (30+) + evaluator + hatch unlock hook
- Procedural expedition generator API
- Homestead expansion catalog (rooms, furniture, farm plots) wired into `/homestead`
- Festival calendar API
- Genetics 2.0 + inheritance preview API
- Riftling AI state (mood, personality, memories, idle interactions)
- Living timeline store + API
- AI Archivist (lore-grounded) API
- Endgame boss/raid/endless scaffolds
- Social / community stubs (emotes, mail, mentors, trade, photo contests)
- Cinematics script player
- Procedural art pipeline job builder
- Marketplace `PetHistoryCard` model
- Ecosystem dashboard `/ecosystem` + nav entry
- Admin analytics `/admin/analytics`
- Feature flags for all decade systems
- Prisma append models for civ/timeline/festivals/housing/metrics/packs
- Security: `withApiGuard`, audit buffer, anti-cheat signals
- Tests: `tests/unit/expansion-foundations.test.ts`
- Validate: `npm run validate:expansion`
- System registry entries updated

### Deferred (intentional, not blocked)

- Phaser weather/disaster VFX
- Homestead drag-drop editor + friend visit sessions
- Full story UI (arcs playable via API; no dedicated quest-story page yet)
- Photo mode capture pipeline + CDN galleries
- Cinematic playback inside Phaser scenes
- Persisting in-memory stores to Prisma
- Warehouse analytics

### Blocked (external / infra deps)

| Blocker | Blocks |
|---------|--------|
| Authoritative Live World WebSocket service | Chat, wildlife authority, raids, guild presence, visits |
| Redis / Upstash in production | Distributed rate limits, presence, queues |
| Breeding mint implementation | Genetics 2.0 → live offspring eggs |
| Admin role gate on analytics | Safe production exposure of `/api/analytics/summary` |
| Asset generation capacity | Region overlays, festival decor, boss art |

---

## 5. Discoverable entry points

| Surface | Path |
|---------|------|
| Ecosystem dashboard | `/ecosystem` |
| Live World clock HUD | `/live-world` (WorldClockChip) |
| Homestead + housing data | `/homestead` |
| Play hub card | `/play` → Ecosystem |
| Admin analytics | `/admin/analytics` |
| Nav | Sidebar + World mega-menu → Ecosystem |
| APIs | `/api/world/clock`, `/api/world/region`, `/api/civilization`, `/api/achievements`, `/api/expeditions/generate`, `/api/festivals`, `/api/archivist`, `/api/timeline`, `/api/expansion/packs`, `/api/ecosystem`, `/api/housing/catalog`, `/api/story/arcs`, `/api/genetics/v2`, `/api/analytics/summary` |

---

## 6. Gap list vs full vision

| Vision pillar | Gap |
|---------------|-----|
| Living World full sim | Clock yes; weather FX / wildlife authority / disasters in Phaser no |
| Advanced Riftling AI | State machine yes; learning persistence + in-world BT no |
| Dynamic Story Engine | Engine + samples yes; DB progress + Live World NPC hooks no |
| Civilization Restoration | Logic yes; visual overlays + global persistence no |
| Housing | Catalog yes; editor / farming ticks / visits no |
| Achievement Universe | Catalog + evaluator yes; PlayerAchievement DB sync no |
| Infinite Exploration | Generator yes; run persistence + rewards no |
| Endgame | Catalogs yes; live encounters no |
| Social | Stubs yes; live guilds/chat/trade no |
| Community | Contest defs yes; photo pipeline no |
| Marketplace Evolution | History card model yes; listing UI integration partial |
| Codex expansion | Reuses species lore via Archivist; dedicated expansion pages deferred |
| Security | Patterns yes; Redis + ranked hooks deferred |
| Load/sim tests | Unit + validate:expansion; dedicated load suite deferred |

---

## 7. Validation

```bash
npm run validate:expansion
npx vitest run tests/unit/expansion-foundations.test.ts
npm run typecheck
```

`validate:all` continues to gate release-critical economy/pets/security suites; expansion validate is additive.

---

## 8. Contribution rules for future agents

1. Register new content through expansion packs — do not hardcode catalogs into UI.
2. Prefer new feature flags for unlockable systems.
3. Append Prisma models only; never rewrite ledger history.
4. Avoid thrashing About, navbar mega-structure, shop sections, or reward vault — integrate via nav extras / APIs.
5. Keep entertainment disclaimers on reward/economy-adjacent surfaces.
6. Update this doc’s Phase tables when a foundation moves from Stub → Partial → Implemented.
