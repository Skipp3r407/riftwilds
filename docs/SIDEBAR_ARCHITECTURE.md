# Sidebar architecture

## Source of truth

- Groups: `sidebarNavGroups` in `src/lib/config/nav.ts`
- Renderer: `src/components/game/game-sidebar.tsx`
- Header mega-groups: `headerNavGroups` (same file)
- Flat catalog: `primaryNav` / `sidebarNav` (validators + legacy)

## Active matching

`isActive` treats `/tcg/battle` (any query) as the Rift Battle item so hub mode tabs keep the Play → Rift Battle highlight.

Query-bearing links (e.g. Stakes Fee Treasury) still navigate correctly; path-only matching avoids false actives for unrelated sections.

## Deduping

- One combat primary: **Rift Battle**
- Rift Stakes only as hub deep link / Treasury fee transparency link
- Account strip holds meta destinations not already in a group (Help, Roadmap, Academy, Login, Nakama)

## Mobile / header

Desktop mega-menu and mobile drawer continue to use `headerNavGroups` via `site-header.tsx`. Combat modes are listed under **Rift Battles** as hub tabs.
