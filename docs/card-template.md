# Card template (master)

Canonical presentation: `MasterCardTemplate` (`src/components/tcg/master-card-template.tsx`).

Legacy `RiftCardFrame` is a thin adapter — every collection / deck / pack / Codex surface uses the master chrome.

## Rules

- **Stats come from gameplay data** (normalized + overlays), never from pixels in source art.
- **Clean art** prefers `/assets/cards/{expansion}/{slug}/art.webp` via path index; baked faces are legacy fallback.
- **Founder / foil / champion finishes** are cosmetic-only — no competitive power.
- Front footer can show expansion · collector # · artist on collection/inspect sizes.

## Progressive sizes

`thumb` → `hand` → `field` → `collection` → `inspect`

## Type layouts (canonical categories)

| Layout | Shows |
|--------|--------|
| companion | ATK · DEF · HP · Speed |
| evolution | ATK · DEF · HP · Speed · evo tag |
| commander | Commander HP · leader / ultimate chips |
| spell | Spell speed · target · effect power |
| item | Consume tag · target · heal/effect (leather/potion frame) |
| equipment | ATK/DEF modifiers · durability · eligible target |
| relic | Permanent board artifact tag |
| terrain | Duration · global effect |
| trap | Face-down · trigger power |
| other | Type tag only |

See `docs/card-categories.md` for ecosystem rules.

## Related

- `docs/card-responsive-design.md`
- `docs/card-asset-pipeline.md`
- `docs/CARD_REGENERATION_PLAN.md`
