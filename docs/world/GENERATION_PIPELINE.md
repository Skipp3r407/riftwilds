# Generation Pipeline

`generation-pipeline.ts` → `validation.ts` → `generation-service.ts`

1. **Roads** — skeleton intersections  
2. **Landmarks** — district identity  
3. **Districts** — purpose zones  
4. **Plots** — road-adjacent only (skipped on overflow)  
5. **Hubs** — NPC / event seed points (not fake players)  
6. **Validate** — nav, plots, safe logout, budget, no housing on overflow  
7. **Review** — `PENDING_REVIEW` until admin/system open  

Seeds are **server-only**. Occupied maps: additive updates only (`versioning.ts`).
