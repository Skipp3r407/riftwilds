# Ember Egg — Art Prompts

**Project:** Riftwilds · **Category:** Egg · **Class:** Ember  
**Visual direction:** Charcoal, orange cracks, ember particles

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
| File | `egg-ember-full.png` |
| Size | 1536 × 1536 |
| Purpose | Master reference / hero render |

**Positive prompt:**

```
Create a completely original fantasy egg for the game Riftwilds, Ember class. The egg is a sturdy organic oval — not a sphere, not a capsule, not a ball with a seam.

Shell surface: deep charcoal gray and soot black with matte scorched texture. Fine hairline fissures glow ember-orange from within like cooling lava veins — subtle at rest, no creature visible inside. Tiny floating ember particles drift near the shell surface. Warm orange rim light on the right edge from internal heat.

Style: polished original 2D fantasy illustration with subtle pixel-art influence, clean dark outlines, layered cel shading, premium mobile-game rendering. Upper-left key light with warm orange bounce from cracks. Transparent background, centered, 10% padding, no text, no logo, no environment.

Completely original design — must NOT resemble a Poké Ball, capture capsule, branded toy egg, or any copyrighted game item.
```

---

## 2. Idle glowing egg

| Field | Value |
|-------|-------|
| File | `egg-ember-idle.png` |
| Size | 1024 × 1024 |

**Prompt:** Ember master look — charcoal shell, pulsing orange crack glow, slow ember particle drift. Baseline locked. No creature inside.

---

## 3. Left wobble

| Field | Value |
|-------|-------|
| File | `egg-ember-wobble-left.png` |
| Size | 1024 × 1024 |

**Prompt:** Ember egg tilted ~5° left. Crack glow and ember particles follow shell. Baseline pivot unchanged.

---

## 4. Right wobble

| Field | Value |
|-------|-------|
| File | `egg-ember-wobble-right.png` |
| Size | 1024 × 1024 |

**Prompt:** Ember egg tilted ~5° right. No new cracks. Same footprint.

---

## 5. First crack

| Field | Value |
|-------|-------|
| File | `egg-ember-crack-01.png` |
| Size | 1024 × 1024 |

**Prompt:** Charcoal egg with one bright orange hairline crack upper-left. Ember spark at crack tip. No creature.

---

## 6. Second crack

| Field | Value |
|-------|-------|
| File | `egg-ember-crack-02.png` |
| Size | 1024 × 1024 |

**Prompt:** Ember egg with crack-01 plus branching orange fissures. Brighter internal glow.

---

## 7. Heavy cracks

| Field | Value |
|-------|-------|
| File | `egg-ember-crack-03.png` |
| Size | 1024 × 1024 |

**Prompt:** Dense glowing orange crack web across upper shell. Small ember chips flaking. Intense heat glow — still empty inside.

---

## 8. Energy leaking through cracks

| Field | Value |
|-------|-------|
| File | `egg-ember-energy-leak.png` |
| Size | 1024 × 1024 |

**Prompt:** Ember egg crack-03 plus flame wisps and ember streams escaping fissures. Shell held together but stressed.

---

## 9. Shell beginning to separate

| Field | Value |
|-------|-------|
| File | `egg-ember-shell-separate.png` |
| Size | 1024 × 1024 |

**Prompt:** Charcoal halves lifting apart at top. Molten orange light between gaps. No creature — only heat and ash.

---

## 10. Bright hatch burst

| Field | Value |
|-------|-------|
| File | `egg-ember-hatch-burst.png` |
| Size | 1024 × 1024 |

**Positive prompt:**

```
Riftwilds Ember egg hatch burst frame. Deep charcoal shell shatters outward in a blazing orange-white flash. Shell fragments fly radially with trailing ember particles and heat distortion wisps. Intense fire-energy burst lit from upper left; orange rim glow on fragment edges.

Original 2D fantasy, subtle pixel influence, clean dark outlines, cel shading, transparent background, centered, 10% padding. NO creature visible — only shell shards, fire burst, and embers. NOT a Poké Ball or capsule. Align to 1024×1024 hatch baseline matching prior Ember frames.
```

---

## 11. Open shell

| Field | Value |
|-------|-------|
| File | `egg-ember-open-shell.png` |
| Size | 1024 × 1024 |

**Prompt:** Two charcoal halves open on baseline, inner surface glowing dull orange, cooling embers. Empty.

---

## 12. Empty shell fragments

| Field | Value |
|-------|-------|
| File | `egg-ember-fragments.png` |
| Size | 1024 × 1024 |

**Prompt:** Scattered scorched shell shards, fading ember sparks, thin smoke wisps. No creature.

---

## 13. Inventory icon

| Field | Value |
|-------|-------|
| File | `egg-ember-icon.png` |
| Size | 256 × 256 |

**Positive prompt:**

```
Riftwilds Ember egg inventory icon. Simplified charcoal oval egg with glowing orange crack lines and one or two tiny ember sparks. Bold silhouette, clean dark outline, cel shading, upper-left lighting. Transparent background, centered, readable at 48px. No text, no creature inside, NOT a Poké Ball or capsule. Original 2D fantasy game icon with subtle pixel influence.
```

---

## 14. Hatchery-card image

| Field | Value |
|-------|-------|
| File | `egg-ember-card.png` |
| Size | 768 × 1024 |

**Prompt:** Portrait card — Ember egg upper third, charcoal with orange crack glow and ember motes. Space below for UI. Transparent BG, no text.

---

## 15. Silhouette-reveal background effect

| Field | Value |
|-------|-------|
| File | `egg-ember-silhouette-reveal.png` |
| Size | 1024 × 1024 |

**Prompt:** Radial fire-orange burst, heat shimmer, floating embers — FX layer only, no creature silhouette. Transparent outside effect.

---

## Assembled outputs

- `egg-ember-hatch-sheet.png` · `egg-ember-hatch-atlas.json` — see [hatching-animation-spec.md](./hatching-animation-spec.md)

## Follow-up editing

Trim canvas · verify transparency · center on baseline · export WebP preview · run alignment checklist · update [index.md](./index.md)
