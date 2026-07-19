# Riftwilds QA Report — Lead QA Session

**Date:** 2026-07-19  
**Scope:** End-to-end critical-path QA (FTUE → hatchery → TCG → shop → arena hub). Fixes only; **local only** (no commit / push / deploy).  
**Environment:** `localhost:3000` (Next.js 16.2.10 Turbopack), Vitest unit/integration suites.

---

## Executive summary

Practice TCG match **start → turn** works on a healthy local server (`MATCH_NOT_FOUND` only for unknown ids / wrong seat). Critical identity bugs were found and fixed: shared `guest_anon` binder, forked `tcg_guest` vs `rift_guest` (broke companion-card grants), and shop `demoUser` ledger targeting. Automated battles/security/TCG/economy suites used in this session **passed**. Full 1M-player / 10k-battle / live SOL escrow load was **not tested** (deferred).

---

## What was fixed this session

| ID | Severity | Fix |
|----|----------|-----|
| F1 | **Critical** | TCG `/api/tcg/deck`, `/collection`, `/families` no longer fall back to shared `guest_anon`. They mint/attach guest cookies via `resolveTcgOwnerKey`. |
| F2 | **Critical** | Unified TCG guest identity with hatchery: prefer shared `rift_guest`, migrate legacy `tcg_guest`, set both cookies in sync (`src/game/tcg/owner-key.ts`). Companion hatch grants now land in the same binder. |
| F3 | **Major** | TCG guest cookies use `secureCookieOptions` (avoids Secure-cookie drop on `http://localhost` under production-mode starts). |
| F4 | **Major** | Shop purchase ignores client `demoUser` — always `session.userId` or pinned `demo-keeper` (blocks arbitrary ledger targeting). |
| F5 | **Minor** | Strip HTML tags / `<>` from match `playerName`, invite `hostName`, join `guestName`. |
| F6 | **Test** | Added `tests/unit/tcg-deck-and-match-store.test.ts` — deck validation edges, binder ownership, match-store seat isolation, combat edges. |

---

## Findings (open / residual)

### Critical

| ID | Area | Finding | Suggested fix | Priority | Est. |
|----|------|---------|---------------|----------|------|
| — | — | *None open after F1–F2.* | — | — | — |

### Major

| ID | Area | Finding | Suggested fix | Priority | Est. |
|----|------|---------|---------------|----------|------|
| M1 | Perf | `/shop` HTML ~1.28 MB — heavy first paint / SSR payload. | Paginate catalog, code-split section panels, defer non-visible art. | P1 | 4–8h |
| M2 | Ops | Hung `next dev` on :3000 caused page/API timeouts (many Established sockets). Restart recovered. | Document “kill hung Next” in local runbook; avoid stacking `npm run dev`. | P1 | 0.5h |
| M3 | Economy | Hatchery/TCG/care still largely in-memory demo stores — process restart wipes guest progress. | Persist eggs/pets/binders to Prisma before marketing durability. | P1 | 1–2d |
| M4 | Arena | SOL Arena escrow / stakes remain flag-gated; not exercised live. | Keep flags off until escrow audit; see `docs/escrow.md`. | P1 | n/a (deferred) |

### Minor

| ID | Area | Finding | Suggested fix | Priority | Est. |
|----|------|---------|---------------|----------|------|
| m1 | UI | Bare `/codex` → 404; real routes are `/tcg/codex` and `/codex/riftlings`. | Optional redirect `/codex` → `/tcg/codex` or marketing hub. | P2 | 0.5h |
| m2 | UI | Marketplace copy includes intentional “demo” labels (by design). | Keep until marketplace writes enabled. | P3 | — |
| m3 | UX | Hatch API field is `eggPublicId` (not `publicId`) — easy to misuse in scripts; UI already correct. | Document in API examples. | P3 | 0.25h |
| m4 | Security | React escapes names; server strip is defense-in-depth only. Continue for any future rich-text fields. | Audit PM / housing name fields similarly. | P2 | 1–2h |

### Balance / Economy / Exploits

| ID | Finding | Status |
|----|---------|--------|
| E1 | Illegal decks (undersized / over-copy / unknown) rejected by Zod + `validateDeckList` / binder ownership. | Pass |
| E2 | Shop Credits purchase rejects insufficient balance; negative price rejected in `resolveShopPurchase`. | Pass (unit + API) |
| E3 | Credit / SOL settlement idempotency covered by existing ledger & phase-3.5 tests. | Pass (unit) |
| E4 | Wallet SOL / paid random rewards flags off — cannot abuse on-chain path in this env. | By design |
| E5 | Double-hatch / egg ownership covered by `hatchery-ownership` + `hatch-duplication` tests. | Pass |

---

## Phase coverage matrix (20-phase brief)

| Phase | Result | Notes |
|-------|--------|-------|
| 1. FTUE / onboarding | **Partial** | Hatchery claim → eggs → hatch (API) OK; full cinematic FTUE UI not walked in browser MCP (tool unavailable this session). |
| 2. Eggs / hatchery | **Pass (API)** | Claim, list, hatch with `eggPublicId` + `skipWait`. |
| 3. Cards / collection | **Pass** | Collection + families APIs; companion grant synced after identity fix. |
| 4. Deck builder | **Pass** | Illegal save → 400; showcase load OK. |
| 5. Battle (practice) | **Pass** | Start + `END_TURN` advances turn; wrong id → `MATCH_NOT_FOUND`. |
| 6. AI opponent | **Pass (unit + API)** | AI resolves inside `END_TURN`; engine tests cover surrender / energy. |
| 7. PvP invite | **Smoke only** | Routes present; dual-browser join not fully exercised. |
| 8. Marketplace | **Partial** | Page 200; demo labels; write path not fully abused. |
| 9. Wallet / login | **Partial** | Login page includes wallet/credits messaging; wallet optional / not required for TCG. |
| 10. SOL Arena | **Deferred** | Status API OK; escrow / stakes **not tested** (flags off). |
| 11. Housing | **Smoke** | `/housing` 200 only. |
| 12. Codex | **Pass (TCG)** | `/tcg/codex` 200; bios unit tests pass; bare `/codex` 404. |
| 13. Quests | **Smoke** | `/quests` 200 only. |
| 14. Shop | **Pass (security)** | Insufficient credits rejected; `demoUser` ignored. Payload size = M1. |
| 15. Performance | **Deferred / spot** | No 10k battles / 1M users. Shop payload flagged. |
| 16. Security | **Pass (spot)** | XSS name strip; no `dangerouslySetInnerHTML` on user content (only JSON-LD); shop impersonation fixed; settlement tests green. |
| 17. UI / assets | **Partial** | Critical pages 200; themed scrollbars present in CSS; no browser visual regression this session. |
| 18. Audio | **Deferred** | Not exercised live; see `docs/testing/AUDIO_QA.md`. |
| 19. Live ops | **Deferred** | Admin pause / soft caps not stress-tested. |
| 20. Full simulation | **Deferred** | Use `npm run simulate:*` offline; not run at 10k scale here. |

---

## Automated test results (this session)

| Suite | Result |
|-------|--------|
| `npm run test:battles` | 24 passed |
| `npm run test:security` | 10 passed |
| TCG content/match/bio/shop/arena unit batch | 38 passed |
| Marketplace / credits / hatch-duplication | 23 passed |
| **New** `tcg-deck-and-match-store` | 8 passed |
| Credit ledger + SOL phase 3.5 + bio | 22 passed |
| Settlement + equipment ownership (security) | included above |

---

## Manual critical path (API / pages)

| Step | Result |
|------|--------|
| Pages `/`, `/hatchery`, `/tcg/*`, `/shop`, `/marketplace`, `/login`, `/arena`, `/housing`, `/quests`, `/live-world` | 200 |
| `GET /api/tcg/deck` sets `rift_guest` + `tcg_guest` (same token) | Pass |
| Illegal deck POST | 400 `INVALID_DECK` / Zod |
| Practice match start → turn | Pass (`turn` ≥ 2) |
| Unknown match turn | `MATCH_NOT_FOUND` |
| Hatch claim → hatch | Pass |
| Companion card count increases in binder | Pass (post F2) |
| Shop buy with empty credits | 400 insufficient |
| XSS-ish `playerName` | Stored as `xKeeper` (tags stripped) |

**Browser MCP:** unavailable this session (“No browser tab”) — UI pixel checks deferred to human or follow-up.

---

## What remains / residual risk

1. **Persistence** — in-memory hatchery/TCG/match stores; multi-instance deploy will fork state (same class of bug as pre-`globalThis` match Map).  
2. **SOL / escrow / ranked stakes** — not live-tested; keep flags off.  
3. **Shop payload size** — UX risk on slow networks.  
4. **PvP invite E2E** — two real clients not dual-session tested.  
5. **Load / balance sims** — deferred (`simulate:battles`, `simulate:load-stub`).  
6. **Hung local Next** — can falsely look like `MATCH_NOT_FOUND` / timeouts; restart before filing battle bugs.  
7. **Arena mid-edit** — avoided thrashing `rift-arena` battle UI if another agent is rewriting; match-store already uses `globalThis` sharing.

---

## Suggested next QA pass

1. Human browser: FTUE → hatch cinematic → Codex discovery banner → deck builder illegal UX → practice surrender.  
2. Two-browser private invite join.  
3. `npm run simulate:battles` + sample economy sim.  
4. Production-mode `next start` cookie jar smoke (Secure cookie regression).  
5. Re-check shop after catalog pagination.

---

## Local-only confirmation

- **No git commit**  
- **No git push**  
- **No deploy / publish**  

Report path: [`docs/QA_REPORT.md`](./QA_REPORT.md)
