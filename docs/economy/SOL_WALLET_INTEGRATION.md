# SOL Wallet Integration

## Identity (existing)

- SIWS nonce: `POST /api/auth/nonce`
- Verify: `POST /api/auth/verify`
- Helpers: `src/lib/auth/siws.ts`
- Wallet optional for play (`AUTH_WALLET_OPTIONAL_PLAY=true`)

## Economy challenges (scaffold)

- `POST /api/economy/sol/wallet-challenge` — issue / verify signed nonce for SOL intents
- Module: `src/lib/economy/sol/wallet-challenge.ts`
- Reuses SIWS message + ed25519 verify
- Never trust client-provided address alone

## Flags

- `SOL_WALLET_ENABLED` — SOL spend UX (default false)
- `AUTH_WALLET_SIWS_ENABLED` — identity (may be true)

## Network

- `projectConfig.SOLANA_NETWORK` defaults to **devnet**
- `getSolEconomyNetwork()` refuses mainnet for economy scaffolding

## Security

- Nonce TTL: `authDefaults.NONCE_TTL_SECONDS` (300s)
- Single-use challenges
- Replay / wrong-wallet / expiry rejected
