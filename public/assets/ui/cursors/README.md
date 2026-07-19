# Riftwilds cursors

Thematic cursors for fine-pointer devices (mouse / trackpad).

| File | Use | Hotspot |
|------|-----|---------|
| `rift-default.png` / `.svg` | Default classic arrow (amber + cyan tip) | `1 1` |
| `rift-pointer.png` / `.svg` | Links, buttons, cards (cyan select arrow) | `1 1` |
| `rift-active.png` / `.svg` | `:active` press (nudged arrow) | `2 2` |
| `rift-text.png` / `.svg` | Text inputs | `12 16` |

Artwork uses a classic arrow silhouette first, with dark outline + amber/cyan accents so tips stay readable on both dark HUD and light panels.

**How it works**

- `RiftCursor` (`src/components/shared/rift-cursor.tsx`) toggles `html.rift-cursors-enabled` when `(pointer: fine)`.
- CSS in `globals.css` applies `cursor: url(...)` with PNG first, SVG fallback.
- Soft lag trail + click spark particles run only when fine pointer **and** motion is allowed.
- Touch / coarse pointers and `prefers-reduced-motion` keep the OS cursor (no trail/sparks).

**See it:** hard-refresh localhost on a mouse/trackpad — classic amber arrow by default; hover nav/buttons/cards for the cyan select arrow; click for a brief spark.
