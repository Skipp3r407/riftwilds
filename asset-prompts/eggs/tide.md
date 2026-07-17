# Tide Egg — Art Prompts

**Project:** Riftwilds · **Category:** Egg · **Class:** Tide  
**Visual direction:** Pearl-blue, water markings, droplets

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
| File | `egg-tide-full.png` |
| Size | 1536 × 1536 |
| Purpose | Master reference / hero render |

**Positive prompt:**

```
Create a completely original fantasy egg for the game Riftwilds, Tide class. Organic smooth oval egg — not a sphere, not a capsule, not a capture ball.

Shell surface: lustrous pearl-blue and seafoam white with iridescent sheen like abalone and nacre. Flowing water-mark patterns ripple across the shell in gentle S-curves — stylized wave motifs, not text. Tiny suspended water droplets cling to the surface and float nearby. Soft cyan inner glow suggests tidal energy with no creature visible inside.

Style: polished original 2D fantasy illustration with subtle pixel-art influence, clean dark outlines, layered cel shading, premium mobile-game rendering. Upper-left cool key light with aqua rim highlight. Transparent background, centered, 10% padding, no text, no logo.

Completely original — must NOT resemble a Poké Ball, capsule, branded toy egg, or copyrighted game item.
```

---

## 2. Idle glowing egg

| Field | Value |
|-------|-------|
| File | `egg-tide-idle.png` |
| Size | 1024 × 1024 |

**Prompt:** Tide master — pearl-blue shell, gentle wave markings pulse, droplets shimmer. Baseline locked. No creature inside.

---

## 3. Left wobble

| Field | Value |
|-------|-------|
| File | `egg-tide-wobble-left.png` |
| Size | 1024 × 1024 |

**Prompt:** Tide egg ~5° left tilt. Droplets and wave marks follow shell. Baseline pivot fixed.

---

## 4. Right wobble

| Field | Value |
|-------|-------|
| File | `egg-tide-wobble-right.png` |
| Size | 1024 × 1024 |

**Prompt:** Tide egg ~5° right tilt. No cracks yet.

---

## 5. First crack

| Field | Value |
|-------|-------|
| File | `egg-tide-crack-01.png` |
| Size | 1024 × 1024 |

**Prompt:** Pearl-blue egg, single thin crack upper-left with cyan light seeping. Small droplet at crack tip.

---

## 6. Second crack

| Field | Value |
|-------|-------|
| File | `egg-tide-crack-02.png` |
| Size | 1024 × 1024 |

**Prompt:** Tide egg with crack-01 plus branching fissures following wave-mark curves. Brighter aqua glow.

---

## 7. Heavy cracks

| Field | Value |
|-------|-------|
| File | `egg-tide-crack-03.png` |
| Size | 1024 × 1024 |

**Prompt:** Dense crack network, shell stressed, strong cyan-white glow through gaps. No creature silhouette.

---

## 8. Energy leaking through cracks

| Field | Value |
|-------|-------|
| File | `egg-tide-energy-leak.png` |
| Size | 1024 × 1024 |

**Prompt:** Tide crack-03 plus water-stream wisps and mist escaping fissures. Droplets scatter outward.

---

## 9. Shell beginning to separate

| Field | Value |
|-------|-------|
| File | `egg-tide-shell-separate.png` |
| Size | 1024 × 1024 |

**Prompt:** Pearl halves parting at top seam. Bright tidal light between gaps — water energy only, no creature.

---

## 10. Bright hatch burst

| Field | Value |
|-------|-------|
| File | `egg-tide-hatch-burst.png` |
| Size | 1024 × 1024 |

**Positive prompt:**

```
Riftwilds Tide egg hatch burst frame. Pearl-blue shell explodes outward in a radiant cyan-white aquatic flash. Shell fragments spray with trailing water droplets and mist arcs. Bright cool light from upper-left key with aqua rim on shards.

Original 2D fantasy, subtle pixel influence, clean dark outlines, cel shading, transparent background, centered, 10% padding. NO creature visible — only shell fragments, water burst, and droplets. NOT a Poké Ball or capsule. 1024×1024 baseline aligned to prior Tide hatch frames.
```

---

## 11. Open shell

| Field | Value |
|-------|-------|
| File | `egg-tide-open-shell.png` |
| Size | 1024 × 1024 |

**Prompt:** Two pearl-blue halves open on baseline, wet inner surface, fading glow. Empty.

---

## 12. Empty shell fragments

| Field | Value |
|-------|-------|
| File | `egg-tide-fragments.png` |
| Size | 1024 × 1024 |

**Prompt:** Scattered nacreous shards, residual droplets, dissipating mist. No creature.

---

## 13. Inventory icon

| Field | Value |
|-------|-------|
| File | `egg-tide-icon.png` |
| Size | 256 × 256 |

**Positive prompt:**

```
Riftwilds Tide egg inventory icon. Simplified pearl-blue egg with subtle wave markings and one or two tiny droplets. Bold silhouette, clean dark outline, cel shading, upper-left lighting. Transparent background, readable at 48px. No text, no creature inside, NOT a Poké Ball or capsule. Original 2D fantasy game icon with subtle pixel influence.
```

---

## 14. Hatchery-card image

| Field | Value |
|-------|-------|
| File | `egg-tide-card.png` |
| Size | 768 × 1024 |

**Prompt:** Portrait card — Tide egg upper third, pearl-blue with wave marks and droplets. UI space below. Transparent, no text.

---

## 15. Silhouette-reveal background effect

| Field | Value |
|-------|-------|
| File | `egg-tide-silhouette-reveal.png` |
| Size | 1024 × 1024 |

**Prompt:** Radial aqua-cyan burst, water ripple rings, floating droplets — FX only, no creature silhouette.

---

## Assembled outputs

- `egg-tide-hatch-sheet.png` · `egg-tide-hatch-atlas.json` — see [hatching-animation-spec.md](./hatching-animation-spec.md)

## Follow-up editing

Trim canvas · verify transparency · center on baseline · export WebP preview · run alignment checklist · update [index.md](./index.md)
