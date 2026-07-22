# Sidebar System (Battle Mode)

Extends the game sidebar (`GameSidebar` + `sidebarNavGroups`) for active battle desks.

## Preferences

`localStorage` key: `riftwilds.battle.sidebar-mode`

| Value | Behavior |
|-------|----------|
| `always-open` | Full `w-60` sidebar during battle |
| `auto-collapse` | **Default** — icon rail; pin / Tab / left-edge hover to open |
| `hidden-during-battle` | Hidden; left-edge hover peeks a full panel |

## Interactions

- **Pin** control on the sidebar header keeps it expanded (auto-collapse mode)
- **Tab** toggles pin / collapse while a battle desk is open
- **Left-edge hover zone** (~14px) sets peek; mouse leave collapses again
- During combat VFX (`data-battle-combat="true"`), a non-peek sidebar fades

## Outside battle

Hub and other game routes keep the full expanded sidebar. Battle Hub mode tabs are unchanged.

## Related

- Architecture catalog: `docs/SIDEBAR_ARCHITECTURE.md`
- Focus Mode: `docs/FOCUS_MODE.md`
