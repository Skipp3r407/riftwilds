# Riftwilds card category ecosystem

Canonical categories (content `type` on each card):

| Category | Purpose | Frame | Engine |
|---|---|---|---|
| **Companion** | Core units (ATK/DEF/HP/Speed, cost, keywords, role, element, family) | Organic bark/vine | UNIT |
| **Spell** | One-time magic; discard after resolve | Arcane violet | SPELL |
| **Item** | Consumables (Medicine Pack, salves…) leather/wood/potion — never companion chrome | Leather/potion | SPELL + `contentType: item` (consume) |
| **Equipment** | Attach to companions; persist until destroy/unequip/death | Brass equip | SPELL + attach |
| **Terrain** | One per player; replacing swaps prior | Nature saturate | AURA |
| **Relic** | Permanent board artifacts (not attach mods) | Crystal rim | SPELL + board zone |
| **Trap** | Face-down set; auto-trigger scaffold | Slate muted | SPELL + traps zone |
| **Commander** | One per deck, not shuffled | Gold leader | UNIT (seat, not main deck) |
| **Evolution** | Upgrade companions along family line | Ascendant gold | UNIT |

## Soft deck guidance vs battle rules v2

Guidance (~29 main + 1 commander):

- 18 companions, 4 spells, 3 items, 2 equipment, 1 terrain, 1 relic, 1 flex, + 1 commander

Hard caps (Standard v2): `minCreatures` 14, `maxSpells` 10, `maxSupportCombined` 6.

**Resolution** (`DECK_COMPOSITION_RESOLUTION`):

- Items count toward the **spell** cap (one-shot consume).
- Equipment + terrain + relic + trap share **support**.
- Evolution counts as **companions** (creature bucket).
- Soft guidance fits inside hard caps; legality uses hard caps.

## Migration

Script: `node scripts/tcg/migrate-card-categories.mjs`  
Report: `docs/CARD_CATEGORY_MIGRATION.md`

Key remaps: `creature→companion`, `legendary→evolution`, consumable `rotr-s-item-*→item`, `location|weather→terrain`, `hero→commander`, `artifact→relic`. Combat-named `rotr-s-item-*` stay **spell**.

## Code touchpoints

- `src/content/tcg/framework/card-categories.ts` — enum, guidance, resolve
- `src/content/tcg/framework/normalize-card.ts` — canonical `category` + layout
- `src/components/tcg/master-card-template.tsx` — distinct frames
- `src/game/tcg/rules/deck-composition.ts` — legality buckets
- `src/game/tcg/match-engine.ts` — item consume, trap set, relic persist, terrain replace
- Collection Flat Binder — category tabs
- Admin Card Studio — category chips + samples

## DB proposal

Content stays JSON. Ownership tables store `cardId` strings. Optional future column: `category` denormalized on `TcgBinderCard` for filters — see `prisma/schema-proposals/tcg-aaa.prisma`.

## Preview URLs (local)

- Collection: `/tcg/collection`
- Card Studio: `/tcg/admin`
- Practice: `/tcg/practice`

Local only — no commit/push from this workstream.
