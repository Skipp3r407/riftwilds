# Cutscene & Cinematic Designs

Story-first; no marketplace/investment framing. Reuse About art where possible; new masters under `public/assets/story/cinematics/`.

---

## Design language

- Wordless art + HTML/UI captions (About comic rule).
- Prefer Riftling + Keeper silhouettes; no stolen IP silhouettes.
- Duration targets: stubs 8–20s; major act 45–90s; finale 2–4 min modular.

---

## Cinematic catalog

### C0 — Origin (existing About)

Already shipped via `/about` chapters + narrationScript. Do not rebuild; deep-link from Academy.

### C1 — Awakening in the Commons (`starter-q1`)

- **Shots:** Player stirs near plaza lanterns → Rowan wave → Riftstone pulse → Elara silhouette.
- **Audio:** `music-commons` swell; soft rift hum.
- **Reward:** None beyond quest; mood setter.

### C2 — Fragments Told (`starter-q2`)

- Mini montage of Fracture (reuse About fracture stills) as Elara speaks — diegetic “memory overlay,” not full About redirect unless player opts in.

### C3 — First Hatch (`starter-q3`)

- Mira’s hands → egg cracks → affinity-colored light → Riftling eyes meet Keeper.
- Affinity vignette tint from About birth vignettes.

### C4 — First Portal (`starter-q8`)

- Elara nod → portal circle sings green → destination triad (Ember/Coast/Elderwood) as choice cards → travel-loading art.

### C5 — Gateway Stone First Activation

- Per `GATEWAY_NETWORK.md` stub: stone wakes; short NPC/stone line; Codex key grant.
- Visual: amber lattice climbing stone like living vine.

### C6 — Act I Heart-Echo

- Regional landmark steadies; Riftling dream of Celestial question-mark constellation.

### C7 — Corrupt Node Choice (Act II climax)

- Three ritual gestures on screen: purify / quarantine / harvest — player input collapses cinematic branch.

### C8 — Triad Threshold (Act III)

- Split-screen Serae / Veyra / Hex statements; Lattice Echo as glitch between faces.

### C9 — Marsh Naming (Act IV)

- Lanterns form the Prime’s loneliness as abstract shape — not a monster reveal.

### C10 — Celestial Finale (modular endings)

- Shared approach shots; ending-specific last 30s (`harmony_reweave`, `chosen_layers`, `sealed_prime`, `forced_lattice`, `elara_path`).
- Post-credit: Riftstone map flicker.

### C11 — World event bumpers

- 5–10s bumper per major event (Ashfall, Null Eclipse, Starfall Gate).

---

## Implementation notes

- Live World cinematic framework exists in decade plan (Phaser) — stub scripts can live in `src/game/story/` additively.
- Prefer skippable with “Codex recap unlocked” for accessibility.
- Never hard-lock hatchery/care behind unskippable multi-minute films.
