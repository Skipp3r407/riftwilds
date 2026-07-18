# Player Academy / Tutorial System

## Overview

The **Player Academy** (`/academy`) is Riftwilds’ first-class interactive tutorial hub: multi-panel lessons, searchable FAQ, progress persistence, and Live World entry points. It extends existing nav — it does not replace Site Header, sidebar, or Live World HUD.

## Route & layout

| Surface | Path |
| --- | --- |
| Academy page | `/academy` (`src/app/(game)/academy/page.tsx`) |
| Lesson deep link | `/academy?lesson=<id\|slug>` |
| FAQ | `/academy?tab=faq&faq=<id>` |
| Practice flag | `&practice=1` |

Three panels (responsive stack on mobile):

1. **Left** — search, path/category filters, favorites, recent, completed, lesson list  
2. **Center** — content, media, interactive drills, quiz, video  
3. **Right** — progress %, ETA, rewards, tips, shortcuts, related, achievements  

## Data model

| Module | Role |
| --- | --- |
| `src/game/academy/types.ts` | Lesson, progress, FAQ, search hit types |
| `src/game/academy/catalog.ts` | Aggregated lessons + helpers |
| `src/game/academy/lessons/beginner.ts` | Beginner Path 1–30 |
| `src/game/academy/lessons/advanced.ts` | Advanced mastery tracks |
| `src/game/academy/lessons/curricula.ts` | Focused academies (Riftling, Care, Combat, …) |
| `src/game/academy/progress.ts` | `riftwilds-academy-progress-v1` localStorage |
| `src/game/academy/search.ts` | Keyword search across lessons + FAQ + tags |
| `src/game/academy/faq.ts` | Searchable FAQ |
| `src/game/academy/achievements.ts` | Learning achievements |

Progress fields per lesson: viewed / interactive / quiz / completed / last viewed. Path % = completed or quiz-passed over path lesson count.

## Interactive framework

`InteractiveLesson` supports: `wasd-gate`, `click-target`, `map-waypoint`, `npc-click`, `menu-navigate`, `practice-stub`, `checklist`, `quiz`, `drag-drop` (stub). Where Live World cannot drive the web page, lessons link to `/live-world` or Arena with **Mark stub complete**.

Combat Academy practice: `/academy?lesson=cur-combat&practice=1`.

## Entry points

| Entry | Wiring |
| --- | --- |
| Main Menu / nav | `headerNavGroups` Play + World; `extraSidebarNav` |
| Header Help | Site Header “Help” → `/academy` |
| Profile | `PROFILE_QUICK_LINKS` |
| Play dashboard | Quick action + `AcademyOnboardingBanner` |
| Quest Journal | Quest Board “Academy: Quests” |
| Footer Learn | Academy / Help |
| Live World F1 | `help` keybind → `/academy` |
| Live World Esc | Pause menu → Academy / Help |
| Live World gate | Academy / Help button before enter |
| Commons building | `academy` building + library Enter Academy |
| Archivist Solen | Dialogue node pointing to Academy |

## Commons Academy building

- Blueprint: `academy` building + `academy-zone` in `riftwild-commons.ts`  
- Texture: `/assets/game/buildings/academy.png`  
- Interact → **Enter Academy** → `bridge.requestNavigate("/academy")`  
- Library also offers Enter Academy (Archive adjacency)

## Economy teaching rule

Lessons and FAQ state clearly: **credits are earned by playing; SOL is never required for basic gameplay.** Academy rewards are small one-time badges/titles/token credits — never large repeatable currency farms.

## Media

Illustrations under `public/assets/academy/`. Videos use `AcademyVideoPlayer` (autoplay **off** by default; captions, speed, fullscreen).

## Tests & docs

- Unit: `tests/unit/academy.test.ts`  
- QA: `docs/testing/TUTORIAL_QA.md`  
- Guides: `BEGINNER_GUIDE.md`, `ADVANCED_GUIDE.md`, `FAQ.md`  

## Proposed follow-ups

- Server-sync progress when player accounts land  
- Interior Academy scene (optional)  
- Wire more Live World objectives to interactive lesson completion events  
