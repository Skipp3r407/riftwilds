# Testing Plan — Battle-Deck Phase 1+

---

## 1. Automated (existing + extend)

| Suite | Path / command | Focus |
|-------|----------------|-------|
| TCG content | `tests/unit/tcg-content.test.ts` | Pack load / schema sanity |
| Match engine | `tests/unit/tcg-match-engine.test.ts` | Energy, play, surrender |
| Deck validation | via engine/deck unit tests | Size + copy limits |
| Quest retarget | existing quest TCG tests | Metrics |
| Lint / typecheck / build | project scripts | Gate before handoff |

After Phase 1 changes, update opening-hand expectations and add:

- Faction / starter-set-20 id resolution  
- Deck builder validation helpers  
- Commander id accepted on match create (optional)

---

## 2. Manual QA — Practice Board

1. Open `/tcg/battle` — Practice Board boots  
2. Play unit / spell / end turn — AI responds  
3. Surrender — loss state  
4. Energy ramps; fatigue eventually  
5. Mobile width: hand + lanes readable  
6. Soft turn timer displays (does not soft-lock)  
7. Encounter query params return to Live World path  

---

## 3. Manual QA — Deck builder

1. Open `/tcg/deck-builder`  
2. Filter by affinity / search name  
3. Add/remove cards; validation errors for size/copies  
4. Save active deck; start battle with that list  
5. Load starter-showcase-20 / faction starter  

---

## 4. Regression — do not break

- `/tcg/collection` binder faces  
- Live World enter + encounter bridge  
- Credits soft shop  
- SOL flags remain false (spot-check status API)  
- Arena training still reachable as legacy  

---

## 5. Performance

- Catalog map cached in `card-catalog`  
- Avoid shipping full 735-card JSON twice to client; deck builder should use API or existing catalog helpers  
- Battle board: card images `unoptimized` OK for local webp  

---

## 6. Phase 2+ test backlog

- Keyword interpreter matrix  
- Unit HP combat  
- Multiplayer reconnect fuzz  
- Ranked rating invariants  
- Persistence migrations dry-run on Neon branch  

---

## 7. Definition of done (Phase 1)

- [x] Docs set written  
- [ ] Unit tests green after default changes  
- [ ] Deck builder route usable  
- [ ] Practice battle still playable  
- [ ] Typecheck / lint clean for touched files  
