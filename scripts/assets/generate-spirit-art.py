"""Generate Spirit Realm / memorial / recovery item SVG placeholders (original IP)."""
from pathlib import Path

root = Path(__file__).resolve().parents[2]
spirit = root / "public" / "assets" / "spirit"
spirit.mkdir(parents=True, exist_ok=True)
icons = root / "public" / "assets" / "items" / "potions" / "icons"
icons.mkdir(parents=True, exist_ok=True)
prompts = root / "asset-prompts" / "spirit"
prompts.mkdir(parents=True, exist_ok=True)


def svg(body: str, w: int = 128, h: int = 128) -> str:
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w * 4}" height="{h * 4}">
  <defs>
    <radialGradient id="aura" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#7ec8ff" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#0a1220" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a2744"/>
      <stop offset="55%" stop-color="#2a4a6a"/>
      <stop offset="100%" stop-color="#0d1828"/>
    </linearGradient>
    <linearGradient id="aurora" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#5ad0c0" stop-opacity="0.3"/>
      <stop offset="50%" stop-color="#a78bfa" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#60a5fa" stop-opacity="0.25"/>
    </linearGradient>
  </defs>
{body}
</svg>
"""


(spirit / "spirit-realm-isles.svg").write_text(
    svg(
        """
  <rect width="1400" height="560" fill="url(#sky)"/>
  <ellipse cx="700" cy="120" rx="600" ry="80" fill="url(#aurora)"/>
  <ellipse cx="320" cy="360" rx="160" ry="48" fill="#1e3a4a"/>
  <ellipse cx="320" cy="340" rx="120" ry="36" fill="#2d5a5a"/>
  <circle cx="300" cy="300" r="18" fill="#fde68a" opacity="0.9"/>
  <circle cx="350" cy="290" r="12" fill="#7dd3fc" opacity="0.85"/>
  <ellipse cx="700" cy="400" rx="220" ry="60" fill="#1e2f44"/>
  <path d="M560 380 Q700 300 840 380" fill="none" stroke="#7dd3fc" stroke-width="6" opacity="0.7"/>
  <rect x="640" y="240" width="120" height="140" rx="8" fill="#334155"/>
  <polygon points="640,240 700,180 760,240" fill="#475569"/>
  <ellipse cx="1050" cy="370" rx="140" ry="40" fill="#1e3a4a"/>
  <circle cx="1020" cy="320" r="22" fill="#c4b5fd" opacity="0.8"/>
  <circle cx="1080" cy="310" r="14" fill="#fde68a" opacity="0.75"/>
""",
        1400,
        560,
    ),
    encoding="utf-8",
)

(spirit / "memorial-garden.svg").write_text(
    svg(
        """
  <rect width="1400" height="480" fill="#0f1a24"/>
  <ellipse cx="700" cy="420" rx="520" ry="50" fill="#1a2e28"/>
  <rect x="200" y="260" width="40" height="120" fill="#64748b"/>
  <ellipse cx="220" cy="250" rx="50" ry="20" fill="#94a3b8"/>
  <rect x="600" y="240" width="50" height="140" fill="#78716c"/>
  <circle cx="625" cy="220" r="36" fill="#a8a29e"/>
  <rect x="1000" y="270" width="36" height="110" fill="#64748b"/>
  <circle cx="250" cy="380" r="8" fill="#fbbf24"/>
  <circle cx="280" cy="390" r="6" fill="#fde68a"/>
  <circle cx="700" cy="360" r="10" fill="#7dd3fc" opacity="0.9"/>
  <circle cx="740" cy="370" r="7" fill="#a78bfa" opacity="0.85"/>
  <path d="M180 400 Q400 320 620 400" fill="none" stroke="#334155" stroke-width="8"/>
  <rect x="480" y="360" width="80" height="24" rx="4" fill="#3f4f3f"/>
""",
        1400,
        480,
    ),
    encoding="utf-8",
)

(spirit / "memorial-statue.svg").write_text(
    svg(
        """
  <circle cx="64" cy="64" r="52" fill="url(#aura)"/>
  <rect x="54" y="48" width="20" height="50" rx="4" fill="#94a3b8"/>
  <circle cx="64" cy="36" r="14" fill="#cbd5e1"/>
  <ellipse cx="64" cy="100" rx="28" ry="8" fill="#64748b"/>
  <circle cx="64" cy="20" r="6" fill="#fde68a" opacity="0.9"/>
"""
    ),
    encoding="utf-8",
)

(spirit / "ancestor-portrait.svg").write_text(
    svg(
        """
  <circle cx="64" cy="64" r="52" fill="url(#aura)"/>
  <ellipse cx="64" cy="72" rx="28" ry="32" fill="#c4b5fd" opacity="0.7"/>
  <circle cx="64" cy="48" r="18" fill="#e9d5ff" opacity="0.85"/>
  <path d="M40 90 Q64 110 88 90" fill="none" stroke="#fde68a" stroke-width="3"/>
"""
    ),
    encoding="utf-8",
)

items = {
    "spirit-crystal": ("#7dd3fc", "M40 80 L64 30 L88 80 Z"),
    "phoenix-feather": ("#fb923c", "M50 90 Q70 40 90 30 Q60 50 55 90"),
    "ancient-heart": ("#f472b6", "M64 90 Q40 60 50 45 Q64 35 64 50 Q64 35 78 45 Q88 60 64 90"),
    "revival-herb": ("#4ade80", "M64 90 L64 40 M64 50 Q50 40 45 55 M64 55 Q80 45 85 60"),
    "healing-stone": ("#94a3b8", "M40 70 Q64 40 88 70 Q64 95 40 70"),
    "soul-bloom": ("#a78bfa", "M64 80 L64 50 M50 60 Q64 40 78 60 M45 70 Q64 55 83 70"),
    "moon-tear": ("#67e8f9", "M64 30 Q80 55 64 95 Q48 55 64 30"),
    "heart-flame": ("#f97316", "M64 90 Q50 60 64 30 Q78 60 64 90"),
    "sacred-feather": ("#fde68a", "M45 85 Q70 35 95 25 Q65 50 50 85"),
    "ancestor-stone": ("#d6d3d1", "M44 40 H84 V90 H44 Z"),
    "ancient-bell": ("#fbbf24", "M50 40 H78 L84 75 H44 Z"),
    "revival-water": ("#38bdf8", "M50 35 H78 V55 Q64 95 50 55 Z"),
    "healing-rune": ("#c084fc", "M40 40 H88 V88 H40 Z M52 52 L76 76 M76 52 L52 76"),
    "spirit-lantern-charm": ("#fde68a", "M54 35 H74 V55 Q64 85 54 55 Z M64 25 V35"),
}

for name, (color, path) in items.items():
    body = f"""
  <circle cx="64" cy="64" r="52" fill="url(#aura)"/>
  <path d="{path}" fill="{color}" stroke="#0a1020" stroke-width="2" opacity="0.95"/>
"""
    (icons / f"{name}.svg").write_text(svg(body), encoding="utf-8")

(prompts / "spirit-realm.md").write_text(
    "# Spirit Realm art\nOriginal Riftwilds IP: floating lantern islands, aurora temples, light bridges.\n",
    encoding="utf-8",
)
(prompts / "memorial-garden.md").write_text(
    "# Memorial Garden art\nQuiet lantern garden, statues, candles. Respectful, not guilt-driven.\n",
    encoding="utf-8",
)

print(f"wrote {len(list(spirit.glob('*.svg')))} spirit svgs, {len(items)} item icons")
