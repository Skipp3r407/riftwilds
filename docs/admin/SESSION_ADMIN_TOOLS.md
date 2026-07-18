# Session Admin Tools (Stub)

## Endpoints

`GET /api/admin/sessions?ownerKey=` — inspect active world session, save summary, checkpoint, recent snapshots  
`GET /api/admin/sessions?sessionId=` — inspect one session  
`POST /api/admin/sessions` — `{ "action": "force_end", "sessionId"|"ownerKey", "reason" }`

Requires authenticated admin role.

## UI

`/admin/players` links to these tools. Full search/ban UI remains a shell.

## Planned (not this pass)

- Live presence map of all `ACTIVE` sessions (needs shared store)
- Force restore to checkpoint with reason codes
- Merge guest → user save on wallet link
- Ban that also `FORCE_ENDED` all world sessions
