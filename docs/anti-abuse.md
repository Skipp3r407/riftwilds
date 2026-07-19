# Anti-Abuse & Reputation (honest status)

## Enforced in current local foundations

- Seller must match asset owner (`verifyListingOwnership`)
- Duplicate purchase `requestId` rejected (in-memory)
- Self-trade buyer === seller blocked
- Soft rate-limit stub (~30 listing/purchase actions per minute per actor)
- Listability gate blocks competitive power / account-bound / property-not-enabled
- Demo marketplace transaction log types for audit scaffolding

## Scaffolded (not production-ready)

- Full wash-trading wallet-graph analysis
- Multi-account / device fingerprint clustering
- Tournament collusion & ring detection
- Production escrow holds + dispute SLA
- Referral fraud scoring before any SOL referral rewards
- Authoritative reputation ledger (UI uses demo seed scores)

## Reputation

`getDemoReputation()` returns a non-authoritative score for shop pages and Exchange. Do not market as trust & safety complete.

Code: `src/lib/exchange/anti-abuse.ts`, `src/lib/marketplace/integrity.ts`, `src/lib/marketplace/security.ts`.

## Admin

`/admin/marketplace` surfaces eligibility, listing types, enforced vs scaffold lists, and the demo tx log.
