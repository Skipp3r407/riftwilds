# Performance Report

**Measured:** 2026-07-17 against local `next start` on `http://localhost:3002`  
**Method:** PowerShell `Invoke-WebRequest` timings (TTFB approx, cold-ish sequential)  
**Raw:** `artifacts/testing/route-timings-prod.json`

## Results (ms)

| Path | Status | ms | Body bytes |
|------|--------|-----|------------|
| /about | 200 | 202 | 147019 |
| /hatchery | 200 | 57 | 43498 |
| /live-world | 200 | 46 | 37070 |
| /marketplace | 200 | 75 | 76596 |
| /shop | 200 | **447** | **562187** |
| /rewards | 200 | 44 | 33699 |
| /treasury | 200 | 37 | 29813 |
| /play | 200 | 64 | 61551 |
| /dashboard | 200 | 49 | 34119 |
| /world | 200 | 77 | 64241 |
| /arena | 200 | 61 | 50938 |
| /quests | 200 | 66 | 36124 |
| /ecosystem | 200 | 119 | 116022 |
| /api/health | 200 | 18 | 111 |
| /api/rewards/center | 200 | 18 | 3388 |
| /api/treasury | 200 | 27 | 2892 |
| /api/ready | 503 | ~4100 | DB down |

## Observations

- Most game shells &lt;120ms locally — healthy for closed alpha demo.
- **Shop** is the outlier (~450ms, ~550KB HTML) — catalog size; candidate for pagination/code-split later (P2, not P0).
- `/api/ready` latency when DB down is dominated by connection timeout — expected.
- Turbopack/dev earlier showed /shop ~5s — prefer prod build for demos.
- Large PNGs (boss/world ~1.5–2.5MB) should be optimized before public CDN (`npm run assets:optimize`).

## Not measured

- Lighthouse mobile field metrics on a public CDN
- Phaser Live World FPS under load
- Multi-region edge latency
