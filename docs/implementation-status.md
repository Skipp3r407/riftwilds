# Implementation Status — Competitive Battle-Deck Expansion + AAA UI + Rift Exchange + Rift Arena

> Updated: 2026-07-19 (Audio soundscape + Rift Arena). **Not pushed. Not committed unless user asks.**

---

## Completed

### Adaptive audio soundscape (local, this session)
- **Engine:** `adaptive-engine` + `music-stems` + `reverb` + `voice-bus` + `registry` — modes include login/shop/housing/guild/arena/tournament/boss/cinematic; intensity stems; priority cues
- **Buses:** Master / Music / Environment / UI / Effects / Companions / Combat / Weather / Voice / **Notifications** (`/settings/audio`)
- **ADD:** `docs/audio/AUDIO_DESIGN_DOCUMENT.md` · catalogs `docs/audio/SFX_CATALOG.json` + `public/audio/MANIFEST.json`
- **Assets:** 117 polished WAV SFX + 13 region ambients + 6 biome aliases (`npm run assets:audio`) under `public/audio/{ui,sfx,companions,bosses,world,housing,guild,arena,marketplace,events}/`
- **Live cues:** login, hatchery rarity fanfares, battle summon/energy/elements/announcer, arena queue, tournaments, housing, guilds, shop/marketplace (SOL transfer cosmetic only), collection, deck, Codex, Live World
- **Deferred:** full spoken VO banks, true multi-stem OGG beds, 5.1/7.1 (see ADD)

### Rift Arena + practice fix (local, prior)
- **Root cause:** TCG `match-store` used a module-scoped `Map` that forked per Turbopack route bundle → `/start` wrote a match, `/turn` read an empty store → `MATCH_NOT_FOUND`
- **Fix:** Persist matches (and binders) on `globalThis`; shared `owner-key` helper for guest cookies
- **Practice vs Kael:** playable on `/tcg/battle` — play cards, end turn, AI responds, win/lose
- **Private invite:** create/join room code + shareable `/tcg/battle?invite=CODE` (same-process local PvP)
- **Rift Arena hub** at `/arena` — browse match types, free queue, invite CTA, ladder/champions/calendar/history, SOL Arena panel clearly OFF
- Modules: `src/game/rift-arena/*` (types, free queue, ladder, replay hooks, escrow scaffold, admin config)
- APIs: `/api/rift-arena/status|queue|ladder|admin`, `/api/tcg/match/invite(+join)`
- Flags: `RIFT_ARENA_*` hub/queue/ranked scaffold ON; **`RIFT_ARENA_SOL_STAKES_ENABLED` / `RIFT_ARENA_SOL_ESCROW_ENABLED` default OFF**
- Docs: `rift-arena.md`, `arena-economy.md`, `escrow.md`, `tournaments.md`, `security.md`, `replays.md`, `esports.md`, `api.md`
- Schema proposal: `prisma/schema-proposals/rift-arena.prisma` (not migrated)
- Admin: pause matchmaking / soft caps on `/admin/arena`

### Hatchery F2P + creature loop (prior)
- Guaranteed free Starter Egg, first-login package, earn paths, companion→TCG card, cosmetic tiers OFF
- Docs: `HATCHERY_ECONOMY.md`, `FREE_TO_PLAY.md`, `TOKEN_COSMETIC_PERKS.md`, `HATCHERY_PHASES_3_5.md`

### Rift Exchange + Player Marketplace (prior)
- Hub `/exchange`, marketplace upgrades, admin board, schema proposal, nav links
- Language: entertainment/rewards only — no guaranteed-earnings framing

### Rift Codex / Collection Book (prior)
- Book shell, family spreads, museum mode, discovery progress

### AAA UI / Competitive TCG (prior)
- Design system, practice battle foundations, deck atelier

---

## In progress

- Battle console deeper material pass
- Deck builder persistence beyond in-memory
- Commander passives execution
- Ranked live queues (scaffold only today)
- Exchange / Marketplace Neon persistence

---

## Remaining (Phase 2+)

| Phase | Work |
|-------|------|
| AUD-VO-1 | Boss / commander spoken VO banks (slots + taunt cue ship) |
| AUD-VO-2 | Full companion dialogue banks (moods + 100 cries ship) |
| AUD-STEM-1 | True multi-stem OGG beds (procedural stem mixer ships) |
| AUD-SPATIAL-1 | 5.1 / 7.1 / full HRTF (stereo pan + reverb zones ship) |
| AUD-BATTLE-2 | Affinity cues wired; deeper VFX sync polish |
| RA-2 | Cross-server private invites + WebSocket spectate |
| RA-3 | Deterministic replay store + VOD |
| RA-4 | Ranked Glicko + seasons on Neon |
| RA-5 | Escrow + SOL Arena only after compliance flags |
| EX-3 | Persist shops / wishlist / trades |
| Codex-DB | Apply proposals after approval |

---

## Blocked

- Neon MCP live DB inspection (needsAuth in some environments)
- Production multiplayer / escrow — intentionally scaffolded

---

## Known issues

- Matches / binders / lobbies are **in-memory** (survive HMR via `globalThis`, lost on process restart)
- Private invites are **same Node process only** — not production MP
- Ranked ratings are demo seeds + local Elo-ish updates
- SOL stakes cannot go live while `REAL_VALUE_WAGERING_ENABLED` is hard-false

---

## Preview URLs (local)

- **Audio settings:** `http://localhost:3000/settings/audio`
- **Rift Arena hub:** `http://localhost:3000/arena`
- **Practice Board:** `http://localhost:3000/tcg/battle`
- **Private invite example:** `http://localhost:3000/tcg/battle?invite=CODE`
- Deck builder: `http://localhost:3000/tcg/deck-builder`
- Admin Arena: `http://localhost:3000/admin/arena`
- Arena status API: `http://localhost:3000/api/rift-arena/status`
- Hatchery: `http://localhost:3000/hatchery`
- Rift Exchange: `http://localhost:3000/exchange`
- Rift Codex: `http://localhost:3000/tcg/codex`
- Live World: `http://localhost:3000/live-world`

---

## Reminder

**Local only** — do not `git push`, deploy, or commit unless the user explicitly requests it. Keep all SOL/real-money flags false. Never promise guaranteed earnings.
