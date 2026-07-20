#!/usr/bin/env python3
"""
Emit complete The Forge of Rifts Issue #8 script + page JSON + prompts + continuity + lore.
  python scripts/comics/issue-008/emit_issue_008.py

Does NOT touch issue-001–007 trees. Mira Eggwarden canon lock. Cal Reed forbidden.
Elara Venn vision only. Riftwright identity / protocol saboteur withheld.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "content/comics/the-forge-of-rifts/issue-008"

STYLE = (
    "Original high-energy Western fantasy comic storytelling with dynamic panel composition, "
    "dramatic inked linework, richly painted colors, expressive character acting, and clear cinematic action. "
    "Original Riftwilds IP only. Black steel and white stone first; cyan plasma, orange molten channels, "
    "restrained purple Rift energy accents, massive crystal columns, ancient mechanical architecture. "
    "NO purple neon AI-fantasy default. NO Marvel/DC/Pokémon characters or logos."
)
NEG = (
    "readable dialogue text, captions, logos, watermarks, page numbers, UI chrome, Marvel, DC, Pokémon, "
    "manga screentone trademarks, extra limbs, duplicate characters, missing companions, purple neon fantasy "
    "default, photoreal modern clothing, Pikachu lookalike, Cal Reed, Voltkit, Riftwright face reveal, "
    "named saboteur identity"
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
    "brass lantern clasps, half-mask of painted wood; subdued posture — supervised redemption, not fully trusted"
)
SERIS = (
    "Seris Vale: Meridian commander, sharp features, storm-dark field coat with three-arc sigil, "
    "ancient control core gauntlet, artificial Rift amplifier crystal, Guardian override codes"
)
ARKAN = (
    "Chief Engineer Arkan: elderly former Riftwright engineer, mechanical prosthetics, ancient engineer robes, "
    "crystal monocle, tool harness, burned hands, blue energy veins under translucent skin, regretful brilliant eyes"
)
AXIOM = (
    "Axiom: small floating crystalline fox prototype companion, transparent body with glowing internal circuitry, "
    "holographic tail, broken crystal horns, soft cyan-gold light, curious restorative presence"
)
NIRA = (
    "Nira Quill: uncertain hunter turned ally, lean, weather cloak, quill-knife kit, steadier eyes after Gate judgment"
)
EGG = (
    "dormant Riftborn egg: warm shell with cyan-amber seam markings, protective wrap, pulsing toward Forge machinery"
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
            f'Riftwilds comic "The Forge of Rifts" Issue #8, STORY PAGE {n}/25 — {title}.',
            f"Story purpose: {purpose}",
            f"Layout: {layout}. {len(panels)} panels with clear inked gutters.",
            " ".join(f"Panel {i+1} ({p['id']}): {p['description']}" for i, p in enumerate(panels)),
            f"Characters: {', '.join(chars)}. Creatures: {', '.join(creatures)}.",
            f"Spark design lock: {SPARK}.",
            f"Keeper lock: {MIRA}.",
            f"Arkan lock: {ARKAN}. Axiom lock: {AXIOM}.",
            f"Environment: {opts.get('environment', 'Forge of Rifts underground civilization')}. Time: {opts.get('time', 'timeless subterranean')}. Weather: {opts.get('weather', 'plasma haze and molten heat')}.",
            f"Lighting: {opts.get('lighting', 'cyan plasma, orange molten channels, crystal column glow')}. Continuity: {json.dumps(opts.get('continuity') or {})}",
            "Leave empty balloon-safe and narration-safe negative space in upper/lower panel corners. NO readable text of any kind in the artwork. NO Riftwright face.",
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
        "locations": opts.get("locations") or ["Forge of Rifts"],
        "artifacts": opts.get("artifacts") or [],
        "continuity": opts.get("continuity") or {},
        "requiredMoments": opts.get("requiredMoments") or [],
        "grokPrompt": grok,
        "negativePrompt": NEG,
        "pageTurnObjective": opts.get("pageTurn") or "Turn to continue.",
        "letteringInstructions": opts.get("lettering")
        or "Standard speech + narration; keep tails off faces and Spark's eyes; Arkan speech weary/brilliant; Axiom soft creature chirps.",
        "generationStatus": "pending",
        "letteringStatus": "pending",
        "approvalStatus": "script-complete",
        "artAlt": opts.get("artAlt") or f"{title} — The Forge of Rifts page {n}",
        "atmosphere": opts.get("atmosphere") or "rift",
        "transcript": build_transcript(panels),
        "a11yTranscript": build_transcript(panels),
        "codexLinks": opts.get("codexLinks") or [],
        "cardTeases": opts.get("cardTeases") or [],
        "spread": opts.get("spread"),
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
            f'Riftwilds comic book {role} page for The Forge of Rifts Issue #8 — {title}.',
            " ".join(p["description"] for p in panels),
            f"Keeper: {MIRA}. Spark: {SPARK}. Arkan: {ARKAN}. Axiom: {AXIOM}.",
            "Empty zones for title lettering. NO readable text in art. NO Riftwright face.",
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
        "atmosphere": opts.get("atmosphere") or "rift",
        "letteringInstructions": "Bake titles/credits programmatically.",
        "transcript": build_transcript(panels),
        "a11yTranscript": build_transcript(panels),
    }


story: list[dict] = []

# ── STORY 1–25 ──────────────────────────────────────────────
story.append(
    page_base(
        1,
        "Forge Threshold",
        "Meridian Road opens into the Forge; Spark reacts violently to artificial Rift energy.",
        "splash",
        [
            panel(
                "p1a",
                f"Full-bleed splash: colossal underground Forge of Rifts — black steel towers, white stone arches, cyan plasma rivers, orange molten channels, giant gears, floating platforms. Meridian Road bridge spills the party in. {SPARK} recoils in pain-flash cyan; {MIRA} bracing him; {CAEL} supervised lag; {NIRA}; companions; wrapped {EGG}. Empty caption zones.",
                [
                    balloon("narration", None, "The Gate had opened. The second creation had already begun. Beyond Meridian Road waited the machine that made the First Rift possible.", 50, 8, maxWidthPct=62),
                    balloon("creature", "Spark", "*violent-RECOIL*", 38, 55, "down"),
                    balloon("shout", "Mira Eggwarden", "Spark—!", 55, 70, "up"),
                    balloon("sfx", None, "FORGE-HUMMMM", 78, 35),
                    balloon("caption", None, "THE FORGE OF RIFTS", 50, 92, maxWidthPct=44),
                ],
            )
        ],
        characters=["mira-eggwarden", "cael-vesper", "nira-quill"],
        creatures=["spark", "bramblefox", "mossprig", "thornling", "wisplet", "spirit-moth", "truthwing"],
        continuity=cont(1, {"location": "Forge threshold / Meridian Road", "spark": "violent-reaction", "egg": "cracked-once-from-gate", "fromIssue7": "second-creation"}),
        requiredMoments=[1],
        pageTurn="The egg answers.",
        atmosphere="rift",
        lighting="cyan plasma flare on Spark's fur",
        environment="Forge of Rifts arrival bridge",
        codexLinks=["forge-of-rifts"],
        artifacts=["dormant-riftborn-egg"],
    )
)

story.append(
    page_base(
        2,
        "Egg Glow",
        "Dormant egg begins glowing in answer to Forge resonance.",
        "three-stack",
        [
            panel(
                "p2a",
                f"{MIRA} kneels, unwrapping the {EGG}; seam markings blaze cyan-amber; Spark presses muzzle to shell despite pain.",
                [
                    balloon("narration", None, "The egg did not wake. It recognized something.", 50, 18, maxWidthPct=52),
                    balloon("creature", "Spark", "*pain-bond-chirp*", 40, 60, "down"),
                ],
            ),
            panel(
                "p2b",
                f"Close on glowing egg seams casting light on {MIRA}'s face and Compact lantern charm.",
                [
                    balloon("speech", "Mira Eggwarden", "Steady. You're not alone in there.", 50, 30, "down", maxWidthPct=40),
                    balloon("sfx", None, "egg-PULSE", 70, 65),
                ],
            ),
            panel(
                "p2c",
                f"{CAEL} hanging back with supervised distance; {NIRA} scanning gantries; Truthwing glassy wings reflecting plasma.",
                [
                    balloon("whisper", "Cael Vesper", "Artificial resonance. Louder than Tempestria's engine.", 35, 28, "down", maxWidthPct=40),
                    balloon("speech", "Nira Quill", "Louder means Meridian wants it more.", 65, 70, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper", "nira-quill"],
        creatures=["spark", "truthwing"],
        continuity=cont(2, {"location": "Forge threshold plaza", "egg": "glowing-cracked-once", "cael": "supervised-turned", "nira": "cleared-ally"}),
        requiredMoments=[2],
        pageTurn="Descend into the machine-city.",
        atmosphere="rift",
        artifacts=["dormant-riftborn-egg"],
    )
)

story.append(
    page_base(
        3,
        "Machine City",
        "Party descends into half-city half-factory; first sight of civilization scale.",
        "two-stack",
        [
            panel(
                "p3a",
                "Wide descent: floating platforms over crystal rivers, endless conveyor systems, overgrown laboratories clinging to white stone, security construct silhouettes dormant on rails.",
                [
                    balloon("narration", None, "Half ancient city. Half impossible factory.", 50, 12, maxWidthPct=55),
                    balloon("sfx", None, "gear-CLANK", 72, 50),
                ],
            ),
            panel(
                "p3b",
                f"{MIRA} leading with Spark and egg; companions fanned; distant resonance towers flickering; abandoned Keeper quarters visible as tiny windows.",
                [
                    balloon("speech", "Mira Eggwarden", "Stay close. Nothing here was built for visitors.", 45, 30, "down", maxWidthPct=42),
                    balloon("creature", "Spirit Moth", "*pattern-search*", 65, 68, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper", "nira-quill"],
        creatures=["spark", "spirit-moth", "bramblefox", "mossprig"],
        continuity=cont(3, {"location": "Forge machine-city descent", "tone": "awe-dread"}),
        requiredMoments=[],
        pageTurn="Companions find the abandoned.",
        atmosphere="rift",
        locations=["Forge of Rifts", "Crystal River Platforms"],
    )
)

story.append(
    page_base(
        4,
        "Abandoned Companions",
        "Bramblefox discovers abandoned / failed companion shells in a side hall.",
        "three-stack",
        [
            panel(
                "p4a",
                "Bramblefox Forest Bond vines leading into a broken assembly hall lined with empty companion cradles and inert crystalline husks.",
                [
                    balloon("creature", "Bramblefox", "*scent-grief*", 40, 28, "down"),
                    balloon("speech", "Nira Quill", "Bramblefox found something.", 60, 70, "up"),
                ],
            ),
            panel(
                "p4b",
                f"{MIRA} and Spark before rows of abandoned prototype shells — not weapons, failed protectors; solemn lighting.",
                [
                    balloon("speech", "Mira Eggwarden", "They tried to make Keepers… out of companions.", 50, 25, "down", maxWidthPct=44),
                    balloon("creature", "Spark", "*mourn-chirp*", 55, 65, "up"),
                ],
            ),
            panel(
                "p4c",
                "Close: one cradle stamped with faded Resonance Keeper motif (no readable text); orange molten light under floor.",
                [
                    balloon("narration", None, "Progress without ethics leaves rooms full of almosts.", 50, 40, maxWidthPct=50),
                ],
            ),
        ],
        characters=["mira-eggwarden", "nira-quill"],
        creatures=["spark", "bramblefox"],
        continuity=cont(4, {"location": "broken assembly hall", "discovery": "abandoned-companions"}),
        requiredMoments=[3],
        pageTurn="Mossprig shields the damaged.",
        atmosphere="ruin",
        cardTeases=["bramblefox"],
    )
)

story.append(
    page_base(
        5,
        "Living Bulwark",
        "Mossprig protects damaged prototypes from collapsing debris / residual energy.",
        "two-stack",
        [
            panel(
                "p5a",
                "Ceiling chain snaps; Mossprig Living Bulwark roots explode into a green shield over damaged crystalline fox/owl husks still faintly ticking.",
                [
                    balloon("sfx", None, "CHAIN-SNAP", 70, 20),
                    balloon("creature", "Mossprig", "*root-BRACE*", 40, 45, "down"),
                    balloon("shout", "Mira Eggwarden", "Mossprig!", 60, 75, "up"),
                ],
            ),
            panel(
                "p5b",
                f"Aftermath: Mossprig trembling but holding; {MIRA} hands on bark; Spark lending soft glow to stabilize husks without claiming them.",
                [
                    balloon("speech", "Mira Eggwarden", "You don't own them. You protect them. That's the difference.", 50, 28, "down", maxWidthPct=46),
                    balloon("narration", None, "Even failed light deserves a keeper.", 50, 78, maxWidthPct=48),
                ],
            ),
        ],
        characters=["mira-eggwarden"],
        creatures=["spark", "mossprig"],
        continuity=cont(5, {"location": "assembly hall collapse pocket", "mossprig": "protecting-prototypes"}),
        requiredMoments=[4],
        pageTurn="Thornling finds a switch.",
        atmosphere="ruin",
    )
)

story.append(
    page_base(
        6,
        "Power Restored",
        "Thornling accidentally restores a local power ring.",
        "three-stack",
        [
            panel(
                "p6a",
                "Thornling poking a thorn into a crystalline lock-ring; sparks of cyan; ancient console wakes.",
                [
                    balloon("creature", "Thornling", "*curious-prick*", 45, 30, "down"),
                    balloon("sfx", None, "click-WHIRRR", 68, 55),
                ],
            ),
            panel(
                "p6b",
                "Corridor lights cascade on — resonance towers, conveyor belts lurch, hologram schematics bloom (empty text zones).",
                [
                    balloon("shout", "Cael Vesper", "That woke a whole ring!", 50, 30, "down"),
                    balloon("speech", "Nira Quill", "Then Meridian just heard us.", 55, 70, "up"),
                ],
            ),
            panel(
                "p6c",
                f"{SPARK} ears flat as Forge systems re-address him as 'missing component' via light patterns (no readable words).",
                [
                    balloon("creature", "Spark", "*alarm-chirp*", 40, 35, "down"),
                    balloon("thought", "Mira Eggwarden", "They built a hunger that looks like a welcome.", 60, 72, maxWidthPct=40),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper", "nira-quill"],
        creatures=["spark", "thornling"],
        continuity=cont(6, {"location": "power ring corridor", "power": "partial-restore", "meridian": "alerted"}),
        requiredMoments=[5],
        pageTurn="Into the ancient laboratory.",
        atmosphere="rift",
    )
)

story.append(
    page_base(
        7,
        "Memory Crystals",
        "Wisplet enters memory crystals; First Rift planning glimpsed.",
        "three-stack",
        [
            panel(
                "p7a",
                "Memory vault: floating crystal shards showing silent visions — Soft Exodus roads, Keepers, Forge blueprints as light.",
                [
                    balloon("caption", None, "MEMORY VAULT", 50, 12, maxWidthPct=36),
                    balloon("creature", "Wisplet", "*phase-in*", 40, 40, "down"),
                ],
            ),
            panel(
                "p7b",
                "Wisplet inside a crystal: vision of engineers (faces soft/obscured) rewriting a protocol circle — saboteur hand gloved, identity unclear.",
                [
                    balloon("narration", None, "The First Rift was planned. Not by accident. Not by storm.", 50, 20, maxWidthPct=52),
                    balloon("whisper", "Mira Eggwarden", "Someone wrote the fracture like a command.", 55, 72, "up", maxWidthPct=40),
                ],
            ),
            panel(
                "p7c",
                f"{MIRA} pulling Wisplet gently free as crystal overheats; Spark shielding her wrist.",
                [
                    balloon("speech", "Mira Eggwarden", "Enough. Knowledge that burns still burns.", 50, 35, "down", maxWidthPct=42),
                    balloon("sfx", None, "crystal-CRACK", 70, 60),
                ],
            ),
        ],
        characters=["mira-eggwarden"],
        creatures=["spark", "wisplet"],
        continuity=cont(7, {"location": "memory vault", "reveal": "first-rift-planned", "saboteur": "identity-withheld"}),
        requiredMoments=[6],
        pageTurn="Blueprints in moth-light.",
        atmosphere="rift",
        artifacts=["memory-crystal"],
    )
)

story.append(
    page_base(
        8,
        "Hidden Blueprints",
        "Spirit Moth discovers hidden blueprint scrolls of Forge original purpose.",
        "two-stack",
        [
            panel(
                "p8a",
                "Spirit Moth lantern-codes unlocking a wall panel; blueprint cylinders roll out — Resonance Keepers, Guardian Constructs, City Engines, Rift Stabilizers illustrated as diagrams (no readable text).",
                [
                    balloon("creature", "Spirit Moth", "*code-unlock*", 35, 25, "down"),
                    balloon("speech", "Cael Vesper", "Those aren't weapons.", 60, 55, "left"),
                ],
            ),
            panel(
                "p8b",
                f"{MIRA} studying stabilizer diagram; egg glow syncing to blueprint lines; Spark watching with dawning understanding.",
                [
                    balloon("speech", "Mira Eggwarden", "They built this to heal unstable dimensions.", 45, 28, "down", maxWidthPct=44),
                    balloon("narration", None, "Someone later taught the machine how to wound.", 50, 75, maxWidthPct=50),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper"],
        creatures=["spark", "spirit-moth"],
        continuity=cont(8, {"location": "blueprint alcove", "forgePurpose": "heal-not-weapon"}),
        requiredMoments=[7],
        pageTurn="Incubator Alpha.",
        atmosphere="rift",
        artifacts=["forge-blueprints"],
    )
)

story.append(
    page_base(
        9,
        "Incubator Alpha",
        "Team finds Companion Incubator Alpha — origin of Resonance Keepers / Spark's line.",
        "splash",
        [
            panel(
                "p9a",
                f"Vast incubation chamber: circular rings of empty pods, central cradle etched with Last Light / Resonance motifs, dormant egg's glow answering the cradle. {MIRA}, Spark, companions small against scale. Empty caption zones.",
                [
                    balloon("caption", None, "COMPANION INCUBATOR ALPHA", 50, 10, maxWidthPct=50),
                    balloon("narration", None, "Here, protectors were grown — not soldiers.", 50, 22, maxWidthPct=55),
                    balloon("creature", "Spark", "*home-ache-chirp*", 42, 60, "down"),
                    balloon("speech", "Mira Eggwarden", "This is where your kind began… to keep, not to obey.", 58, 78, "up", maxWidthPct=42),
                ],
            )
        ],
        characters=["mira-eggwarden", "nira-quill"],
        creatures=["spark", "bramblefox", "mossprig", "thornling", "wisplet", "spirit-moth"],
        continuity=cont(9, {"location": "Companion Incubator Alpha", "spark": "lineage-recognition", "egg": "cradle-sync"}),
        requiredMoments=[8],
        pageTurn="Someone still lives here.",
        atmosphere="rift",
        locations=["Companion Incubator Alpha"],
        cardTeases=["spark"],
    )
)

story.append(
    page_base(
        10,
        "Chief Engineer",
        "Meet Chief Engineer Arkan emerging from memory preservation.",
        "three-stack",
        [
            panel(
                "p10a",
                f"Preservation alcove cracks open: {ARKAN} stepping out — elderly, prosthetics, crystal monocle, blue energy veins, tool harness; centuries of dust falling.",
                [
                    balloon("sfx", None, "stasis-HISS", 70, 25),
                    balloon("speech", "Arkan", "Visitors. Living ones. How… rude of the centuries.", 45, 55, "up", maxWidthPct=42),
                ],
            ),
            panel(
                "p10b",
                f"{MIRA} protective stance with Spark; Arkan studying Spark with aching curiosity, not greed.",
                [
                    balloon("speech", "Mira Eggwarden", "Stay back. We're Keepers — not spare parts.", 40, 30, "down", maxWidthPct=40),
                    balloon("speech", "Arkan", "Good. The Forge forgot that difference. I have not.", 60, 70, "up", maxWidthPct=40),
                ],
            ),
            panel(
                "p10c",
                "Arkan's burned hands raised empty; monocle reflecting Spark's glow; shame in posture.",
                [
                    balloon("whisper", "Arkan", "I am Chief Engineer Arkan. Last architect who stayed.", 50, 40, "down", maxWidthPct=46),
                    balloon("creature", "Spark", "*wary-curious*", 55, 72, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "arkan"],
        creatures=["spark"],
        continuity=cont(10, {"location": "preservation alcove near Incubator", "arkan": "introduced"}),
        requiredMoments=[9],
        pageTurn="Hear the Forge's history.",
        atmosphere="rift",
        cardTeases=["arkan"],
    )
)

story.append(
    page_base(
        11,
        "Forge History",
        "Arkan reveals Forge purpose, weaponization, Riftwright disappearance before activation.",
        "four-grid",
        [
            panel(
                "p11a",
                "Arkan gesturing at holographic Forge timeline: healing engines, Resonance Keepers, Guardian Constructs, City Engines, Stabilizers.",
                [
                    balloon("speech", "Arkan", "We made Resonance Keepers. Guardians. City Engines. Stabilizers.", 50, 30, "down", maxWidthPct=44),
                ],
            ),
            panel(
                "p11b",
                "Holo shifts to First Rift tear — artificial; protocol rings corrupted; gloved hand rewriting (identity hidden).",
                [
                    balloon("speech", "Arkan", "Someone rewrote the Forge protocols. The Riftwright never intended genocide.", 50, 35, "down", maxWidthPct=46),
                ],
            ),
            panel(
                "p11c",
                "Empty command dais — Riftwright gone before final activation; other silhouette pushing the last command (face obscured).",
                [
                    balloon("narration", None, "The Riftwright vanished before activation. Someone else pushed the final command.", 50, 40, maxWidthPct=50),
                ],
            ),
            panel(
                "p11d",
                f"{MIRA} holding Spark; egg bright; Arkan ashamed.",
                [
                    balloon("speech", "Mira Eggwarden", "Then the enemy may not be the original creators.", 45, 30, "down", maxWidthPct=42),
                    balloon("whisper", "Arkan", "Knowledge without conscience is just a prettier knife.", 55, 72, "up", maxWidthPct=40),
                ],
            ),
        ],
        characters=["mira-eggwarden", "arkan"],
        creatures=["spark"],
        continuity=cont(11, {"location": "history holodais", "reveal": "protocols-altered", "riftwright": "vanished-pre-activation", "saboteur": "withheld"}),
        requiredMoments=[10],
        pageTurn="A prototype wakes.",
        atmosphere="rift",
        artifacts=["forge-blueprints", "memory-crystal"],
    )
)

story.append(
    page_base(
        12,
        "Axiom Awakens",
        "Prototype companion Axiom awakens and bonds restoratively to the group.",
        "three-stack",
        [
            panel(
                "p12a",
                f"Side cradle flares: {AXIOM} floating free — crystalline fox, holographic tail, broken horns, circuitry glow.",
                [
                    balloon("sfx", None, "proto-CHIME", 65, 25),
                    balloon("creature", "Axiom", "*query-trill*", 50, 50, "down"),
                ],
            ),
            panel(
                "p12b",
                f"Axiom Pulse Repair light knitting a cracked platform under {MIRA}'s boots; Spark nose-to-nose with Axiom.",
                [
                    balloon("speech", "Arkan", "Axiom. Adaptive Matrix. Built to copy protection — never ownership.", 50, 22, "down", maxWidthPct=46),
                    balloon("creature", "Spark", "*welcome-chirp*", 40, 65, "right"),
                    balloon("creature", "Axiom", "*matrix-hum*", 60, 70, "left"),
                ],
            ),
            panel(
                "p12c",
                f"Party reunited shot: Axiom orbiting Spark and egg; {CAEL} watching with careful hope.",
                [
                    balloon("speech", "Mira Eggwarden", "Invite only. Same rule — even for prototypes.", 50, 35, "down", maxWidthPct=42),
                    balloon("narration", None, "A companion that remembers repair is already choosing a side.", 50, 78, maxWidthPct=50),
                ],
            ),
        ],
        characters=["mira-eggwarden", "arkan", "cael-vesper"],
        creatures=["spark", "axiom"],
        continuity=cont(12, {"location": "Incubator Alpha side cradle", "axiom": "awakened"}),
        requiredMoments=[11],
        pageTurn="Meridian arrives.",
        atmosphere="rift",
        cardTeases=["axiom"],
    )
)

story.append(
    page_base(
        13,
        "Meridian Assault",
        "Seris Vale attacks with Meridian strike force to restart the Forge.",
        "three-stack",
        [
            panel(
                "p13a",
                f"Blast doors explode: {SERIS} with control core gauntlet and amplifier crystal; Meridian agents; override codes projecting toward security rings.",
                [
                    balloon("sfx", None, "BLAST-DOORS", 70, 20),
                    balloon("shout", "Seris Vale", "The Resonance component is here. Secure the egg.", 45, 45, "down", maxWidthPct=44),
                ],
            ),
            panel(
                "p13b",
                f"{MIRA} shielding Spark and egg; Nira engaging; Cael lantern-flash stun (supervised help); Axiom barrier flicker.",
                [
                    balloon("speech", "Mira Eggwarden", "You don't get to manufacture living light!", 40, 30, "down", maxWidthPct=40),
                    balloon("speech", "Cael Vesper", "I'll hold the lane — don't thank me yet.", 65, 65, "up", maxWidthPct=36),
                ],
            ),
            panel(
                "p13c",
                "Arkan slamming emergency locks; blue veins flaring; shame and resolve.",
                [
                    balloon("speech", "Arkan", "They want to restart what we buried. I will not watch twice.", 50, 40, "down", maxWidthPct=46),
                ],
            ),
        ],
        characters=["mira-eggwarden", "seris-vale", "cael-vesper", "nira-quill", "arkan"],
        creatures=["spark", "axiom", "bramblefox"],
        continuity=cont(13, {"location": "Incubator Alpha approach", "meridian": "assault", "seris": "control-core"}),
        requiredMoments=[12],
        pageTurn="An artificial Rift tears open.",
        atmosphere="rift",
    )
)

story.append(
    page_base(
        14,
        "Artificial Rift",
        "Seris opens an artificial Rift inside the Forge.",
        "splash",
        [
            panel(
                "p14a",
                f"Cinematic splash: artificial Rift tearing above Rift Engine Alpha — sharper, geometric, cyan-purple edges vs organic First Rift lore; platforms tilt; {SERIS} amplifier blazing; party small below.",
                [
                    balloon("sfx", None, "ARTIFICIAL-TEAR", 70, 28),
                    balloon("narration", None, "Natural Rifts bleed. Artificial Rifts cut.", 50, 12, maxWidthPct=55),
                    balloon("shout", "Seris Vale", "Engine Alpha — answer the Meridian!", 45, 70, "up", maxWidthPct=42),
                    balloon("creature", "Spark", "*component-pain!*", 35, 55, "right"),
                ],
            )
        ],
        characters=["mira-eggwarden", "seris-vale", "arkan"],
        creatures=["spark", "axiom"],
        continuity=cont(14, {"location": "Rift Engine Alpha plaza", "artificialRift": "open"}),
        requiredMoments=[13],
        pageTurn="Failed experiments break free.",
        atmosphere="rift",
        locations=["Rift Engine Alpha"],
        artifacts=["artificial-rift-amplifier"],
    )
)

story.append(
    page_base(
        15,
        "Escaped Experiments",
        "Companion experiments escape; Forge security constructs activate.",
        "three-stack",
        [
            panel(
                "p15a",
                "Broken incubation pods burst — unstable prototype creatures thrashing, scared not evil; Cindermink-style restraint possible via Axiom Pulse Repair calming one.",
                [
                    balloon("sfx", None, "POD-BURST", 68, 22),
                    balloon("creature", "Axiom", "*pulse-repair*", 40, 45, "down"),
                    balloon("speech", "Mira Eggwarden", "Don't harm them — guide them!", 55, 75, "up"),
                ],
            ),
            panel(
                "p15b",
                "Forge Guardians awaken on rails — black steel / white stone constructs with cyan oath flames (Oathwarden / Last Guardian lineage echo).",
                [
                    balloon("narration", None, "Security remembered oaths older than Meridian uniforms.", 50, 20, maxWidthPct=50),
                    balloon("sfx", None, "guardian-LOCK", 65, 60),
                ],
            ),
            panel(
                "p15c",
                f"Chaos triangulation: Meridian vs Guardians vs freed experiments; party in middle; egg cracking glow intensifying.",
                [
                    balloon("speech", "Nira Quill", "The Forge is choosing sides — and none of them are calm!", 50, 40, "down", maxWidthPct=44),
                ],
            ),
        ],
        characters=["mira-eggwarden", "nira-quill", "seris-vale"],
        creatures=["spark", "axiom", "mossprig", "bramblefox"],
        continuity=cont(15, {"location": "Engine Alpha plaza", "experiments": "escaped", "guardians": "active"}),
        requiredMoments=[14, 15],
        pageTurn="The battle becomes the Forge itself.",
        atmosphere="rift",
    )
)

story.append(
    page_base(
        16,
        "Giant Battle",
        "Giant multi-faction Forge battle begins.",
        "montage",
        [
            panel(
                "p16a",
                "Wide battle: Bramblefox vines vs Meridian agents; Mossprig bulwark; Thornling shorting weapons; Wisplet phasing through beams; Spirit Moth light-codes confusing targeting.",
                [
                    balloon("sfx", None, "CLASH-BOOM", 70, 20),
                    balloon("creature", "Bramblefox", "*vine-SNAP*", 30, 40, "right"),
                    balloon("creature", "Thornling", "*short-circuit!*", 55, 55, "down"),
                ],
            ),
            panel(
                "p16b",
                f"{SERIS} directing Guardians with override codes — half obey, half resist; artificial Rift widening.",
                [
                    balloon("shout", "Seris Vale", "Override! Perfect Riftborn require perfect control!", 50, 35, "down", maxWidthPct=44),
                ],
            ),
            panel(
                "p16c",
                f"{MIRA} and Spark at center; Axiom Adaptive Matrix copying Mossprig's bulwark shimmer briefly.",
                [
                    balloon("creature", "Axiom", "*adaptive-matrix*", 40, 30, "down"),
                    balloon("speech", "Mira Eggwarden", "Protect — don't obey a thief!", 60, 70, "up", maxWidthPct=38),
                ],
            ),
        ],
        characters=["mira-eggwarden", "seris-vale", "arkan", "nira-quill"],
        creatures=["spark", "axiom", "bramblefox", "mossprig", "thornling", "wisplet", "spirit-moth"],
        continuity=cont(16, {"location": "Engine Alpha battle", "battle": "multi-faction"}),
        requiredMoments=[16],
        pageTurn="Spark nearly taken.",
        atmosphere="rift",
    )
)

story.append(
    page_base(
        17,
        "Near Capture",
        "Meridian nearly captures Spark as missing component.",
        "three-stack",
        [
            panel(
                "p17a",
                f"Restraint field from {SERIS}'s control core snares Spark; cyan leash toward Engine Alpha intake.",
                [
                    balloon("sfx", None, "FIELD-LOCK", 70, 25),
                    balloon("creature", "Spark", "*struggle-yelp*", 40, 50, "down"),
                    balloon("shout", "Mira Eggwarden", "He chooses! He is not a component!", 55, 75, "up", maxWidthPct=40),
                ],
            ),
            panel(
                "p17b",
                f"{CAEL} burns a lantern flare into the field projector; guilt and courage mixed; Nira cuts a conduit.",
                [
                    balloon("speech", "Cael Vesper", "I opened doors for them once. Not this one.", 45, 30, "down", maxWidthPct=42),
                    balloon("speech", "Nira Quill", "Then cut the wire — don't write a speech!", 60, 70, "up"),
                ],
            ),
            panel(
                "p17c",
                "Spark breaks free mid-air; egg wrap blazing; Arkan reaching toward Reactor kill-switch with prosthetic hand.",
                [
                    balloon("narration", None, "Choice is a kind of armor. Meridian never forged that.", 50, 35, maxWidthPct=50),
                ],
            ),
        ],
        characters=["mira-eggwarden", "seris-vale", "cael-vesper", "nira-quill", "arkan"],
        creatures=["spark"],
        continuity=cont(17, {"location": "Engine Alpha intake", "spark": "nearly-captured-then-freed", "cael": "earns-inch"}),
        requiredMoments=[17],
        pageTurn="Double-page battle.",
        atmosphere="rift",
    )
)

story.append(
    page_base(
        18,
        "Forge War — Left",
        "Double-page battle left: all companions, Guardians, Artificial Rift, egg cracks further.",
        "splash",
        [
            panel(
                "p18a",
                f"DOUBLE-PAGE SPREAD LEFT: massive Forge battle — {SPARK}, Bramblefox, Mossprig, Thornling, Wisplet, Spirit Moth, {AXIOM}, Forge Guardians, Artificial Rift overhead, reactor sparks; {SERIS} mid-command; {MIRA} with cracking {EGG} (further crack lines glowing). Empty balloon zones upper/lower. Continues visually into page 19.",
                [
                    balloon("sfx", None, "REACTOR-ROAR", 70, 18),
                    balloon("creature", "Spark", "*last-light-flare*", 35, 45, "down"),
                    balloon("creature", "Axiom", "*system-restore!*", 55, 55, "left"),
                    balloon("narration", None, "The Forge shook like a heart deciding whether to keep beating.", 50, 88, maxWidthPct=58),
                ],
            )
        ],
        characters=["mira-eggwarden", "seris-vale", "arkan"],
        creatures=["spark", "axiom", "bramblefox", "mossprig", "thornling", "wisplet", "spirit-moth"],
        continuity=cont(18, {"location": "Engine Alpha — double spread L", "egg": "cracks-further-second-time", "spread": "18-19", "priorCrack": "gate-issue-007"}),
        requiredMoments=[18, 16],
        pageTurn="Arkan's last act.",
        atmosphere="rift",
        spread={"pair": 19, "side": "left"},
        lettering="Wide cinematic; fewer balloons; SFX dominant.",
    )
)

story.append(
    page_base(
        19,
        "Forge War — Sacrifice",
        "Double-page battle right: reactor explosion threat; Arkan sacrifices preserved body.",
        "splash",
        [
            panel(
                "p19a",
                f"DOUBLE-PAGE SPREAD RIGHT: continues battle — reactor core going critical; {ARKAN} diving into the control lattice, blue veins becoming pure light, prosthetics shattering as he overloads preservation to vent the Artificial Rift and save the party; {MIRA} reaching; Spark stabilizing edge; explosion bloom (cyan/orange). Empty zones for final lines.",
                [
                    balloon("shout", "Arkan", "Someone can finally fix my mistakes—!", 40, 28, "down", maxWidthPct=42),
                    balloon("speech", "Arkan", "Protect. Don't obey.", 55, 48, "up", maxWidthPct=34),
                    balloon("sfx", None, "SACRIFICE-BLOOM", 72, 60),
                    balloon("creature", "Spark", "*grief-bright*", 30, 70, "right"),
                ],
            )
        ],
        characters=["mira-eggwarden", "arkan", "seris-vale"],
        creatures=["spark", "axiom"],
        continuity=cont(19, {"location": "Engine Alpha — double spread R", "arkan": "sacrificed", "spread": "18-19"}),
        requiredMoments=[19],
        pageTurn="The Forge collapses.",
        atmosphere="rift",
        spread={"pair": 18, "side": "right"},
        lettering="Heroic final speech; keep Arkan's last lines readable.",
    )
)

story.append(
    page_base(
        20,
        "Collapse",
        "Forge begins collapsing; truth settles — creators vs corrupters.",
        "three-stack",
        [
            panel(
                "p20a",
                "Platforms fall; molten channels overflow; Guardians freeze mid-step; Meridian scrambling.",
                [
                    balloon("sfx", None, "COLLAPSE-RUMBLE", 65, 25),
                    balloon("narration", None, "Machines die louder than men — and quieter than guilt.", 50, 70, maxWidthPct=52),
                ],
            ),
            panel(
                "p20b",
                f"{MIRA} clutching egg and Spark; Axiom System Restore dampening corrupted Rift shards; Cael and Nira pulling wounded clear.",
                [
                    balloon("speech", "Mira Eggwarden", "Arkan bought us a path. We use it.", 50, 30, "down", maxWidthPct=40),
                    balloon("creature", "Axiom", "*system-restore*", 55, 65, "up"),
                ],
            ),
            panel(
                "p20c",
                "Arkan's monocle left on cracked white stone — empty; blue dust dispersing.",
                [
                    balloon("whisper", "Cael Vesper", "He stayed centuries… and still chose us over the machine.", 50, 45, "down", maxWidthPct=46),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper", "nira-quill"],
        creatures=["spark", "axiom"],
        continuity=cont(20, {"location": "collapsing Engine Alpha", "arkan": "gone", "forge": "collapsing"}),
        requiredMoments=[20],
        pageTurn="Spark steadies the reactor.",
        atmosphere="ruin",
    )
)

story.append(
    page_base(
        21,
        "Reactor Alpha",
        "Spark stabilizes Rift Engine Alpha long enough for escape; purpose affirmed.",
        "two-stack",
        [
            panel(
                "p21a",
                f"{SPARK} at Reactor Alpha core by invitation — not forced bond; cyan-gold aura knitting containment rings; {MIRA} hand open, inviting, never forcing.",
                [
                    balloon("speech", "Mira Eggwarden", "Only if you want to. Invite. Wait.", 40, 25, "down", maxWidthPct=38),
                    balloon("creature", "Spark", "*choose-stabilize*", 55, 50, "down"),
                    balloon("sfx", None, "reactor-SETTLE", 72, 70),
                ],
            ),
            panel(
                "p21b",
                "Reactor settles to safe venting; Spark exhausted but proud; egg warm against Mira; Axiom copying Spark's calm passive briefly.",
                [
                    balloon("narration", None, "Spark's species was created to protect — not obey.", 50, 20, maxWidthPct=52),
                    balloon("thought", "Mira Eggwarden", "Why you survived: you were never finished as a weapon.", 50, 70, maxWidthPct=46),
                ],
            ),
        ],
        characters=["mira-eggwarden"],
        creatures=["spark", "axiom"],
        continuity=cont(21, {"location": "Rift Engine Alpha core", "spark": "stabilized-reactor", "theme": "protect-not-obey"}),
        requiredMoments=[21],
        pageTurn="Run.",
        atmosphere="rift",
        artifacts=["rift-engine-alpha"],
    )
)

story.append(
    page_base(
        22,
        "Escape",
        "Team escapes collapsing Forge via Meridian Road reverse path.",
        "three-stack",
        [
            panel(
                "p22a",
                "Sprint across cracking floating platforms; companions leaping; Truthwing guiding reflections of safe path.",
                [
                    balloon("creature", "Truthwing", "*path-gleam*", 40, 25, "down"),
                    balloon("shout", "Nira Quill", "Bridge left — go!", 60, 55, "up"),
                ],
            ),
            panel(
                "p22b",
                f"{MIRA} with egg and Spark; Axiom repairing a collapsing step mid-air; Cael covering rear.",
                [
                    balloon("speech", "Cael Vesper", "I still don't deserve trust. I can still deserve your backs.", 50, 35, "down", maxWidthPct=44),
                    balloon("speech", "Mira Eggwarden", "Then keep earning. Move!", 55, 72, "up"),
                ],
            ),
            panel(
                "p22c",
                "Party clears into Meridian Road tunnel as Forge mouth collapses behind — white stone dust and cyan sparks.",
                [
                    balloon("sfx", None, "GATE-SLAM", 65, 40),
                    balloon("narration", None, "They escaped with light — and with questions heavier than steel.", 50, 75, maxWidthPct=52),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper", "nira-quill"],
        creatures=["spark", "axiom", "truthwing", "bramblefox", "mossprig"],
        continuity=cont(22, {"location": "Meridian Road egress", "forgePrimary": "collapsed-vented", "party": "escaped"}),
        requiredMoments=[22],
        pageTurn="Seris still has hands.",
        atmosphere="ruin",
    )
)

story.append(
    page_base(
        23,
        "Stolen Blueprint",
        "Seris steals a critical blueprint during the chaos.",
        "three-stack",
        [
            panel(
                "p23a",
                f"Cutaway: {SERIS} snatching a sealed blueprint cylinder from a falling vault — Second Forge schematic hinted as twin glyph (no readable text).",
                [
                    balloon("whisper", "Seris Vale", "One Forge dies. The project does not.", 50, 30, "down", maxWidthPct=42),
                    balloon("sfx", None, "vault-SNATCH", 68, 55),
                ],
            ),
            panel(
                "p23b",
                "Seris vanishing into a private Meridian fissure with amplifier and blueprint; agents covering.",
                [
                    balloon("shout", "Nira Quill", "She's running with a scroll!", 45, 35, "down"),
                    balloon("speech", "Mira Eggwarden", "We can't chase and keep the egg safe.", 55, 70, "up", maxWidthPct=40),
                ],
            ),
            panel(
                "p23c",
                "Close on Mira's face — fury tempered by Keeper priority; Spark and Axiom flank the egg.",
                [
                    balloon("narration", None, "Some victories leave the villain holding tomorrow.", 50, 45, maxWidthPct=50),
                ],
            ),
        ],
        characters=["mira-eggwarden", "seris-vale", "nira-quill"],
        creatures=["spark", "axiom"],
        continuity=cont(23, {"location": "egress / Meridian fissure", "seris": "stole-second-forge-blueprint"}),
        requiredMoments=[23],
        pageTurn="A second Forge exists.",
        atmosphere="night",
        artifacts=["second-forge-blueprint"],
    )
)

story.append(
    page_base(
        24,
        "Second Forge",
        "Reveal another hidden Forge exists under another continent.",
        "two-stack",
        [
            panel(
                "p24a",
                "Party in quiet Meridian Road alcove; Axiom projects a map hologram from residual matrix — two Forge glyphs on different continents.",
                [
                    balloon("creature", "Axiom", "*map-projection*", 40, 30, "down"),
                    balloon("speech", "Mira Eggwarden", "There's another one.", 55, 65, "up"),
                ],
            ),
            panel(
                "p24b",
                "Wide map vision: primary Forge cooling wreck; second Forge pulsing awake far away under alien coastline; egg sync-pulse.",
                [
                    balloon("narration", None, "Deep beneath another continent, a second Forge listened.", 50, 18, maxWidthPct=55),
                    balloon("whisper", "Cael Vesper", "If Meridian has the blueprint… they'll find it first.", 50, 75, "up", maxWidthPct=44),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper"],
        creatures=["spark", "axiom"],
        continuity=cont(24, {"location": "Meridian Road alcove", "secondForge": "revealed-exists"}),
        requiredMoments=[24],
        pageTurn="Someone is already there.",
        atmosphere="rift",
        locations=["Second Forge (distant)"],
    )
)

story.append(
    page_base(
        25,
        "The Riftwright",
        "Cliffhanger: second Forge activates; Riftwright silhouette; alive teaser.",
        "splash",
        [
            panel(
                "p25a",
                "Full-bleed cliffhanger: deep underground Second Forge reactor hall — black steel, white stone, cyan plasma, orange molten. A lone SILHOUETTE (face and identity fully hidden — hood/coat, engineer posture) walks toward the central reactor as it ignites. Empty dialogue zones. NO face. NO name plate.",
                [
                    balloon("narration", None, "Inside, a figure walked toward the central reactor.", 50, 10, maxWidthPct=55),
                    balloon("speech", None, "So… after all this time… someone finally reached my Forge.", 50, 48, maxWidthPct=50),
                    balloon("caption", None, "THE RIFTWRIGHT IS ALIVE", 50, 78, maxWidthPct=48),
                    balloon("caption", None, "NEXT: THE RIFTWRIGHT", 50, 90, maxWidthPct=42),
                ],
            )
        ],
        characters=[],
        creatures=[],
        continuity=cont(25, {"location": "Second Forge reactor", "riftwright": "alive-silhouette-only", "identity": "WITHHELD", "next": "the-riftwright"}),
        requiredMoments=[25],
        pageTurn="End Issue #8 — continue in The Riftwright.",
        atmosphere="rift",
        lettering="Cliffhanger captions clear; silhouette speech without speaker name.",
        locations=["Second Forge"],
    )
)

# Book assembly: covers + matter + story + back matter
book: list[dict] = []

book.append(
    matter_page(
        1,
        "front-cover",
        "The Forge of Rifts — Cover",
        [
            panel(
                "fc",
                f"Main cover: {MIRA} and {SPARK} before colossal Forge machinery; cyan plasma and orange molten; dormant egg glow; tiny Arkan silhouette on gantry; empty title zones top/bottom. NO text in art.",
                [
                    balloon("caption", None, "LEGENDS OF THE RIFT", 50, 10),
                    balloon("caption", None, "THE FORGE OF RIFTS", 50, 48),
                    balloon("caption", None, "ISSUE #8", 50, 88),
                ],
            )
        ],
        characters=["mira-eggwarden"],
        creatures=["spark"],
        atmosphere="rift",
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
                "Quiet Forge corridor atmosphere — crystal columns, soft plasma, invitation to read; empty recap zones.",
                [
                    balloon("narration", None, "Previously: Cael Vesper's coercion broke at the Traitor's Gate — Lumenhare freed, Nira cleared, egg cracked once. Gate open. Meridian Road lit. A voice from the Forge: Begin the second creation.", 50, 40, maxWidthPct=60),
                    balloon("caption", None, "CONTINUE THE FRACTURE DAWN", 50, 85),
                ],
            )
        ],
        atmosphere="rift",
    )
)

book.append(
    matter_page(
        3,
        "credits",
        "Credits",
        [
            panel(
                "cr",
                f"Credits plate: workshop desk with Forge tools, blueprints (blank), Spark motif, Compact lantern; {MIRA} silhouette at window of underground light.",
                [
                    balloon("caption", None, "THE FORGE OF RIFTS", 50, 14),
                    balloon("narration", None, "Story · Continuity · Lettering · Art Direction — Riftwilds Studio Pipeline. Keeper: Mira Eggwarden. Cal Reed is not canon.", 50, 50, maxWidthPct=58),
                    balloon("caption", None, "ORIGINAL RIFTWILDS IP", 50, 88),
                ],
            )
        ],
        characters=["mira-eggwarden"],
        creatures=["spark"],
        atmosphere="ruin",
    )
)

book.append(
    matter_page(
        4,
        "title",
        "Chapter Eight — The Forge of Rifts",
        [
            panel(
                "tp",
                "Title spread energy: party small on bridge into Forge maw; empty title zones.",
                [
                    balloon("caption", None, "CHAPTER EIGHT", 50, 18),
                    balloon("caption", None, "THE FORGE OF RIFTS", 50, 42),
                    balloon("narration", None, "Progress without ethics leaves a wound that looks like a doorway.", 50, 72, maxWidthPct=55),
                ],
            )
        ],
        characters=["mira-eggwarden"],
        creatures=["spark"],
        atmosphere="rift",
    )
)

# Story pages become book pages 5–29
for i, sp in enumerate(story):
    bp = dict(sp)
    bp["pageNumber"] = 5 + i
    bp["storyPageNumber"] = i + 1
    book.append(bp)

book.append(
    matter_page(
        30,
        "teaser",
        "Next Issue — The Riftwright",
        [
            panel(
                "te",
                "Teaser plate: second Forge silhouette; hooded figure from behind only; no face; empty title zones.",
                [
                    balloon("caption", None, "NEXT ISSUE", 50, 14),
                    balloon("caption", None, "THE RIFTWRIGHT", 50, 40),
                    balloon("narration", None, "Alive. Waiting. And the Meridian already holds a key.", 50, 70, maxWidthPct=52),
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
        "Character Profile — Chief Engineer Arkan",
        [
            panel(
                "pr",
                f"Character profile plate: full-body {ARKAN} with callout zones empty for lettering; tools, monocle, burned hands.",
                [
                    balloon("caption", None, "CHIEF ENGINEER ARKAN", 50, 12),
                    balloon("narration", None, "Last surviving Forge architect. Memory-preserved for centuries. Brilliant. Regretful. Not evil — not absolved. Died believing someone could finally fix his mistakes.", 50, 55, maxWidthPct=58),
                    balloon("caption", None, "ROLE: Support NPC · Sacrifice", 50, 88),
                ],
            )
        ],
        characters=["arkan"],
        atmosphere="ruin",
    )
)

book.append(
    matter_page(
        32,
        "profile",
        "Companion Profile — Axiom",
        [
            panel(
                "cp",
                f"Companion profile: {AXIOM} floating with ability icons as abstract shapes (no text in art).",
                [
                    balloon("caption", None, "AXIOM — PROTOTYPE COMPANION", 50, 12),
                    balloon("narration", None, "Passive: Adaptive Matrix — copy one ally passive briefly. Active: Pulse Repair — restore durability. Ultimate: System Restore — dampen corrupted Rift effects.", 50, 50, maxWidthPct=58),
                    balloon("caption", None, "ROLE: Support / Utility / Resonance", 50, 88),
                ],
            )
        ],
        creatures=["axiom"],
        atmosphere="rift",
    )
)

book.append(
    matter_page(
        33,
        "lore",
        "Codex — The Forge of Rifts",
        [
            panel(
                "lx",
                "Codex plate: cutaway of Forge civilization — labs, reactors, crystal rivers, Incubator Alpha, Engine Alpha.",
                [
                    balloon("caption", None, "CODEX — THE FORGE OF RIFTS", 50, 10),
                    balloon("narration", None, "Underground civilization around a machine that manufactures artificial Rift energy. Built to heal unstable dimensions. Weaponized after protocol rewrite. Primary site vented in Issue #8; a second Forge remains.", 50, 50, maxWidthPct=60),
                ],
            )
        ],
        atmosphere="rift",
    )
)

book.append(
    matter_page(
        34,
        "lore",
        "Blueprint Gallery — Prototype Riftborn",
        [
            panel(
                "bg",
                "Blueprint gallery: schematic plates of prototype Riftborn, Resonance Keeper cradle, failed husks — empty annotation zones.",
                [
                    balloon("caption", None, "BLUEPRINT GALLERY", 50, 10),
                    balloon("narration", None, "Riftborn were grown as protectors. Artificial Rifts cut; natural Rifts bleed. Spark and the dormant egg survived because their lines were never finished as weapons.", 50, 48, maxWidthPct=58),
                    balloon("caption", None, "PROTOTYPE RIFTBORN", 50, 88),
                ],
            )
        ],
        atmosphere="rift",
    )
)

book.append(
    matter_page(
        35,
        "lore",
        "Ability Spotlight — Rift Engine Alpha",
        [
            panel(
                "ab",
                "Ability/engine spotlight: Rift Engine Alpha core with Spark-sized silhouette for scale; abstract ability rings.",
                [
                    balloon("caption", None, "RIFT ENGINE ALPHA", 50, 12),
                    balloon("narration", None, "Primary Forge reactor. Stabilized by Spark through voluntary invitation — never forced bond. City Engines and Guardian constructs once drew safe power here.", 50, 55, maxWidthPct=58),
                ],
            )
        ],
        atmosphere="rift",
    )
)

book.append(
    matter_page(
        36,
        "map",
        "World Map — Meridian Road to Twin Forges",
        [
            panel(
                "mp",
                "World map update: Traitor's Gate → Meridian Road → Forge of Rifts (vented) → distant Second Forge under far continent; Tempestria/Crossroads marks small.",
                [
                    balloon("caption", None, "ROUTE OF THE FORGE ROAD", 50, 10),
                    balloon("narration", None, "Traitor's Gate → Meridian Road → Forge of Rifts (vented) → Second Forge (active)", 50, 85, maxWidthPct=58),
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
        "Editor's Note — Responsibility in Creation",
        [
            panel(
                "ed",
                "Editor desk with Compact lantern and blank Forge blueprint; warm light.",
                [
                    balloon("caption", None, "EDITOR'S NOTE", 50, 14),
                    balloon("narration", None, "Issue #8 asks whether knowledge itself can be dangerous — and answers that danger lives in the hands that rewrite purpose. Create to protect. Never to own.", 50, 50, maxWidthPct=58),
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
                "Behind-the-lore collage: Arkan's monocle, Axiom circuitry, egg crack light, Meridian three-arc — empty note zones.",
                [
                    balloon("caption", None, "BEHIND THE LORE", 50, 14),
                    balloon("narration", None, "Guardian Cities ran on Forge Engines. Artificial Rifts differ by geometry and intent. The saboteur who rewrote protocols remains unnamed — for now.", 50, 50, maxWidthPct=58),
                    balloon("whisper", None, "Archive Shelf unlocks after Issue #7 — or admin/dev override.", 50, 82, maxWidthPct=50),
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
        "Back Cover — The Riftwright",
        [
            panel(
                "bc",
                "Back cover: Second Forge silhouette ignition; party tiny on far ridge; empty blurb zones. NO Riftwright face.",
                [
                    balloon("caption", None, "THE FORGE OF RIFTS", 50, 12),
                    balloon("narration", None, "Someone finally reached the Forge. Someone else was already home.", 50, 50, maxWidthPct=55),
                    balloon("caption", None, "ISSUE #8 · LEGENDS OF THE RIFT", 50, 88, maxWidthPct=50),
                ],
            )
        ],
        characters=["mira-eggwarden"],
        creatures=["spark"],
        atmosphere="night",
    )
)

synopsis = (
    "Beyond the Traitor's Gate, Mira Eggwarden, Spark, and the supervised expedition enter the Forge of Rifts — "
    "an underground civilization built around a machine that manufactures artificial Rift energy. "
    "Chief Engineer Arkan reveals the Forge was meant to heal dimensions before someone rewrote its protocols; "
    "prototype companion Axiom awakens. Seris Vale restarts Engine Alpha to mass-produce Riftborn, nearly capturing Spark. "
    "In a double-page battle Arkan sacrifices his preserved body; Spark stabilizes the reactor; the team escapes as Seris steals "
    "a Second Forge blueprint. Cliffhanger: another Forge activates — the Riftwright is alive."
)


def main():
    for sub in (
        "pages",
        "prompts",
        "covers",
        "generated/raw-art",
        "generated/lettered-pages",
        "generated/thumbnails",
        "generated/covers",
        "reports",
        "references",
    ):
        (OUT / sub).mkdir(parents=True, exist_ok=True)

    script = {
        "title": "The Forge of Rifts",
        "issueNumber": 8,
        "slug": "the-forge-of-rifts",
        "protagonist": "Mira Eggwarden",
        "synopsis": synopsis,
        "storyPageCount": 25,
        "requiredMoments": list(range(1, 26)),
        "themes": [
            "progress without ethics",
            "creation versus exploitation",
            "science and responsibility",
            "compassion",
            "found family",
            "identity",
            "choosing purpose",
            "free will",
            "redemption",
            "whether knowledge itself can be dangerous",
        ],
        "calReed": "NON-CANON — forbidden",
        "elaraVenn": "vision/counsel only — not present cast",
        "arkan": "Chief Engineer — sacrifice",
        "axiom": "Prototype companion — joins",
        "riftwright": "Alive silhouette only — identity withheld",
        "protocolSaboteur": "WITHHELD",
        "continuesFrom": "the-traitors-gate",
        "nextIssue": "the-riftwright",
        "dialogueLock": {
            "arkanLast": "Protect. Don't obey.",
            "riftwrightCliff": "So… after all this time… someone finally reached my Forge.",
        },
    }
    (OUT / "script.json").write_text(json.dumps(script, indent=2) + "\n", encoding="utf-8")
    (OUT / "continuity.json").write_text(json.dumps({"pages": continuity_track}, indent=2) + "\n", encoding="utf-8")

    characters = {
        "cast": [
            {"id": "mira-eggwarden", "name": "Mira Eggwarden", "role": "Keeper protagonist"},
            {"id": "arkan", "name": "Chief Engineer Arkan", "role": "Forge architect — sacrifice"},
            {"id": "seris-vale", "name": "Seris Vale", "role": "Meridian commander"},
            {"id": "cael-vesper", "name": "Cael Vesper", "role": "Lanternmaster — supervised redemption"},
            {"id": "nira-quill", "name": "Nira Quill", "role": "Allied hunter"},
            {"id": "aurelia-voss", "name": "Aurelia Voss", "role": "Off-page merchant intel"},
            {"id": "elara-venn", "name": "Elara Venn", "role": "Vision/counsel only — not present"},
            {"id": "riftwright", "name": "The Riftwright", "role": "Alive silhouette cliffhanger — identity withheld"},
        ],
        "rejected": [{"id": "cal-reed", "note": "NON-CANON"}, {"id": "voltkit", "note": "legacy seed — not used"}],
    }
    (OUT / "characters.json").write_text(json.dumps(characters, indent=2) + "\n", encoding="utf-8")

    companions = {
        "featured": [
            {"id": "spark", "name": "Spark", "note": "Missing component — chooses to stabilize; protect not obey"},
            {"id": "axiom", "name": "Axiom", "note": "NEW — Adaptive Matrix / Pulse Repair / System Restore"},
            {"id": "dormant-riftborn-egg", "name": "Dormant Riftborn Egg", "note": "Glows; cracks further; responds to Spark"},
            {"id": "bramblefox", "name": "Bramblefox", "purpose": "Finds abandoned companions"},
            {"id": "mossprig", "name": "Mossprig", "purpose": "Protects damaged prototypes"},
            {"id": "thornling", "name": "Thornling", "purpose": "Accidentally restores power"},
            {"id": "wisplet", "name": "Wisplet", "purpose": "Memory crystals"},
            {"id": "spirit-moth", "name": "Spirit Moth", "purpose": "Hidden blueprints"},
            {"id": "truthwing", "name": "Truthwing", "purpose": "Escape path reflections"},
            {"id": "thundervane", "name": "Thundervane", "note": "Off-page recovery"},
            {"id": "lumenhare", "name": "Lumenhare", "note": "Recovering after #7 rescue"},
        ]
    }
    (OUT / "companions.json").write_text(json.dumps(companions, indent=2) + "\n", encoding="utf-8")
    (OUT / "creatures.json").write_text(json.dumps(companions, indent=2) + "\n", encoding="utf-8")

    factions = {
        "factions": [
            {"id": "veiled-meridian", "name": "Veiled Meridian", "goal": "Restart Forge; mass-produce Riftborn; capture Spark/egg"},
            {"id": "hatchery-compact", "name": "Hatchery Compact", "status": "invite-wait — protect not own"},
            {"id": "forge-architects", "name": "Forge Architects (defunct)", "status": "Arkan last survivor — sacrificed"},
            {"id": "lanternveil-circus", "name": "Lanternveil Traveling Circus", "status": "ally-uneasy — off-page wards"},
            {"id": "tempestria-crown", "name": "Tempestria Crown", "status": "reforming — off-page"},
        ]
    }
    (OUT / "factions.json").write_text(json.dumps(factions, indent=2) + "\n", encoding="utf-8")

    locations = {
        "locations": [
            {"id": "forge-of-rifts", "name": "The Forge of Rifts", "blurb": "Underground civilization / artificial Rift factory"},
            {"id": "meridian-road", "name": "Meridian Road", "blurb": "Sealed route from Traitor's Gate"},
            {"id": "companion-incubator-alpha", "name": "Companion Incubator Alpha", "blurb": "Origin of Resonance Keepers"},
            {"id": "rift-engine-alpha", "name": "Rift Engine Alpha", "blurb": "Primary reactor — Spark-stabilized"},
            {"id": "memory-vault", "name": "Memory Vault", "blurb": "Crystal records of protocol rewrite"},
            {"id": "second-forge", "name": "Second Forge", "blurb": "Hidden under another continent — cliffhanger"},
        ]
    }
    (OUT / "locations.json").write_text(json.dumps(locations, indent=2) + "\n", encoding="utf-8")

    artifacts = {
        "artifacts": [
            {"id": "dormant-riftborn-egg", "name": "Dormant Riftborn Egg", "status": "cracked further — with Mira/Spark"},
            {"id": "artificial-rift-amplifier", "name": "Artificial Rift Amplifier", "status": "with Seris"},
            {"id": "ancient-control-core", "name": "Ancient Control Core", "status": "with Seris"},
            {"id": "forge-blueprints", "name": "Forge Blueprints", "status": "partially recovered; critical scroll stolen"},
            {"id": "second-forge-blueprint", "name": "Second Forge Blueprint", "status": "stolen by Seris"},
            {"id": "rift-engine-alpha", "name": "Rift Engine Alpha", "status": "vented/stabilized — primary site collapsing"},
            {"id": "memory-crystal", "name": "Memory Crystal", "status": "viewed — saboteur identity withheld"},
            {"id": "arkan-monocle", "name": "Arkan's Monocle", "status": "left behind after sacrifice"},
        ]
    }
    (OUT / "artifacts.json").write_text(json.dumps(artifacts, indent=2) + "\n", encoding="utf-8")

    lore = {
        "title": "The Forge of Rifts — Lore Packet",
        "riftbornCreation": "Grown in Companion Incubator lines as protectors / Resonance Keepers — not soldiers. Spark's line is Resonance / Last Light.",
        "guardianCities": "City Engines and Guardian Constructs drew stable power from Forge reactors (Engine Alpha lineage).",
        "riftEngines": "Exist to stabilize dimensions and power guardian infrastructure; weaponized after protocol rewrite.",
        "artificialVsNatural": "Natural Rifts bleed/organic tear; Artificial Rifts cut with geometric edges and amplifier control.",
        "whySparkSurvived": "Never finished as a weapon; voluntary bond capacity; Last Light resilience.",
        "whyEggSurvived": "Same unfinished protector line; Gate/Forge-responsive; bonded to Spark's presence.",
        "protocolRewrite": "Someone altered Forge protocols after original heal-intent design. Identity WITHHELD.",
        "riftwright": "Disappeared before First Rift activation; someone else pushed final command; revealed alive as silhouette only in #8.",
        "withheld": ["protocol saboteur identity", "Riftwright true name/face", "full second creation plan"],
    }
    (OUT / "lore.json").write_text(json.dumps(lore, indent=2) + "\n", encoding="utf-8")

    covers = {
        "main": {"title": "The Forge of Rifts", "issue": 8, "prompt": book[0]["grokPrompt"]},
        "variant-a": {
            "label": "Arkan and Engine Alpha",
            "prompt": f"{STYLE} Variant cover A: {ARKAN} before Rift Engine Alpha, empty title zones. NO text. NO Riftwright face.",
        },
        "variant-b": {
            "label": "Axiom and Spark",
            "prompt": f"{STYLE} Variant cover B: {AXIOM} and {SPARK} floating before Incubator Alpha rings, {MIRA} silhouette. NO text.",
        },
        "foil": {
            "label": "Foil — cyan plasma and orange molten",
            "prompt": f"{STYLE} Foil cover concept: cyan plasma and orange molten shimmer on black steel; empty title zones. NO text.",
        },
    }
    (OUT / "covers.json").write_text(json.dumps(covers, indent=2) + "\n", encoding="utf-8")
    (OUT / "covers" / "COVERS.md").write_text(
        "# Issue #8 Covers\n\nSee covers.json for main / variant-a / variant-b / foil prompts.\n",
        encoding="utf-8",
    )

    refs = {
        "sheets": [
            "mira-eggwarden",
            "spark",
            "arkan",
            "axiom",
            "seris-vale",
            "cael-vesper",
            "nira-quill",
            "bramblefox",
            "mossprig",
            "thornling",
            "wisplet",
            "spirit-moth",
            "truthwing",
            "dormant-riftborn-egg",
            "forge-of-rifts-architecture",
            "rift-engine-alpha",
            "companion-incubator-alpha",
            "artificial-rift",
            "second-forge-silhouette",
            "meridian-symbols",
        ]
    }
    (OUT / "references" / "INDEX.json").write_text(json.dumps(refs, indent=2) + "\n", encoding="utf-8")
    (OUT / "references" / "README.md").write_text(
        "# Issue #8 reference sheets\n\nPlaceholder index for character/location lock sheets.\n",
        encoding="utf-8",
    )

    issue = {
        "slug": "the-forge-of-rifts",
        "issueNumber": 8,
        "title": "The Forge of Rifts",
        "subtitle": "Chapter Eight — Protect. Don't Obey.",
        "synopsis": synopsis,
        "publishedAt": "2026-07-20",
        "status": "script-complete",
        "storyPageCount": 25,
        "bookPageCount": len(book),
        "estimatedReadMinutes": 20,
        "protagonist": "Mira Eggwarden",
        "featuredCreatures": ["Spark", "Axiom", "Bramblefox", "Mossprig", "Thornling", "Wisplet", "Spirit Moth", "Truthwing"],
        "locations": ["Forge of Rifts", "Companion Incubator Alpha", "Rift Engine Alpha", "Meridian Road", "Second Forge"],
        "loreRel": "lore.json",
        "unlockGates": [
            {"kind": "prior-issue", "slug": "the-traitors-gate", "label": "Complete Issue #7: The Traitor's Gate"},
            {"kind": "admin-dev", "label": "Admin / COMICS_DEV_UNLOCK override"},
        ],
        "related": {
            "cards": ["spark", "axiom", "bramblefox", "mossprig"],
            "codex": ["forge-of-rifts", "rift-engine-alpha", "artificial-rift"],
            "companions": ["spark", "axiom", "truthwing"],
            "locations": ["forge-of-rifts", "second-forge", "meridian-road"],
            "artifacts": ["dormant-riftborn-egg", "second-forge-blueprint", "arkan-monocle"],
            "hiddenAchievements": ["forge-witness", "arkan-last-light", "axiom-matrix-first"],
        },
        "nextIssueTeaser": {
            "slug": "the-riftwright",
            "hook": "So… after all this time… someone finally reached my Forge.",
        },
        "pipeline": {
            "artProvider": "grok",
            "lettering": "programmatic",
            "bakedLettering": True,
            "contentRoot": "content/comics/the-forge-of-rifts/issue-008",
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
        # Remap story pageNumbers already set; ensure id uses book page number
        page_out = {
            **p,
            "id": f"the-forge-of-rifts-issue-008-p{nn}",
            "cleanArtRel": f"generated/raw-art/page-{nn}.webp",
            "letteredArtRel": f"generated/lettered-pages/page-{nn}.webp",
            "publicArtRel": f"assets/comics/the-forge-of-rifts/issue-008/pages/page-{nn}.webp",
        }
        # Fix story grok prompts that still say story page from page_base n
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
                "missingMoments": [m for m in range(1, 26) if m not in moments_hit],
                "calReedHits": sum("cal reed" in json.dumps(book).lower() for _ in [0]),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
