# Game Visual QA — Riftwild Commons

Checklist for the Live World showcase hub. Update after each art pass.

## Pass criteria (Commons)

| Check | Status | Notes |
|-------|--------|-------|
| Player is not a debug circle | **PASS** | Grok Keeper actor |
| Pet follower is not a circle | **PASS** | Amber riftling companion |
| Named NPCs use overworld sheets | **PASS** | 10 named |
| Ambient NPCs not purple circles | **PASS** | Sheets + sprites |
| Riftlings use creature sprites | **PASS** | emberkit / glowpup / pouchling |
| Cal Reed complete art | **PASS** | full-body + dialogue + sheet |
| Dialogue portraits non-empty | **PASS** | `dialogue-portrait.png` with portrait fallback |
| Buildings use facades (not flat boxes) | **PASS** | Premium spawn |
| Riftstone Monument art | **PASS** | Dedicated prop |
| Training dummies not signposts | **PASS** | `training-dummy` prop |
| Resources not green diamonds/circles | **PASS** | berry / herb / fish props |
| Portal hub has art | **PASS** | facade + ring glow |
| Terrain not flat single color | **PASS** | Layered premium tiles |
| Roads not rigid single stroke | **PASS** | Path variants (premium) |
| Minimap uses icons | **PASS** | Grok crop icons |
| Label overlap reduced | **PASS** | Distance-faded NPC names; quieter building plaques |
| Spawn stacking reduced | **PASS** | Plaza child / riftling offsets |
| Collision still valid | **Manual** | Verify in Live World after pull |

## Known soft spots

- Portal destination markers still use `ui-map-portal` at 36×36 (good) with text labels
- Fishing dock shares fish resource art
- Weather/atmosphere circles for glow are intentional FX, not placeholders

## Other regions

Not in this QA scope. Expect circle/rect fallbacks until premium art inheritance.
