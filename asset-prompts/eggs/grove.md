# Grove Egg — Art Prompts

**Project:** Riftwilds · **Category:** Egg · **Class:** Grove  
**Visual direction:** Bark texture, moss, tiny leaves, emerald runes

## Global settings

| Property | Value |
|----------|-------|
| Style | Original 2D fantasy, subtle pixel influence, clean dark outlines, cel shading |
| Lighting | Upper-left key light, soft rim on elemental accents |
| Background | Transparent |
| Composition | Centered, ≥10% padding, no text/logo |
| Master size | 1536 × 1536 |
| Hatch frames | 1024 × 1024, shared baseline |
| Icon size | 256 × 256 |
| Negative prompt | [negative-prompt.md](./negative-prompt.md) |

## Critical rules

- NO creature visible inside unhatched egg
- NOT Poké Balls, capsules, or branded toy eggs
- Hatch frames share identical shell footprint and baseline

---

## 1. Full clean egg

| Field | Value |
|-------|-------|
| File | `egg-grove-full.png` |
| Size | 1536 × 1536 |
| Purpose | Master reference / hero render |

**Positive prompt:**

```
Create a completely original fantasy egg for the game Riftwilds, Grove class. Organic oval egg with natural asymmetry — not a sphere, not a capsule, not a capture ball.

Shell surface: rich brown bark texture with deep wood grain grooves. Patches of soft green moss cling to the shell. Tiny fresh leaves sprout delicately from moss clusters. Glowing emerald rune sigils — original geometric nature symbols, not letters — trace faintly across the bark. Soft verdant inner glow with no creature visible inside.

Style: polished original 2D fantasy illustration with subtle pixel-art influence, clean dark outlines, layered cel shading, premium mobile-game rendering. Upper-left warm key light, emerald rim accent. Transparent background, centered, 10% padding, no text, no logo.

Completely original — must NOT resemble a Poké Ball, capsule, branded toy egg, or copyrighted game item.
```

---

## 2. Idle glowing egg

| Field | Value |
|-------|-------|
| File | `egg-grove-idle.png` |
| Size | 1024 × 1024 |

**Prompt:** Grove master — bark shell, moss patches, runes pulse emerald, leaves flutter slightly. Baseline locked. No creature.

---

## 3. Left wobble

| Field | Value |
|-------|-------|
| File | `egg-grove-wobble-left.png` |
| Size | 1024 × 1024 |

**Prompt:** Grove egg ~5° left tilt. Moss and leaves follow shell. Baseline fixed.

---

## 4. Right wobble

| Field | Value |
|-------|-------|
| File | `egg-grove-wobble-right.png` |
| Size | 1024 × 1024 |

**Prompt:** Grove egg ~5° right tilt. No cracks.

---

## 5. First crack

| Field | Value |
|-------|-------|
| File | `egg-grove-crack-01.png` |
| Size | 1024 × 1024 |

**Prompt:** Bark egg with thin crack splitting grain upper-left. Emerald light through fissure. Moss edge frayed.

---

## 6. Second crack

| Field | Value |
|-------|-------|
| File | `egg-grove-crack-02.png` |
| Size | 1024 × 1024 |

**Prompt:** Grove crack-01 plus branching cracks along bark grain. Runes brighten at intersections.

---

## 7. Heavy cracks

| Field | Value |
|-------|-------|
| File | `egg-grove-crack-03.png` |
| Size | 1024 × 1024 |

**Prompt:** Dense crack web, bark splintering, strong green glow, tiny leaf fragments — no creature inside.

---

## 8. Energy leaking through cracks

| Field | Value |
|-------|-------|
| File | `egg-grove-energy-leak.png` |
| Size | 1024 × 1024 |

**Prompt:** Grove crack-03 plus leaf-particle and pollen wisps escaping cracks. Verdant energy streams.

---

## 9. Shell beginning to separate

| Field | Value |
|-------|-------|
| File | `egg-grove-shell-separate.png` |
| Size | 1024 × 1024 |

**Prompt:** Bark halves lifting apart. Bright emerald life-light between gaps — no creature.

---

## 10. Bright hatch burst

| Field | Value |
|-------|-------|
| File | `egg-grove-hatch-burst.png` |
| Size | 1024 × 1024 |

**Positive prompt:**

```
Riftwilds Grove egg hatch burst frame. Bark-textured shell shatters outward in a radiant emerald-green nature flash. Shell fragments fly with trailing leaf particles and glowing rune shards. Upper-left key light with forest-green rim on bark shards.

Original 2D fantasy, subtle pixel influence, clean dark outlines, cel shading, transparent background, centered, 10% padding. NO creature visible — only shell, leaves, and nature energy. NOT a Poké Ball or capsule. 1024×1024 baseline aligned to prior Grove frames.
```

---

## 11. Open shell

| Field | Value |
|-------|-------|
| File | `egg-grove-open-shell.png` |
| Size | 1024 × 1024 |

**Prompt:** Two bark halves open on baseline, moss-lined interior, fading green glow. Empty.

---

## 12. Empty shell fragments

| Field | Value |
|-------|-------|
| File | `egg-grove-fragments.png` |
| Size | 1024 × 1024 |

**Prompt:** Scattered bark shards, moss tufts, settling leaf motes. No creature.

---

## 13. Inventory icon

| Field | Value |
|-------|-------|
| File | `egg-grove-icon.png` |
| Size | 256 × 256 |

**Positive prompt:**

```
Riftwilds Grove egg inventory icon. Simplified bark-brown egg with small moss patch, one tiny leaf, and faint emerald rune mark. Bold silhouette, clean dark outline, cel shading, upper-left lighting. Transparent background, readable at 48px. No text, no creature inside, NOT a Poké Ball or capsule. Original 2D fantasy game icon with subtle pixel influence.
```

---

## 14. Hatchery-card image

| Field | Value |
|-------|-------|
| File | `egg-grove-card.png` |
| Size | 768 × 1024 |

**Prompt:** Portrait card — Grove egg upper third, bark/moss/leaves/runes. UI space below. Transparent, no text.

---

## 15. Silhouette-reveal background effect

| Field | Value |
|-------|-------|
| File | `egg-grove-silhouette-reveal.png` |
| Size | 1024 × 1024 |

**Prompt:** Radial emerald burst, leaf swirl, pollen motes — FX layer only, no creature silhouette.

---

## Assembled outputs

- `egg-grove-hatch-sheet.png` · `egg-grove-hatch-atlas.json` — see [hatching-animation-spec.md](./hatching-animation-spec.md)

## Follow-up editing

Trim canvas · verify transparency · center on baseline · export WebP preview · run alignment checklist · update [index.md](./index.md)
