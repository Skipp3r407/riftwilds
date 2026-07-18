# Relationship System (stub)

## Storage

`localStorage` key `riftwilds-npc-relationships-v1` via `src/game/npc-ai/relationships.ts`.

## Entry shape

```ts
{
  score: number;       // -100 .. 100
  memories: string[];  // last 8 tags/lines
  events?: { kind, detail, at, regionId? }[]; // helped / attacked / promises…
  talkedCount: number;
  killerNoticed: boolean;
  socialNoticed?: boolean;
  lastInteractionAt: number;
}
```

## Deltas

| Event | Typical delta |
|---|---|
| Talk | +1 |
| Killer scared (first) | −8 |
| Killer praise (first) | +6 |
| Social fear / hide | −7…−10 |
| Social respect / wave | +4…+8 |
| Guard challenge | −5 |
| Priest condemn | −6 |
| Helped / quest memory | +6…+12 |
| Attacked memory | −25 |

Bands: hostile / wary / neutral / friendly / trusted.

## Killer reputation (player)

On `LivePlayState`:

- `pvpKills`, `combatKills`, `killerReputation` (0–100), `bountyTier` (0–3)  
- Flags: `murderer`, `hostile_rep`, `bounty`, `hero_deed`, `monster_slayer`  
- Training `enemiesDefeated` alone does **not** make you a known killer  

Helpers: `recordPvpKill`, `recordHostileCombatKill`, `setBountyTier`, `syncKillerReputation`.

## Multi-axis reputation

See **[REPUTATION_SYSTEM.md](./REPUTATION_SYSTEM.md)** for hero/criminal/merchant axes, witnesses, gossip lag, forgiveness (Credits only, never SOL), and personality-gated reactions.
