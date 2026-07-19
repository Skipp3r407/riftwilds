# Security & Anti-Cheat — TCG / Competitive

> Complements `docs/security/SOL_THREAT_MODEL.md` and map-generation security docs.  
> Phase 1 practice is low-stakes; design for Phase 4+ authority now.

---

## 1. Trust boundaries

| Client may | Client must not |
|------------|-----------------|
| Send intended actions | Author authoritative HP / energy / RNG |
| Render snapshots | Invent owned cards not in binder |
| Soft UI timers | Override server turn clock (future) |

Practice matches: server Next routes mutate in-memory state — still validate actions.

---

## 2. Phase 1 controls (implemented / required)

- Zod body validation on match start/turn  
- Cookie guest/session `ownerKey` for match ownership  
- Deck validation before start (`validateContentDeckList` / constructed `validateDeckList`)  
- AI side cannot be acted by client (`AI_SIDE` error)  
- Feature flag gate `TCG_FRAMEWORK_ENABLED`  
- SOL spend paths separately gated false  

---

## 3. Competitive anti-cheat (Phase 4+)

1. **Server RNG** for shuffle / mulligan  
2. **Deck hash** registered at queue time from server binder  
3. **Action rate limits** + duplicate action idempotency keys  
4. **Reconnect tokens** bound to match + user  
5. **Replay audit** — event log enough to re-simulate  
6. **Spectators** receive delayed snapshots if needed  

---

## 4. Economy abuse

- No real-value wagering  
- Credits grants through ledger patterns with idempotent keys  
- Pack RNG (when enabled) server-side only; paid random rewards flag stays hard-off  
- Marketplace writes: existing cooldown / fee policy tables  

---

## 5. Content / IP

- Reject user uploads that impersonate official card IDs  
- Prompt pipelines strip franchise names  
- Admin asset import security: `docs/assets/ASSET_SECURITY.md`

---

## 6. Incident response (sketch)

1. Disable mode via flag  
2. Freeze affected ledger lines  
3. Preserve match event logs  
4. Patch engine; add regression test  
5. Patch notes if user-visible  

---

## 7. Explicit non-goals

- Client-side “fair play” honor system as sole defense  
- On-chain match results as anti-cheat (optional chain is ownership-only)  
