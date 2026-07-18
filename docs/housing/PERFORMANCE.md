# Housing Performance

## Strategy

- **Private interiors** isolate furniture cost per instance
- **Shared exteriors** use neighborhood interest management (see neighborhoods perf)
- Nearby furniture load: `loadNearbyFurnitureBucket` / `nearbyFurniture`
- LOD bands: near / mid / far / culled (`performance.ts`)

## Budgets (Phase 1 stubs)

| Budget | Value |
|--------|-------|
| Hot furniture / room | 80 |
| Interior particles | 24 |
| Nearby radius | 384px |
| Exterior interest | 512px |

## Future

Occlusion, streaming room chunks, instance hibernation when no visitors, multiplayer interest management when WS leases go live.
