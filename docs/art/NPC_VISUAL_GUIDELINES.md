# NPC Visual Guidelines (Riftwilds)

> Master bible: [ART_DIRECTION.md](./ART_DIRECTION.md) · creatures: [RIFTLING_GUIDE.md](./RIFTLING_GUIDE.md)

## Hard rules for Live World actors

1. **Full body only** — Every overworld NPC must show head → feet (or full creature silhouette for Riftlings). Bust/portrait crops are **dialogue-only**.
2. **Never wire `portrait.png` / `dialogue-portrait.png` as a world texture.** Boot loads `overworld-sheet.png` first, then `sprite.png`.
3. **Transparent cutout** — World kits must have true RGBA edges (no opaque studio rectangle, no photo sky plate).
4. **Readable at ~50px height** — Strong silhouette, limited micro-detail, distinct costume colors per role.
5. **Original IP** — No franchise lookalikes; prompts already ban Pokémon / Zelda / WoW clones.

## Asset kit per NPC directory

`public/assets/npcs/<region>/<slug>/`

| File | Role |
|------|------|
| `portrait.png` | UI / roster (bust OK) |
| `dialogue-portrait.png` | Dialogue overlay (bust OK) |
| `thumbnail.png` | Compact UI icon |
| `full-body.png` | Dedicated full figure (preferred world source) |
| `sprite.png` | World/static fallback — **must** be full-body, not a portrait crop |
| `overworld-sheet.png` | 4×128 horizontal sheet (idle + walk frames) |
| `metadata.json` | `fullBodyDistinct`, `spriteDistinct`, `worldArtSource` |

## Metadata flags

- `fullBodyDistinct: true` / `spriteDistinct: true` — dedicated world art installed; derive scripts **must not** overwrite with portrait crops.
- `worldArtSource: "dedicated-fullbody"` — installed via showcase / named-fullbody installers.
- If flags are false, treat world art as incomplete — sheet builder will skip bust sources.

## Commons cast (showcase bar)

Named 10 + ambient humans/guards + 3 ambient Riftlings must all pass `npm run assets:audit:npc-world` with **0 floating-head risk**.

## Generation prompts (full body)

Always include: *Full body standing pose, feet visible, solid pure white studio background, front three-quarter view, clean silhouette, no text/watermark.*

Dialogue portraits remain separate bust prompts.