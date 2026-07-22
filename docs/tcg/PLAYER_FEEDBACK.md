# Player Feedback — Event Feed

**Scope:** Practice Board `/tcg/battle` · engine `src/game/tcg/match-engine.ts` · feed `src/game/tcg/events/*` · UI `src/components/tcg/battle-event-feed.tsx`

## Problem

The old Battle Log dumped engine codes (`DRAW`, `SECOND_MAIN_SKIPPED`, `Unit fell`) into a player-facing panel. That read as a debug console, not a TCG event feed.

## Solution

1. **Engine** enriches every event with `seq`, `turn`, `phase`, and resolved `cardName` / attacker / target names.
2. **Catalog** marks internal codes as non-player-visible (`SECOND_MAIN_SKIPPED`, `FATIGUE` alias, skipped draws, etc.).
3. **Feed builder** emits natural-language lines with turn dividers, phase labels, combat blocks, tooltips, and highlight ids.
4. **UI** shows filters, newest glow / flash tones, click-to-highlight board units, end-of-match summary, and a separate **Dev** console.

## Player-facing examples

```
──────── Turn 4 ────────
YOUR TURN
Main
🔹 You drew Frostfin.
⚡ You gained 1 Rift Energy. Energy: 5 → 6
🔹 You summoned Sprayfin to the Frontline.
🔸 Mossdrake attacked Bramblefox.
🗡 3 Damage
💀 Bramblefox was defeated.
```

## Developer mode

Never mixed into the default feed.

| Toggle | How |
|--------|-----|
| In-panel **Dev** button | Top-right of Event Feed |
| Query | `/tcg/battle?battleDev=1` (or `?dev=1`) |
| Persist | `localStorage.riftwilds.battleDev = "1"` |

Dev console lists raw `#seq Tturn TYPE defId` lines with payload tooltips.

## Feedback rules (related)

Illegal plays already toast via `playHint` + illegal VFX — keep that path; Event Feed covers match history, not soft-fail affordances.

## Deferred (still in overhaul backlog)

- Full combat replay scrubber / jump-to-timestamp
- Crit / shield-break telemetry (payload hooks exist; combat FX pass later)
- Screen-reader announcement queue beyond `aria-live`
