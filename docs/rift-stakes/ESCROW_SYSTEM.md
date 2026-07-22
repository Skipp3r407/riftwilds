# Escrow System

State machine phases: `CONFIRM_STAKE` → `DEPOSIT_PENDING` → `DEPOSITED` → `LOCKED` → `MATCH_ACTIVE` → `VERIFYING` → `PAYOUT_COMPLETE` | `REFUNDED`.

Disconnect rules (stubbed in config):

- Pre-lock cancel → full refund, no fee
- Post-lock double disconnect → refund both, no fee
- Single AFK after lock → forfeit path (server settle to connected player)

Store: `.data/rift-stakes/state.json` (DEMO). Prisma proposal: `prisma/schema-proposals/rift-stakes.prisma`.
