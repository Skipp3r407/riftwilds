# Asset Discovery Candidates Report

**Date:** 2026-07-18  
**Mode:** Discovery only — **no packs downloaded into the game**  
**Approval gate:** STOP — human review required before any import  

Registry mirror: `assets/licenses/third-party-assets.json`  
Policy: [THIRD_PARTY_ASSET_POLICY.md](./THIRD_PARTY_ASSET_POLICY.md)

---

## How to review

1. Open each **Preview** link (official page).
2. Confirm license text matches the row.
3. Decide: approve download to `private-assets/` / reject / hold.
4. Do **not** mark `IN_USE` until processed derivatives exist.

---

## Candidate table

| ID | Title | Creator | License | Style | Status | Preview |
|----|-------|---------|---------|------:|--------|---------|
| disc-kenney-ui-pack | Kenney UI Pack | Kenney | CC0 | 58 | DISCOVERED | [kenney.nl](https://kenney.nl/assets/ui-pack) |
| disc-kenney-input-prompts | Kenney Input Prompts | Kenney | CC0 | 70 | DISCOVERED | [kenney.nl](https://kenney.nl/assets/input-prompts) |
| disc-kenney-rpg-audio | Kenney RPG Audio | Kenney | CC0 | 55 | DISCOVERED | [kenney.nl](https://kenney.nl/assets/rpg-audio) |
| disc-game-icons-net | game-icons.net (selective) | Lorc et al. | CC BY 3.0 / some CC0 | 64 | LICENSE_REVIEW | [game-icons.net](https://game-icons.net/) |
| disc-polyhaven-forest-floor | Poly Haven textures | Poly Haven | CC0 | 42 | DISCOVERED | [polyhaven.com](https://polyhaven.com/textures) |
| disc-ambientcg-nature | ambientCG materials | ambientCG | CC0 | 40 | DISCOVERED | [ambientcg.com](https://ambientcg.com/) |
| disc-freesound-cc0-nature | Freesound CC0 (filter) | Various | CC0 only | 60 | LICENSE_REVIEW | [freesound CC0 tag](https://freesound.org/browse/tags/cc0/) |
| disc-oga-lpc-base | LPC base assets | LPC | Likely CC-BY-SA / GPL — verify | 48 | LICENSE_REVIEW | [OGA LPC](https://opengameart.org/content/lpc-base-assets) |
| disc-wikimedia-public-domain-nature | Wikimedia PD nature | Various | PD / per-file | 25 | DISCOVERED | [Commons](https://commons.wikimedia.org/wiki/Category:PD_nature) |
| disc-github-kenney-nl-mirror-caution | GitHub Kenney mirrors | Kenney / mirrors | Verify LICENSE | 50 | LICENSE_REVIEW | [github.com/KenneyNL](https://github.com/KenneyNL) |
| reject-kenmi-cute-fantasy-unverified | Kenmi Cute Fantasy | Kenmi | **UNVERIFIED** | 88 | **RESTRICTED** | [kenmi.itch.io](https://kenmi.itch.io/) |

### Already in use (grandfathered)

| ID | Title | License | Status | Credits |
|----|-------|---------|--------|---------|
| in-use-oga-dark-sci-fi-audio | Dark Sci-Fi Audio Pack (+ other CC0 beds) | CC0 | IN_USE | [MUSIC_CREDITS.md](../../public/sounds/MUSIC_CREDITS.md) |

---

## Per-candidate notes

### Kenney UI Pack — style 58
Clean CC0 chrome. Risk: recognizable “Kenney UI” in a premium brand shell. Recommend tint/re-skin or use only for internal admin tools.

### Kenney Input Prompts — style 70
Best short-term fit for `/settings/keybinds`. Neutral glyphs recolor well.

### Kenney RPG Audio — style 55
OK for prototype SFX; Riftling cries must stay original procedural IP.

### game-icons.net — style 64
Commercial OK with **attribution**. Per-icon author check required. Good for quest/map glyphs if credits page updated.

### Poly Haven / ambientCG — style 40–42
Legally strong (CC0), visually photoreal — **reference / bake only**, not Live World tiles.

### Freesound CC0 filter — style 60
Must open **each** sound page; never bulk-download non-CC0. Respect ToS/rate limits.

### LPC base — style 48
Legal risk: ShareAlike / GPL dual licenses common — hold in LICENSE_REVIEW; likely reject for closed commercial art.

### Wikimedia PD — style 25
Mood reference only.

### Kenmi Cute Fantasy — style 88 / RESTRICTED
High style affinity to art-direction aspiration. **No import** until commercial license on the exact pack page is verified. Do not treat “Kenmi-quality” wording in docs as a license.

---

## Recommended first approvals (after you say go)

1. Kenney Input Prompts (CC0, high utility, low brand risk)  
2. Selective game-icons with attribution plan  
3. Individual Freesound CC0 clips for portal/ambience gaps  

## Explicit non-approvals pending you

- Kenmi Cute Fantasy (RESTRICTED)  
- LPC until SA/GPL accepted or rejected  
- Any creature sprite packs resembling franchise monsters  

---

## Audit snapshot (existing project)

| Area | Finding |
|------|---------|
| Renderer / Live World | Existing Phaser/canvas + premium library under `public/assets/game/` — **not modified** this pass |
| Pets | 18 starter art pipeline + large lore roster; portraits under `public/assets/pets/` |
| Animations | Battle sheets largely pending in manifest; do not fake |
| Licenses today | Music CC0 via OGA credited; SFX/cries mostly original procedural |
| Build pipeline | `scripts/assets/*` + `src/lib/assets/asset-manifest.ts` — extended via new third-party module only |

---

**STOP:** Awaiting explicit approval to download or promote any DISCOVERED / LICENSE_REVIEW candidate.
