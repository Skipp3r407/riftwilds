# Emote Moderation and Privacy

## Privacy settings (local → future account sync)

| Setting | Effect |
|---------|--------|
| Allow social requests | Master gate for consent prompts |
| Friends-only social | Stub until friends graph ships |
| Hide remote bubbles | Local visual preference |
| Mute list | Drop requests + optional bubble hide |
| Block list | Hard reject + auto-mute |

Storage key: `riftwilds-emote-privacy-v1`.

## Moderation principles

1. Emotes are **entertainment cosmetics** — no power, loot, or SOL.
2. Catalog tags must include `safe`; reject unsafe proposals in admin review.
3. Chat slash bodies still pass `sanitizeChatBody` + stub profanity filter.
4. Rate limits: per-emote cooldown, global anti-spam (5 / 4s), ping cooldowns.
5. NPC AI flavor (optional) must fall back to authored family-safe lines — never invent rewards.
6. Admin shell: `/admin/emotes` for catalog audit notes.

## Report path

Player reports of abusive social spam → Support / moderation queue (`/admin/support`). Emote-specific tooling is a shell until live presence ships.
