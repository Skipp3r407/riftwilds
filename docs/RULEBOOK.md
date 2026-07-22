# Official Riftwilds Rulebook

**Version:** Rules **v2.2.0**  
**Authority:** `src/game/tcg/rules/battle-rules-config.ts` · `src/game/tcg/match-engine.ts`  
**In-game:** `/tcg/rules`

This document is the **single source of truth** for competitive Riftwilds TCG rules. Code, tutorials, tooltips, AI, and other docs must not diverge from it.

---

## Changelog (rules)

### v2.2.0 — Strategic card advantage (2026-07-22)

| Rule | Change |
|------|--------|
| Turn draw | Still **exactly one** card at start of turn (P1 skips turn 1). |
| Auto-draw on play | **Forbidden** — playing a card never replaces itself unless that card has a draw keyword / effect. |
| Keywords | **Insight**, **Inspire**, **Scout**, **Discover** (tactical filter / limited advantage). |
| Commander Focus | Once/turn: spend **1** Energy → draw 1. |
| Conversions | Channel (2 Energy → draw); Bank (discard → +1 Energy next turn); Recycle (shuffle → draw). Each once/turn. |
| Relics | Insight relics (e.g. Keeper's Quill) may grant end-of-turn thrift draw when Energy is empty. |
| Deck tools | High-curve / starvation warnings in Deck Atelier. |

See [CARD_ADVANTAGE.md](./CARD_ADVANTAGE.md).

### v2.1.0 — Early-game curve / 0-cost / mulligan (2026-07-22)

| Rule | Change |
|------|--------|
| Collectible 0-cost | Allowed for carefully designed utilities (~5–10% of launch pool). Catalog no longer floors non-token costs to 1. |
| Deck cap | Max **4** zero-cost combat cards per constructed deck (`maxZeroCostPerDeck`). |
| Opening hand | Soft-shaped so ≥1 card costs ≤ turn-1 Energy. Does **not** replace mulligan. |
| Mulligan UI | Keep / Partial / Full — once per player. Practice Board no longer skips mulligan. |
| Starting Energy | **Kept at 2** (audit: raising to 3 would mindlessly speed the game). |
| Curve tags | Tempo, Combo, Support, Starter, Finisher, Ramp, Removal, Control, Utility. |
| AI | Curves out (highest affordable first); 0-cost as glue after tempo spends. |
| Deck Atelier | Energy curve graph + warnings (too expensive / no T1 / 0-cost cap). |

### v2.0.0 — Battle rules baseline

29+1 constructed, Energy 2→10, mulligan once (engine), Rift Spark for P2, field 3+2, Keeper 25 HP.

---

## 1. Win conditions

- Reduce the enemy **Keeper** to 0 HP (start **25**).
- Opponent concedes / disconnect past reconnect timer.
- Alternate card win effects.
- Fatal **Rift Collapse** from empty-deck draws (escalating).

## 2. Deck building

See also: [DECK_BUILDING.md](./DECK_BUILDING.md), [DECK_VALIDATION.md](./DECK_VALIDATION.md).

| Rule | Value |
|------|-------|
| Total pieces | **30** = 1 Commander (not shuffled) + **29** main-deck |
| Min companions/evolutions | 14 |
| Max spells (+ legacy items) | 10 |
| Max equipment/terrain/relic/trap | 6 |
| Max Legendary/Mythic/Ancient/Founder | 3 combined |
| Copy limit | **1** of each cardId (unique-only Standard) |
| Max **0-cost** combat cards | **4** (configurable) |
| Inventory / food / care | **Never** legal in combat decks |

Commander belongs in the Commander slot only — never in the 29.

## 3. Rift Energy

See also: [RIFT_ENERGY.md](./RIFT_ENERGY.md).

| | |
|--|--|
| Turn 1 max | **2** |
| Per turn | +1 max, refill to max at turn start |
| Cap | **10** |
| Temp energy | Expires end of turn (e.g. Rift Spark) |
| Unaible plays | Engine rejects unaffordable plays (`INSUFFICIENT_RIFT_ENERGY`) |

**Starting Energy decision (v2.1):** Keep **2**. Dead opens are handled by opening-hand shaping, mulligan, curve tools, and 0-cost utilities — not by raising the floor.

### Example — illegal play

Keeper has 1 Energy. Hand has a 2-cost companion. Play is rejected; Energy unchanged.

### Example — cost reduction

First companion each game may cost 1 less (Commander passive). Printed 2 → spend 1. Still cannot go below 0.

### Example — 0-cost play

Keeper has 0 Energy. Plays **Glowbug** (0). Legal. Board gains a 1/1. Remaining Energy still 0 — then a 2-cost is still illegal.

## 4. Opening hand & mulligan

See also: [OPENING_HAND_SYSTEM.md](./OPENING_HAND_SYSTEM.md), [MULLIGAN_SYSTEM.md](./MULLIGAN_SYSTEM.md), [MULLIGAN_RULES.md](./MULLIGAN_RULES.md).

1. Shuffle main deck; deal **5**.
2. Soft-shape: if no card costs ≤ turn-1 Energy, swap priciest hand card with a cheaper deck card.
3. **Mulligan once** (optional):
   - **Keep** — lock hand.
   - **Partial** — select cards to put back, shuffle, draw that many.
   - **Full** — replace all five.
4. P1 skips turn-1 draw. P2 may receive **Rift Spark** (+1 temp Energy, exile).

### Example — mulligan

Hand: 5, 4, 3, 6, 4 (no ≤2). Soft-shape already tried. Player selects the three highest → Partial mulligan → three new cards.

## 5. Turn structure

See also: [TURN_STRUCTURE.md](./TURN_STRUCTURE.md), [turn-structure.md](./turn-structure.md).

`MULLIGAN → START → MAIN → COMBAT → SECOND_MAIN → END`

1. **START** — raise energy max, refill, ready units, start effects, draw **one** (skip P1 turn 1). Apply banked Energy from Bank conversion.
2. **MAIN** — play cards, abilities, Commander Focus, optional conversions (Channel / Bank / Recycle).
3. **COMBAT** — declare ready attackers; resolve damage.
4. **SECOND MAIN** — Fast/Reaction (auto-skipped in Practice / Quick / Casual).
5. **END** — relic thrift draws, expire temp Energy, pass turn.

Actions: `PLAY_CARD`, `DECLARE_COMBAT`, `END_TURN`, `MULLIGAN`, `KEEP_HAND`, `SURRENDER`, `ENERGY_TO_DRAW`, `DISCARD_FOR_ENERGY`, `RECYCLE`, `COMMANDER_DRAW`.

**No auto-draw-on-play.** Card advantage is deliberate (keywords / Focus / conversions).

## 6. Combat & field

- 3 Frontline + 2 Backline + Terrain + Commander (max **5** creatures).
- Frontline protects Keeper unless Flying / Pierce / Stealth / Siege.
- Summons enter Exhausted unless Charge / Rush / Swift.
- Damage: `max(1, round((atk − def) × elementMod))` when atk > 0.

## 7. Card types in combat

See also: [CARD_TYPES.md](./CARD_TYPES.md), [CARD_CLASSIFICATION.md](./CARD_CLASSIFICATION.md).

| Playable in combat | Not combat |
|--------------------|------------|
| Companion, Evolution, Spell, Equipment, Relic, Terrain, Trap | Food, medicine, materials, care tools, inventory goods |

## 8. Zero-cost cards

See also: [ZERO_COST_CARD_DESIGN.md](./ZERO_COST_CARD_DESIGN.md), [ZERO_COST_CARD_GUIDE.md](./ZERO_COST_CARD_GUIDE.md).

- Target **5–10%** of the launch pool as tiny utilities (Common/Uncommon).
- **Never:** large/legendary companions, board wipes, massive heal/draw/damage, Charge/Rush/Echo on collectibles, game-ending combos.
- Templates: Glowbug, Pocket Scout, Morning Dew, Rift Whisk.
- Deck cap **4** prevents free-card floods.

## 9. Keywords

See [KEYWORDS.md](./KEYWORDS.md), [keywords.md](./keywords.md), and [CARD_ADVANTAGE.md](./CARD_ADVANTAGE.md). Registry: `src/game/tcg/combat/keywords.ts`.

Card-advantage keywords (v2.2): **Insight**, **Inspire**, **Scout**, **Discover**.

## 10. Companion Care vs Inventory

Food and care items live in **Inventory** only. They never enter combat decks or Practice hands. See [COMPANION_CARE.md](./COMPANION_CARE.md), [INVENTORY_SYSTEM.md](./INVENTORY_SYSTEM.md).

## 11. Rift Stakes

Optional wagering modes — see [rift-stakes/RIFT_STAKES.md](./rift-stakes/RIFT_STAKES.md). Core Energy / mulligan / deck rules are identical unless a mode override says otherwise.

## 12. Related early-game / advantage docs

- [CARD_ADVANTAGE.md](./CARD_ADVANTAGE.md)
- [MANA_CURVE_ANALYSIS.md](./MANA_CURVE_ANALYSIS.md)
- [EARLY_GAME_BALANCE.md](./EARLY_GAME_BALANCE.md)
- [DECK_CURVE_ANALYZER.md](./DECK_CURVE_ANALYZER.md)
- [GAMEPLAY_RULES.md](./GAMEPLAY_RULES.md)
- [FAQ.md](./FAQ.md)
- [CHANGELOG.md](./CHANGELOG.md) (rules changelog mirror)

## 13. Client controls (presentation)

Rules are input-agnostic. Practice Board / match desk UI:

| Input | Play a card | End turn | Inspect |
|-------|-------------|----------|---------|
| Desktop | Drag to field or Play | End Turn / Space | Click |
| Touch | Double-tap or drag summon | Dock End / Pass | Long-press |

Full chrome: [TOUCH_CONTROLS.md](./TOUCH_CONTROLS.md), [MOBILE_UI_GUIDELINES.md](./MOBILE_UI_GUIDELINES.md).
