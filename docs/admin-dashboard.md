# Admin Treasury Dashboard

## Route

`/admin/treasury` — admin role required (`src/app/admin/layout.tsx`).

## Capabilities

- Project Treasury + destination balances (SOL/RIFT demo fields)
- Revenue by source + daily/weekly/monthly/annual stats
- Pending / failed queues + approval workflow
- Distribution history + notifications
- Configure % splits (must total 10000 bps)
- Min amount, delay, auto-approval threshold
- Pause / resume / emergency stop / retry failed
- Simulate Pump.fun deposit (monitor tick)
- Export report
- Live refresh (~12s)

## Component

`src/components/treasury-ops/admin-dashboard.tsx`

## Config panel APIs

Uses `/api/treasury-ops/config`, `update-rules`, `pause`, `resume`, `distribute`, `monitor/tick`, `approvals`, `retry`, `reports`.
