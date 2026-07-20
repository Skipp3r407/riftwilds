#!/usr/bin/env python3
"""
Emit complete The Traitor's Gate Issue #7 script + page JSON + prompts + continuity.
  python scripts/comics/issue-007/emit_issue_007.py

OUT: content/comics/the-traitors-gate/issue-007
Does NOT touch issue-001–006. Mira Eggwarden canon. Cal Reed forbidden.
Traitor lock: Cael Vesper (Issue #6 p25 transmission recipient). Captive: Lumenhare.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "content/comics/the-traitors-gate/issue-007"

STYLE = (
    "Original high-energy Western fantasy comic storytelling with dynamic panel composition, "
    "dramatic inked linework, richly painted colors, expressive character acting, and clear cinematic action. "
    "Original Riftwilds IP only. Black stone, pale silver metal, moss and timber first; cyan Rift light, "
    "deep red warning runes, restrained violet gate shimmer as accents only. NO purple AI-fantasy neon default. "
    "NO Marvel/DC/Pokémon characters or logos."
)
NEG = (
    "readable dialogue text, captions, logos, watermarks, page numbers, UI chrome, Marvel, DC, Pokémon, "
    "manga screentone trademarks, extra limbs, duplicate characters, missing companions, purple neon fantasy "
    "default, photoreal modern clothing, Pikachu lookalike, Cal Reed, Voltkit"
)
SPARK = (
    "Spark the Glowpup-line Riftborn hatchling: soft luminous fur, cyan-gold rift markings, large expressive eyes, "
    "small crystal growths, glowing-tip emotional tail, steadier aura when bonded; cute but original — not a franchise mascot"
)
MIRA = (
    "Mira Eggwarden: young adult Hatchery mentor/Keeper, warm brown skin, dark hair in practical braid, "
    "travel-stained hatchery coat over Compact robes, Compact lantern charm on satchel, determined protective eyes"
)
CAEL = (
    "Cael Vesper the Lanternmaster: mid-40s, warm brown skin, silver-threaded dark hair, deep blue and ember-gold coat, "
    "brass lantern clasps, half-mask of painted wood with nested lantern motif"
)
NIRA = "Nira Quill: uncertain hunter, lean, weather cloak, quill-knife kit, conflicted eyes"
AURELIA = (
    "Aurelia Voss the Gilded Merchant: elegant, warm gold and deep-red market robes, ledger-chain jewelry, "
    "half-veil, calculating calm eyes"
)
SERIS = (
    "Seris Vale: Meridian commander, sharp features, storm-dark field coat with three-arc sigil, "
    "carries Lost City Rift component crystal"
)
SERAPH = (
    "Oathwarden Seraph: tall ceremonial black-and-silver armor, split judgment mask, cyan oath flame, "
    "long judgment spear, broken Keeper cloak, floating lock rings, one armor side corrupted, orbiting memory mirrors"
)
TRUTHWING = (
    "Truthwing: small silver-and-black birdlike companion, glassy wings, cyan eyes, feather patterns like keys, "
    "reflections moving across its body"
)
EGG = (
    "dormant Riftborn egg: warm oval shell with cyan-amber seam markings, soft pulse glow, no full hatch — "
    "visually identical across pages"
)
LUMEN = (
    "Lumenhare: circus light companion, soft luminous fur, lantern-mark ears, indigo-gold Grand Illusion weave hints"
)


def balloon(kind, speaker, text, x, y, tail=None, **extras):
    b = {"kind": kind, "text": text, "x": x, "y": y, "tail": tail, "maxWidthPct": extras.pop("maxWidthPct", 34)}
    if speaker:
        b["speaker"] = speaker
    b.update(extras)
    return b


def panel(pid, description, bubbles, **extra):
    p = {"id": pid, "description": description, "bubbles": bubbles}
    p.update(extra)
    return p


def build_transcript(panels):
    lines = []
    for p in panels:
        for b in p.get("bubbles") or []:
            if b.get("speaker"):
                lines.append(f"{b['kind'].upper()} ({b['speaker']}): {b['text']}")
            else:
                lines.append(f"{b['kind'].upper()}: {b['text']}")
    return lines


continuity_track: list[dict] = []


def cont(page, state):
    row = {"page": page, **state}
    continuity_track.append(row)
    return state


def page_base(n, title, purpose, layout, panels, **opts):
    order = 0
    dialogue, captions, sfx = [], [], []
    for p in panels:
        for b in p.get("bubbles") or []:
            if b.get("readOrder") is None:
                b["readOrder"] = order
                order += 1
            entry = {"panelId": p["id"], **b}
            if b["kind"] == "sfx":
                sfx.append(entry)
            elif b["kind"] in ("narration", "caption"):
                captions.append(entry)
            else:
                dialogue.append(entry)
    chars = opts.get("characters") or ["mira-eggwarden"]
    creatures = opts.get("creatures") or []
    grok = " ".join(
        [
            STYLE,
            f'Riftwilds comic "The Traitor\'s Gate" Issue #7, STORY PAGE {n}/25 — {title}.',
            f"Story purpose: {purpose}",
            f"Layout: {layout}. {len(panels)} panels with clear inked gutters.",
            " ".join(f"Panel {i+1} ({p['id']}): {p['description']}" for i, p in enumerate(panels)),
            f"Characters: {', '.join(chars)}. Creatures: {', '.join(creatures)}.",
            f"Spark design lock: {SPARK}. Keeper lock: {MIRA}.",
            f"Egg lock: {EGG}. Oathwarden lock: {SERAPH}.",
            f"Environment: {opts.get('environment', 'Traitor Gate approaches')}. Time: {opts.get('time', 'day')}.",
            f"Lighting: {opts.get('lighting', 'black stone with cyan rift accents')}. Continuity: {json.dumps(opts.get('continuity') or {})}",
            "Leave empty balloon-safe and narration-safe negative space in upper/lower panel corners. NO readable text of any kind in the artwork.",
        ]
    )
    return {
        "pageNumber": n,
        "storyPageNumber": n,
        "bookRole": "story",
        "title": title,
        "storyPurpose": purpose,
        "layout": {"type": layout, "panelCount": len(panels)},
        "panels": panels,
        "dialogue": dialogue,
        "captions": captions,
        "soundEffects": sfx,
        "characters": chars,
        "creatures": creatures,
        "locations": opts.get("locations") or ["Gilded Crossroads"],
        "artifacts": opts.get("artifacts") or [],
        "continuity": opts.get("continuity") or {},
        "requiredMoments": opts.get("requiredMoments") or [],
        "grokPrompt": grok,
        "negativePrompt": NEG,
        "pageTurnObjective": opts.get("pageTurn") or "Turn to continue.",
        "letteringInstructions": opts.get("lettering")
        or "Standard speech + narration; keep tails off faces and Spark's eyes; Gate text formal.",
        "generationStatus": "pending",
        "letteringStatus": "pending",
        "approvalStatus": "script-complete",
        "artAlt": opts.get("artAlt") or f"{title} — The Traitor's Gate page {n}",
        "atmosphere": opts.get("atmosphere") or "rift",
        "transcript": build_transcript(panels),
        "a11yTranscript": build_transcript(panels),
        "codexLinks": opts.get("codexLinks") or [],
        "cardTeases": opts.get("cardTeases") or [],
    }


def matter_page(n, role, title, panels, **opts):
    order = 0
    dialogue, captions, sfx = [], [], []
    for p in panels:
        for b in p.get("bubbles") or []:
            if b.get("readOrder") is None:
                b["readOrder"] = order
                order += 1
            entry = {"panelId": p["id"], **b}
            if b["kind"] == "sfx":
                sfx.append(entry)
            elif b["kind"] in ("narration", "caption"):
                captions.append(entry)
            else:
                dialogue.append(entry)
    grok = " ".join(
        [
            STYLE,
            f"Riftwilds comic book {role} page for The Traitor's Gate Issue #7 — {title}.",
            " ".join(p["description"] for p in panels),
            f"Keeper: {MIRA}. Spark: {SPARK}. Gate: black stone towers, cyan locks.",
            "Empty zones for title lettering. NO readable text in art.",
        ]
    )
    return {
        "pageNumber": n,
        "storyPageNumber": None,
        "bookRole": role,
        "title": title,
        "storyPurpose": title,
        "layout": {"type": opts.get("layout") or "splash", "panelCount": len(panels)},
        "panels": panels,
        "dialogue": dialogue,
        "captions": captions,
        "soundEffects": sfx,
        "characters": opts.get("characters") or [],
        "creatures": opts.get("creatures") or [],
        "locations": opts.get("locations") or [],
        "artifacts": opts.get("artifacts") or [],
        "continuity": opts.get("continuity") or {},
        "requiredMoments": [],
        "grokPrompt": grok,
        "negativePrompt": NEG,
        "pageTurnObjective": opts.get("pageTurn") or "",
        "letteringInstructions": opts.get("lettering") or "Matter page captions; large title zones.",
        "generationStatus": "pending",
        "letteringStatus": "pending",
        "approvalStatus": "script-complete",
        "artAlt": opts.get("artAlt") or title,
        "atmosphere": opts.get("atmosphere") or "rift",
        "transcript": build_transcript(panels),
        "a11yTranscript": build_transcript(panels),
        "codexLinks": opts.get("codexLinks") or [],
        "cardTeases": opts.get("cardTeases") or [],
        "spoilerLevel": opts.get("spoilerLevel") or "none",
    }


story: list[dict] = []

# ── STORY PAGES 1–25 ─────────────────────────────────────────

story.append(
    page_base(
        1,
        "Ash of the Crossroads",
        "Aftermath of Gilded Crossroads; Mira studies hidden token; suspicion begins.",
        "splash",
        [
            panel(
                "p1a",
                f"Full-bleed splash: damaged Gilded Crossroads after portal collapse — broken bridges, dimmed amber lanterns, merchant workers rebuilding. Foreground: {MIRA} examining small hidden transmission token; {SPARK} beside warm {EGG}; {NIRA} standing apart; {CAEL} half-turned, eyes averted; Bramblefox, Mossprig, Thornling nearby; Lockjaw Wisp on crates. Balloon-safe top.",
                [
                    balloon(
                        "narration",
                        None,
                        "A secret can survive the person who kept it. Suspicion rarely waits that long.",
                        50,
                        12,
                        maxWidthPct=62,
                    ),
                    balloon("thought", "Mira Eggwarden", "Someone walked every road with us.", 28, 78, "up", maxWidthPct=32),
                    balloon("creature", "Spark", "*worried-glow*", 62, 72, "up"),
                ],
            )
        ],
        characters=["mira-eggwarden", "nira-quill", "cael-vesper", "aurelia-voss"],
        creatures=["spark", "bramblefox", "mossprig", "thornling", "lockjaw-wisp", "dormant-egg"],
        continuity=cont(1, {"location": "gilded-crossroads-aftermath", "egg": "warm-dormant", "token": "examined"}),
        requiredMoments=[1],
        pageTurn="Evidence arrives.",
        atmosphere="dusk",
        locations=["Gilded Crossroads"],
        artifacts=["hidden-token", "dormant-riftborn-egg"],
        codexLinks=["gilded-crossroads"],
    )
)

story.append(
    page_base(
        2,
        "Transmission Trail",
        "Aurelia presents transmission records; surface evidence implicates Nira.",
        "three-stack",
        [
            panel(
                "p2a",
                f"{AURELIA} unfurls glowing cyan-amber transmission strips on black lacquer table; Lockjaw Wisp Appraiser's Eye active; Mira leaning in.",
                [
                    balloon("speech", "Aurelia Voss", "The signal followed you through four regions.", 50, 28, "down", maxWidthPct=40),
                    balloon("creature", "Lockjaw Wisp", "*click-appraise*", 70, 70, "up"),
                ],
            ),
            panel(
                "p2b",
                "Close on strip marks aligning with hunter route seals and Meridian buyer sigils — visual implication without readable text.",
                [
                    balloon("speech", "Aurelia Voss", "On paper, the hunter's path matches best.", 50, 30, "down", maxWidthPct=42),
                    balloon("sfx", None, "strip-SNAP", 75, 65),
                ],
            ),
            panel(
                "p2c",
                f"{NIRA} jaw tight at table edge; {CAEL} still in background shadow; Spark ears flat sensing incomplete truth.",
                [
                    balloon("speech", "Nira Quill", "I won't run from ink.", 40, 35, "down"),
                    balloon("whisper", "Cael Vesper", "…Ink lies too.", 70, 70, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "aurelia-voss", "nira-quill", "cael-vesper"],
        creatures=["spark", "lockjaw-wisp", "dormant-egg"],
        continuity=cont(2, {"location": "merchant-evidence-tent", "nira": "implicated-surface"}),
        requiredMoments=[1, 2],
        pageTurn="Confrontation.",
        atmosphere="night",
        locations=["Gilded Crossroads"],
        artifacts=["transmission-records"],
    )
)

story.append(
    page_base(
        3,
        "Incomplete Accusation",
        "Mira confronts Nira; Spark senses incomplete truth; egg pulses toward map.",
        "grid-2x2",
        [
            panel(
                "p3a",
                f"{MIRA} faces {NIRA} under broken lantern; companions tense; accusation held in posture.",
                [
                    balloon("speech", "Mira Eggwarden", "You knew their buyers. Their files.", 45, 30, "down", maxWidthPct=36),
                    balloon("speech", "Nira Quill", "Knowing isn't feeding.", 55, 70, "up"),
                ],
            ),
            panel(
                "p3b",
                f"{SPARK} between them, cyan-gold resonance flickering confused — not hostile toward Nira.",
                [
                    balloon("creature", "Spark", "*no-wrong-glow*", 50, 40, "down"),
                    balloon("thought", "Mira Eggwarden", "Spark isn't sure. That should stop me.", 50, 78, maxWidthPct=38),
                ],
            ),
            panel(
                "p3c",
                f"Warm {EGG} pulsing, light pointing toward old folded map on crate.",
                [balloon("sfx", None, "pulse…", 50, 50)],
            ),
            panel(
                "p3d",
                "Map corner unfolds toward a marked fortress glyph — Gate route awakening.",
                [
                    balloon("narration", None, "The egg does not argue. It points.", 50, 75, maxWidthPct=40),
                ],
            ),
        ],
        characters=["mira-eggwarden", "nira-quill"],
        creatures=["spark", "dormant-egg", "bramblefox"],
        continuity=cont(3, {"accusation": "nira-incomplete", "egg": "points-to-gate"}),
        requiredMoments=[2, 3, 4],
        pageTurn="The Gate named.",
        atmosphere="night",
        artifacts=["dormant-riftborn-egg", "gate-map"],
    )
)

story.append(
    page_base(
        4,
        "Named Gate",
        "Map reveals Traitor's Gate; Cael recognizes and warns about intent recording.",
        "three-stack",
        [
            panel(
                "p4a",
                "Close on map label zone empty for lettering bake — ancient fortress between fractured regions; cyan route line.",
                [
                    balloon("caption", None, "TRAITOR'S GATE", 50, 40, maxWidthPct=50),
                    balloon("speech", "Mira Eggwarden", "That's where the token wants us.", 50, 75, "up"),
                ],
            ),
            panel(
                "p4b",
                f"{CAEL} recognizes the mark; half-mask tilting; genuine fear mixed with guilt.",
                [
                    balloon(
                        "speech",
                        "Cael Vesper",
                        "That Gate records intent as well as name.",
                        50,
                        30,
                        "down",
                        maxWidthPct=42,
                    ),
                    balloon("whisper", "Cael Vesper", "It remembers who lied.", 50, 70),
                ],
            ),
            panel(
                "p4c",
                f"{AURELIA} gathers selective ledgers; Nira packs; Mira cradles egg; Spark steady.",
                [
                    balloon("speech", "Aurelia Voss", "I will open the road. Not the verdict.", 50, 35, "down", maxWidthPct=40),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper", "aurelia-voss", "nira-quill"],
        creatures=["spark", "dormant-egg"],
        continuity=cont(4, {"destination": "traitors-gate", "cael": "warns-intent"}),
        requiredMoments=[4, 5],
        pageTurn="Travel under tension.",
        atmosphere="dusk",
        locations=["Gilded Crossroads", "Traitor's Gate (map)"],
        codexLinks=["traitors-gate"],
    )
)

story.append(
    page_base(
        5,
        "Quiet Roads",
        "Travel montage; team divided; companions reflect tension.",
        "four-strip",
        [
            panel(
                "p5a",
                "Fractured terrain ridge: party small against black chasm fog; cyan underlights.",
                [balloon("narration", None, "Suspicion makes every mile longer.", 50, 20, maxWidthPct=45)],
            ),
            panel(
                "p5b",
                f"{NIRA} walking alone ahead; Bramblefox glancing back protectively.",
                [balloon("creature", "Bramblefox", "*guard-scent*", 50, 70, "up")],
            ),
            panel(
                "p5c",
                f"{CAEL} adjusting lantern clasps; transmitter bulge unseen in companion-care pouch.",
                [balloon("thought", "Cael Vesper", "Just reach the Gate. Then they free you.", 50, 35, maxWidthPct=40)],
            ),
            panel(
                "p5d",
                f"{MIRA} and {SPARK} with egg between them; Mossprig close; quiet bond.",
                [balloon("speech", "Mira Eggwarden", "We keep the egg. We keep each other.", 50, 70, "up", maxWidthPct=38)],
            ),
        ],
        characters=["mira-eggwarden", "nira-quill", "cael-vesper"],
        creatures=["spark", "bramblefox", "mossprig", "dormant-egg"],
        continuity=cont(5, {"location": "fractured-approach", "team": "divided"}),
        requiredMoments=[5],
        pageTurn="Something follows.",
        atmosphere="day",
        locations=["Fractured Approaches"],
        layout_type_override="four-strip",
    )
)
# fix layout type for page 5
story[-1]["layout"] = {"type": "four-strip", "panelCount": 4}

story.append(
    page_base(
        6,
        "Fog Scouts",
        "Bramblefox detects pursuit; Meridian scout vanishes into Rift fog.",
        "two-col",
        [
            panel(
                "p6a",
                "Bramblefox frozen, nose to wind, bramble fur raised; Mira signals halt; Thornling on pack.",
                [
                    balloon("creature", "Bramblefox", "*track-alert*", 40, 30, "down"),
                    balloon("speech", "Mira Eggwarden", "We're not alone.", 60, 70, "up"),
                ],
            ),
            panel(
                "p6b",
                "Distant Meridian scout silhouette dissolves into cyan-violet Rift fog; Spirit Moth signals warning flickers.",
                [
                    balloon("sfx", None, "FOG-HUSH", 50, 40),
                    balloon("creature", "Spirit Moth", "*warn-flash*", 70, 65, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden"],
        creatures=["bramblefox", "spirit-moth", "thornling", "spark"],
        continuity=cont(6, {"surveillance": "meridian-scout"}),
        requiredMoments=[5, 6],
        pageTurn="The Gate appears.",
        atmosphere="rift",
        locations=["Fractured Approaches"],
    )
)

story.append(
    page_base(
        7,
        "Twin Towers",
        "Full reveal of Traitor's Gate across black chasm; guardian statues awaken.",
        "splash",
        [
            panel(
                "p7a",
                f"Epic splash: Traitor's Gate — twin ancient black-stone towers, suspended central portal cyan-violet, companion-shaped guardian statues awakening, Rift bridges, low fog, light under floor. Foreground party tiny: {MIRA}, Spark, egg, Nira, Cael, Aurelia, companions. Balloon-safe top.",
                [
                    balloon("narration", None, "Built to catch infiltrators. Remembered every betrayal.", 50, 10, maxWidthPct=55),
                    balloon("speech", "Aurelia Voss", "Passage has a price. Truth is currency.", 35, 80, "up", maxWidthPct=34),
                    balloon("sfx", None, "STONE-WAKE", 70, 55),
                ],
            )
        ],
        characters=["mira-eggwarden", "cael-vesper", "nira-quill", "aurelia-voss"],
        creatures=["spark", "bramblefox", "mossprig", "truthwing", "dormant-egg"],
        continuity=cont(7, {"location": "traitors-gate-exterior", "statues": "awake"}),
        requiredMoments=[5, 6],
        pageTurn="Enter verification.",
        atmosphere="rift",
        locations=["Traitor's Gate"],
        environment="Traitor's Gate exterior chasm",
        lighting="black towers cyan portal glow",
        codexLinks=["traitors-gate", "oathwarden-seraph"],
    )
)

story.append(
    page_base(
        8,
        "Declarations",
        "Verification chamber; Gate demands name, bond, purpose, oath, keys.",
        "grid-2x2",
        [
            panel(
                "p8a",
                "Identity-verification chamber: rotating lock rings, Keeper oath inscriptions (shapes only), Resonance locks; party inside.",
                [
                    balloon("magic", "Gate", "NAME. BOND. PURPOSE. OATH. KEYS.", 50, 25, maxWidthPct=45),
                ],
            ),
            panel(
                "p8b",
                f"{MIRA} declares; symbol of Compact lantern forms in air; Spark voluntary glow answers.",
                [
                    balloon("speech", "Mira Eggwarden", "Mira Eggwarden. Keeper by Compact.", 40, 30, "down"),
                    balloon("creature", "Spark", "*bond-yes*", 65, 65, "up"),
                ],
            ),
            panel(
                "p8c",
                f"{NIRA} states purpose: stop Meridian theft — symbol flickers but holds.",
                [balloon("speech", "Nira Quill", "Purpose: cut the leash I once wore.", 50, 40, "down", maxWidthPct=38)],
            ),
            panel(
                "p8d",
                f"{TRUTHWING} glides from statue alcove, lands near Spark — Clear Reflection shimmer.",
                [
                    balloon("creature", "Truthwing", "*clear-chime*", 50, 35, "down"),
                    balloon("narration", None, "A Gate companion answers honesty with light.", 50, 75, maxWidthPct=42),
                ],
            ),
        ],
        characters=["mira-eggwarden", "nira-quill", "cael-vesper", "aurelia-voss"],
        creatures=["spark", "truthwing", "dormant-egg"],
        continuity=cont(8, {"location": "verification-chamber", "truthwing": "introduced"}),
        requiredMoments=[6, 7],
        pageTurn="A declaration fails.",
        atmosphere="rift",
        locations=["Traitor's Gate — Verification Chamber"],
        cardTeases=["truthwing-clear-reflection"],
    )
)

story.append(
    page_base(
        9,
        "Failed Mask",
        "Cael's declaration fails; admits old Gate transport of forbidden Riftborn records.",
        "three-stack",
        [
            panel(
                "p9a",
                f"{CAEL}'s declaration symbol cracks; lock rings reject; half-mask reflects red warning runes.",
                [
                    balloon("sfx", None, "REJECT", 50, 30),
                    balloon("magic", "Gate", "CONCEALED INTENT.", 50, 55, maxWidthPct=40),
                ],
            ),
            panel(
                "p9b",
                f"{CAEL} removes half-mask slightly; shame; Mira and Aurelia watch.",
                [
                    balloon(
                        "speech",
                        "Cael Vesper",
                        "I used this Gate once — to move forbidden Riftborn records.",
                        50,
                        30,
                        "down",
                        maxWidthPct=44,
                    ),
                    balloon("speech", "Cael Vesper", "I called it protection. The Gate called it theft.", 50, 70, "up", maxWidthPct=44),
                ],
            ),
            panel(
                "p9c",
                f"Suspicion shifts: Nira glances between Mira and Cael; Spark resonance torn.",
                [
                    balloon("speech", "Mira Eggwarden", "Secrecy and betrayal aren't the same. Prove which this is.", 50, 40, "down", maxWidthPct=42),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper", "nira-quill", "aurelia-voss"],
        creatures=["spark", "truthwing"],
        continuity=cont(9, {"cael": "admits-old-gate-use", "suspicion": "shifts-to-cael"}),
        requiredMoments=[7],
        pageTurn="Merchant withholds.",
        atmosphere="rift",
        locations=["Traitor's Gate — Verification Chamber"],
    )
)

story.append(
    page_base(
        10,
        "Withheld Memory",
        "Aurelia refuses one memory; Oathwarden Seraph activates.",
        "two-col",
        [
            panel(
                "p10a",
                f"{AURELIA} hand raised refusing a memory-mirror pull; Lockjaw Wisp Closed Contract stance; Mira tense.",
                [
                    balloon(
                        "speech",
                        "Aurelia Voss",
                        "One memory stays mine. Sell everything else — not that.",
                        50,
                        30,
                        "down",
                        maxWidthPct=42,
                    ),
                    balloon("creature", "Lockjaw Wisp", "*contract-lock*", 60, 70, "up"),
                ],
            ),
            panel(
                "p10b",
                f"{SERAPH} materializes — towering, judgment spear, orbiting mirrors, cyan oath flame; chamber seals.",
                [
                    balloon(
                        "speech",
                        "Oathwarden Seraph",
                        "Concealed intent may close the Gate permanently.",
                        50,
                        25,
                        "down",
                        maxWidthPct=44,
                    ),
                    balloon("sfx", None, "LOCK-RING", 50, 70),
                ],
            ),
        ],
        characters=["mira-eggwarden", "aurelia-voss", "oathwarden-seraph"],
        creatures=["lockjaw-wisp", "spark", "truthwing"],
        continuity=cont(10, {"oathwarden": "active", "aurelia": "withholds-memory"}),
        requiredMoments=[8, 9],
        pageTurn="Mirrors lie.",
        atmosphere="rift",
        locations=["Traitor's Gate — Command Hall"],
        cardTeases=["oathwarden-mirror-verdict"],
    )
)

story.append(
    page_base(
        11,
        "Mirror Case",
        "Memory mirrors show Nira meeting Meridian; Mira nearly convinced.",
        "three-stack",
        [
            panel(
                "p11a",
                "Cracked memory mirrors flare; false image of Nira meeting Meridian agents with transmission token.",
                [
                    balloon("sfx", None, "MIRROR-HISS", 50, 25),
                    balloon("speech", "Mira Eggwarden", "There. That's you.", 40, 70, "up"),
                ],
            ),
            panel(
                "p11b",
                f"{NIRA} shaking head; Bramblefox snarls at mirror not at her.",
                [
                    balloon("speech", "Nira Quill", "I met them to steal files — not feed them.", 50, 35, "down", maxWidthPct=40),
                    balloon("creature", "Bramblefox", "*false-scent*", 65, 70, "up"),
                ],
            ),
            panel(
                "p11c",
                f"{MIRA} hurt-closed expression; egg dim; Spark distressed between Mira and Nira.",
                [
                    balloon("thought", "Mira Eggwarden", "If she's lying, I've already failed them.", 50, 40, maxWidthPct=40),
                ],
            ),
        ],
        characters=["mira-eggwarden", "nira-quill"],
        creatures=["spark", "bramblefox", "wisplet", "dormant-egg"],
        continuity=cont(11, {"mirrors": "false-nira", "mira": "nearly-convinced"}),
        requiredMoments=[10, 2],
        pageTurn="Wisplet enters.",
        atmosphere="rift",
        locations=["Traitor's Gate — Memory Mirrors"],
    )
)

story.append(
    page_base(
        12,
        "Fabricated Light",
        "Wisplet finds altered memory; real transmission came from someone nearby.",
        "grid-2x2",
        [
            panel(
                "p12a",
                "Wisplet phases into mirror surface; cyan ghost-trail; Truthwing Clear Reflection assists.",
                [
                    balloon("creature", "Wisplet", "*phase-in*", 40, 40, "down"),
                    balloon("creature", "Truthwing", "*clear-reflection*", 65, 55, "up"),
                ],
            ),
            panel(
                "p12b",
                "Inside mirror: seams of rewritten light; Nira face peeled to reveal composite splice.",
                [
                    balloon("magic", "Wisplet", "FAKE JOIN", 50, 30),
                    balloon("sfx", None, "rip…", 70, 60),
                ],
            ),
            panel(
                "p12c",
                "Corrected memory silhouette: transmitter held by figure in lantern-clasp coat standing near earlier events.",
                [
                    balloon("speech", "Mira Eggwarden", "It wasn't her hand.", 50, 40, "down"),
                ],
            ),
            panel(
                "p12d",
                f"Team stares; {CAEL} goes still; Thornling already sniffing packs.",
                [
                    balloon("narration", None, "The Gate does not invent guilt. Someone fed it a costume.", 50, 70, maxWidthPct=45),
                ],
            ),
        ],
        characters=["mira-eggwarden", "nira-quill", "cael-vesper"],
        creatures=["wisplet", "truthwing", "thornling", "spark"],
        continuity=cont(12, {"mirrors": "debunked", "suspect": "nearby-ally"}),
        requiredMoments=[11, 12],
        pageTurn="The device.",
        atmosphere="rift",
        locations=["Traitor's Gate — Memory Mirrors"],
    )
)

story.append(
    page_base(
        13,
        "In the Kit",
        "Thornling finds Meridian transmitter in Cael's companion-care kit; Cael breaks.",
        "three-stack",
        [
            panel(
                "p13a",
                "Thornling pulls small Meridian signal device from Cael's lantern-marked companion-care pouch — identical to #6 token tech.",
                [
                    balloon("creature", "Thornling", "*found!*", 40, 30, "down"),
                    balloon("sfx", None, "CLICK", 60, 55),
                ],
            ),
            panel(
                "p13b",
                f"Wide: device glowing three-arc Meridian sigil; {CAEL} sees it and crumples emotionally; Mira frozen; Nira eyes widen.",
                [
                    balloon("speech", "Cael Vesper", "Don't— please. Not like this.", 50, 30, "down", maxWidthPct=38),
                    balloon("speech", "Mira Eggwarden", "Cael.", 70, 70, "up"),
                ],
            ),
            panel(
                "p13c",
                f"Close on {CAEL} tears under half-mask; Spark resonance aching; egg pulsing hard.",
                [
                    balloon("whisper", "Cael Vesper", "They have Lumenhare.", 50, 45, maxWidthPct=36),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper", "nira-quill", "aurelia-voss"],
        creatures=["thornling", "spark", "dormant-egg"],
        continuity=cont(13, {"traitor": "cael-revealed", "captive": "lumenhare", "device": "found"}),
        requiredMoments=[12, 13, 14],
        pageTurn="Confession.",
        atmosphere="rift",
        locations=["Traitor's Gate — Verification Chamber"],
        artifacts=["traitor-transmitter"],
        lettering="Emotional restraint; short lines; tails clear of tears.",
    )
)

story.append(
    page_base(
        14,
        "What I Gave Them",
        "Cael confesses: threats, leaks, start point, disasters never intended.",
        "three-stack",
        [
            panel(
                "p14a",
                f"{CAEL} kneeling; confession without theatrics; Mira standing, hurt-controlled; Nira listening.",
                [
                    balloon(
                        "speech",
                        "Cael Vesper",
                        "They took Lumenhare after the market tore. Said cooperation would stop another tear.",
                        50,
                        28,
                        "down",
                        maxWidthPct=46,
                    ),
                ],
            ),
            panel(
                "p14b",
                "Inset flashes (no text): route maps, Tempestria crest, egg token — visual timeline of leaks.",
                [
                    balloon(
                        "speech",
                        "Cael Vesper",
                        "I gave routes first. Then doors. Then… that you had the egg.",
                        50,
                        30,
                        "down",
                        maxWidthPct=44,
                    ),
                    balloon("speech", "Cael Vesper", "I never meant for anyone to die.", 50, 70, "up", maxWidthPct=40),
                ],
            ),
            panel(
                "p14c",
                f"{MIRA} silence; Spark presses against Cael's knee without absolution; Aurelia cold-precise.",
                [
                    balloon("speech", "Aurelia Voss", "Intent does not refund the sold road.", 50, 35, "down", maxWidthPct=40),
                    balloon("creature", "Spark", "*hurt-warm*", 60, 70, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper", "nira-quill", "aurelia-voss"],
        creatures=["spark", "dormant-egg"],
        continuity=cont(14, {"confession": "complete", "forgiveness": "not-yet"}),
        requiredMoments=[14],
        pageTurn="Meridian strikes.",
        atmosphere="rift",
        locations=["Traitor's Gate — Verification Chamber"],
    )
)

story.append(
    page_base(
        15,
        "Lockdown",
        "Seris activates transmitter; Meridian forces emerge; Gate seals exits.",
        "grid-2x2",
        [
            panel(
                "p15a",
                f"{SERIS} steps from hidden tunnel, remote-activating Cael's transmitter; three-arc glow.",
                [
                    balloon("speech", "Seris Vale", "Thank you for delivering both keys.", 50, 30, "down", maxWidthPct=40),
                    balloon("sfx", None, "PING", 70, 60),
                ],
            ),
            panel(
                "p15b",
                "Meridian soldiers and controlled creatures pour from maintenance tunnels; Spirit Moth alarms.",
                [
                    balloon("shout", "Mira Eggwarden", "Positions!", 40, 35),
                    balloon("creature", "Spirit Moth", "*ALARM*", 65, 55, "up"),
                ],
            ),
            panel(
                "p15c",
                f"{SERAPH} lock rings slam; all exits seal; red warning runes race along bridges.",
                [
                    balloon("speech", "Oathwarden Seraph", "Exits sealed. Testimony incomplete.", 50, 40, "down", maxWidthPct=42),
                ],
            ),
            panel(
                "p15d",
                f"{CAEL} reaches for device in horror; Seris smiles without warmth.",
                [
                    balloon("speech", "Seris Vale", "Finish the opening. Or watch the hare dim.", 50, 50, "down", maxWidthPct=40),
                ],
            ),
        ],
        characters=["mira-eggwarden", "seris-vale", "cael-vesper", "oathwarden-seraph"],
        creatures=["spirit-moth", "spark", "cindermink"],
        continuity=cont(15, {"siege": "begun", "exits": "sealed"}),
        requiredMoments=[15, 16],
        pageTurn="Dual keys.",
        atmosphere="rift",
        locations=["Traitor's Gate — Upper Bridge"],
    )
)

story.append(
    page_base(
        16,
        "Dual Keys",
        "Seris names Spark and egg as keys; attempts seize; Oathwarden partially overridden.",
        "three-stack",
        [
            panel(
                "p16a",
                f"{SERIS} raises Lost City command component; capture beams toward Spark and egg.",
                [
                    balloon(
                        "speech",
                        "Seris Vale",
                        "Resonance Keeper. Secondary egg. Dual keys.",
                        50,
                        28,
                        "down",
                        maxWidthPct=42,
                    ),
                ],
            ),
            panel(
                "p16b",
                f"{SERAPH} armor corruption spreads on one side; Mirror Verdict glitching; floating rings stutter.",
                [
                    balloon("speech", "Oathwarden Seraph", "Unauthorized identity key—", 50, 40, "down", maxWidthPct=40),
                    balloon("sfx", None, "GLITCH", 70, 65),
                ],
            ),
            panel(
                "p16c",
                f"{SPARK} dodging resonance chains; Mira shielding egg; Cindermink snarls at restraints.",
                [
                    balloon("creature", "Cindermink", "*chain-hate*", 35, 70, "up"),
                    balloon("speech", "Mira Eggwarden", "They are not keys.", 65, 35, "down"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "seris-vale", "oathwarden-seraph"],
        creatures=["spark", "cindermink", "dormant-egg"],
        continuity=cont(16, {"oathwarden": "partial-override", "egg": "targeted"}),
        requiredMoments=[15, 16, 17],
        pageTurn="Bulwark and hunt.",
        atmosphere="rift",
        artifacts=["lost-city-rift-component", "meridian-identity-key"],
    )
)

story.append(
    page_base(
        17,
        "Bulwark Bridge",
        "Mossprig Living Bulwark protects egg; Bramblefox hunts infiltrators on bridge.",
        "two-col",
        [
            panel(
                "p17a",
                "Mossprig Living Bulwark dome over Mira and dormant egg; capture beam shatters on green shield; egg cracks once under stress.",
                [
                    balloon("creature", "Mossprig", "*BULWARK*", 45, 30, "down"),
                    balloon("sfx", None, "CRACK", 60, 55),
                    balloon("narration", None, "One seam opens. An eye does not — yet.", 50, 80, maxWidthPct=40),
                ],
            ),
            panel(
                "p17b",
                "Bramblefox races narrow upper bridge, tackling Meridian infiltrators; cyan fog below void.",
                [
                    balloon("creature", "Bramblefox", "*tackled!*", 50, 35, "down"),
                    balloon("sfx", None, "SCRAPE", 70, 60),
                ],
            ),
        ],
        characters=["mira-eggwarden"],
        creatures=["mossprig", "bramblefox", "spark", "dormant-egg"],
        continuity=cont(17, {"egg": "cracked-once", "mossprig": "bulwark", "bramblefox": "bridge-hunt"}),
        requiredMoments=[17, 18],
        pageTurn="Siege spreads.",
        atmosphere="rift",
        locations=["Traitor's Gate — Upper Bridge"],
        cardTeases=["mossprig-living-bulwark"],
    )
)

story.append(
    page_base(
        18,
        "Gate of Consequence",
        "Major siege spread: companions battle; Oathwarden towers; Cael caught between sides.",
        "splash",
        [
            panel(
                "p18a",
                f"Cinematic battle splash across Gate: {SPARK} dodging resonance chains; Bramblefox on walkways; Mossprig shielding; Thornling in circuit guts; Wisplet through mirrors; Spirit Moth revealing hidden soldiers; Cindermink burning restraints; Meridian beasts; {SERAPH} towering Gate of Consequence; {CAEL} mid-bridge between Mira and Seris; {TRUTHWING} Unmasked Sky shimmer. Empty balloon corners.",
                [
                    balloon("shout", "Seris Vale", "Open it!", 20, 20),
                    balloon("creature", "Spark", "*refuse-chain*", 55, 30, "down"),
                    balloon("speech", "Oathwarden Seraph", "Gate of Consequence.", 75, 18, "down", maxWidthPct=30),
                    balloon("sfx", None, "CLASH", 40, 55),
                    balloon("sfx", None, "RING-BOOM", 65, 70),
                ],
            )
        ],
        characters=["mira-eggwarden", "seris-vale", "cael-vesper", "oathwarden-seraph", "nira-quill"],
        creatures=[
            "spark",
            "bramblefox",
            "mossprig",
            "thornling",
            "wisplet",
            "spirit-moth",
            "cindermink",
            "truthwing",
            "dormant-egg",
        ],
        continuity=cont(18, {"battle": "peak", "cael": "between-sides"}),
        requiredMoments=[18],
        pageTurn="The captive shown.",
        atmosphere="rift",
        locations=["Traitor's Gate — Battlefield"],
        lettering="Sparse balloons; big SFX; leave art readable.",
    )
)

story.append(
    page_base(
        19,
        "Beyond the Seal",
        "Seris reveals captive Lumenhare; orders Cael to finish opening.",
        "three-stack",
        [
            panel(
                "p19a",
                f"Projection / portal glimpse: {LUMEN} in restraint cradle beyond Gate, dimmed lantern marks, Meridian chains.",
                [
                    balloon("creature", "Lumenhare", "*weak-pulse*", 50, 40, "down"),
                    balloon("sfx", None, "chain-rattle", 70, 65),
                ],
            ),
            panel(
                "p19b",
                f"{SERIS} calm; {CAEL} devastated; Mira seeing the leverage clearly.",
                [
                    balloon(
                        "speech",
                        "Seris Vale",
                        "Finish the opening, Lanternmaster. Or the light goes out.",
                        50,
                        30,
                        "down",
                        maxWidthPct=44,
                    ),
                ],
            ),
            panel(
                "p19c",
                f"{NIRA} understanding coercion firsthand; hand on Cael's shoulder without absolution.",
                [
                    balloon("speech", "Nira Quill", "I know that leash. Cut it — or it owns you.", 50, 45, "down", maxWidthPct=40),
                ],
            ),
        ],
        characters=["mira-eggwarden", "seris-vale", "cael-vesper", "nira-quill"],
        creatures=["lumenhare", "spark"],
        continuity=cont(19, {"captive": "shown", "leverage": "active"}),
        requiredMoments=[19],
        pageTurn="Mira chooses.",
        atmosphere="rift",
        locations=["Traitor's Gate — Lower Gate glimpse"],
    )
)

story.append(
    page_base(
        20,
        "All Three",
        "Mira refuses sacrifice logic; chooses rescue + protect eggs + stop Gate abuse via teamwork.",
        "three-stack",
        [
            panel(
                "p20a",
                f"{MIRA} centered, egg in arm, Spark at side — leadership without revenge face.",
                [
                    balloon(
                        "speech",
                        "Mira Eggwarden",
                        "We stop the Gate abuse. We protect the eggs. We bring Lumenhare home.",
                        50,
                        30,
                        "down",
                        maxWidthPct=46,
                    ),
                    balloon("speech", "Mira Eggwarden", "Not one life as payment.", 50, 70, "up", maxWidthPct=36),
                ],
            ),
            panel(
                "p20b",
                "Companions align: Mossprig, Bramblefox, Wisplet, Thornling, Cindermink, Truthwing — voluntary circle.",
                [balloon("creature", "Spark", "*together*", 50, 50, "down")],
            ),
            panel(
                "p20c",
                f"{CAEL} looks up — expects rejection, receives a mission instead.",
                [
                    balloon("speech", "Mira Eggwarden", "Help us. Then answer for the roads you sold.", 50, 40, "down", maxWidthPct=42),
                    balloon("whisper", "Cael Vesper", "…Thank you is the wrong word.", 50, 75),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper"],
        creatures=["spark", "mossprig", "bramblefox", "wisplet", "thornling", "cindermink", "truthwing", "dormant-egg"],
        continuity=cont(20, {"mira": "rescue-choice", "trust": "conditional"}),
        requiredMoments=[20],
        pageTurn="Truth in the Gate.",
        atmosphere="rift",
    )
)

story.append(
    page_base(
        21,
        "Never Release",
        "Spark enters Gate memory; reveals Meridian never planned to free captive; Cael turns.",
        "two-col",
        [
            panel(
                "p21a",
                f"{SPARK} enters memory-light lattice with Truthwing; records show disposal order for Lumenhare and Cael.",
                [
                    balloon("magic", "Gate Memory", "ASSET DISPOSAL — AFTER OPENING", 50, 25, maxWidthPct=42),
                    balloon("creature", "Spark", "*liar-light!*", 55, 70, "up"),
                ],
            ),
            panel(
                "p21b",
                f"{CAEL} fury and grief; turns spear of lantern-light toward Seris; no longer compliant.",
                [
                    balloon(
                        "speech",
                        "Cael Vesper",
                        "You never meant to free them.",
                        45,
                        30,
                        "down",
                        maxWidthPct=38,
                    ),
                    balloon("shout", "Cael Vesper", "I'm done opening your doors!", 55, 70, "up", maxWidthPct=36),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper", "seris-vale"],
        creatures=["spark", "truthwing", "lumenhare"],
        continuity=cont(21, {"cael": "turns-against-meridian", "lie": "exposed"}),
        requiredMoments=[21, 22],
        pageTurn="Key breaks.",
        atmosphere="rift",
    )
)

story.append(
    page_base(
        22,
        "Break the Key",
        "Cael destroys Meridian identity key; coordinated rescue; egg cracks once more.",
        "splash",
        [
            panel(
                "p22a",
                f"Action splash: {CAEL} shattering Meridian identity key; Mossprig holding collapsing bridge; Bramblefox smashing restraint relay; Wisplet freeing {LUMEN} through barrier; {SPARK} restoring voluntary bond lock cyan-gold; {EGG} cracks once revealing faint eye-glow silhouette hint — not full hatch; Nira covering retreat; Cindermink burning chains.",
                [
                    balloon("sfx", None, "SHATTER", 30, 25),
                    balloon("creature", "Lumenhare", "*breath!*", 70, 40, "down"),
                    balloon("creature", "Mossprig", "*hold!*", 25, 60, "up"),
                    balloon("creature", "Spark", "*lock-true*", 55, 70, "up"),
                    balloon("sfx", None, "egg-CRACK", 80, 75),
                ],
            )
        ],
        characters=["mira-eggwarden", "cael-vesper", "nira-quill", "seris-vale"],
        creatures=["spark", "mossprig", "bramblefox", "wisplet", "lumenhare", "cindermink", "dormant-egg"],
        continuity=cont(22, {"identity-key": "destroyed", "lumenhare": "freed", "egg": "eye-hint"}),
        requiredMoments=[22, 19, 20],
        pageTurn="Judgment.",
        atmosphere="rift",
        artifacts=["meridian-identity-key"],
    )
)

story.append(
    page_base(
        23,
        "Voluntary Passage",
        "Oathwarden rejects Meridian auth; recognizes voluntary bonds; Seris retreats lower route.",
        "three-stack",
        [
            panel(
                "p23a",
                f"{SERAPH} corruption recedes; cyan oath flame steadies; Mirror Verdict clears.",
                [
                    balloon(
                        "speech",
                        "Oathwarden Seraph",
                        "Meridian authorization rejected. Bonds acted by choice.",
                        50,
                        30,
                        "down",
                        maxWidthPct=46,
                    ),
                ],
            ),
            panel(
                "p23b",
                f"{SERIS} retreating into lower sealed route with Lost City component; furious controlled exit.",
                [
                    balloon("speech", "Seris Vale", "Keep your Gate. The Forge will not need it.", 50, 40, "down", maxWidthPct=42),
                    balloon("sfx", None, "tunnel-ROAR", 70, 65),
                ],
            ),
            panel(
                "p23c",
                f"{MIRA} to {CAEL}: accountability without abandonment; Lumenhare weak in Cael's arms; Nira nods once.",
                [
                    balloon("speech", "Mira Eggwarden", "You travel with us. Under watch. Under truth.", 50, 35, "down", maxWidthPct=42),
                    balloon("whisper", "Cael Vesper", "I will not ask for trust. Only the road.", 50, 75, maxWidthPct=38),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper", "seris-vale", "oathwarden-seraph", "nira-quill"],
        creatures=["lumenhare", "spark", "truthwing"],
        continuity=cont(23, {"seris": "retreated", "cael": "supervised", "passage": "allowed"}),
        requiredMoments=[23],
        pageTurn="The Gate opens.",
        atmosphere="rift",
    )
)

story.append(
    page_base(
        24,
        "Road Beneath",
        "Gate opens to vast Meridian roadway toward artificial Rift fortress; Riftwright project hinted.",
        "two-col",
        [
            panel(
                "p24a",
                "Suspended portal fully opens; vast underground Meridian roadway toward fortress ringed around artificial Rift glow.",
                [
                    balloon("narration", None, "Beyond judgment: a road built to remake the tear.", 50, 20, maxWidthPct=45),
                    balloon("sfx", None, "GATE-OPEN", 50, 55),
                ],
            ),
            panel(
                "p24b",
                "Recovered record glyphs / Echoquill projection: Riftwright next project schematic — empty containment rows, growing core — no readable English in art.",
                [
                    balloon("speech", "Aurelia Voss", "Their architect's next ledger… is a forge.", 50, 30, "down", maxWidthPct=40),
                    balloon("creature", "Echoquill", "*archive-warn*", 65, 70, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "aurelia-voss", "cael-vesper"],
        creatures=["spark", "echoquill", "dormant-egg", "lumenhare", "truthwing"],
        continuity=cont(24, {"gate": "open", "destination": "forge-of-rifts"}),
        requiredMoments=[24, 25],
        pageTurn="Cliffhanger.",
        atmosphere="rift",
        locations=["Traitor's Gate — Lower Route", "Meridian Roadway"],
    )
)

story.append(
    page_base(
        25,
        "Second Creation",
        "Cliffhanger: subterranean city, empty containment chambers, artificial egg/core; masked figure; Forge of Rifts.",
        "splash",
        [
            panel(
                "p25a",
                "Full splash cliffhanger: subterranean city around colossal machine; rows of empty companion containment chambers; growing artificial egg/core at center; masked Riftwright-adjacent figure watches from high gantry; tiny inset of Mira's team on Gate threshold. Empty zones for final lines.",
                [
                    balloon("narration", None, "Begin the second creation.", 50, 18, maxWidthPct=50),
                    balloon("caption", None, "NEXT: THE FORGE OF RIFTS", 50, 88, maxWidthPct=55),
                    balloon("sfx", None, "core-HUM", 50, 55),
                ],
            )
        ],
        characters=["riftwright-silhouette"],
        creatures=[],
        continuity=cont(25, {"teaser": "the-forge-of-rifts", "cliffhanger": "second-creation"}),
        requiredMoments=[25],
        pageTurn="End Issue #7.",
        atmosphere="rift",
        locations=["Forge of Rifts (teaser)"],
        lighting="artificial rift core cyan-amber",
    )
)

assert len(story) == 25

# ── BOOK MATTER ─────────────────────────────────────────────
book: list[dict] = []

book.append(
    matter_page(
        1,
        "front-cover",
        "The Traitor's Gate — Cover",
        [
            panel(
                "cover",
                f"Premium cover: {MIRA} center holding hidden transmitter; {SPARK} protecting {EGG}; {NIRA} one side; {CAEL} opposite partly obscured; {SERAPH} towering above Gate; cracked memory mirrors with conflicting faces; {SERIS} beyond portal; Bramblefox, Mossprig, Wisplet battle-ready; black towers cyan-violet Rift. Empty title zones.",
                [
                    balloon("caption", None, "LEGENDS OF THE RIFT", 50, 8),
                    balloon("caption", None, "THE TRAITOR'S GATE", 50, 82),
                    balloon("caption", None, "ISSUE #7", 50, 92),
                ],
            )
        ],
        characters=["mira-eggwarden", "nira-quill", "cael-vesper", "seris-vale", "oathwarden-seraph"],
        creatures=["spark", "bramblefox", "mossprig", "wisplet", "dormant-egg"],
        atmosphere="rift",
        spoilerLevel="cover-safe",
    )
)

book.append(
    matter_page(
        2,
        "inside-cover",
        "Inside Front Cover",
        [
            panel(
                "ifc",
                "Quiet inside-cover: damaged market token, Compact lantern, Gate map scrap; soft cyan glow; empty invitation zone.",
                [
                    balloon(
                        "narration",
                        None,
                        "Previously: The Gilded Crossroads tore open. An egg was saved. A transmission named the next gate.",
                        50,
                        40,
                        maxWidthPct=60,
                    ),
                    balloon("caption", None, "CONTINUE THE FRACTURE DAWN", 50, 80),
                ],
            )
        ],
        atmosphere="dusk",
    )
)

book.append(
    matter_page(
        3,
        "credits",
        "Credits",
        [
            panel(
                "credits",
                "Workshop desk with black-stone Gate maquette, companion sketches of Truthwing and Oathwarden — no readable credit text in art.",
                [
                    balloon("caption", None, "THE TRAITOR'S GATE", 50, 14),
                    balloon(
                        "narration",
                        None,
                        "Story · Continuity · Lettering · Art Direction — Riftwilds Studio Pipeline. Keeper: Mira Eggwarden.",
                        50,
                        55,
                        maxWidthPct=58,
                    ),
                    balloon("caption", None, "ORIGINAL RIFTWILDS IP", 50, 85),
                ],
            )
        ],
        atmosphere="dusk",
    )
)

book.append(
    matter_page(
        4,
        "title",
        "Chapter Seven — The Traitor's Gate",
        [
            panel(
                "title",
                f"Title energy: {MIRA}, Spark, egg before twin Gate towers; empty center for title bake.",
                [
                    balloon("caption", None, "CHAPTER SEVEN", 50, 18),
                    balloon("caption", None, "THE TRAITOR'S GATE", 50, 34),
                    balloon(
                        "narration",
                        None,
                        "Trust is a bridge. Someone has been selling the planks.",
                        50,
                        75,
                        maxWidthPct=55,
                    ),
                ],
            )
        ],
        characters=["mira-eggwarden"],
        creatures=["spark", "dormant-egg"],
        atmosphere="rift",
    )
)

for i, sp in enumerate(story):
    bp = dict(sp)
    bp["pageNumber"] = 5 + i
    bp["storyPageNumber"] = i + 1
    book.append(bp)

book.append(
    matter_page(
        30,
        "teaser",
        "Next Issue — The Forge of Rifts",
        [
            panel(
                "teaser",
                "Teaser: artificial Rift core, empty containment rows, masked silhouette on gantry; empty title zone.",
                [
                    balloon("caption", None, "NEXT ISSUE", 50, 16),
                    balloon("narration", None, "They will not steal the world. They will rebuild it wrong.", 50, 48, maxWidthPct=55),
                    balloon("caption", None, "THE FORGE OF RIFTS", 50, 82),
                ],
            )
        ],
        atmosphere="rift",
    )
)

book.append(
    matter_page(
        31,
        "profile",
        "Character Profile — The Lanternmaster",
        [
            panel(
                "prof-traitor",
                f"Character profile plate: {CAEL} three-quarter portrait with cracked half-mask and dim lantern clasps; Lumenhare silhouette; empty text zones. (Post-issue back-matter.)",
                [
                    balloon("caption", None, "CAEL VESPER", 50, 12),
                    balloon(
                        "narration",
                        None,
                        "Lanternmaster. Ally. Traitor under coercion. Accountability is not the same as exile.",
                        50,
                        78,
                        maxWidthPct=55,
                    ),
                ],
            )
        ],
        characters=["cael-vesper"],
        creatures=["lumenhare"],
        atmosphere="dusk",
        spoilerLevel="post-completion",
    )
)

book.append(
    matter_page(
        32,
        "profile",
        "Companion Profile — Truthwing",
        [
            panel(
                "prof-tw",
                f"Companion profile: {TRUTHWING} front/side/three-quarter collage with Clear Reflection shimmer; empty ability zones.",
                [
                    balloon("caption", None, "TRUTHWING", 50, 12),
                    balloon(
                        "narration",
                        None,
                        "Clear Reflection · Oathlight · Unmasked Sky — Gate scout of concealed identities.",
                        50,
                        80,
                        maxWidthPct=55,
                    ),
                ],
            )
        ],
        creatures=["truthwing"],
        atmosphere="rift",
    )
)

book.append(
    matter_page(
        33,
        "lore",
        "Codex — The Traitor's Gate",
        [
            panel(
                "codex",
                "Codex plate: Gate diagram shapes — twin towers, suspended portal, memory mirrors, lower route — empty label zones.",
                [
                    balloon("caption", None, "CODEX: TRAITOR'S GATE", 50, 12),
                    balloon(
                        "narration",
                        None,
                        "Ancient Rift transit fortress. Judges identity, bond, and intent. Built as border, prison, and memorial to betrayal.",
                        50,
                        78,
                        maxWidthPct=58,
                    ),
                ],
            )
        ],
        atmosphere="rift",
        codexLinks=["traitors-gate"],
    )
)

book.append(
    matter_page(
        34,
        "lore",
        "Ability Spotlight — Mirror Verdict",
        [
            panel(
                "ability",
                f"{SERAPH} demonstrating Mirror Verdict — copying a betrayal gesture into mirrored light; empty ability text zones.",
                [
                    balloon("caption", None, "MIRROR VERDICT", 50, 12),
                    balloon(
                        "narration",
                        None,
                        "Reveal and temporarily copy one recent action, buff, or betrayal effect. Judgment without mercy — or favor.",
                        50,
                        80,
                        maxWidthPct=55,
                    ),
                ],
            )
        ],
        characters=["oathwarden-seraph"],
        atmosphere="rift",
        cardTeases=["oathwarden-mirror-verdict"],
    )
)

book.append(
    matter_page(
        35,
        "lore",
        "Evidence File — Transmission Timeline",
        [
            panel(
                "evidence",
                "In-universe evidence board: route pins Circus → Lost City → Tempestria → Crossroads → Gate; token sketches; empty detail zones for baked labels.",
                [
                    balloon("caption", None, "EVIDENCE FILE", 50, 10),
                    balloon(
                        "narration",
                        None,
                        "Leaks escalated from roads to doors to the egg. Motive: a captive companion. Promise: a lie.",
                        50,
                        78,
                        maxWidthPct=58,
                    ),
                ],
            )
        ],
        atmosphere="night",
        spoilerLevel="post-reveal",
    )
)

book.append(
    matter_page(
        36,
        "map",
        "World Map — Roads to the Gate",
        [
            panel(
                "map",
                "Painterly world map: Commons, Shellward Sanctum, Lanternveil, Aureth Vale, Tempestria, Gilded Crossroads, Traitor's Gate glowing, Forge of Rifts teaser mark. Empty label zones.",
                [
                    balloon(
                        "narration",
                        None,
                        "Commons → Circus → Lost City → Storm → Market → Gate → Forge",
                        50,
                        85,
                        maxWidthPct=55,
                    ),
                ],
            )
        ],
        atmosphere="dusk",
    )
)

book.append(
    matter_page(
        37,
        "letters",
        "Editor's Note — Trust & Leashes",
        [
            panel(
                "editor",
                "Quiet editor desk with Compact lantern and cracked mirror shard; warm light.",
                [
                    balloon("caption", None, "EDITOR'S NOTE", 50, 12),
                    balloon(
                        "narration",
                        None,
                        "Coercion explains. It does not erase. Forgiveness, if it comes, is a road — not a door that opens once.",
                        50,
                        55,
                        maxWidthPct=58,
                    ),
                    balloon("caption", None, "— Riftwilds Lore Desk", 50, 85),
                ],
            )
        ],
        atmosphere="dusk",
    )
)

book.append(
    matter_page(
        38,
        "inside-cover",
        "Inside Back Cover",
        [
            panel(
                "ibc",
                "Gate warning poster mood: oath rings, companion-bond seals, damaged text zone for bake.",
                [
                    balloon("caption", None, "PASSAGE REQUIRES TRUTH", 50, 18),
                    balloon(
                        "narration",
                        None,
                        "Keeper oath · Bond verification · No stolen identity keys · Beware altered memories.",
                        50,
                        50,
                        maxWidthPct=55,
                    ),
                    balloon("caption", None, "A false oath opens only one road.", 50, 82, maxWidthPct=50),
                ],
            )
        ],
        atmosphere="rift",
    )
)

book.append(
    matter_page(
        39,
        "back-cover",
        "Back Cover — Begin the Second Creation",
        [
            panel(
                "back",
                "Back cover: Gate silhouette opening onto artificial Rift glow; Mira and Spark tiny on threshold; egg crack glint; empty blurb zones.",
                [
                    balloon("caption", None, "THE TRAITOR'S GATE", 50, 12),
                    balloon(
                        "narration",
                        None,
                        "Suspicion named the wrong hunter. The Gate named the truth. Beyond it — a forge that wants a second world.",
                        50,
                        55,
                        maxWidthPct=55,
                    ),
                    balloon("caption", None, "ISSUE #7", 50, 88),
                ],
            )
        ],
        characters=["mira-eggwarden"],
        creatures=["spark", "dormant-egg"],
        atmosphere="rift",
        spoilerLevel="cover-safe",
    )
)

# Spoiler-safe public synopsis (no traitor name)
synopsis_public = (
    "After the Gilded Crossroads, suspicion fractures Mira Eggwarden's alliance. "
    "A dormant Riftborn egg pulls the team toward the Traitor's Gate — an ancient fortress that judges identity, bond, and intent. "
    "False accusations, memory mirrors, and a Meridian siege force impossible choices before a sealed road opens toward the Forge of Rifts."
)

synopsis_full = (
    synopsis_public
    + " Cael Vesper, coerced by the Meridian's captivity of Lumenhare, confesses and turns against his handlers. Trust is not instantly restored."
)

script = {
    "title": "The Traitor's Gate",
    "issueNumber": 7,
    "slug": "the-traitors-gate",
    "protagonist": "Mira Eggwarden",
    "synopsis": synopsis_full,
    "synopsisPublic": synopsis_public,
    "storyPageCount": 25,
    "requiredMoments": list(range(1, 26)),
    "themes": [
        "trust",
        "betrayal",
        "forgiveness",
        "manipulation",
        "loyalty under pressure",
        "chosen family",
        "secrecy vs deception",
        "accountability",
        "consequences of fear",
    ],
    "calReed": "NON-CANON — forbidden",
    "elaraVenn": "vision/counsel only — not present cast",
    "traitor": "Cael Vesper",
    "traitorCaptive": "Lumenhare",
    "gateWarden": "Oathwarden Seraph",
    "gateCompanion": "Truthwing",
    "nextIssue": "the-forge-of-rifts",
}


def main():
    for sub in (
        "pages",
        "prompts",
        "generated/raw-art",
        "generated/lettered-pages",
        "generated/thumbnails",
        "generated/covers",
        "reports",
        "references",
    ):
        (OUT / sub).mkdir(parents=True, exist_ok=True)

    (OUT / "script.json").write_text(json.dumps(script, indent=2) + "\n", encoding="utf-8")
    (OUT / "continuity.json").write_text(json.dumps({"pages": continuity_track}, indent=2) + "\n", encoding="utf-8")

    characters = {
        "cast": [
            {"id": "mira-eggwarden", "name": "Mira Eggwarden", "role": "Keeper protagonist"},
            {"id": "cael-vesper", "name": "Cael Vesper", "role": "Lanternmaster / coerced traitor", "spoiler": True},
            {"id": "nira-quill", "name": "Nira Quill", "role": "Uncertain hunter — falsely accused"},
            {"id": "aurelia-voss", "name": "Aurelia Voss", "role": "Gilded Merchant"},
            {"id": "seris-vale", "name": "Seris Vale", "role": "Meridian commander"},
            {"id": "oathwarden-seraph", "name": "Oathwarden Seraph", "role": "Gate guardian"},
            {"id": "elara-venn", "name": "Elara Venn", "role": "Vision/counsel only — not present"},
        ],
        "publicFeatured": [
            {"id": "mira-eggwarden", "name": "Mira Eggwarden", "role": "Keeper"},
            {"id": "nira-quill", "name": "Nira Quill", "role": "Hunter under suspicion"},
            {"id": "aurelia-voss", "name": "Aurelia Voss", "role": "Gilded Merchant"},
            {"id": "oathwarden-seraph", "name": "Oathwarden Seraph", "role": "Gate guardian"},
        ],
        "rejected": [{"id": "cal-reed", "note": "NON-CANON"}, {"id": "voltkit", "note": "legacy seed — not used"}],
    }
    (OUT / "characters.json").write_text(json.dumps(characters, indent=2) + "\n", encoding="utf-8")

    creatures = {
        "featured": [
            {"id": "spark", "name": "Spark", "note": "Resonance Line / Last Light"},
            {"id": "truthwing", "name": "Truthwing", "note": "See TRUTHWING_CANON_PROPOSAL.md"},
            {"id": "lumenhare", "name": "Lumenhare", "note": "Captive leverage — rescued"},
            {"id": "dormant-egg", "name": "Dormant Riftborn Egg", "note": "Warm; Gate-responsive; cracks twice max"},
            {"id": "bramblefox", "name": "Bramblefox", "purpose": "Track / protect Nira"},
            {"id": "mossprig", "name": "Mossprig", "purpose": "Living Bulwark"},
            {"id": "thornling", "name": "Thornling", "purpose": "Finds transmitter"},
            {"id": "wisplet", "name": "Wisplet", "purpose": "Mirror cleanse"},
            {"id": "spirit-moth", "name": "Spirit Moth", "purpose": "Warning lights"},
            {"id": "cindermink", "name": "Cindermink", "purpose": "Break restraints"},
            {"id": "lockjaw-wisp", "name": "Lockjaw Wisp", "purpose": "Merchant contracts"},
            {"id": "echoquill", "name": "Echoquill", "purpose": "Archive warn"},
        ]
    }
    (OUT / "creatures.json").write_text(json.dumps(creatures, indent=2) + "\n", encoding="utf-8")

    factions = {
        "factions": [
            {"id": "veiled-meridian", "name": "Veiled Meridian", "goal": "Open Gate; seize dual keys; reach Forge"},
            {"id": "lanternveil-circus", "name": "Lanternveil Traveling Circus", "status": "ally-compromised"},
            {"id": "gilded-merchant-network", "name": "Gilded Merchant Network", "status": "uneasy-ally"},
            {"id": "hatchery-compact", "name": "Hatchery Compact", "status": "established"},
            {"id": "gate-oath", "name": "Oathwarden Authority", "status": "awakened"},
        ]
    }
    (OUT / "factions.json").write_text(json.dumps(factions, indent=2) + "\n", encoding="utf-8")

    locations = {
        "locations": [
            {"id": "gilded-crossroads", "name": "Gilded Crossroads", "blurb": "Aftermath of portal collapse"},
            {"id": "fractured-approaches", "name": "Fractured Approaches", "blurb": "Road to the Gate"},
            {"id": "traitors-gate", "name": "Traitor's Gate", "blurb": "Ancient Rift transit fortress"},
            {"id": "verification-chamber", "name": "Verification Chamber", "blurb": "Identity and oath trials"},
            {"id": "memory-mirrors", "name": "Memory Mirrors", "blurb": "Can be fabricated"},
            {"id": "upper-bridge", "name": "Upper Bridge", "blurb": "Siege battlefield"},
            {"id": "lower-gate", "name": "Lower Gate", "blurb": "Sealed Meridian route"},
            {"id": "forge-of-rifts", "name": "Forge of Rifts", "blurb": "Issue #8 teaser"},
        ]
    }
    (OUT / "locations.json").write_text(json.dumps(locations, indent=2) + "\n", encoding="utf-8")

    artifacts = {
        "artifacts": [
            {"id": "dormant-riftborn-egg", "name": "Dormant Riftborn Egg", "status": "cracked; eye-hint; with Mira"},
            {"id": "hidden-token", "name": "Hidden Transmission Token", "status": "evidence"},
            {"id": "traitor-transmitter", "name": "Traitor Transmitter", "status": "found in Cael kit"},
            {"id": "meridian-identity-key", "name": "Meridian Identity Key", "status": "destroyed by Cael"},
            {"id": "lost-city-rift-component", "name": "Lost City Rift Component", "status": "with Seris"},
            {"id": "transmission-records", "name": "Merchant Transmission Records", "status": "partially misleading"},
        ]
    }
    (OUT / "artifacts.json").write_text(json.dumps(artifacts, indent=2) + "\n", encoding="utf-8")

    evidence = {
        "spoilerGate": "complete-issue-007",
        "timeline": [
            {"window": "post-issue-003", "leak": "circus approach roads", "source": "Cael Vesper"},
            {"window": "issue-004", "leak": "Lost City corridor hints", "source": "Cael Vesper"},
            {"window": "issue-005", "leak": "Tempestria approach confirmation", "source": "Cael Vesper"},
            {"window": "issue-006", "leak": "market customs; egg custody", "source": "Cael Vesper"},
            {"window": "issue-006-p25", "message": "The Keeper has the egg. Proceed to the next gate.", "recipient": "Cael Vesper"},
        ],
        "falseLead": {"suspect": "Nira Quill", "mechanism": "altered memory mirrors"},
        "leverage": {"captive": "Lumenhare", "holder": "Veiled Meridian"},
        "publicBlurb": "A transmission trail crosses four regions. The Gate will not accept a costume of guilt.",
    }
    (OUT / "evidence.json").write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")

    traitor_reveal = {
        "traitorId": "cael-vesper",
        "traitorName": "Cael Vesper",
        "revealStoryPage": 13,
        "confessionStoryPage": 14,
        "motivation": "coercion",
        "captive": "Lumenhare",
        "intendedDeaths": False,
        "redemption": "supervised travel; unfinished",
        "retroactiveClues": [
            "issue-003-lanternveil-moral-gray",
            "issue-005-prior-tempestria-negotiation",
            "issue-006-merchant-debt-and-p25-transmission",
        ],
        "spoilerSafeUntil": "issue-complete",
    }
    (OUT / "traitor-reveal.json").write_text(json.dumps(traitor_reveal, indent=2) + "\n", encoding="utf-8")

    covers = {
        "main": {"title": "The Traitor's Gate", "issue": 7, "prompt": book[0]["grokPrompt"]},
        "variant-a": {
            "label": "Traitor reflected in broken memory mirrors",
            "prompt": f"{STYLE} Variant cover A: {CAEL} reflected in multiple cracked memory mirrors, lantern clasps, guilt lighting. Empty title zones. NO text.",
            "spoiler": True,
        },
        "variant-b": {
            "label": "Spark and egg before Oathwarden",
            "prompt": f"{STYLE} Variant cover B: {SPARK} and {EGG} before {SERAPH}. Empty title zones. NO text.",
        },
        "foil": {
            "label": "Foil — mirror reflections, lock rings, oath flames",
            "prompt": f"{STYLE} Digital foil cover concept: animated-feeling mirror reflections, Rift lock rings, cyan oath flames. Empty title zones. NO text.",
        },
    }
    (OUT / "covers.json").write_text(json.dumps(covers, indent=2) + "\n", encoding="utf-8")

    refs = {
        "sheets": [
            "mira-eggwarden",
            "spark",
            "dormant-riftborn-egg",
            "cael-vesper",
            "aurelia-voss",
            "nira-quill",
            "lumenhare-captive",
            "seris-vale",
            "oathwarden-seraph",
            "truthwing",
            "bramblefox",
            "mossprig",
            "thornling",
            "wisplet",
            "spirit-moth",
            "cindermink",
            "traitors-gate-exterior",
            "verification-chamber",
            "memory-mirrors",
            "upper-bridge",
            "lower-gate",
            "meridian-tunnel",
            "forge-of-rifts-teaser",
            "meridian-identity-key",
            "traitor-transmitter",
        ]
    }
    (OUT / "references" / "INDEX.json").write_text(json.dumps(refs, indent=2) + "\n", encoding="utf-8")
    (OUT / "references" / "README.md").write_text(
        "# Issue #7 reference sheets\n\nPlaceholder index for character/location lock sheets. Generate art via pipeline when ready.\n",
        encoding="utf-8",
    )

    (OUT / "TRUTHWING_CANON_PROPOSAL.md").write_text(
        """# Truthwing — Canon Proposal (Issue #7)

| Field | Value |
|-------|--------|
| Name | **Truthwing** |
| Role | Scout / Detection / Cleanse |
| Bond | Oathwarden Seraph / Gate flock |
| Passive | **Clear Reflection** — first hidden/disguised/Stealthed effect each round revealed |
| Active | **Oathlight** — cleanse one negative status; expose source |
| Ultimate | **Unmasked Sky** — remove Stealth, illusions, false-copy from all units |

Visual: small silver-and-black birdlike companion; glassy wings; cyan eyes; key-pattern feathers; reflective body.

Do not overwrite existing species files until art + TCG pack formalized.
""",
        encoding="utf-8",
    )

    (OUT / "OATHWARDEN_SERAPH_CHARACTER.md").write_text(
        """# Oathwarden Seraph — Character Lock

| Field | Value |
|-------|--------|
| Name | **Oathwarden Seraph** |
| Role | Gate guardian / judgment construct |
| Passive | **Oathbound** — gain Judgment when a declared condition breaks |
| Active | **Mirror Verdict** |
| Ultimate | **Gate of Consequence** |

Visual: tall ceremonial black-and-silver armor; split mask; cyan oath flame; judgment spear; broken Keeper cloak; floating lock rings; one corrupted armor side; orbiting memory mirrors.

Not automatically aligned with Keeper or Meridian.
""",
        encoding="utf-8",
    )

    issue = {
        "slug": "the-traitors-gate",
        "issueNumber": 7,
        "title": "The Traitor's Gate",
        "subtitle": "Chapter Seven — Judgment at the Border",
        "synopsis": synopsis_public,
        "synopsisSpoiler": synopsis_full,
        "publishedAt": "2026-07-20",
        "status": "published",
        "storyPageCount": 25,
        "bookPageCount": len(book),
        "estimatedReadMinutes": 24,
        "protagonist": "Mira Eggwarden",
        "featuredCreatures": [
            "Spark",
            "Truthwing",
            "Bramblefox",
            "Mossprig",
            "Thornling",
            "Wisplet",
            "Cindermink",
            "Lumenhare",
        ],
        "featuredCharactersPublic": [
            "Mira Eggwarden",
            "Nira Quill",
            "Aurelia Voss",
            "Oathwarden Seraph",
        ],
        "spoiler": {
            "traitorNameHiddenUntilComplete": True,
            "evidenceFileLockedUntilReveal": True,
            "traitorProfileLockedUntilComplete": True,
            "publicSynopsisOnly": True,
        },
        "locations": [
            "Gilded Crossroads",
            "Traitor's Gate",
            "Verification Chamber",
            "Forge of Rifts (teaser)",
        ],
        "unlockGates": [
            {"kind": "prior-issue", "slug": "the-merchants-secret", "label": "Complete Issue #6: The Merchant's Secret"},
            {"kind": "admin-dev", "label": "Admin / COMICS_DEV_UNLOCK override"},
        ],
        "nextIssueTeaser": {
            "slug": "the-forge-of-rifts",
            "hook": "Begin the second creation.",
        },
        "pipeline": {
            "artProvider": "grok",
            "lettering": "programmatic",
            "bakedLettering": True,
            "contentRoot": "content/comics/the-traitors-gate/issue-007",
        },
        "bookPages": [
            {
                "pageNumber": p["pageNumber"],
                "storyPageNumber": p.get("storyPageNumber"),
                "role": p["bookRole"],
                "title": p["title"],
            }
            for p in book
        ],
    }
    (OUT / "issue.json").write_text(json.dumps(issue, indent=2) + "\n", encoding="utf-8")

    moments_hit = sorted({m for p in story for m in p.get("requiredMoments") or []})
    (OUT / "reports" / "REQUIRED_MOMENTS.json").write_text(
        json.dumps({"required": list(range(1, 26)), "taggedInScript": moments_hit}, indent=2) + "\n",
        encoding="utf-8",
    )

    for p in book:
        nn = f"{p['pageNumber']:03d}"
        page_out = {
            **p,
            "id": f"the-traitors-gate-issue-007-p{nn}",
            "cleanArtRel": f"generated/raw-art/page-{nn}.webp",
            "letteredArtRel": f"generated/lettered-pages/page-{nn}.webp",
            "publicArtRel": f"assets/comics/the-traitors-gate/issue-007/pages/page-{nn}.webp",
        }
        (OUT / "pages" / f"page-{nn}.json").write_text(json.dumps(page_out, indent=2) + "\n", encoding="utf-8")
        (OUT / "prompts" / f"page-{nn}.prompt.txt").write_text(page_out["grokPrompt"] + "\n", encoding="utf-8")

    print(
        json.dumps(
            {
                "out": str(OUT),
                "storyPages": len(story),
                "bookPages": len(book),
                "continuityPages": len(continuity_track),
                "momentsTagged": moments_hit,
                "traitor": "Cael Vesper",
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
