#!/usr/bin/env python3
"""
Emit complete The Lost City Issue #4 script + page JSON + prompts + continuity.
  python scripts/comics/issue-004/emit_issue_004.py

Does NOT touch issue-001 / 002 / 003 trees. Mira Eggwarden canon lock. Cal Reed forbidden.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "content/comics/the-lost-city/issue-004"

STYLE = (
    "Original high-energy Western fantasy comic storytelling with dynamic panel composition, "
    "dramatic inked linework, richly painted colors, expressive character acting, and clear cinematic action. "
    "Original Riftwilds IP only. Warm earth greens, sandstone, timber, moss first; pale stone, teal crystal, "
    "gold inlay, cyan rift energy and amber hearth as accents only. NO purple AI-fantasy default. "
    "NO Marvel/DC/Pokémon characters or logos."
)
NEG = (
    "readable dialogue text, captions, logos, watermarks, page numbers, UI chrome, Marvel, DC, Pokémon, "
    "manga screentone trademarks, extra limbs, duplicate characters, missing companions, purple neon fantasy "
    "default, photoreal modern clothing, Pikachu lookalike, Cal Reed"
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
GUARDIAN = (
    "The Last Guardian: towering stone-and-crystal construct in ancient Keeper armor, cyan energy core, moss and roots "
    "over armor, one damaged sensor-eye, massive shield, heavy Rift-powered weapon, emotional traces of former bond"
)
ECHO = (
    "Echoquill: small owl-fox-bird Rift companion, pale feathers, teal-gold markings, crystal feather tips, "
    "large reflective eyes that project soft memory light"
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
            f'Riftwilds comic "The Lost City" Issue #4, STORY PAGE {n}/25 — {title}.',
            f"Story purpose: {purpose}",
            f"Layout: {layout}. {len(panels)} panels with clear inked gutters.",
            " ".join(f"Panel {i+1} ({p['id']}): {p['description']}" for i, p in enumerate(panels)),
            f"Characters: {', '.join(chars)}. Creatures: {', '.join(creatures)}.",
            f"Spark design lock: {SPARK}.",
            f"Keeper lock: {MIRA}.",
            f"Environment: {opts.get('environment', 'Aureth Vale Lost City')}. Time: {opts.get('time', 'day')}. Weather: {opts.get('weather', 'clear over ruins')}.",
            f"Lighting: {opts.get('lighting', 'pale stone with teal crystal glow')}. Continuity: {json.dumps(opts.get('continuity') or {})}",
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
        "locations": opts.get("locations") or ["Aureth Vale"],
        "artifacts": opts.get("artifacts") or [],
        "continuity": opts.get("continuity") or {},
        "grokPrompt": grok,
        "negativePrompt": NEG,
        "pageTurnObjective": opts.get("pageTurn") or "Turn to continue.",
        "letteringInstructions": opts.get("lettering")
        or "Standard speech + narration; keep tails off faces and Spark's eyes; Guardian speech may be formal/fragmented.",
        "generationStatus": "pending",
        "letteringStatus": "pending",
        "approvalStatus": "script-complete",
        "artAlt": opts.get("artAlt") or f"{title} — The Lost City page {n}",
        "atmosphere": opts.get("atmosphere") or "ruin",
        "transcript": build_transcript(panels),
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
            f'Riftwilds comic book {role} page for The Lost City Issue #4 — {title}.',
            " ".join(p["description"] for p in panels),
            f"Keeper: {MIRA}. Spark: {SPARK}.",
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
        "continuity": opts.get("continuity") or {},
        "grokPrompt": grok,
        "negativePrompt": NEG,
        "generationStatus": "pending",
        "letteringStatus": "pending",
        "approvalStatus": "script-complete",
        "artAlt": title,
        "atmosphere": opts.get("atmosphere") or "ruin",
        "letteringInstructions": "Bake titles/credits programmatically.",
        "transcript": build_transcript(panels),
    }


story: list[dict] = []

# ── STORY 1–25 ──────────────────────────────────────────────
story.append(
    page_base(
        1,
        "City That Memory Kept",
        "Full-page reveal of Aureth Vale from the ridge at dawn.",
        "splash",
        [
            panel(
                "p1a",
                f"Full-bleed splash: vast Lost City Aureth Vale at dawn — towering pale stone and teal crystal, broken suspended bridges, gravity-defying waterfalls, forest reclaiming outer walls, floating debris. On high ridge in foreground: {MIRA}, {SPARK} glowing, Bramblefox, Mossprig, Thornling, Wisplet, Lumenhare, {CAEL}, acrobat Tavi Brightline. Meridian rooftop silhouettes distant/tiny. Space for top caption.",
                [
                    balloon("narration", None, "A city can disappear from maps. It is harder to disappear from memory.", 50, 10, maxWidthPct=72),
                    balloon("caption", None, "AURETH VALE", 50, 88, maxWidthPct=40),
                    balloon("sfx", None, "distant-HUMMM", 70, 55),
                ],
            )
        ],
        characters=["mira-eggwarden", "cael-vesper", "tavi-brightline"],
        creatures=["spark", "bramblefox", "mossprig", "thornling", "wisplet", "lumenhare"],
        continuity=cont(1, {"location": "ridge above Aureth Vale", "time": "dawn", "spark": {"glow": "drawn to city"}}),
        pageTurn="Descend toward the gate.",
        atmosphere="dawn",
        lighting="dawn gold over teal crystal",
        environment="ridge overlooking Aureth Vale",
    )
)

story.append(
    page_base(
        2,
        "No Expedition Returned",
        "Descent; Lanternmaster warning; Spark hears faint pulse.",
        "three-stack",
        [
            panel(
                "p2a",
                "Team descending switchback path toward pale outer walls; moss and broken banners.",
                [
                    balloon("speech", "Tavi Brightline", "Roads still argue with themselves.", 40, 22, "down"),
                    balloon("sfx", None, "stone-slide", 70, 60),
                ],
            ),
            panel(
                "p2b",
                f"{CAEL} half-masked, serious, pointing toward inner district towers.",
                [
                    balloon(
                        "speech",
                        "Cael Vesper",
                        "Outskirts forgive guests. The inner stage never returned its players.",
                        50,
                        28,
                        "down",
                        maxWidthPct=48,
                    )
                ],
            ),
            panel(
                "p2c",
                f"Close on {SPARK}: ears pricked, cyan pulse answering something underground.",
                [
                    balloon("creature", "Spark", "*…pulse…?*", 35, 40, "down"),
                    balloon("whisper", "Mira Eggwarden", "I hear it too. Soft. Old.", 65, 70, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper", "tavi-brightline"],
        creatures=["spark", "bramblefox", "lumenhare"],
        continuity=cont(2, {"lanternmaster": "warns inner district", "spark": {"hears": "city pulse"}}),
        pageTurn="Gate opens for Spark.",
        atmosphere="dawn",
    )
)

story.append(
    page_base(
        3,
        "The Gate That Knew a Name",
        "Main gate opens untouched; statues turn toward Spark; glowing eyes close-up.",
        "two-col",
        [
            panel(
                "p3a",
                "Massive ancient gate of pale stone and teal inlay opens without touch as Spark approaches; runes ignite cyan-gold.",
                [
                    balloon("sfx", None, "GRIND-AWAKEN", 50, 35),
                    balloon("speech", "Mira Eggwarden", "Nobody touched it.", 30, 72, "up"),
                ],
            ),
            panel(
                "p3b",
                "Line of ancient Keeper statues slowly turn stone heads toward Spark; end on extreme close-up of one statue's glowing cyan eyes.",
                [
                    balloon("narration", None, "The city does not ask names. It remembers them.", 50, 14, maxWidthPct=55),
                    balloon("creature", "Spark", "*soft yip*", 40, 75, "up"),
                    balloon("sfx", None, "stone-turn…", 70, 50),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper"],
        creatures=["spark", "bramblefox", "mossprig"],
        continuity=cont(3, {"gate": "opened for Spark", "statues": "tracking Spark"}),
        pageTurn="Silent market.",
        atmosphere="ruin",
    )
)

story.append(
    page_base(
        4,
        "Left Behind Mid-Step",
        "Silent market; sudden evacuation freeze-frame.",
        "grid-2x2",
        [
            panel(
                "p4a",
                "Abandoned market plaza: carts, fruit petrified under crystal dust, cups still upright.",
                [balloon("narration", None, "They left mid-errand. Mid-laugh. Mid-promise.", 50, 18, maxWidthPct=55)],
            ),
            panel(
                "p4b",
                "Mira touches a child's discarded toy without taking it; Compact restraint.",
                [balloon("speech", "Mira Eggwarden", "We annotate. We don't loot memory.", 50, 70, "up")],
            ),
            panel(
                "p4c",
                "Bramblefox sniffs three-arc Meridian residue near a stall — fresh vs ancient dust contrast.",
                [
                    balloon("creature", "Bramblefox", "*low rrk*", 40, 55, "up"),
                    balloon("whisper", "Tavi Brightline", "Someone else already walked this quiet.", 60, 25, "down"),
                ],
            ),
            panel(
                "p4d",
                "Wide: empty homes with doors ajar; gravity waterfall beyond street.",
                [balloon("sfx", None, "water-upward hush", 55, 60)],
            ),
        ],
        characters=["mira-eggwarden", "tavi-brightline"],
        creatures=["spark", "bramblefox"],
        continuity=cont(4, {"meridian": "fresh trail in market", "evacuation": "sudden"}),
        pageTurn="Transit activates.",
        atmosphere="ruin",
    )
)

story.append(
    page_base(
        5,
        "Thornling's Mistake",
        "Thornling activates forgotten transit; team carried deeper.",
        "three-stack",
        [
            panel(
                "p5a",
                "Thornling pokes glowing conduit crystals on broken transit platform; Sparks of teal.",
                [
                    balloon("creature", "Thornling", "*poke-poke!*", 45, 30, "down"),
                    balloon("speech", "Mira Eggwarden", "Thornling— wait—", 70, 55, "left"),
                ],
            ),
            panel(
                "p5b",
                "Platform rings ignite; whole team caught in cyan transit field; Lumenhare ears flat.",
                [balloon("sfx", None, "WHOOM-RING", 50, 45), balloon("creature", "Lumenhare", "*fwip!*", 70, 70, "up")],
            ),
            panel(
                "p5c",
                "Blur of suspended streets rushing past — team pulled deeper into Aureth Vale.",
                [balloon("narration", None, "The city decides how deep guests go.", 50, 20, maxWidthPct=50)],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper", "tavi-brightline"],
        creatures=["thornling", "spark", "lumenhare", "mossprig", "bramblefox", "wisplet"],
        continuity=cont(5, {"transit": "activated by Thornling", "depth": "inner districts"}),
        pageTurn="Suspended streets.",
        atmosphere="rift",
    )
)

story.append(
    page_base(
        6,
        "Streets That Float",
        "Transit through suspended streets; shelters, training grounds, sealed towers.",
        "two-col",
        [
            panel(
                "p6a",
                "Aerial transit corridor: suspended bridges, companion shelters with empty nest alcoves, training rings overgrown.",
                [
                    balloon("speech", "Cael Vesper", "Training halls. Nest cradles. Stages without audiences.", 40, 20, "down", maxWidthPct=42),
                    balloon("sfx", None, "rail-HUM", 70, 60),
                ],
            ),
            panel(
                "p6b",
                "Sealed laboratory towers with gold-inlay wards; Spirit Moth drifts toward a signal; Spark presses to glass of empty sanctuary window.",
                [
                    balloon("creature", "Spark", "*…empty…*", 35, 55, "up"),
                    balloon("whisper", "Mira Eggwarden", "Not empty. Waiting.", 65, 75, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper"],
        creatures=["spark", "spirit-moth", "wisplet", "lumenhare"],
        continuity=cont(6, {"saw": ["companion shelters", "training grounds", "sealed towers"]}),
        pageTurn="Memory echoes.",
        atmosphere="ruin",
    )
)

story.append(
    page_base(
        7,
        "Wisplet Opens the Past",
        "Wisplet spectral; memory silhouettes of ancient citizens.",
        "splash",
        [
            panel(
                "p7a",
                "Wisplet phases spectral cyan; translucent memory-silhouettes of ancient citizens walk through the same street as the living team — beautiful and tragic double-exposure composition.",
                [
                    balloon("narration", None, "The street remembers footsteps the stone forgot to keep.", 50, 12, maxWidthPct=60),
                    balloon("creature", "Wisplet", "*soft chime*", 30, 50, "down"),
                    balloon("speech", "Mira Eggwarden", "Don't chase them. Let them pass.", 70, 78, "up", maxWidthPct=36),
                ],
            )
        ],
        characters=["mira-eggwarden"],
        creatures=["wisplet", "spark", "bramblefox"],
        continuity=cont(7, {"memoryEchoes": True, "wisplet": "spectral"}),
        pageTurn="War preparation memory.",
        atmosphere="dusk",
        lighting="spectral cyan over dusk stone",
    )
)

story.append(
    page_base(
        8,
        "Keepers Before the Tear",
        "Memory: Keepers prepare defenses; child with Spark-like companion; face glitches.",
        "three-stack",
        [
            panel(
                "p8a",
                "Memory vision: armored ancient Keepers sealing Rift conduits; banners with city seal.",
                [
                    balloon("magic", "Memory Echo", "Hold the network. Hold the cradles.", 50, 25, maxWidthPct=45),
                    balloon("sfx", None, "memory-static", 70, 60),
                ],
            ),
            panel(
                "p8b",
                "Child in memory carries a Spark-like Glowpup-line companion toward a sanctuary door.",
                [balloon("narration", None, "They called the little lights Resonance Keepers — before crowns renamed everything.", 50, 75, maxWidthPct=55)],
            ),
            panel(
                "p8c",
                "Close on child's face beginning to resolve — memory glitches to static before identity clear; Spark flinches.",
                [
                    balloon("creature", "Spark", "*afraid chirp*", 40, 40, "down"),
                    balloon("speech", "Mira Eggwarden", "You don't have to watch if it hurts.", 65, 70, "up", maxWidthPct=38),
                ],
            ),
        ],
        characters=["mira-eggwarden"],
        creatures=["spark", "wisplet"],
        continuity=cont(8, {"loreHint": "Resonance Keepers", "memoryGlitch": True}),
        pageTurn="Sanctuary chambers.",
        atmosphere="rift",
    )
)

story.append(
    page_base(
        9,
        "Empty Nest Rows",
        "Spark follows echo into abandoned sanctuary; Echoquill appears.",
        "grid-2x2",
        [
            panel(
                "p9a",
                "Abandoned companion sanctuary: rows of empty resting chambers lined with teal crystal nests.",
                [balloon("narration", None, "Cradles without breath. Names without voices.", 50, 16, maxWidthPct=50)],
            ),
            panel(
                "p9b",
                f"{SPARK} walks alone down the aisle, drawn; Mira waits at threshold — invite, not push.",
                [balloon("whisper", "Mira Eggwarden", "I'm here when you look back.", 50, 80, "up")],
            ),
            panel(
                "p9c",
                f"{ECHO} emerges from a high nest alcove, projecting a soft memory fragment of Spark's kind.",
                [
                    balloon("creature", "Echoquill", "*archive-trill*", 55, 35, "down"),
                    balloon("sfx", None, "memory-shimmer", 40, 60),
                ],
            ),
            panel(
                "p9d",
                "Echoquill lands near Spark; reflective eyes share a calm pulse — first contact.",
                [balloon("creature", "Spark", "*curious chirp*", 45, 55, "up")],
            ),
        ],
        characters=["mira-eggwarden"],
        creatures=["spark", "echoquill", "wisplet", "spirit-moth"],
        continuity=cont(9, {"echoquill": "first contact", "sanctuary": "empty nests"}),
        pageTurn="Resonance Keeper records.",
        atmosphere="ruin",
    )
)

story.append(
    page_base(
        10,
        "Resonance Keepers",
        "Records identify Spark's kind as Resonance Keepers for Rift engines.",
        "two-col",
        [
            panel(
                "p10a",
                "Wall archive crystal projects diagram of companions synchronized to city engines — abstract glyphs, Echoquill tracing light.",
                [
                    balloon("caption", None, "CLASS: RESONANCE KEEPERS", 50, 18, maxWidthPct=55),
                    balloon("narration", None, "Trained — or born — to steady the engines that held the First Tear's roads.", 50, 78, maxWidthPct=50),
                ],
            ),
            panel(
                "p10b",
                "Close: Spark sees itself in a mural of Resonance Line companions; cyan core schematic behind.",
                [
                    balloon("speech", "Cael Vesper", "The circus… moved lights like these. Quietly. For longer than I admitted.", 40, 25, "down", maxWidthPct=44),
                    balloon("thought", "Mira Eggwarden", "History wrote a job description. Spark didn't sign it.", 60, 70, "up", maxWidthPct=40),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper"],
        creatures=["spark", "echoquill"],
        artifacts=["resonance-keeper-record"],
        continuity=cont(10, {"term": "Resonance Keepers", "cael": "partial admission beginning"}),
        pageTurn="Spark's fear.",
        atmosphere="dusk",
    )
)

story.append(
    page_base(
        11,
        "Not a Tool",
        "Spark fears purpose-as-ownership; Mira reassures; Cael silent.",
        "three-stack",
        [
            panel(
                "p11a",
                "Spark's glow destabilizes — fear of being an engine part; Echoquill backs a step.",
                [balloon("creature", "Spark", "*distress pulse*", 50, 40, "down"), balloon("sfx", None, "PULSE-STUTTER", 70, 55)],
            ),
            panel(
                "p11b",
                "Mira kneels, open hands, eye-level with Spark — Compact posture.",
                [
                    balloon(
                        "speech",
                        "Mira Eggwarden",
                        "History can name a use. It doesn't own your choice.",
                        50,
                        22,
                        "down",
                        maxWidthPct=46,
                    )
                ],
            ),
            panel(
                "p11c",
                "Cael stands half in shadow, mask tilted down — silent, guilty; Lumenhare presses his boot.",
                [
                    balloon("narration", None, "Some roads are lit by lanterns that refuse to name their fuel.", 50, 20, maxWidthPct=55),
                    balloon("creature", "Lumenhare", "*soft thump*", 65, 70, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper"],
        creatures=["spark", "echoquill", "lumenhare"],
        continuity=cont(11, {"spark": {"emotion": "fear of tool-status"}, "cael": "silent guilt"}),
        pageTurn="Confrontation.",
        atmosphere="dusk",
    )
)

story.append(
    page_base(
        12,
        "Lanterns and Admissions",
        "Mira confronts Cael; circus transported Resonance Keepers; didn't know Spark survived.",
        "two-col",
        [
            panel(
                "p12a",
                "Mira faces Cael in sanctuary light; Spark between them; Tavi watches from doorway.",
                [
                    balloon("speech", "Mira Eggwarden", "How long has Lanternveil moved Resonance Keepers?", 40, 20, "down", maxWidthPct=42),
                    balloon(
                        "speech",
                        "Cael Vesper",
                        "Generations. Between safe stages. We hid lights from nets — not for sale.",
                        60,
                        55,
                        "up",
                        maxWidthPct=44,
                    ),
                ],
            ),
            panel(
                "p12b",
                "Cael removes half-mask briefly — honest face; Spark's glow steadies.",
                [
                    balloon(
                        "speech",
                        "Cael Vesper",
                        "We did not know this one survived the Soft Exodus roads.",
                        50,
                        28,
                        "down",
                        maxWidthPct=46,
                    ),
                    balloon("whisper", "Mira Eggwarden", "Then stop performing. Help us keep it free.", 50, 72, "up", maxWidthPct=40),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper", "tavi-brightline"],
        creatures=["spark", "lumenhare", "echoquill"],
        continuity=cont(12, {"cael": "admits Resonance Keeper transport", "alliance": "uneasy honesty"}),
        pageTurn="Meridian at the core.",
        atmosphere="night",
    )
)

story.append(
    page_base(
        13,
        "Stolen Seals",
        "Meridian agents enter central core with command seals; Seris restores power.",
        "three-stack",
        [
            panel(
                "p13a",
                "Elsewhere: Veiled Meridian agents in dark travel cloaks with three-arc sigils enter city core via sealed service gate.",
                [
                    balloon("whisper", "Meridian Agent", "Seal accepted. Quiet feet.", 50, 20, "down"),
                    balloon("sfx", None, "seal-click", 70, 55),
                ],
            ),
            panel(
                "p13b",
                "Seris Vale (senior Meridian commander): calm, sharp, holding partial ancient command seals to a cyan console.",
                [
                    balloon(
                        "speech",
                        "Seris Vale",
                        "Control is not cruelty. Another Tear will not wait for kindness.",
                        50,
                        25,
                        "down",
                        maxWidthPct=48,
                    )
                ],
            ),
            panel(
                "p13c",
                "City core engines begin lighting — teal veins racing through pale stone streets above.",
                [balloon("sfx", None, "ENGINE-WAKE", 50, 45), balloon("caption", None, "CORE POWER: PARTIAL", 50, 78)],
            ),
        ],
        characters=["seris-vale"],
        creatures=[],
        artifacts=["ancient-command-seal"],
        continuity=cont(13, {"meridian": "core infiltration", "seris": "restoring power"}),
        pageTurn="Guardian rises.",
        atmosphere="rift",
        environment="Aureth Vale city core",
    )
)

story.append(
    page_base(
        14,
        "The Last Guardian Rises",
        "City shakes; Guardian towers awaken; Last Guardian rises from plaza — large reveal.",
        "splash",
        [
            panel(
                "p14a",
                f"Massive reveal splash: {GUARDIAN} rises from beneath the central plaza — stone plates peeling back, cyan core blazing, towers around plaza lighting defensive runes. Tiny expedition figures for scale. Mira shielding Spark. Meridian agents on far side.",
                [
                    balloon("sfx", None, "CITY-QUAKE", 50, 18),
                    balloon("shout", "Last Guardian", "EVACUATION PROTOCOL — ACTIVE.", 50, 78, "up", maxWidthPct=50),
                ],
            )
        ],
        characters=["mira-eggwarden", "seris-vale", "cael-vesper"],
        creatures=["spark", "mossprig", "bramblefox"],
        continuity=cont(14, {"guardian": "awakened", "scale": "plaza-towering"}),
        pageTurn="Scan and demand.",
        atmosphere="rift",
        lighting="violent cyan core light",
    )
)

story.append(
    page_base(
        15,
        "Scan: Stolen Stabilizer",
        "Guardian identifies unauthorized Keepers, stolen stabilizer, Meridian seal, evacuation order.",
        "grid-2x2",
        [
            panel(
                "p15a",
                "Guardian sensor-eye sweeps cyan beam across Mira's team.",
                [balloon("speech", "Last Guardian", "UNAUTHORIZED KEEPERS.", 50, 30, "down", maxWidthPct=40)],
            ),
            panel(
                "p15b",
                "Beam locks on Spark — HUD-like glyph rings (abstract, no readable UI).",
                [
                    balloon("speech", "Last Guardian", "STABILIZER — MISSING FROM RESONANCE LINE.", 50, 28, "down", maxWidthPct=46),
                    balloon("creature", "Spark", "*recoil chirp*", 40, 70, "up"),
                ],
            ),
            panel(
                "p15c",
                "Beam notes Meridian command seal on Seris's gauntlet.",
                [balloon("speech", "Last Guardian", "ALLY CODE — PARTIAL. MERIDIAN SEAL ACCEPTED.", 50, 35, "down", maxWidthPct=46)],
            ),
            panel(
                "p15d",
                "Guardian raises shield and weapon; evacuation banners unfurl from towers.",
                [
                    balloon("shout", "Last Guardian", "SURRENDER STABILIZER. COMPLY.", 50, 40, "down", maxWidthPct=42),
                    balloon("speech", "Mira Eggwarden", "Spark is not property.", 55, 75, "up", maxWidthPct=36),
                ],
            ),
        ],
        characters=["mira-eggwarden", "seris-vale"],
        creatures=["spark", "echoquill"],
        continuity=cont(15, {"guardianBelief": "Spark stolen stabilizer", "meridianSeal": "partial ally"}),
        pageTurn="Override and attack.",
        atmosphere="rift",
    )
)

story.append(
    page_base(
        16,
        "Partial Override",
        "Seris attempts control; partial success; Guardian attacks expedition.",
        "three-stack",
        [
            panel(
                "p16a",
                "Seris speaks ancient command language into seal; Guardian staggers, cyan core flickering.",
                [
                    balloon("speech", "Seris Vale", "Priority: secure Resonance asset. Minimize structural loss.", 50, 22, "down", maxWidthPct=48),
                    balloon("sfx", None, "OVERRIDE-CRACKLE", 70, 55),
                ],
            ),
            panel(
                "p16b",
                "Guardian weapon swings — capture beams toward Spark; Mira pulls Spark behind Mossprig.",
                [balloon("shout", "Mira Eggwarden", "Move!", 40, 30, "down"), balloon("sfx", None, "BEAM-KRACK", 65, 50)],
            ),
            panel(
                "p16c",
                "Plaza stone shatters; companions scatter; Echoquill Memory Trace shimmer records a Guardian strike.",
                [balloon("narration", None, "A protector with a broken clock still hits like a war.", 50, 80, maxWidthPct=55)],
            ),
        ],
        characters=["mira-eggwarden", "seris-vale"],
        creatures=["spark", "mossprig", "echoquill", "bramblefox"],
        continuity=cont(16, {"override": "partial", "combat": "begun"}),
        pageTurn="Living Bulwark.",
        atmosphere="storm",
    )
)

story.append(
    page_base(
        17,
        "Living Bulwark",
        "Mossprig Living Bulwark vs massive energy strike; shield cracks but holds.",
        "two-col",
        [
            panel(
                "p17a",
                "Mossprig expands Living Bulwark — moss-and-root dome over Mira, Spark, Tavi, Cael; Guardian energy spear impacts.",
                [
                    balloon("creature", "Mossprig", "*BULWARK!*", 40, 30, "down"),
                    balloon("sfx", None, "SHIELD-BOOM", 60, 45),
                ],
            ),
            panel(
                "p17b",
                "Bulwark cracks with light fissures but holds; team dashes through gap Bramblefox found.",
                [
                    balloon("speech", "Mira Eggwarden", "Thank you — don't burn yourself empty!", 45, 25, "down", maxWidthPct=40),
                    balloon("creature", "Mossprig", "*strain-hum*", 55, 70, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper", "tavi-brightline"],
        creatures=["mossprig", "spark", "bramblefox"],
        continuity=cont(17, {"mossprig": "Living Bulwark cracked but held"}),
        pageTurn="Battle across plaza.",
        atmosphere="rift",
    )
)

story.append(
    page_base(
        18,
        "Plaza War Map",
        "Multi-front battle: Guardian, companions, Meridian, Keeper directing.",
        "grid-2x3",
        [
            panel("p18a", f"{GUARDIAN} crossing plaza, shield up, weapon sweeping.", [balloon("sfx", None, "STEP-THOOM", 50, 50)]),
            panel(
                "p18b",
                "Bramblefox climbing broken aqueduct; Forest Bond vines slow a Meridian agent.",
                [balloon("creature", "Bramblefox", "*hunt-rrk*", 50, 40, "down")],
            ),
            panel(
                "p18c",
                "Thornling bites an energy conduit — accidental city lights flicker aiding cover.",
                [balloon("creature", "Thornling", "*nom!*", 45, 45, "down"), balloon("sfx", None, "conduit-zap", 70, 60)],
            ),
            panel(
                "p18d",
                "Wisplet phases through defense barrier; Spirit Moth reveals hidden rune path.",
                [balloon("creature", "Wisplet", "*phase-chime*", 40, 35, "down")],
            ),
            panel(
                "p18e",
                "Spark dodges capture beams; Echoquill Echo Step copies Mossprig's earlier defensive hop.",
                [balloon("creature", "Echoquill", "*echo-step*", 50, 40, "down")],
            ),
            panel(
                "p18f",
                "Mira directing: point, call, never commanding Spark to attack — only to stay free.",
                [
                    balloon("speech", "Mira Eggwarden", "Disable joints — do not break the mind inside!", 50, 30, "down", maxWidthPct=44),
                    balloon("speech", "Seris Vale", "Yield the stabilizer. I will spare your Compact theater.", 50, 70, "up", maxWidthPct=42),
                ],
            ),
        ],
        characters=["mira-eggwarden", "seris-vale"],
        creatures=["spark", "bramblefox", "thornling", "wisplet", "spirit-moth", "echoquill", "mossprig"],
        continuity=cont(18, {"battle": "multi-front plaza", "miraOrder": "disable not destroy"}),
        pageTurn="Weak point found.",
        atmosphere="rift",
        layout_type="grid-2x3",
    )
)
# fix layout type for page 18
story[-1]["layout"] = {"type": "grid-2x3", "panelCount": 6}

story.append(
    page_base(
        19,
        "Joints, Not Heart",
        "Bramblefox finds damaged crystal joints; refuse destructive kill.",
        "three-stack",
        [
            panel(
                "p19a",
                "Bramblefox at Guardian ankle: cracked teal crystal joints glowing stress fractures.",
                [
                    balloon("creature", "Bramblefox", "*here—*", 40, 40, "down"),
                    balloon("speech", "Tavi Brightline", "We could drop it.", 70, 55, "left"),
                ],
            ),
            panel(
                "p19b",
                "Mira shakes head hard; Spark looks at Guardian's damaged eye with empathy not fear.",
                [
                    balloon(
                        "speech",
                        "Mira Eggwarden",
                        "If we destroy a wounded guard, we become the Tear's echo.",
                        50,
                        25,
                        "down",
                        maxWidthPct=48,
                    )
                ],
            ),
            panel(
                "p19c",
                "Team sets nonlethal vine/conduit bind on joint — disable locomotion only.",
                [balloon("narration", None, "Mercy is also a tactic.", 50, 75, maxWidthPct=40), balloon("sfx", None, "vine-CINCH", 60, 45)],
            ),
        ],
        characters=["mira-eggwarden", "tavi-brightline"],
        creatures=["bramblefox", "spark", "mossprig"],
        continuity=cont(19, {"plan": "disable joints", "refuseKill": True}),
        pageTurn="Nira disables override.",
        atmosphere="dusk",
    )
)

story.append(
    page_base(
        20,
        "The Hunter Cuts the Wire",
        "Nira Quill disables Meridian override; Guardian unstable; Spark hears pain.",
        "two-col",
        [
            panel(
                "p20a",
                "Nira Quill (uncertain hunter) appears from rooftop shadow; smashes Meridian override relay with a dampener spike.",
                [
                    balloon("speech", "Nira Quill", "I won't collect a scream and call it order.", 45, 20, "down", maxWidthPct=44),
                    balloon("sfx", None, "RELAY-SHATTER", 65, 55),
                ],
            ),
            panel(
                "p20b",
                "Guardian staggers; override glyphs die; core spasms; Spark presses paws to ground, feeling pain-resonance.",
                [
                    balloon("speech", "Last Guardian", "COMMAND… CONFLICT…", 50, 22, "down", maxWidthPct=40),
                    balloon("creature", "Spark", "*hurt…*", 40, 70, "up"),
                    balloon("whisper", "Mira Eggwarden", "I won't order you. If you go — you choose.", 65, 78, "up", maxWidthPct=38),
                ],
            ),
        ],
        characters=["nira-quill", "mira-eggwarden", "seris-vale"],
        creatures=["spark"],
        continuity=cont(20, {"nira": "disabled override", "guardian": "unstable", "sparkChoice": "pending"}),
        pageTurn="Spark touches the core.",
        atmosphere="rift",
    )
)

story.append(
    page_base(
        21,
        "Chosen Contact",
        "Spark approaches Guardian voluntarily; touches damaged core; shared memory begins.",
        "three-stack",
        [
            panel(
                "p21a",
                "Spark walks alone across cracked plaza toward kneeling/unstable Guardian; Mira's team holds position — not commanding.",
                [balloon("narration", None, "Invite. Wait. Even when the city shakes.", 50, 16, maxWidthPct=50)],
            ),
            panel(
                "p21b",
                "Spark's paw touches Guardian's damaged cyan core; Echoquill projects Memory Trace bridge light.",
                [
                    balloon("creature", "Spark", "*…with you…*", 40, 55, "up"),
                    balloon("sfx", None, "RESONANCE-LOCK", 65, 40),
                ],
            ),
            panel(
                "p21c",
                "Both dissolve into shared memory light — world washes teal-gold; Seris shouts uselessly from edge.",
                [
                    balloon("shout", "Seris Vale", "Break the link!", 70, 30, "down"),
                    balloon("speech", "Mira Eggwarden", "No. This is consent.", 30, 70, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "seris-vale", "nira-quill"],
        creatures=["spark", "echoquill"],
        continuity=cont(21, {"spark": "voluntary Guardian link", "seris": "fails to break"}),
        pageTurn="Final day memory.",
        atmosphere="rift",
    )
)

story.append(
    page_base(
        22,
        "The Day Relief Never Came",
        "Memory splash: final day — network order, evacuation, altered command, seal with people inside.",
        "splash",
        [
            panel(
                "p22a",
                "Memory splash collage: Aureth Vale's final day — Keepers ordered to keep Rift network active; Guardian shepherding evacuation routes; a trusted official's hand altering a command seal; city gates sealing while silhouettes still inside; Guardian waiting on empty road for relief that never arrives. Emotional, tragic, grand.",
                [
                    balloon("narration", None, "Hold the network. Guard the cradles. Wait for relief.", 50, 10, maxWidthPct=60),
                    balloon("magic", "Altered Order", "SEAL THE CITY. FORGET THE NAME.", 50, 48, maxWidthPct=50),
                    balloon("whisper", "Last Guardian", "…relief inbound…", 40, 82, "up", maxWidthPct=36),
                ],
            )
        ],
        characters=[],
        creatures=["spark"],
        continuity=cont(22, {"truth": "command altered; city sealed with people; Guardian waited"}),
        pageTurn="War ended long ago.",
        atmosphere="rift",
        lighting="memory storm light",
    )
)

story.append(
    page_base(
        23,
        "Last Light of the Resonance Line",
        "Return present; Guardian accepts war ended; names Spark; lowers weapon.",
        "two-col",
        [
            panel(
                "p23a",
                "Back in plaza: Guardian lowers weapon and shield; damaged eye softens; Mossprig still braced but easing.",
                [
                    balloon("speech", "Last Guardian", "TIMESTAMP CONFLICT. WAR… CONCLUDED.", 50, 22, "down", maxWidthPct=46),
                    balloon("sfx", None, "weapon-lower…", 60, 60),
                ],
            ),
            panel(
                "p23b",
                "Guardian bows massive head toward Spark; Mira stands beside Spark without claiming ownership.",
                [
                    balloon(
                        "speech",
                        "Last Guardian",
                        "Last Light of the Resonance Line. You are not stolen. You are late — and alive.",
                        50,
                        28,
                        "down",
                        maxWidthPct=48,
                    ),
                    balloon("creature", "Spark", "*warm pulse*", 40, 75, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden"],
        creatures=["spark", "mossprig", "echoquill"],
        continuity=cont(23, {"guardian": "accepts war ended", "sparkTitle": "Last Light of the Resonance Line"}),
        pageTurn="Archive map + storm signal.",
        atmosphere="dusk",
    )
)

story.append(
    page_base(
        24,
        "Engines Still Sleeping",
        "Central archive opens; world map of dormant engines; storm mountain signal; Seris escapes with partial records.",
        "grid-2x2",
        [
            panel(
                "p24a",
                "Guardian opens central archive chamber — floating cartographic crystal with several dormant Rift engine markers.",
                [balloon("speech", "Last Guardian", "Network incomplete. Nodes dormant.", 50, 20, "down", maxWidthPct=42)],
            ),
            panel(
                "p24b",
                "One marker flares violently — storm-covered mountain kingdom far northeast.",
                [
                    balloon("sfx", None, "SIGNAL-SPIKE", 55, 40),
                    balloon("caption", None, "UNKNOWN NODE — STORM KINGDOM", 50, 78, maxWidthPct=50),
                ],
            ),
            panel(
                "p24c",
                "Seris Vale escapes through collapsing service gate with partial crystal records under arm; Nira does not chase.",
                [
                    balloon("speech", "Seris Vale", "Control can wait. Data does not.", 50, 25, "down", maxWidthPct=40),
                    balloon("whisper", "Nira Quill", "Run. I'll still hate the cage.", 55, 70, "up", maxWidthPct=36),
                ],
            ),
            panel(
                "p24d",
                "Echoquill Living Archive shimmer stores a fragment of the map for the team; Mira studies storm node.",
                [
                    balloon("speech", "Mira Eggwarden", "Another light. Another choice waiting.", 50, 30, "down", maxWidthPct=40),
                    balloon("creature", "Echoquill", "*archive-lock*", 60, 65, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "seris-vale", "nira-quill", "cael-vesper"],
        creatures=["spark", "echoquill"],
        artifacts=["rift-engine-map", "partial-meridian-records"],
        continuity=cont(24, {"stormSignal": True, "seris": "escaped with partial records", "guardian": "uneasy ally"}),
        pageTurn="Storm King cliffhanger.",
        atmosphere="night",
    )
)

story.append(
    page_base(
        25,
        "A King Who Never Surrendered",
        "Cliffhanger: storm mountain fortress; massive figure opens glowing eyes; next: Storm King.",
        "splash",
        [
            panel(
                "p25a",
                "Distant mountain fortress inside supernatural storm; lightning wraps a throne-like tower; a massive crowned silhouette opens glowing storm-cyan eyes. Tiny inset of Aureth Vale archive signal linking toward the peaks. Empty zones for end captions.",
                [
                    balloon(
                        "narration",
                        None,
                        "Above the clouds, a king who never surrendered hears the call.",
                        50,
                        12,
                        maxWidthPct=65,
                    ),
                    balloon("sfx", None, "KRACK-THUNDER", 60, 48),
                    balloon("caption", None, "NEXT: THE STORM KING", 50, 88, maxWidthPct=50),
                ],
            )
        ],
        characters=[],
        creatures=[],
        locations=["Storm Kingdom"],
        continuity=cont(25, {"teaser": "the-storm-king", "cliffhanger": True}),
        pageTurn="End of Issue #4.",
        atmosphere="storm",
        environment="Storm Kingdom peaks",
        lighting="supernatural storm cyan lightning",
    )
)

assert len(story) == 25

# ── BOOK MATTER ─────────────────────────────────────────────
book: list[dict] = []

book.append(
    matter_page(
        1,
        "front-cover",
        "The Lost City — Cover",
        [
            panel(
                "cover",
                f"Main cover: {SPARK} foreground; {MIRA} and companions entering pale-stone teal-crystal city; {GUARDIAN} towering behind ruins; floating waterfalls; Meridian agents hidden on rooftops; cyan city core glow below; storm mountains faint in distance. Trade dress space top/bottom. Original Riftwilds.",
                [
                    balloon("caption", None, "RIFTWILDS", 50, 8),
                    balloon("caption", None, "THE LOST CITY", 50, 18),
                    balloon("caption", None, "ISSUE #4", 50, 88),
                ],
            )
        ],
        characters=["mira-eggwarden", "cael-vesper"],
        creatures=["spark", "bramblefox", "mossprig"],
        atmosphere="ruin",
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
                "Quiet parchment-and-teal inside cover: Aureth Vale seal watermark, Soft Gateway glow, invitation to read. No trade logos.",
                [
                    balloon("caption", None, "Riftwilds Comic Publishing — original fantasy. Free to read.", 50, 30, maxWidthPct=60),
                    balloon("narration", None, "Credits & cosmetics may unlock along the way. The story itself stays free.", 50, 60, maxWidthPct=55),
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
                "Workshop lore-desk: quills, rift-ink, layered city maps, Echoquill feather — no painted credit text in art.",
                [
                    balloon("caption", None, "Story · Riftwilds Lore Desk", 50, 28),
                    balloon("caption", None, "Art · Grok + Publishing Engine", 50, 42),
                    balloon("caption", None, "Lettering · Programmatic Bake", 50, 56),
                    balloon("narration", None, "Canon: World Codex · Riftling Codex · Legends of the Rift TCG. Keeper: Mira Eggwarden.", 50, 75, maxWidthPct=55),
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
        "Chapter Four — The Lost City",
        [
            panel(
                "title",
                f"Title spread energy without painted lettering: {MIRA}, Spark, companions, Cael on ridge above Aureth Vale dawn; empty center for title bake.",
                [
                    balloon("caption", None, "CHAPTER FOUR", 50, 20),
                    balloon("caption", None, "THE LOST CITY", 50, 35),
                    balloon("narration", None, "Aureth Vale wakes. The Guardian remembers. The Meridian arrives.", 50, 75, maxWidthPct=55),
                ],
            )
        ],
        characters=["mira-eggwarden", "cael-vesper"],
        creatures=["spark"],
        atmosphere="dawn",
    )
)

# story pages become book pages 5–29
for i, sp in enumerate(story):
    bp = dict(sp)
    bp["pageNumber"] = 5 + i
    bp["storyPageNumber"] = i + 1
    # rebuild grok with book page awareness already in story purpose
    book.append(bp)

book.append(
    matter_page(
        30,
        "teaser",
        "Next Issue — The Storm King",
        [
            panel(
                "teaser",
                "Teaser plate: storm-wrapped mountain throne tower; lightning crown motif; empty title zone for THE STORM KING.",
                [
                    balloon("caption", None, "NEXT ISSUE", 50, 18),
                    balloon("narration", None, "A dormant engine answers from the peaks. A king who never surrendered listens.", 50, 50, maxWidthPct=55),
                    balloon("caption", None, "THE STORM KING", 50, 82),
                ],
            )
        ],
        atmosphere="storm",
    )
)

book.append(
    matter_page(
        31,
        "profile",
        "Character Profile — The Last Guardian",
        [
            panel(
                "prof-g",
                f"Character profile plate: {GUARDIAN} three-quarter portrait with broken city reflections in shield; empty text zones.",
                [
                    balloon("caption", None, "THE LAST GUARDIAN", 50, 12),
                    balloon("narration", None, "Civic defense construct of Aureth Vale. Follows evacuation law until truth rewrites the clock.", 50, 78, maxWidthPct=55),
                ],
            )
        ],
        atmosphere="ruin",
    )
)

book.append(
    matter_page(
        32,
        "profile",
        "Companion Profile — Echoquill",
        [
            panel(
                "prof-e",
                f"Companion profile: {ECHO} front/side/three-quarter; Memory Trace light ribbons; empty ability text zones.",
                [
                    balloon("caption", None, "ECHOQUILL", 50, 12),
                    balloon("narration", None, "Memory Trace · Echo Step · Living Archive — scout of the sanctuary nests.", 50, 80, maxWidthPct=55),
                ],
            )
        ],
        creatures=["echoquill"],
        atmosphere="dusk",
    )
)

book.append(
    matter_page(
        33,
        "lore",
        "Codex — Aureth Vale",
        [
            panel(
                "lore",
                "Codex plate: layered city cross-section — plazas, suspended bridges, engine core, memory archive — pale stone teal crystal gold inlay.",
                [
                    balloon("caption", None, "CODEX — AURETH VALE", 50, 12),
                    balloon(
                        "narration",
                        None,
                        "Ancient Riftkeeper capital. Fracture-layered climates. Erased from modern maps. The engines still hum.",
                        50,
                        78,
                        maxWidthPct=58,
                    ),
                ],
            )
        ],
        atmosphere="ruin",
    )
)

book.append(
    matter_page(
        34,
        "lore",
        "Ability Spotlight — Memory Trace",
        [
            panel(
                "ability",
                "Ability spotlight art: Echoquill recording a Guardian strike as teal memory ribbon; empty rules text zones.",
                [
                    balloon("caption", None, "ABILITY — MEMORY TRACE", 50, 14),
                    balloon("narration", None, "When an enemy ability is used, record it once per round. Knowledge is a second shield.", 50, 78, maxWidthPct=55),
                ],
            )
        ],
        creatures=["echoquill"],
        atmosphere="rift",
    )
)

book.append(
    matter_page(
        35,
        "map",
        "World Map — Commons to Storm Peaks",
        [
            panel(
                "map",
                "Painterly world map: Riftwild Commons, Shellward Sanctum, Lanternveil Circus route, Aureth Vale Lost City, Storm Kingdom destination marker glowing. Empty label zones for programmatic lettering.",
                [
                    balloon("caption", None, "ROUTE OF THE RESONANCE LINE", 50, 10, maxWidthPct=50),
                    balloon("narration", None, "Commons → Sanctum → Circus → Aureth Vale → Storm Peaks", 50, 85, maxWidthPct=55),
                ],
            )
        ],
        atmosphere="dusk",
    )
)

book.append(
    matter_page(
        36,
        "letters",
        "Editor's Note — Memory & Duty",
        [
            panel(
                "letters",
                "Quiet editor desk with city seal rubbing and Compact lantern charm; soft window light.",
                [
                    balloon("caption", None, "EDITOR'S NOTE", 50, 14),
                    balloon(
                        "narration",
                        None,
                        "Memory without mercy becomes a prison. Duty without choice becomes a cage. Issue #4 asks which inheritance we keep — and which we refuse to pass on.",
                        50,
                        55,
                        maxWidthPct=60,
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
        "inside-cover",
        "Inside Back Cover",
        [
            panel(
                "ibc",
                "Inside back: damaged Aureth Vale Civil Defense Notice aesthetic — evacuation arrows, companion safety icons (abstract), cracked city seal.",
                [
                    balloon("caption", None, "AURETH VALE CIVIL DEFENSE NOTICE", 50, 14, maxWidthPct=55),
                    balloon("narration", None, "Evacuation Route Γ. Companions to Resonance cradles. Seal integrity — ALTERED.", 50, 50, maxWidthPct=55),
                    balloon("whisper", None, "Relief inbound… [signal lost]", 50, 78),
                ],
            )
        ],
        atmosphere="ruin",
    )
)

book.append(
    matter_page(
        38,
        "back-cover",
        "Back Cover — Storm Signal",
        [
            panel(
                "bc",
                "Back cover: Aureth Vale silhouette at dusk with storm mountain signal beam; Spark and Mira small on ridge looking out; empty blurb zones.",
                [
                    balloon("caption", None, "THE LOST CITY", 50, 12),
                    balloon("narration", None, "The Guardian remembers. The Meridian runs. The peaks answer.", 50, 50, maxWidthPct=55),
                    balloon("caption", None, "ISSUE #4 · LEGENDS OF THE RIFT", 50, 88, maxWidthPct=50),
                ],
            )
        ],
        characters=["mira-eggwarden"],
        creatures=["spark"],
        atmosphere="night",
    )
)

# Fix story pageNumbers inside book (already set) — also fix grok prompts for story pages to say book context
# Re-number story pages' internal storyPageNumber already set

synopsis = (
    "Mira Eggwarden, Spark, and a Lanternveil expedition enter Aureth Vale — a Lost City awakening after the First Rift. "
    "They discover Resonance Keepers lore, face Meridian commander Seris Vale, and confront the Last Guardian until Spark "
    "voluntarily shares memory and proves the war ended long ago. A storm-kingdom Riftborn signal sparks the road to Issue #5."
)

script = {
    "title": "The Lost City",
    "issueNumber": 4,
    "slug": "the-lost-city",
    "protagonist": "Mira Eggwarden",
    "synopsis": synopsis,
    "storyPageCount": 25,
    "requiredMoments": list(range(1, 26)),
    "themes": [
        "memory",
        "historical truth",
        "guilt",
        "duty",
        "protector vs prison guard",
        "generational consequences",
    ],
    "calReed": "NON-CANON — forbidden",
    "elaraVenn": "vision/counsel only — not present cast",
}


def main():
    for sub in ("pages", "prompts", "generated/raw-art", "generated/lettered-pages", "generated/thumbnails", "generated/covers", "reports", "references"):
        (OUT / sub).mkdir(parents=True, exist_ok=True)

    (OUT / "script.json").write_text(json.dumps(script, indent=2) + "\n", encoding="utf-8")
    (OUT / "continuity.json").write_text(json.dumps({"pages": continuity_track}, indent=2) + "\n", encoding="utf-8")

    characters = {
        "cast": [
            {"id": "mira-eggwarden", "name": "Mira Eggwarden", "role": "Keeper protagonist"},
            {"id": "cael-vesper", "name": "Cael Vesper", "role": "Lanternmaster"},
            {"id": "tavi-brightline", "name": "Tavi Brightline", "role": "Trusted circus performer"},
            {"id": "nira-quill", "name": "Nira Quill", "role": "Uncertain hunter"},
            {"id": "seris-vale", "name": "Seris Vale", "role": "Meridian commander"},
            {"id": "last-guardian", "name": "The Last Guardian", "role": "City defense construct"},
            {"id": "elara-venn", "name": "Elara Venn", "role": "Vision/counsel only — not present"},
        ],
        "rejected": [{"id": "cal-reed", "note": "NON-CANON"}],
    }
    (OUT / "characters.json").write_text(json.dumps(characters, indent=2) + "\n", encoding="utf-8")

    creatures = {
        "featured": [
            {"id": "spark", "name": "Spark", "note": "Resonance Line / Last Light"},
            {"id": "echoquill", "name": "Echoquill", "note": "See ECHOQUILL_CANON_PROPOSAL.md"},
            {"id": "bramblefox", "name": "Bramblefox", "purpose": "Track / Forest Bond"},
            {"id": "mossprig", "name": "Mossprig", "purpose": "Living Bulwark"},
            {"id": "thornling", "name": "Thornling", "purpose": "Transit / conduits"},
            {"id": "wisplet", "name": "Wisplet", "purpose": "Spectral archives"},
            {"id": "spirit-moth", "name": "Spirit Moth", "purpose": "Signals / invisible messages"},
            {"id": "lumenhare", "name": "Lumenhare", "purpose": "Circus companion light"},
        ]
    }
    (OUT / "creatures.json").write_text(json.dumps(creatures, indent=2) + "\n", encoding="utf-8")

    factions = {
        "factions": [
            {"id": "veiled-meridian", "name": "Veiled Meridian", "goal": "Control city core + Spark"},
            {"id": "lanternveil-circus", "name": "Lanternveil Traveling Circus", "status": "ally-uneasy"},
            {"id": "hatchery-compact", "name": "Hatchery Compact", "status": "established"},
            {"id": "aureth-civil-defense", "name": "Aureth Vale Civil Defense", "status": "ancient-stuck"},
        ]
    }
    (OUT / "factions.json").write_text(json.dumps(factions, indent=2) + "\n", encoding="utf-8")

    locations = {
        "locations": [
            {"id": "aureth-vale", "name": "Aureth Vale", "blurb": "Lost City — Fracture-layered Riftkeeper capital"},
            {"id": "central-plaza", "name": "Central Plaza", "blurb": "Guardian rise site"},
            {"id": "companion-sanctuary", "name": "Companion Sanctuary", "blurb": "Empty Resonance cradles"},
            {"id": "city-core", "name": "City Core", "blurb": "Rift engine chamber"},
            {"id": "memory-archive", "name": "Memory Archive", "blurb": "Network map chamber"},
            {"id": "storm-kingdom", "name": "Storm Kingdom", "blurb": "Issue #5 teaser only"},
        ]
    }
    (OUT / "locations.json").write_text(json.dumps(locations, indent=2) + "\n", encoding="utf-8")

    artifacts = {
        "artifacts": [
            {"id": "ancient-command-seal", "name": "Ancient Command Seal", "status": "Meridian partial copy"},
            {"id": "rift-engine-map", "name": "Rift Engine Network Map", "status": "opened by Guardian"},
            {"id": "resonance-keeper-record", "name": "Resonance Keeper Records", "status": "sanctuary archive"},
            {"id": "circus-warded-crystal", "name": "Shellward Crystal", "status": "remains at Lanternveil — not on expedition"},
        ]
    }
    (OUT / "artifacts.json").write_text(json.dumps(artifacts, indent=2) + "\n", encoding="utf-8")

    covers = {
        "main": {"title": "The Lost City", "issue": 4, "prompt": book[0]["grokPrompt"]},
        "variant-a": {
            "label": "Last Guardian portrait with broken city reflections",
            "prompt": f"{STYLE} Variant cover A: {GUARDIAN} portrait, broken city reflections in shield, empty title zones. NO text.",
        },
        "variant-b": {
            "label": "Spark inside memory vision of ancient Keepers",
            "prompt": f"{STYLE} Variant cover B: {SPARK} inside teal memory vision of ancient Keepers and Resonance cradles. NO text.",
        },
        "foil": {
            "label": "Foil — teal city runes and Guardian core",
            "prompt": f"{STYLE} Foil cover concept: teal city runes and Guardian core shimmer for foil overlay; empty title zones. NO text.",
        },
    }
    (OUT / "covers.json").write_text(json.dumps(covers, indent=2) + "\n", encoding="utf-8")

    # References index
    refs = {
        "sheets": [
            "mira-eggwarden",
            "spark",
            "cael-vesper",
            "nira-quill",
            "seris-vale",
            "bramblefox",
            "mossprig",
            "thornling",
            "wisplet",
            "spirit-moth",
            "lumenhare",
            "echoquill",
            "last-guardian",
            "aureth-vale-architecture",
            "central-plaza",
            "companion-sanctuary",
            "city-core",
            "memory-archive",
            "meridian-symbols",
            "ancient-command-seals",
        ]
    }
    (OUT / "references" / "INDEX.json").write_text(json.dumps(refs, indent=2) + "\n", encoding="utf-8")

    issue = {
        "slug": "the-lost-city",
        "issueNumber": 4,
        "title": "The Lost City",
        "subtitle": "Chapter Four — Aureth Vale Remembers",
        "synopsis": synopsis,
        "publishedAt": "2026-07-20",
        "status": "published",
        "storyPageCount": 25,
        "bookPageCount": len(book),
        "estimatedReadMinutes": 22,
        "protagonist": "Mira Eggwarden",
        "featuredCreatures": ["Spark", "Echoquill", "Bramblefox", "Mossprig", "Thornling", "Wisplet", "Lumenhare"],
        "locations": ["Aureth Vale", "Companion Sanctuary", "City Core", "Storm Kingdom (teaser)"],
        "unlockGates": [
            {"kind": "prior-issue", "slug": "the-traveling-circus", "label": "Complete Issue #3: The Traveling Circus"},
            {"kind": "admin-dev", "label": "Admin / COMICS_DEV_UNLOCK override"},
        ],
        "nextIssueTeaser": {
            "slug": "the-storm-king",
            "hook": "Above the clouds, a king who never surrendered hears the call.",
        },
        "pipeline": {
            "artProvider": "grok",
            "lettering": "programmatic",
            "bakedLettering": True,
            "contentRoot": "content/comics/the-lost-city/issue-004",
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

    for p in book:
        nn = f"{p['pageNumber']:03d}"
        page_out = {
            **p,
            "id": f"the-lost-city-issue-004-p{nn}",
            "cleanArtRel": f"generated/raw-art/page-{nn}.webp",
            "letteredArtRel": f"generated/lettered-pages/page-{nn}.webp",
            "publicArtRel": f"assets/comics/the-lost-city/issue-004/pages/page-{nn}.webp",
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
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
