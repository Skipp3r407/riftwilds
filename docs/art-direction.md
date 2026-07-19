# Art Direction — Competitive TCG Surfaces

> Master bible remains `docs/art/ART_DIRECTION.md`. This doc scopes **battle-deck / TCG** surfaces only.  
> Original IP only — never franchise names in prompts or chrome.

---

## 1. Visual pillars (TCG)

1. **Warm earth + rift accents** — greens/browns/sandstone; cyan Rift Energy + amber hearth highlights.  
2. **Readable at card scale** — chunky silhouettes, clear cost/power, mobile-legible board.  
3. **Command desk fantasy** — Practice Board feels like a Keeper’s battle desk, not a generic esports HUD.  
4. **Affinity color language** — Ember coral, Tide blue, Grove green, Storm pale lightning (match existing CSS tokens).  
5. **Avoid AI clichés** — no purple-on-white default, no glow soup, no emoji UI.

---

## 2. Surface hierarchy

| Surface | Priority | Notes |
|---------|----------|-------|
| Card faces | Highest | Full-art ROTR faces already pipeline-generated |
| Battle console board | Highest | Lane readability, Core HP, energy gems |
| Deck builder | High | Binder grid + list pane; premium but not dashboard clutter |
| Commander portraits | High | Heroes from `heroes.json` prompts |
| Faction banners | Medium | Ember / Tide / Grove / Storm |
| Pack / shop chrome | Medium | Existing shop routes |
| Ranked / tournament frames | Later | Cosmetics only |

---

## 3. Battlefield composition

- One composition: desk + two opposing lanes, not a multi-widget dashboard.  
- Brand “Riftwilds” / Rift Battle as hero signal in Practice mode header.  
- Dominant board plane; cards are interaction containers (cards OK here).  
- Mobile: stack opponent lane → board → hand; keep tap targets ≥44px.

---

## 4. Card chrome

Prefer composited faces (`/assets/tcg/cards/{id}.webp`). Fallback: framed art + cost pip. No text overlays that fight the bitmap face in binder tiles.

---

## 5. Motion

Ship intentional motion: card hover lift, energy refill pulse, Core damage shake, end-turn confirm. Avoid particle spam.

---

## 6. Asset registry

Runtime manifest: `src/data/assets-manifest.ts`. Generation prompts: [art-generation-prompts](./art-generation-prompts.md).
