# Egg Hatching Animation Spec

**Project:** Riftwilds · **Engine:** Phaser 3 · **Category:** Egg hatch sequence

## Overview

Each egg class ships a **12-frame hatch sprite sheet** plus a **Phaser atlas JSON**. Individual PNG frames are the source of truth; the sheet is assembled for runtime playback.

| Property | Value |
|----------|-------|
| Frame size | 1024 × 1024 px |
| Sheet size | 4096 × 3072 px (4 cols × 3 rows) |
| Anchor | `(0.5, 0.72)` — shell sits on shared baseline |
| Origin | `(0.5, 0.72)` |
| Display scale | 1.0 in hatchery scene (adjust per layout) |
| Export | PNG-32 transparent + WebP preview |
| Atlas | `egg-{class}-hatch-atlas.json` |
| Sheet file | `egg-{class}-hatch-sheet.png` |

## Frame naming & order

Frames are numbered **0–11** left-to-right, top-to-bottom. Names match standalone exports.

| Index | Frame name | Standalone file | Duration (ms) | Loop |
|-------|------------|-----------------|---------------|------|
| 0 | `idle` | `egg-{class}-idle.png` | 140 | yes (pre-hatch) |
| 1 | `wobble-left` | `egg-{class}-wobble-left.png` | 90 | no |
| 2 | `wobble-right` | `egg-{class}-wobble-right.png` | 90 | no |
| 3 | `wobble-left-2` | `egg-{class}-wobble-left.png` | 90 | no |
| 4 | `crack-01` | `egg-{class}-crack-01.png` | 110 | no |
| 5 | `crack-02` | `egg-{class}-crack-02.png` | 110 | no |
| 6 | `crack-03` | `egg-{class}-crack-03.png` | 120 | no |
| 7 | `energy-leak` | `egg-{class}-energy-leak.png` | 130 | no |
| 8 | `shell-separate` | `egg-{class}-shell-separate.png` | 140 | no |
| 9 | `hatch-burst` | `egg-{class}-hatch-burst.png` | 100 | no |
| 10 | `open-shell` | `egg-{class}-open-shell.png` | 160 | no |
| 11 | `fragments` | `egg-{class}-fragments.png` | 200 | no |

**Pre-hatch idle loop:** frames `[0]` only, 140 ms, repeat `-1`.

**Wobble teaser loop (optional UI):** `[0, 1, 0, 2]`, 90 ms, repeat `-1`.

**Full hatch (one-shot):** `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]` after server confirms hatch — skip if user disables motion.

## Sprite sheet layout

```
Row 0:  idle          | wobble-left   | wobble-right  | wobble-left-2
Row 1:  crack-01      | crack-02      | crack-03      | energy-leak
Row 2:  shell-separate| hatch-burst   | open-shell    | fragments
```

```
┌─────────┬─────────┬─────────┬─────────┐
│ 0 idle  │ 1 w-L   │ 2 w-R   │ 3 w-L2  │  y=0
├─────────┼─────────┼─────────┼─────────┤
│ 4 c-01  │ 5 c-02  │ 6 c-03  │ 7 leak  │  y=1024
├─────────┼─────────┼─────────┼─────────┤
│ 8 sep   │ 9 burst │ 10 open │ 11 frag │  y=2048
└─────────┴─────────┴─────────┴─────────┘
  x=0      x=1024    x=2048    x=3072
```

## Phaser atlas JSON example

Replace `{class}` with the egg class slug (e.g. `ember`).

```json
{
  "frames": {
    "egg-ember-idle": {
      "frame": { "x": 0, "y": 0, "w": 1024, "h": 1024 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 1024, "h": 1024 },
      "sourceSize": { "w": 1024, "h": 1024 }
    },
    "egg-ember-wobble-left": {
      "frame": { "x": 1024, "y": 0, "w": 1024, "h": 1024 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 1024, "h": 1024 },
      "sourceSize": { "w": 1024, "h": 1024 }
    },
    "egg-ember-wobble-right": {
      "frame": { "x": 2048, "y": 0, "w": 1024, "h": 1024 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 1024, "h": 1024 },
      "sourceSize": { "w": 1024, "h": 1024 }
    },
    "egg-ember-wobble-left-2": {
      "frame": { "x": 3072, "y": 0, "w": 1024, "h": 1024 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 1024, "h": 1024 },
      "sourceSize": { "w": 1024, "h": 1024 }
    },
    "egg-ember-crack-01": {
      "frame": { "x": 0, "y": 1024, "w": 1024, "h": 1024 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 1024, "h": 1024 },
      "sourceSize": { "w": 1024, "h": 1024 }
    },
    "egg-ember-crack-02": {
      "frame": { "x": 1024, "y": 1024, "w": 1024, "h": 1024 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 1024, "h": 1024 },
      "sourceSize": { "w": 1024, "h": 1024 }
    },
    "egg-ember-crack-03": {
      "frame": { "x": 2048, "y": 1024, "w": 1024, "h": 1024 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 1024, "h": 1024 },
      "sourceSize": { "w": 1024, "h": 1024 }
    },
    "egg-ember-energy-leak": {
      "frame": { "x": 3072, "y": 1024, "w": 1024, "h": 1024 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 1024, "h": 1024 },
      "sourceSize": { "w": 1024, "h": 1024 }
    },
    "egg-ember-shell-separate": {
      "frame": { "x": 0, "y": 2048, "w": 1024, "h": 1024 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 1024, "h": 1024 },
      "sourceSize": { "w": 1024, "h": 1024 }
    },
    "egg-ember-hatch-burst": {
      "frame": { "x": 1024, "y": 2048, "w": 1024, "h": 1024 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 1024, "h": 1024 },
      "sourceSize": { "w": 1024, "h": 1024 }
    },
    "egg-ember-open-shell": {
      "frame": { "x": 2048, "y": 2048, "w": 1024, "h": 1024 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 1024, "h": 1024 },
      "sourceSize": { "w": 1024, "h": 1024 }
    },
    "egg-ember-fragments": {
      "frame": { "x": 3072, "y": 2048, "w": 1024, "h": 1024 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 1024, "h": 1024 },
      "sourceSize": { "w": 1024, "h": 1024 }
    }
  },
  "meta": {
    "app": "Riftwilds Asset Pipeline",
    "version": "1.0",
    "image": "egg-ember-hatch-sheet.png",
    "format": "RGBA8888",
    "size": { "w": 4096, "h": 3072 },
    "scale": "1"
  }
}
```

## Phaser animation config example

```javascript
// Boot: load texture + atlas
this.load.image("egg-ember-hatch-sheet", "assets/eggs/egg-ember-hatch-sheet.png");
this.load.atlas("egg-ember-hatch", "assets/eggs/egg-ember-hatch-sheet.png", "assets/eggs/egg-ember-hatch-atlas.json");

// Scene: create sprite
const egg = this.add.sprite(x, y, "egg-ember-hatch", "egg-ember-idle");
egg.setOrigin(0.5, 0.72);

// Register animations
this.anims.create({
  key: "egg-ember-idle",
  frames: [{ key: "egg-ember-hatch", frame: "egg-ember-idle" }],
  frameRate: 1000 / 140,
  repeat: -1,
});

this.anims.create({
  key: "egg-ember-wobble-tease",
  frames: [
    { key: "egg-ember-hatch", frame: "egg-ember-idle" },
    { key: "egg-ember-hatch", frame: "egg-ember-wobble-left" },
    { key: "egg-ember-hatch", frame: "egg-ember-idle" },
    { key: "egg-ember-hatch", frame: "egg-ember-wobble-right" },
  ],
  frameRate: 1000 / 90,
  repeat: -1,
});

this.anims.create({
  key: "egg-ember-hatch-full",
  frames: [
    { key: "egg-ember-hatch", frame: "egg-ember-wobble-left" },
    { key: "egg-ember-hatch", frame: "egg-ember-wobble-right" },
    { key: "egg-ember-hatch", frame: "egg-ember-wobble-left-2" },
    { key: "egg-ember-hatch", frame: "egg-ember-crack-01" },
    { key: "egg-ember-hatch", frame: "egg-ember-crack-02" },
    { key: "egg-ember-hatch", frame: "egg-ember-crack-03" },
    { key: "egg-ember-hatch", frame: "egg-ember-energy-leak" },
    { key: "egg-ember-hatch", frame: "egg-ember-shell-separate" },
    { key: "egg-ember-hatch", frame: "egg-ember-hatch-burst" },
    { key: "egg-ember-hatch", frame: "egg-ember-open-shell" },
    { key: "egg-ember-hatch", frame: "egg-ember-fragments" },
  ],
  frameRate: 8,
  repeat: 0,
});

// Play full hatch once, then hold fragments
egg.play("egg-ember-hatch-full");
egg.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
  egg.setFrame("egg-ember-fragments");
});
```

## Alignment checklist

Before approving any egg hatch set:

- [ ] All 12 hatch frames are **1024 × 1024** with transparent background
- [ ] Shell **footprint width** varies no more than ±2% across frames
- [ ] Shared **baseline** aligns at **y ≈ 738 px** (72% of canvas height)
- [ ] Shell **horizontal center** stays within ±8 px of canvas center (512)
- [ ] **Crack progression** is monotonic — each frame adds cracks, never removes them
- [ ] **No creature** visible inside shell before `hatch-burst`
- [ ] `hatch-burst` is brightest frame; light origin matches upper-left key
- [ ] `open-shell` and `fragments` preserve half-shell geometry from `shell-separate`
- [ ] Wobble frames rotate **≤6°** around baseline pivot without vertical drift >4 px
- [ ] Glow/VFX expand outward but do not shift shell center
- [ ] Icon (`256×256`) reads clearly at 48 px display size
- [ ] Master full egg (`1536×1536`) matches hatch shell design at higher detail
- [ ] Negative prompt applied — **no Poké Ball / capsule** forms
- [ ] Sheet assembles with zero gaps; atlas JSON frame rects verified
- [ ] WebP preview exported; source PNG retained

## Related files

- [negative-prompt.md](./negative-prompt.md)
- [index.md](./index.md)
- [../../art-direction/asset-naming-guide.md](../../art-direction/asset-naming-guide.md)
- [../../art-direction/animation-style-guide.md](../../art-direction/animation-style-guide.md)
