# Foundational Set Balance Notes (ROTR)

Generated with the content pipeline — **validate in playtests**. Sources: full pet lore roster, item catalogs, region packs, game-library props.

## Macro
- Cards (incl. tokens/heroes): **735**
- Average non-hero energy cost: **2.66**
- Cost histogram: {"1":184,"2":157,"3":177,"4":104,"5":37,"6":23,"7":11}
- Rarity mix: {"uncommon":195,"common":234,"legendary":173,"rare":76,"epic":38,"mythic":19}
- Cards with `art.assetPath`: **645**
- Riftling creature cards: **100**

## Rift Energy model
- Start **1**, gain **+1** each turn, cap **10**
- Empower cares about energy spent this turn — keep 5+ drops rare
- Ramp (Star Dust) is uncommon/rare gated

## Archetype health (hypothesis)
| Deck | Risk | Note |
|------|------|------|
| Fire Aggro | High early | Needs Guardian hate later |
| Earth Guardian | Slow | Locations must matter by turn 4 |
| Spirit Combo | Echo loops | Cap Echo once; no infinite without Ancient |
| Shadow Corrupt | Attrition | Residue cap 3 (4 only on Void board) |
| Celestial | Ramp | Ultimate cost 10 — gate carefully |

## Flagged combinations to watch
1. Echo + Arc Latch + cheap draws — watch hand flooding
2. Bloom + Elderwood Path double tick — may need half-stacks
3. Charge + Stormspire Landing + Volta passive — burst damage
4. Soulbind + Corrupt Residue sharing — delay Soulbind to rare

## Recommended next balance pass
- Play 50 AI mirrors per starter deck
- Track turn-of-death distribution
- Adjust only JSON `attack`/`health`/`energyCost` — keep keywords stable
