# Tutorial / Player Academy QA

## Automated

```bash
npm run test:unit -- tests/unit/academy.test.ts
```

Covers: catalog size, SOL messaging, progress, search, achievements, href helpers.

## Manual checklist

### Entry points

- [ ] Header **Help** → `/academy`
- [ ] Play group / World group / sidebar **Academy / Help**
- [ ] Footer Learn → Academy / Help
- [ ] Profile quick link **Player Academy**
- [ ] Play dashboard quick action + onboarding banner
- [ ] Quests board **Academy: Quests**
- [ ] About final CTA **Player Academy**
- [ ] Live World pre-enter **Academy / Help**
- [ ] Live World **F1** navigates to Academy
- [ ] Live World **Esc** pause menu → Academy / Help
- [ ] Commons **Player Academy** building → Enter Academy
- [ ] **Rift Archive** also offers Enter Academy
- [ ] Archivist Solen dialogue mentions Academy location

### Academy UX

- [ ] Three-panel layout desktop; stacks on mobile
- [ ] Search finds “SOL”, “WASD”, NPC slugs, FAQ
- [ ] Favorites / recent / completed filters work
- [ ] Beginner path % updates after completes
- [ ] WASD gate lights keys and completes
- [ ] Map waypoint + NPC click drills work
- [ ] Quiz pass marks lesson; fail does not graduate
- [ ] Video embeds do **not** autoplay
- [ ] Illustrations lazy-load (check network)
- [ ] Achievements unlock (Economy Aware after b05)

### Economy / rewards

- [ ] Credits vs SOL lesson + FAQ state SOL never required for basics
- [ ] Graduate rewards one-time only; no large repeatable credit farm

### Regression / coordination

- [ ] World travel / portals still function (Academy building does not block plaza)
- [ ] Esc still closes map/chat/emote before pause menu
- [ ] Library texture / academy texture both load in BootScene

## Known stubs

- Drag-drop interactive is a button stub
- Combat practice beyond click drills links to Arena Training
- Progress is localStorage-only until account sync
