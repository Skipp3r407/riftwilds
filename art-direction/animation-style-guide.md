# Animation Style Guide

## Principles

- Readability over flourish  
- Looping idles must settle on a calm frame  
- Attacks telegraph → impact → recovery  
- Effects are separate layers when possible  
- Reduced-motion: prefer static pose + short particle burst  

## Frame plans

| Anim | Frames | Notes |
|------|--------|-------|
| Idle | 6–12 | Breath, blink, tail, float, flicker · loop |
| Walk | 6–8 / dir | 4 directions |
| Run | 6–8 / dir | Optional MVP+ |
| Basic attack | 8–12 | No loop |
| Affinity attack | 12–18 | No loop |
| Hit | 4–6 | No loop |
| Crit hit | 6–10 | No loop |
| Victory | 8–14 | No loop |
| Defeat | 8–12 | No loop |
| Happy | 8–12 | Loop ×2 in care UI |
| Eating | 8–12 | Care |
| Sleeping | 6–10 | Slow loop |
| Evolution | Layered FX + creature morph stages | Not one sheet |

## Battle timing defaults

| Key | Frames | ms/frame | Loop |
|-----|--------|----------|------|
| idle | 8 | 110 | yes |
| attack-basic | 10 | 70 | no |
| attack-affinity | 14 | 65 | no |
| hit | 5 | 85 | no |
| victory | 10 | 100 | no |
| defeat | 10 | 100 | no |
| happy | 10 | 100 | ×2 |
| sleep | 8 | 160 | yes |

## Sprite sheet metadata (required)

Canvas dims · frame W/H · rows · cols · frame order · names · duration · loop · anchor · hitbox · display scale · export format · Phaser config  

Format: PNG transparent + atlas JSON  

## Hatch stages (skippable after server result)

1 Still + glow · 2 Shake + hairline cracks · 3 Crack spread + affinity leak · 4 Shell lift + burst · 5 Flash + silhouette · 6 Creature reveal · 7 Rarity frame + particles  
