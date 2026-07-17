# Event Egg — Art Prompts

**Project:** Riftwilds · **Category:** Egg · **Class:** Event  
**Visual direction:** Configurable theme; never bake date/title into art

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

## Configurable theme placeholders

Replace bracketed tokens per event. **Never** bake dates, event names, or promotional text into shell art — those belong in UI overlays only.

| Token | Example values |
|-------|----------------|
| `[EVENT_THEME]` | harvest festival, eclipse rift, spring bloom, winter solstice |
| `[PRIMARY_COLOR]` | amber orange, silver blue, blossom pink |
| `[ACCENT_COLOR]` | gold, cyan, emerald |
| `[MOTIF]` | falling leaves, crescent arcs, snow crystals, lantern glow |
| `[PARTICLE]` | embers, petals, snowflakes, sparkles |

## Critical rules

- NO creature visible inside unhatched egg
- NOT Poké Balls, capsules, or branded toy eggs
- NO dates, event titles, or promotional text on shell
- Hatch frames share identical shell footprint and baseline
- Event theming is cosmetic — shell shape and baseline match all other egg classes

---

## 1. Full clean egg

| Field | Value |
|-------|-------|
| File | `egg-event-full.png` |
| Size | 1536 × 1536 |
| Purpose | Master reference / hero render |

**Positive prompt:**

```
Create a completely original fantasy egg for the game Riftwilds, Event class. Organic oval egg with a [EVENT_THEME] seasonal theme — not a sphere, not a capsule, not a capture ball.

Shell surface: [PRIMARY_COLOR] base with [ACCENT_COLOR] decorative [MOTIF] patterns integrated into the shell texture — stylized ornamental motifs, not text, not logos, not dates. Subtle [PARTICLE] elements float near the shell. Soft themed inner glow with no creature visible inside.

Style: polished original 2D fantasy illustration with subtle pixel-art influence, clean dark outlines, layered cel shading, premium mobile-game rendering. Upper-left key light with [ACCENT_COLOR] rim accent. Transparent background, centered, 10% padding.

CRITICAL: Do NOT include any event name, date, year, holiday text, or promotional wording baked into the shell art. Completely original — must NOT resemble a Poké Ball, capsule, branded toy egg, or copyrighted game item.
```

---

## 2. Idle glowing egg

| Field | Value |
|-------|-------|
| File | `egg-event-idle.png` |
| Size | 1024 × 1024 |

**Prompt:** Event master look with `[EVENT_THEME]` palette. Themed glow pulse, `[PARTICLE]` drift slowly. Baseline locked. No creature, no text.

---

## 3. Left wobble

| Field | Value |
|-------|-------|
| File | `egg-event-wobble-left.png` |
| Size | 1024 × 1024 |

**Prompt:** Event egg ~5° left tilt. Theme motifs and particles follow shell. Baseline fixed.

---

## 4. Right wobble

| Field | Value |
|-------|-------|
| File | `egg-event-wobble-right.png` |
| Size | 1024 × 1024 |

**Prompt:** Event egg ~5° right tilt. No cracks. No text on shell.

---

## 5. First crack

| Field | Value |
|-------|-------|
| File | `egg-event-crack-01.png` |
| Size | 1024 × 1024 |

**Prompt:** Themed egg, thin crack upper-left with `[ACCENT_COLOR]` light seeping. Event motifs intact.

---

## 6. Second crack

| Field | Value |
|-------|-------|
| File | `egg-event-crack-02.png` |
| Size | 1024 × 1024 |

**Prompt:** Event crack-01 plus branching fissures. Brighter themed glow.

---

## 7. Heavy cracks

| Field | Value |
|-------|-------|
| File | `egg-event-crack-03.png` |
| Size | 1024 × 1024 |

**Prompt:** Dense crack network, shell stressed, strong `[ACCENT_COLOR]` glow — no creature inside.

---

## 8. Energy leaking through cracks

| Field | Value |
|-------|-------|
| File | `egg-event-energy-leak.png` |
| Size | 1024 × 1024 |

**Prompt:** Event crack-03 plus themed energy wisps and `[PARTICLE]` streams escaping fissures.

---

## 9. Shell beginning to separate

| Field | Value |
|-------|-------|
| File | `egg-event-shell-separate.png` |
| Size | 1024 × 1024 |

**Prompt:** Themed halves parting at top. Bright `[ACCENT_COLOR]` light between gaps — no creature.

---

## 10. Bright hatch burst

| Field | Value |
|-------|-------|
| File | `egg-event-hatch-burst.png` |
| Size | 1024 × 1024 |

**Positive prompt:**

```
Riftwilds Event egg hatch burst frame. [EVENT_THEME] themed shell explodes outward in a bright [ACCENT_COLOR] celebratory flash. Shell fragments fly with trailing [PARTICLE] and themed energy streaks. Upper-left key light with [PRIMARY_COLOR] rim on shards.

Original 2D fantasy, subtle pixel influence, clean dark outlines, cel shading, transparent background, centered, 10% padding. NO creature visible — only shell fragments and themed energy. NO event name, date, or text on shell. NOT a Poké Ball or capsule. 1024×1024 baseline aligned to prior Event frames for the same theme variant.
```

---

## 11. Open shell

| Field | Value |
|-------|-------|
| File | `egg-event-open-shell.png` |
| Size | 1024 × 1024 |

**Prompt:** Two themed halves open on baseline, inner glow fading. Empty. No text.

---

## 12. Empty shell fragments

| Field | Value |
|-------|-------|
| File | `egg-event-fragments.png` |
| Size | 1024 × 1024 |

**Prompt:** Scattered themed shell shards, residual `[PARTICLE]`. No creature.

---

## 13. Inventory icon

| Field | Value |
|-------|-------|
| File | `egg-event-icon.png` |
| Size | 256 × 256 |

**Positive prompt:**

```
Riftwilds Event egg inventory icon. Simplified [PRIMARY_COLOR] egg with subtle [MOTIF] mark and tiny [PARTICLE]. Bold silhouette, clean dark outline, cel shading, upper-left lighting. Transparent background, readable at 48px. No text, no date, no event title, no creature inside, NOT a Poké Ball or capsule. Original 2D fantasy game icon with subtle pixel influence.
```

---

## 14. Hatchery-card image

| Field | Value |
|-------|-------|
| File | `egg-event-card.png` |
| Size | 768 × 1024 |

**Prompt:** Portrait card — Event egg upper third with `[EVENT_THEME]` styling. UI space below for event name overlay (added by code, not art). Transparent, no baked text.

---

## 15. Silhouette-reveal background effect

| Field | Value |
|-------|-------|
| File | `egg-event-silhouette-reveal.png` |
| Size | 1024 × 1024 |

**Prompt:** Radial `[ACCENT_COLOR]` burst with `[MOTIF]` ring and `[PARTICLE]` — FX only, no creature silhouette, no text.

---

## Theme variant naming

When exporting multiple event themes, append variant slug to filenames:

```
egg-event-{variant}-full.png
egg-event-{variant}-hatch-sheet.png
```

Register each variant in [index.md](./index.md) with its own status row.

## Assembled outputs

- `egg-event-hatch-sheet.png` (or `egg-event-{variant}-hatch-sheet.png`)
- `egg-event-hatch-atlas.json`

See [hatching-animation-spec.md](./hatching-animation-spec.md).

## Follow-up editing

Trim canvas · verify transparency · center on baseline · confirm NO text/dates in art · export WebP preview · run alignment checklist · update [index.md](./index.md)
