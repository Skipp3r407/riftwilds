# Grok Asset Generation Queue

Blocked / next when Commons showcase is already green.

## Done this pass (2026-07-18)

- Commons named 10 dedicated full-body world kits + overworld sheets
- Hatchery + Guild masked isometric cutouts
- Sheet builder refuses portrait busts; audit script + unit test gate

## Ready next (non-blocking for Commons play)

1. Hand-authored 4-direction walk sheets for Commons named 10
2. Cutout remasters for remaining Commons facades (academy, library, forge, market, recovery)
3. Premium terrain inheritance: Ember Crater, Moonwater Coast, Elderwood
4. Dedicated enemy overworld sprites for Commons wilds zones
5. Interior room kits (Hatchery / Market / Recovery) when enterables ship
6. Non-Commons named NPC full-body world kits when those hubs go premium

## Blocked / waiting

| Item | Blocker |
|------|---------|
| True multi-frame animator export | No in-engine atlas authoring pipeline yet |
| Parallel agent terrain masters | Coordinate before regenerating `commons-tileset` / grass masters |
| Region ambient unique portraits (non-Commons) | Prioritize only when those hubs are showcase targets |

## Do not regenerate casually

- `public/assets/tilesets/commons-tileset.png`
- `public/assets/terrain/terrain-*.png`
- Existing named-cast portrait masters unless QA flags damage
