# Player Map Assignment

`assignment.ts`

Priority: owned property → party → friends → guild → region → latency → population → housing.

- New players prefer **active** maps (not empty ghosts).
- Sticky assignment for owned property.
- Overflow only when `overflowEventKey` present.
- Public directory never exposes seeds or job infra.
