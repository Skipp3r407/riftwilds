# Capacity & Thresholds

Config: `src/lib/world-expansion/config.ts` · Measure: `capacity.ts` · Tick: `orchestrator.ts`

| Knob | Default | Effect |
|------|---------|--------|
| Soft player ratio | 0.72 | Plan permanent expansion if sustained |
| Hard player ratio | 0.92 | Urgent pressure |
| Plot soft / hard | 0.75 / 0.90 | Housing neighborhood expansion |
| Rolling window | 30m | Festival spike detection |
| Spike factor | 1.85× rolling avg | Spike → overflow, not city |
| Permanent forecast | rolling ≥ 0.68 | Sustained only |
| Overflow absolute | 0.88 | Spawn temporary instance |

Crowd labels (public): Quiet → Settling → Lively → Busy → Full.
