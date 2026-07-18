# World Expansion QA

Tests: `tests/unit/world-expansion.test.ts`

## Coverage

- Capacity soft/hard + spike → overflow vs permanent forecast  
- Template catalog + Living Towns road-adjacent plots  
- Generation uniqueness + validation reject path  
- Assignment priority (friends / new player)  
- Security: client seed forbidden  
- Relocation idempotency + overflow dest reject  
- Founder rewards economy-safe  
- Failure cleanup does not delete occupied maps  

## Manual

1. `/world` — directory Quiet→Full labels  
2. `/admin/world-expansion` — snapshot lists starter Commons  
3. POST assign / relocate with guest cookie  
4. Confirm Prisma flag remains off  

## Backlog

Full multiplayer stress, GPU previews, regional orchestration.
