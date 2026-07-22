# Touch Controls (Battle)

Coarse-pointer battle interactions on Practice Board / active match desk.

## Card gestures

| Gesture | Action |
|---------|--------|
| Tap | Select hand card for Play |
| Double-tap | Play selected / tapped card (if legal) |
| Long-press (~420ms) | Fullscreen card preview (detail modal) |
| Drag | Summon to Your Field (HTML5 DnD) |
| Swipe down (board) | Collapse hand + cancel selection |

Unaffordable cards still select so energy deny feedback is visible — Play stays blocked by rules.

## Board / chrome gestures

| Gesture | Action |
|---------|--------|
| Swipe left | Open Event Feed drawer (closes intel) |
| Swipe right | Open Match Intel drawer (closes feed) |
| Swipe up | Expand hand |
| Swipe down | Collapse hand / clear selection |

Gestures ignore starts on buttons, links, inputs, and card faces (`use-battle-gestures.ts`).

## Action dock (mobile / tablet)

Play · End Turn · Commander (Focus) · Pass (= End Turn) · Undo (scaffold, disabled until engine history) · Settings · Menu

## Targets

Minimum **48×48** on dock buttons, panel toggles, and compact utils.

## Desktop unchanged

Hover fan zoom · click bio · drag / Play · keyboard shortcuts (Tab / F11 / Esc / Space).
