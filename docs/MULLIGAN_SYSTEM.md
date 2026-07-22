# MULLIGAN_SYSTEM.md

Implementation notes for Keep / Partial / Full.

| Layer | Location |
|-------|----------|
| Config | `hand.mulliganOnce` in `battle-rules-config.ts` |
| Engine | `applyMulligan` / `keepHand` in `match-engine.ts` |
| API | `POST /api/tcg/match/turn` accepts `KEEP_HAND` / `MULLIGAN` |
| UI | `src/components/tcg/mulligan-panel.tsx` |

Practice Board **enables** mulligan as of v2.1 (Quick / Tutorial still skip by default).

See [MULLIGAN_RULES.md](./MULLIGAN_RULES.md).
