# Color Palette — Riftwilds

CSS tokens live in `src/app/globals.css` (`:root`). This doc is the design intent; tokens are the implementation.

## Philosophy

**~70% earth, ~20% sky/water, ~10% rift accents.**  
Cyan and amber are brand signals — never flood every surface. Violet/void hues are **rare** (rift storms, spirit zones) — not default chrome.

## Core earth (primary)

| Token / name | Hex | Use |
|--------------|-----|-----|
| Forest canopy | `#2f5a3a` | Deep foliage, night trees |
| Meadow green | `#4a9e4a` → `#7bc86a` | Commons grass midtones (cozy outdoors) |
| Moss | `#6b8f4e` | Path edges, ruins |
| Bark brown | `#5c3d2e` | Timber, props |
| Leather | `#8b5a3c` | Costumes, UI wood |
| Sandstone | `#c4a882` | Stone plaza (`--stone`) |
| Parchment | `#e8d5b0` | Light UI text panels, maps |
| Ink brown | `#2a2118` | Dark UI fills (fantasy mode) |

## Brand accents (sparing)

| Token | Hex | Use |
|-------|-----|-----|
| `--cyan` | `#3de7ff` | Rift energy, links, HUD brackets TL/BR |
| `--amber` | `#ffb84d` | Hearth, CTAs, HUD brackets TR/BL |
| `--ember` | `#ff7a3d` | Forge / fire |
| `--radiant` | `#ffe566` | Gold leaf, rewards |
| `--tide` | `#3d9bff` | Water / coast (secondary) |

## Night & atmosphere

| Role | Hex | Notes |
|------|-----|-------|
| Night navy | `#0a1830` → `#121a28` | Overlay base (warmer than pure black) |
| Dusk rose-gold | `#3a2820` @ low alpha | Sunset wash |
| Torch | `#ffc070` / `#ffaa55` | ADD blend pools |
| Portal cyan | `#66e0ff` | Portal circle only |

## Forbidden defaults

- Primary UI gradients that are purple → indigo
- Flat `#F4F1EA` cream pages with terracotta-only accents as the whole brand
- Neon magenta / hot pink as Commons district color
- Pure white `#FFFFFF` large fills in Live World HUD (use parchment or glass navy)

## District tint hints (Commons)

| District | Local accent |
|----------|--------------|
| Plaza / Riftstone | Cyan crystal + sandstone |
| Market | Banner red-ochre + amber lanterns |
| Forge | Ember + iron grey |
| Hatchery | Soft cyan + cream |
| Guild | Gold + deep green banners |
| Forest edge | Dense greens, cool shade |

## Accessibility

- Body text on glass: `--text` `#f0f2f8` or parchment ink `#2a2118` on light panels.
- Never rely on cyan-only vs green-only for state; pair with icon/shape.
- Maintain contrast on HUD buttons over bright midday grass.
