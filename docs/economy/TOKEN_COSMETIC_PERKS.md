# Token Cosmetic Perks (Optional)

`$RIFT` holder perks are **cosmetics / community flair only**.

## Tiers (admin-configurable)

| Tier | Illustrative threshold | Example perks |
|------|------------------------|---------------|
| **Explorer** | low hold | Title flair, card back |
| **Guardian** | mid hold | Soft aura, profile frame, emote |
| **Ancient** | high hold | Badge, habitat decor, foil card back |
| **Mythic Keeper** | top hold | Title, prismatic aura, animated frame |

Source of truth: `src/lib/economy/token-cosmetic-perks.ts`

## What these never do

- Change hatch odds, rarity, or species pools
- Unlock exclusive competitive cards or commanders
- Gate Hatchery, TCG, quests, Codex, or starter package
- Grant PvP / ranked advantages
- Promise earnings or payouts (payout flags default **OFF**)

## Flags

- `TOKEN_COSMETIC_PERKS_ENABLED` — default `false`
- `TOKEN_COSMETIC_PAYOUTS_ENABLED` — default `false`
- `TOKEN_GATE_ENABLED` — default `false` (legacy; not applied to core play routes)
- `ANTI_PAY_TO_WIN_ENFORCED` — default `true`

## Runtime

`evaluateCosmeticTier()` returns unlocked tier keys only when perks are enabled.  
`cosmeticPerksAffectGameplay()` always returns `false`.
