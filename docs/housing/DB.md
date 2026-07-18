# Housing + Neighborhoods DB

**Migration:** `prisma/migrations/20260718120000_player_housing_neighborhoods/`  
**Pattern:** Same as World Persistence — SQL prepared, Prisma models in schema, runtime flag off.

## Tables (housing)

`PlayerHome`, `HomeInstance`, `HomeRoom`, `HomeFurniture`, `HomeStorageSlot`, `HomeVisitor`, `HomePermission`, `HomeBlueprint`, `HomeRating`, `HomeEvent`, `HomeGardenPlot`, `HomeNpc`

## Tables (neighborhoods)

`PlayerNeighborhood`, `NeighborhoodDistrict`, `PlayerPlot`, `CommunityProject`, `PlayerContribution`, `PublicBuilding`, `PlayerStore`, `PlayerGovernment`, `NeighborhoodEvent`, `NeighborhoodLandmark`

## Apply checklist (future)

1. Review SQL on staging
2. `prisma migrate deploy` (approval required)
3. Flip `PLAYER_HOUSING_PRISMA_ENABLED` / `PLAYER_NEIGHBORHOODS_PRISMA_ENABLED`
4. Wire adapters (not shipped in Phase 1 hot path)

Legacy `Homestead*` models remain for economy bridge compatibility.
