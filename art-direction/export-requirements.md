# Export Requirements

## Formats

| Use | Format |
|-----|--------|
| Phaser runtime | PNG (lossless, transparency) |
| Web previews | WebP (+ PNG fallback) |
| Source masters | PNG in `creatures/source/` (never overwrite) |
| Atlases | PNG + JSON (Phaser atlas / TexturePacker-compatible) |
| Placeholders | SVG (dev-only text allowed) |

## Color / alpha

- sRGB  
- Straight alpha (not premultiplied) unless documented  
- No baked checkerboard backgrounds  

## Naming

Lowercase kebab-case — see [asset-naming-guide.md](./asset-naming-guide.md)

## Processing pipeline

1. Artists drop masters in `public/assets/creatures/source/`  
2. Scripts validate → resize → thumbnails → pack → atlas → manifest  
3. Outputs: `processed/`, `sheets/`, `atlases/`  
4. Approved sources are immutable  

## Quality gates

Full body · limb count · transparency · dims · no text/watermark · affinity · silhouette · family consistency · naming  

Status workflow: Planned → Prompt written → Generated → Needs revision → Approved → Animated → Integrated → Production ready → Retired  
