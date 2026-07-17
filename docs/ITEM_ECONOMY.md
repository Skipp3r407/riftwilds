# Riftwilds Item & SOL Economy — Architecture

## Compliance boundaries

- Purchases are **digital entertainment products**, not investments.
- No guaranteed profit, resale value, token rewards, or battle victory.
- **No paid mystery boxes / gacha** at launch: `PAID_RANDOM_REWARDS_ENABLED=false`.
- SOL purchases: `SOL_ITEM_PURCHASES_ENABLED=false` until Phase 2 (devnet verification).
- All SOL amounts in **integer lamports** (1 SOL = 1_000_000_000 lamports). Never JS floats for balances.
- Ranked Arena **normalizes** equipment stats; cosmetics/visuals retained.

---

## 1. Item taxonomy

| Family | Subtypes | Ownership default |
|--------|----------|-------------------|
| Weapons | Claw, Tail, Horn, Floating Focus, Harness | Off-chain; optional on-chain for Mythic+ |
| Armor | Head, Chest, Back, Paw, Tail, Wing, Barrier, Cosmetic set | Off-chain |
| Potions | Health, Energy, Status, Care, Recovery | Off-chain stacks |
| Abilities | Attack / Defensive / Healing / Control / Support / Ultimate | Scrolls → pet-bound on use |
| Materials | Crafting tiers Common→Celestial | Off-chain stacks |
| Cosmetics | Auras, overlays, titles | Off-chain / limited on-chain |
| Accessories | Charms, ribbons | Off-chain |

Shop categories map to routes under `/shop/*`.

---

## 2. Rarity balance table

| Rarity | Max power vs Common | Visual | Affixes |
|--------|---------------------|--------|---------|
| Common | 0% (baseline) | Neutral gray | 0–1 small |
| Uncommon | ≤3% | Emerald | 1 minor |
| Rare | ≤6% | Crystal blue | 1–2 |
| Epic | ≤9% | Violet aura | 2–3 |
| Legendary | ≤12% | Gold + runes | Unique passive |
| Mythic | ≤15% | Iridescent | Specialized |
| Celestial | ≤15% combat; rest cosmetic | Cosmic | Prestigious |

Ranked: Option A normalization (visuals kept). Casual: full disclosed stats within caps.

---

## 3. Starter item catalog

- **40 weapons** (Common→Celestial) — see `src/lib/items/catalog/weapons.ts`
- **Armor** across Common→Celestial — `catalog/armor.ts`
- **Health / energy / status / care potions** — `catalog/potions.ts`
- **Magic + physical abilities + ultimates** — `catalog/abilities.ts`
- **Crafting materials** — `catalog/materials.ts`

---

## 4. Ability catalog

Five magic families + physical basics. One ultimate per affinity (Volcanic Heartburst … Ancestral Lantern Parade). Acquisition: level, quests, named scrolls (exact ability disclosed), events. No random paid ability rolls.

---

## 5. Pricing configuration

Versioned `ItemPriceVersion` + bootstrap `src/lib/items/pricing.ts`:

| Rarity | Example SOL range (config only) |
|--------|----------------------------------|
| Common | 0.002–0.01 |
| Uncommon | 0.01–0.03 |
| Rare | 0.03–0.08 |
| Epic | 0.08–0.20 |
| Legendary | 0.20–0.75 |
| Mythic | 0.75–2 |
| Celestial | Individually configured |

Price changes never rewrite historical orders.

---

## 6. SOL payment architecture (Phase 2)

```
Client → POST payment intent (server)
      → User signs exact lamports to destination
      → Server verifies finalized tx (amount, dest, memo/ref)
      → Idempotent ItemPurchase + inventory credit
```

Never trust browser callbacks alone. Replay protection + unique payment refs.

---

## 7. Inventory architecture

Tabs: All / Weapons / Armor / Potions / Abilities / Materials / Care / Cosmetics / Recovery / Collectibles.  
Ownership badges: Off-chain | On-chain | Tradable | Account-bound | Pet-bound | Consumable.  
Capacity + stack counts; server validates use/equip.

---

## 8. Marketplace flow (Phase 3)

List → fee breakdown (92/4/2/1/1) → buyer pays → verify → transfer ownership → treasury split. Versioned fee policy. Disclosures on every confirmation.

---

## 9. Crafting flow (Phase 3)

Materials + optional SOL fee + blueprint → atomic commit. Failure: no materials consumed, no fee, no item. Deterministic results for paid crafts. Upgrades +0…+5 always succeed when requirements met (no paid fail chance).

---

## 10. Equipment attachment system

Points: head, horn, neck, chest, back, paws, tail*, wings, floatingFocus.  
Offsets per species/animation. Admin: `/admin/assets/equipment-aligner`.

---

## 11. Image asset plan

Prompts: `asset-prompts/{weapons,armor,potions,abilities,scrolls,materials,cosmetics,marketplace}/`  
Outputs: `public/assets/items/...` + rarity frames separate.  
Phase 1: SVG placeholders via `scripts/assets/generate-item-placeholders.ts`.

---

## 12. Security threat model

| Threat | Mitigation |
|--------|------------|
| Fake browser payment success | Server RPC finalize check |
| Wrong amount/destination | Exact match on intent |
| Replay signature | Unique constraint on signature |
| Double delivery | Idempotency keys |
| Paid gacha | Flag hard-off |
| Pay-to-win ranked | Equipment normalization |
| Float precision | Lamports bigint/int only |

---

## 13. Database migration plan

Extend `Item` metadata + append: `ItemPriceVersion`, `ItemSupply`, `ItemPurchase`, `PaymentIntent`, `PaymentVerification`, potion/ability/armor definition tables, `PetLoadout`, marketplace fee entries. Soft-launch with flags off for SOL.

---

## 14. Implementation checklist

- [x] Architecture doc
- [x] Phase 1 catalog + pricing (lamports)
- [x] Inventory + shop UI (browse; SOL checkout disabled)
- [x] Pet loadout + rarity components
- [x] Prompts + SVG placeholders
- [x] Admin items shell + tests
- [ ] Phase 2 devnet SOL purchases
- [ ] Phase 3 crafting + marketplace
- [ ] Phase 4 on-chain collectibles
