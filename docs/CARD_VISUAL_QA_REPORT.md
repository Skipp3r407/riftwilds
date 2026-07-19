# CARD_VISUAL_QA_REPORT

Generated: 2026-07-19T16:49:31.160Z

## Progressive disclosure

| Size | Shows |
|------|-------|
| thumb | Cost, name, ATK/DEF/HP condensed |
| hand | + type/element/role |
| field | Live ATK/DEF/HP/Speed + exhausted/status |
| collection | Rules summary + keywords |
| inspect | Full stats + ability text |

## Checks (manual / local)

- [ ] Collection binder renders DEF/Speed for units
- [ ] Battle field overlay updates after strikes
- [ ] Inspect modal role + speed present
- [ ] Card Studio preview on `/tcg/admin`
- [ ] Founder/foil finish does not change ATK vs competitive base
- [ ] Lazy-loaded art (`loading="lazy"`) on master template

## Performance notes

- Prefer clean art thumbs; avoid decoding large baked faces in hand rows when possible.
- Virtualization: collection flat list still capped (120); binder virtualization can follow.
