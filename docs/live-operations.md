# Live Operations — Battle-Deck Game

> Coordinates seasons, events, balance, and support without breaking soft-economy or Live World ops docs.

---

## 1. Content ops

| Cadence | Action |
|---------|--------|
| Per expansion | Run `tcg:generate` / `tcg:validate`; balance note in `docs/tcg/` |
| Weekly | Review Practice Board funnel (start → finish) |
| Seasonal | Cosmetics via season-pass; story festivals via living world clock |
| Hotfix | Feature flags (`TCG_FRAMEWORK_ENABLED`, encounter flags) |

Card text lives in content JSON — ship data + adapter changes together.

---

## 2. Modes & flags

- Practice TCG: on via `TCG_FRAMEWORK_ENABLED`  
- World encounters: `TCG_WORLD_ENCOUNTERS_ENABLED`  
- Ranked / duels / tournaments (Arena): mostly off until product ready  
- SOL / mint / real money: **remain false**  
- Quests product flag may be off while demo metrics still record  

Document every flag flip in patch notes workflow before public push.

---

## 3. Seasons

- Soft season pass cosmetics (`src/lib/economy/season-pass.ts`)  
- Arena seasons tables exist; TCG ranked seasons later  
- World festivals / region clocks: `docs/gameplay/SEASONS.md`  

Never gate competitive fairness behind paid season tiers.

---

## 4. Events

- Live World events stub flags exist — prefer soft Credits rewards  
- Tournament Training Cup: Credits only  
- Marketing commercials / comics are separate content pipelines under `artifacts/` / `docs/comics/`

---

## 5. Support playbooks

1. **Stuck match** — in-memory store: restart server clears; guest cookie rematch  
2. **Binder wipe** — expected until Prisma persistence; communicate demo status  
3. **Balance complaint** — log card id + match publicId; adjust content JSON  
4. **SOL user asking to withdraw** — explain flags off; no production spends  

---

## 6. Observability (targets)

- Match start / end counters  
- Invalid deck rejection rates  
- Surrender vs Core-kill outcomes  
- Deck builder save failures  
- Flag-gated SOL attempt blocks (should be 100% block in prod)

---

## 7. Patch notes

User-visible combat changes require `src/content/patch-notes.ts` update before coordinating a push (`docs/PATCH_NOTES_WORKFLOW.md`). Local-only work: no push.
