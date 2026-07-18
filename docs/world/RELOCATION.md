# Relocation

`relocation.ts` · API `POST /api/world-expansion/relocate`

1. Request + idempotency key  
2. Snapshot hash of furniture IDs  
3. Lock furniture (anti-dupe)  
4. Move assignment / plot pointers  
5. Unlock · complete — or rollback  

Guild hall moves: `guild_pending_approval` stub.  
**Rejected:** permanent housing → overflow destination.
