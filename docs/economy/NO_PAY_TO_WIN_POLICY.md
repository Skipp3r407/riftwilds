# No Pay-To-Win Policy

## Rules

1. **Essential competitive cards** must be earnable without SOL (quests, Gold packs, battle rewards).
2. **Collectible editions** (alt art, foil, animated) never grant ATK/HP/energy or exclusive competitive effects.
3. **Premium collector packs** may sell cosmetics only — not exclusive gameplay power.
4. **Season pass premium** may add cosmetics/convenience; free track must remain viable.
5. Catalog validator: `validateCatalogNoPayToWin()` in `src/lib/economy/sol/catalog.ts`.
6. **Hatchery / companions** — wallet, SOL, and `$RIFT` never required to claim, hatch, or battle. Token holder tiers (Explorer → Mythic Keeper) are cosmetics only (`TOKEN_COSMETIC_PERKS.md`).
7. **Never promise guaranteed earnings** from eggs, hatches, battles, or token holding.
8. Flag `ANTI_PAY_TO_WIN_ENFORCED` defaults **true**; real payout flags default **false**.

## Separation

| Asset | Competitive? |
|-------|----------------|
| Gameplay card copy (`GAMEPLAY_CARD_COPY`) | Yes — soft earn/spend |
| Collectible edition | No — cosmetic ownership |
| Card backs / boards / frames | No |
| `$RIFT` Explorer/Guardian/Ancient/Mythic Keeper | No — cosmetics / community only |
| Starter Egg / starter deck | Free — no purchase |

## Enforcement

- Unit tests reject SOL-exclusive essential power SKUs.
- `collectibleAffectsGameplay()` always returns `false`.
- `cosmeticPerksAffectGameplay()` always returns `false`.
- Minting does not unlock stronger cards.
- Hatchery APIs use guest-safe `resolveOwnerKey()` — no wallet middleware.
