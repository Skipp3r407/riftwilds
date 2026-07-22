# DECK_VALIDATION

Constructed combat decks: **29 main + 1 Commander** (commander never shuffled). Inventory goods are illegal.

## Reject message

```
This item belongs in your Inventory, not your Combat Deck.
```

Codes: `INVENTORY_NOT_COMBAT` / `INVENTORY_NOT_DECK`.

## Enforcement points

1. **`validateConstructedDeck`** — always rejects inventory ids
2. **`validateDeckList`** — binder saves / match start
3. **Deck Atelier** — combat-only gallery; `addCard` shows reject message
4. **`GET /api/tcg/deck`** — catalog filtered to combat-eligible
5. **`padUniqueToConstructedSize`** — fill pool combat-only
6. **Practice Board** — `isPracticeUsefulCard` hard-gates inventory
7. **Match engine** — throws if a leftover somehow reaches play

## Save migration

`getActiveDeckList` strips inventory ids, grants inventory stacks, pads unique combat cards. Saved decks migrate the same way.
