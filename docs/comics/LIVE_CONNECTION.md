# Legends of the Rift — Live World connection

Website-first comics that deep-link into playable surfaces when available.

## Issue #3 → Traveling Circus

| Comic | Live system |
|-------|-------------|
| Issue #3 **The Traveling Circus** (`/comics/the-traveling-circus`) | Dynamic World Event key `traveling_circus` |
| CTA | “Join the Circus event” → `/live-world` |
| Catalog source | `src/lib/world-events/catalog.ts` (`key: "traveling_circus"`) |

### Stub behavior

- Comic reader exposes `worldEventKey` + `worldEventHref` on issue meta.
- When the event is inactive, Live World still loads; Happening Now banner shows the event only while the engine schedules it.
- Secret code `CIRCUS-APPLAUSE` is a quest-unlock stub (local comic progress), not a server grant.

### Do not fight Living Towns

Comics content lives under `src/content/comics/` and `public/assets/comics/`. Do not rewrite world map blueprints or NPC catalogs for comic delivery.
