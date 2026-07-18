# Riftling Spirit System

Riftlings are living companions. When critically wounded they become **Downed** (unconscious), not instantly dead.

## Life states

Healthy → Injured → Weak → Critical → **Downed** → Spirit Form → Recovered  
Also: Retired · Memorialized · Legendary Ancestor · **Permadead (Hardcore only)**

## Normal play

- HP ≤ 0 → Downed + configurable countdown (default 72h)
- Cannot fight / explore / gather / use abilities while Downed or in Spirit Form
- Can still be viewed and healed through recovery methods
- Visual stubs: breathing, dim glow, spirit particles, heartbeat SFX key

## Modules

| Path | Role |
|------|------|
| `src/game/spirit/` | Authoritative life/recovery logic |
| `src/content/regions/packs/spirit-realm.ts` | Spirit Realm content pack (rescue instance) |
| `/spirit-realm` | Playable stub UI |
| `/api/pets/[id]/spirit` | Status, options, SOL quote |
| `/api/pets/[id]/recovery` | Down / Spirit Form / Recover |

## Flags

- `SPIRIT_SYSTEM_ENABLED` (default on)
- `SOL_SPIRIT_RECALL_ENABLED` (default off)
- `HARDCORE_MODE_ENABLED` (default on as opt-in capability)
- `MEMORIAL_GARDEN_ENABLED` (default on)
- `PERMANENT_DEATH_ENABLED` remains the legacy global kill switch (default off)

## Bond

Higher bond → longer countdown, lower Credits healer cost, special dialogue, unique quest eligibility. Bond never prices SOL.
