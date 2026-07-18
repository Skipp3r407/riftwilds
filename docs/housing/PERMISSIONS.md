# Housing Permissions

## Roles

Owner · Co-owner · Family · Guild · Friends · Visitors · Public

## Flags

`enter` · `build` · `decorate` · `storage_take` · `storage_deposit` · `craft` · `farm` · `invite` · `manage_permissions` · `host_events` · `edit_music` · `edit_lighting`

## Visit policies

`PRIVATE` · `FRIENDS` · `GUILD` · `FEATURED` · `PUBLIC`

## Anti-abuse

- Unauthorized edit blocked by flag checks
- Storage deposit/withdraw idempotency tokens (anti-dupe)
- Blueprint hash prevents identical re-list spam
- Offensive décor keyword stub (neighborhoods) + permission abuse returns `forbidden`
