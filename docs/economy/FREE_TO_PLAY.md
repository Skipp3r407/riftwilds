# Free-to-Play Philosophy

Riftwilds is **free to play**. Crypto is optional.

## Hard rules

1. **Never require** a wallet, SOL, or `$RIFT` to hatch, battle, quest, collect, or care.
2. **Crypto/token is optional** — cosmetics and community perks only.
3. **Never** grant competitive power or exclusive core access via token holdings.
4. **Never promise guaranteed earnings** from play, eggs, or token holding.
5. **Starter package** for every new player (no purchase):
   - Starter Egg (account-bound)
   - Starter Credits
   - Starter deck
   - Tutorial / Academy / Help
   - Free avatar options
   - Home / homestead entry
   - Starter quest chain

## Eggs

Earned via gameplay (quests, bosses, login, guild, battle pass free track, exploration, events, achievements) plus optional Credits purchases for convenience — never SOL-gated core access.

## Companions & cards

Hatched Riftlings are companions **and** map to collectible TCG cards (dual existence). Codex tracks discovery. Battles use the TCG loop — not paywalled.

## Flags

| Flag | Default | Meaning |
|------|---------|---------|
| `FREE_TO_PLAY_CORE_ENABLED` | `true` | Product stance |
| `AUTH_WALLET_OPTIONAL_PLAY` | `true` | Play without wallet |
| `TOKEN_GATE_ENABLED` | `false` | No core token gate |
| `TOKEN_COSMETIC_PERKS_ENABLED` | `false` | Holder cosmetics scaffold |
| `TOKEN_COSMETIC_PAYOUTS_ENABLED` | `false` | Real payouts off |
| `ANTI_PAY_TO_WIN_ENFORCED` | `true` | Policy + validators |
| `SOL_*` / `PAID_RANDOM_REWARDS_*` | `false` | Real-money rails off |

## Related

- `docs/economy/HATCHERY_ECONOMY.md`
- `docs/economy/TOKEN_COSMETIC_PERKS.md`
- `docs/economy/NO_PAY_TO_WIN_POLICY.md`
- `docs/economy/SOL_INTEGRATION.md`
