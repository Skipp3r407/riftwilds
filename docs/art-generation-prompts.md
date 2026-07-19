# Art Generation Prompts — TCG / Battle Deck

> Original IP only. **Never** include copyrighted franchise names, characters, or UI.  
> Append shared style suffix from `src/lib/assets/image-provider.ts` (`RIFTWILDS_STYLE_SUFFIX`) when using the project image pipeline.  
> Content prompts also live in `src/content/tcg/data/artPrompts.json`.

---

## Global negative prompt

```
text, watermark, logo, UI chrome, copyrighted character, anime sticker sheet,
hyper-real PBR, voxel, muddy grey fog, purple neon glow spam, stock fantasy clone
```

---

## 1. Faction banners (4)

### Ember Forge League
```
Horizontal faction banner for original fantasy game Riftwilds, Ember Forge League,
warm forge coals and copper filigree, coral-ember accents, subtle cyan rift spark,
timber and stone heraldry, readable silhouette icon of a forge-anvil egg motif,
painterly cozy fantasy, no text
```

### Tideward Compact
```
Horizontal faction banner for original fantasy game Riftwilds, Tideward Compact,
moonlit coastal teal and deep tide blue, pearl foam edges, brass compass accents,
soft cyan rift shimmer, readable wave-and-shell crest, painterly cozy fantasy, no text
```

### Grove Circle
```
Horizontal faction banner for original fantasy game Riftwilds, Grove Circle,
lush moss greens and warm bark browns, amber sap light, cyan rift dew,
leaf-and-egg crest, readable at small size, painterly cozy fantasy, no text
```

### Spirewind League
```
Horizontal faction banner for original fantasy game Riftwilds, Spirewind League,
stormspire pale lightning and wind-silver, high cliffs, brass harness buckles,
cyan rift streak in clouds, readable storm-crest, painterly cozy fantasy, no text
```

---

## 2. Commander portraits (hero key art)

Template (fill from `heroes.json` visualIdentity):

```
Full-body portrait of {name}, {title}, original Riftwilds Keeper,
{visualIdentity}, warm earthy fantasy wardrobe, subtle cyan rift accents,
clean silhouette, feet visible, soft 3/4 view, transparent or studio plate,
cozy readable fantasy RPG, no text, no watermark
```

Priority heroes: Elara Venn, Captain Brine, Volta, Mira, Kael, Archivist Solen.

---

## 3. Battle desk board background

```
Top-down / soft 3/4 Keeper battle desk for Riftwilds TCG, warm wood grain,
amber lantern pools, cyan rift energy inlays forming two opposing lanes,
parchment edges, readable empty board center for cards, cozy fantasy, no text, no UI widgets
```

---

## 4. Deck builder ambient

```
Wide atmospheric backdrop of a Riftwilds card atelier, wooden sorting trays,
soft daylight through timber window, binder spines, cyan rift mote dust,
warm browns and moss greens, no cards with readable logos, no text
```

---

## 5. Energy gem / Core icon

```
Single game UI icon, Rift Energy crystal gem, cyan core with amber facet highlights,
chunky readable silhouette for mobile HUD, soft fantasy, transparent background, no text
```

```
Single game UI icon, Keeper Core heartstone, warm amber crystal with soft cyan rim,
chunky readable, transparent background, no text
```

---

## 6. Card face regeneration

Prefer pipeline: `npm run tcg:generate:card-images`. Per-card prompts already embedded in content `art.prompt`. Showcase-20 priority IDs listed in `docs/card-system.md`.

---

## 7. Manifest

Register outputs in `src/data/assets-manifest.ts` with id, path, surface, status (`needed` | `pipeline` | `shipped`).
