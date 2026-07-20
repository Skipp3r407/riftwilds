#!/usr/bin/env python3
"""
Emit complete The Storm King Issue #5 script + page JSON + prompts + continuity.
  python scripts/comics/issue-005/emit_issue_005.py

Does NOT touch issue-001–004 trees. Mira Eggwarden canon lock. Cal Reed forbidden.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "content/comics/the-storm-king/issue-005"

STYLE = (
    "Original high-energy Western fantasy comic storytelling with dynamic panel composition, "
    "dramatic inked linework, richly painted colors, expressive character acting, and clear cinematic action. "
    "Original Riftwilds IP only. Slate stone, silver metal, moss and timber first; electric cyan crystal, "
    "white lightning, deep indigo storm clouds, gold royal accents as accents only. NO purple AI-fantasy neon default. "
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
VAELOR = (
    "King Vaelor Tempest the Storm King: tall ancient armored monarch, storm-worn cloak, silver-and-cyan crown, "
    "lightning scars, Rift crystal in gauntlet, one eye glowing storm-cyan, weathered proud face, storm blade"
)
THUNDER = (
    "Thundervane: massive winged storm-lion companion, dark storm fur and feathered wings, electric-cyan markings, "
    "white-hot eyes, lightning along spine, royal armor fragments, visible exhaustion"
)
GALE = (
    "Galesprig: small fox-bird mountain companion, pale gray fur, blue feathered ears, spiral wind markings, "
    "ribbon-like tail, short glides, curious cautious eyes"
)
SERIS = (
    "Seris Vale: Meridian commander, sharp features, storm-dark field coat with three-arc sigil, "
    "carries Lost City Rift component crystal"
)
NIRA = (
    "Nira Quill: uncertain hunter, lean, weather cloak, quill-knife kit, conflicted eyes"
)
ECHO = (
    "Echoquill: small owl-fox-bird Rift companion, pale feathers, teal-gold markings, crystal feather tips"
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
            f'Riftwilds comic "The Storm King" Issue #5, STORY PAGE {n}/25 — {title}.',
            f"Story purpose: {purpose}",
            f"Layout: {layout}. {len(panels)} panels with clear inked gutters.",
            " ".join(f"Panel {i+1} ({p['id']}): {p['description']}" for i, p in enumerate(panels)),
            f"Characters: {', '.join(chars)}. Creatures: {', '.join(creatures)}.",
            f"Spark design lock: {SPARK}.",
            f"Keeper lock: {MIRA}.",
            f"Storm King lock: {VAELOR}. Thundervane lock: {THUNDER}.",
            f"Environment: {opts.get('environment', 'Tempestria Storm Kingdom')}. Time: {opts.get('time', 'day')}. Weather: {opts.get('weather', 'permanent supernatural storm')}.",
            f"Lighting: {opts.get('lighting', 'slate peaks with electric cyan lightning')}. Continuity: {json.dumps(opts.get('continuity') or {})}",
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
        "locations": opts.get("locations") or ["Tempestria"],
        "artifacts": opts.get("artifacts") or [],
        "continuity": opts.get("continuity") or {},
        "requiredMoments": opts.get("requiredMoments") or [],
        "grokPrompt": grok,
        "negativePrompt": NEG,
        "pageTurnObjective": opts.get("pageTurn") or "Turn to continue.",
        "letteringInstructions": opts.get("lettering")
        or "Standard speech + narration; keep tails off faces and Spark's eyes; king speech formal/controlled.",
        "generationStatus": "pending",
        "letteringStatus": "pending",
        "approvalStatus": "script-complete",
        "artAlt": opts.get("artAlt") or f"{title} — The Storm King page {n}",
        "atmosphere": opts.get("atmosphere") or "storm",
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
            f'Riftwilds comic book {role} page for The Storm King Issue #5 — {title}.',
            " ".join(p["description"] for p in panels),
            f"Keeper: {MIRA}. Spark: {SPARK}. Storm King: {VAELOR}.",
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
        "atmosphere": opts.get("atmosphere") or "storm",
        "letteringInstructions": "Bake titles/credits programmatically.",
        "transcript": build_transcript(panels),
        "a11yTranscript": build_transcript(panels),
    }


story: list[dict] = []

# ── STORY 1–25 ──────────────────────────────────────────────
story.append(
    page_base(
        1,
        "Kingdom Built of Weather",
        "Full-page reveal of Tempestria through a break in the storm wall.",
        "splash",
        [
            panel(
                "p1a",
                f"Full-bleed splash: wall of supernatural deep-indigo storm clouds opens to reveal Tempestria — slate mountain citadel, lightning towers, suspended bridges, cliffside villages, {THUNDER} silhouette circling highest tower. Narrow ridge foreground: {MIRA}, {SPARK} glowing unsteadily, Bramblefox, Mossprig, Thornling, Wisplet, Lumenhare, Echoquill, {CAEL}. Space for top caption.",
                [
                    balloon("narration", None, "Some kingdoms built walls. Tempestria built weather.", 50, 10, maxWidthPct=72),
                    balloon("caption", None, "TEMPESTRIA", 50, 88, maxWidthPct=40),
                    balloon("sfx", None, "KRACK-BOOM", 72, 40),
                ],
            )
        ],
        characters=["mira-eggwarden", "cael-vesper"],
        creatures=["spark", "thundervane", "bramblefox", "mossprig", "thornling", "wisplet", "lumenhare", "echoquill"],
        continuity=cont(1, {"location": "ridge at Tempestria storm wall", "time": "day", "spark": {"glow": "unsteady-storm"}}),
        requiredMoments=[1, 2],
        pageTurn="Cross the mountain path.",
        atmosphere="storm",
        lighting="break of storm light on slate citadel",
        environment="ridge overlooking Tempestria",
        codexLinks=["tempestria"],
        cardTeases=["thundervane"],
    )
)

story.append(
    page_base(
        2,
        "Roots Against the Gale",
        "Wind nearly throws Thornling; Mossprig anchors; Spark flinches at lightning.",
        "three-stack",
        [
            panel(
                "p2a",
                "Expedition on narrow mountain trail; hurricane wind tears at cloaks; Thornling skidding toward edge.",
                [
                    balloon("speech", "Tavi Brightline", "Hold the little green!", 35, 20, "down"),
                    balloon("sfx", None, "WHOOOOM", 70, 35),
                ],
            ),
            panel(
                "p2b",
                "Mossprig roots deep into slate stone, living bulwark shield blooming; team huddled behind moss barrier.",
                [
                    balloon("creature", "Mossprig", "*root-brace*", 40, 30, "down"),
                    balloon("speech", "Mira Eggwarden", "Thank you. Stay low.", 60, 70, "up"),
                ],
            ),
            panel(
                "p2c",
                f"{SPARK} winces as nearby lightning forks; cyan markings flare painfully; Mira steadies Spark with open hand (invite, not command).",
                [
                    balloon("creature", "Spark", "*pain-chirp*", 45, 28, "down"),
                    balloon("thought", "Mira Eggwarden", "The lightning hurts him. The engine is already speaking.", 55, 72, maxWidthPct=40),
                ],
            ),
        ],
        characters=["mira-eggwarden", "tavi-brightline", "cael-vesper"],
        creatures=["spark", "mossprig", "thornling", "bramblefox"],
        continuity=cont(2, {"location": "mountain border path", "mossprig": "anchoring", "spark": {"pain": "lightning"}}),
        requiredMoments=[2, 3],
        pageTurn="A guide appears.",
        atmosphere="storm",
    )
)

story.append(
    page_base(
        3,
        "Updraft Invitation",
        "Galesprig guides team through upward-blowing waterfall path.",
        "two-stack",
        [
            panel(
                "p3a",
                f"{GALE} appears on a wind-carved ledge, ribbon tail pointing toward waterfall blowing upward into cloud sea.",
                [
                    balloon("creature", "Galesprig", "*chirp-updraft*", 40, 25, "down"),
                    balloon("speech", "Cael Vesper", "A local scout. Follow the wind — carefully.", 60, 70, "up"),
                ],
            ),
            panel(
                "p3b",
                "Team following Galesprig behind reverse waterfall into a hidden slate tunnel; Spirit Moth reading lightning pattern at entrance.",
                [
                    balloon("narration", None, "Some doors are made of weather.", 50, 15, maxWidthPct=50),
                    balloon("sfx", None, "wind-tunnel-WHOOSH", 65, 55),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper"],
        creatures=["spark", "galesprig", "spirit-moth", "bramblefox", "mossprig"],
        continuity=cont(3, {"location": "hidden waterfall path", "guide": "galesprig"}),
        requiredMoments=[4],
        pageTurn="Enter the lower village.",
        atmosphere="storm",
        cardTeases=["galesprig"],
    )
)

story.append(
    page_base(
        4,
        "Village Under Rods",
        "Lower cliffside village living under lightning rods and storm shutters; citizens stare at Spark.",
        "splash-inset",
        [
            panel(
                "p4a",
                "Wide: Tempestria lower village — reinforced roofs, lightning rods, storm shutters, rain-darkened slate; citizens in storm cloaks staring at Spark's glow; expedition entering main lane.",
                [
                    balloon("narration", None, "They built homes under a sky that never forgives.", 50, 10, maxWidthPct=60),
                    balloon("whisper", "Villager", "That light… Resonance?", 30, 55, "right"),
                    balloon("creature", "Spark", "*shy-glow*", 70, 70, "up"),
                ],
            )
        ],
        characters=["mira-eggwarden", "cael-vesper"],
        creatures=["spark", "galesprig", "lumenhare"],
        continuity=cont(4, {"location": "Tempestria lower village", "public": "staring-at-spark"}),
        requiredMoments=[5],
        pageTurn="Ask the villagers.",
        atmosphere="storm",
        locations=["Tempestria", "Cliffside Village"],
    )
)

story.append(
    page_base(
        5,
        "Praise and Prison",
        "Villagers disagree about the Storm King — protector vs prison.",
        "four-grid",
        [
            panel(
                "p5a",
                f"{MIRA} speaking with elder under storm awning; Compact lantern charm visible.",
                [balloon("speech", "Mira Eggwarden", "Does the king keep you safe — or keep you in?", 50, 30, "down")],
            ),
            panel(
                "p5b",
                "Proud citizen gesturing toward lightning towers.",
                [balloon("speech", "Villager A", "Without Vaelor, the Rift would have eaten us generations ago.", 50, 35, "down", maxWidthPct=40)],
            ),
            panel(
                "p5c",
                "Weary parent shuttering a window as children flinch at thunder.",
                [balloon("speech", "Villager B", "Safe is a word for people who can leave. We can't.", 50, 35, "down", maxWidthPct=40)],
            ),
            panel(
                "p5d",
                "Spark looking between towers and people; Echoquill recording soft memory light.",
                [
                    balloon("creature", "Echoquill", "*archive-trill*", 40, 30, "down"),
                    balloon("thought", "Mira Eggwarden", "Protection that forbids exit is still a cage.", 55, 70, maxWidthPct=38),
                ],
            ),
        ],
        characters=["mira-eggwarden"],
        creatures=["spark", "echoquill"],
        continuity=cont(5, {"location": "lower village", "politics": "split-opinion"}),
        requiredMoments=[6],
        pageTurn="Royal escort arrives.",
        atmosphere="storm",
    )
)

story.append(
    page_base(
        6,
        "Royal Insignia",
        "Royal escort orders citadel visit; Cael recognizes insignia and turns serious.",
        "three-stack",
        [
            panel(
                "p6a",
                "Storm-armored royal guards with gold-and-cyan insignia surround expedition; lightning spears upright.",
                [
                    balloon("speech", "Royal Captain", "Outsiders. The King requires your presence.", 50, 25, "down"),
                    balloon("sfx", None, "armor-CLACK", 70, 60),
                ],
            ),
            panel(
                "p6b",
                f"{CAEL} half-mask tilting, eyes hard on royal crest — nested storm crown motif.",
                [
                    balloon("speech", "Cael Vesper", "That crest… I negotiated under it once. Years ago.", 50, 30, "down", maxWidthPct=40),
                    balloon("whisper", "Cael Vesper", "He does not forget visitors.", 50, 70),
                ],
            ),
            panel(
                "p6c",
                f"{MIRA} nodding acceptance; Spark pressed close; Galesprig perched on escort spear tip curiously.",
                [balloon("speech", "Mira Eggwarden", "We'll come. Spark stays with me.", 50, 40, "down")],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper"],
        creatures=["spark", "galesprig"],
        continuity=cont(6, {"location": "village square", "escort": "to-citadel", "cael": "recognizes-insignia"}),
        requiredMoments=[12],
        pageTurn="Enter the throne hall.",
        atmosphere="storm",
    )
)

story.append(
    page_base(
        7,
        "Throne Under Conduit",
        "Throne hall; Vaelor beneath living storm conduit; Thundervane weakened behind throne.",
        "splash",
        [
            panel(
                "p7a",
                f"Cinematic throne hall: {VAELOR} seated beneath living storm conduit of electric cyan; {THUNDER} sprawled behind throne — armor cracked, breathing heavy; expedition small in foreground; empty balloon zones.",
                [
                    balloon("narration", None, "Duty sat the throne so long it forgot how to stand.", 50, 10, maxWidthPct=60),
                    balloon("speech", "King Vaelor Tempest", "Approach. The storm has already named you.", 50, 78, "up", maxWidthPct=45),
                    balloon("sfx", None, "conduit-HUMMMM", 75, 35),
                ],
            )
        ],
        characters=["mira-eggwarden", "cael-vesper", "vaelor-tempest"],
        creatures=["spark", "thundervane", "galesprig"],
        continuity=cont(7, {"location": "royal citadel throne hall", "thundervane": "weakened", "vaelor": "proud"}),
        requiredMoments=[7, 11],
        pageTurn="The king names Spark.",
        atmosphere="storm",
        locations=["Tempestria", "Royal Citadel"],
        cardTeases=["thundervane", "vaelor-tempest"],
    )
)

story.append(
    page_base(
        8,
        "Resonance Named",
        "King identifies Spark as Resonance Keeper; offers stabilization; Mira asks the cost.",
        "three-stack",
        [
            panel(
                "p8a",
                f"{VAELOR} leaning forward, storm-eye glowing, gazing at Spark.",
                [
                    balloon("speech", "King Vaelor Tempest", "Resonance Keeper. Last Light of a broken line.", 50, 28, "down", maxWidthPct=42),
                    balloon("creature", "Spark", "*alert-chirp*", 65, 65, "up"),
                ],
            ),
            panel(
                "p8b",
                "King gesturing toward floor seals leading down to engine.",
                [
                    balloon(
                        "speech",
                        "King Vaelor Tempest",
                        "You may stabilize what my bond can no longer hold alone.",
                        50,
                        30,
                        "down",
                        maxWidthPct=44,
                    )
                ],
            ),
            panel(
                "p8c",
                f"{MIRA} stepped protectively before Spark; Compact lantern charm catching cyan light.",
                [
                    balloon("speech", "Mira Eggwarden", "Stabilize how? What does that cost him?", 50, 35, "down"),
                    balloon("thought", "Mira Eggwarden", "Invite. Wait. Never own.", 50, 72),
                ],
            ),
        ],
        characters=["mira-eggwarden", "vaelor-tempest"],
        creatures=["spark", "thundervane"],
        continuity=cont(8, {"location": "throne hall", "vaelor": "wants-spark-engine", "mira": "refuses-blind"}),
        requiredMoments=[8, 9],
        pageTurn="Orders and refusal.",
        atmosphere="storm",
    )
)

story.append(
    page_base(
        9,
        "Refuse the Engine",
        "King orders Spark to engine; Mira refuses; tension rises.",
        "three-stack",
        [
            panel(
                "p9a",
                "Royal guards stepping toward Spark; Vaelor's hand raised in command.",
                [
                    balloon("speech", "King Vaelor Tempest", "Bring the Resonance to the chamber. The kingdom endures.", 50, 28, "down", maxWidthPct=44),
                ],
            ),
            panel(
                "p9b",
                f"{MIRA} blocking with open palm — Compact stance, not aggression; Spark behind her.",
                [
                    balloon("speech", "Mira Eggwarden", "No. Not until I understand the risk — and he chooses.", 50, 35, "down", maxWidthPct=42),
                    balloon("shout", "Royal Captain", "Insolence—", 70, 70, "left"),
                ],
            ),
            panel(
                "p9c",
                "Tight shot: Vaelor's jaw tight; Thundervane's eye opens weakly; Cael hand on lantern clasp.",
                [
                    balloon("speech", "King Vaelor Tempest", "Choice is a luxury walls cannot afford.", 50, 40, "down", maxWidthPct=42),
                    balloon("whisper", "Cael Vesper", "Mira… careful.", 30, 75),
                ],
            ),
        ],
        characters=["mira-eggwarden", "vaelor-tempest", "cael-vesper"],
        creatures=["spark", "thundervane"],
        continuity=cont(9, {"location": "throne hall", "conflict": "mira-refuses-engine"}),
        requiredMoments=[9, 10],
        pageTurn="Thundervane collapses.",
        atmosphere="storm",
    )
)

story.append(
    page_base(
        10,
        "Bond Pain",
        "Thundervane collapses; lightning erupts; Spark feels companion pain.",
        "splash",
        [
            panel(
                "p10a",
                f"Dynamic splash: {THUNDER} collapsing behind throne, armor plates cracking, lightning erupting through hall; {SPARK} mid-cry glowing cyan-gold pain; Mira reaching; Vaelor standing shocked; empty balloon zones.",
                [
                    balloon("sfx", None, "THOOM-KRACK", 50, 20),
                    balloon("creature", "Spark", "*shared-pain!*", 35, 55, "right"),
                    balloon("creature", "Thundervane", "*agonized-roar*", 70, 45, "left"),
                    balloon("speech", "King Vaelor Tempest", "Hold— hold the crown—", 50, 82, "up"),
                ],
            )
        ],
        characters=["mira-eggwarden", "vaelor-tempest"],
        creatures=["spark", "thundervane"],
        continuity=cont(10, {"location": "throne hall", "thundervane": "collapsed", "spark": {"pain": "shared-bond"}}),
        requiredMoments=[11],
        pageTurn="See the storm engine.",
        atmosphere="storm",
    )
)

story.append(
    page_base(
        11,
        "Engine That Feeds on Bond",
        "Storm engine chamber: system consumes king and companion.",
        "two-wide",
        [
            panel(
                "p11a",
                "Vast engine chamber beneath throne: Rift-powered weather core of slate rings and cyan crystal conductors; conduits linking upward to Vaelor's gauntlet crystal and Thundervane's armor.",
                [
                    balloon("narration", None, "The engine did not love them. It used their love as fuel.", 50, 12, maxWidthPct=55),
                    balloon("sfx", None, "engine-PULSE", 70, 60),
                ],
            ),
            panel(
                "p11b",
                f"{MIRA}, Spark, Cael, Echoquill at railing; Wisplet phasing through barrier shimmer; Vaelor at console looking aged.",
                [
                    balloon("speech", "Cael Vesper", "It draws through the bond. Both of them.", 40, 25, "down"),
                    balloon("speech", "King Vaelor Tempest", "Without it, Tempestria dies. With it… we dwindle.", 60, 65, "up", maxWidthPct=40),
                ],
            ),
        ],
        characters=["mira-eggwarden", "vaelor-tempest", "cael-vesper"],
        creatures=["spark", "thundervane", "wisplet", "echoquill"],
        continuity=cont(11, {"location": "storm engine chamber", "engine": "consuming-bond"}),
        requiredMoments=[21],
        pageTurn="Cael's history.",
        atmosphere="rift",
        locations=["Tempestria", "Storm Engine Chamber"],
        artifacts=["storm-engine"],
        codexLinks=["storm-engine"],
    )
)

story.append(
    page_base(
        12,
        "Warned Years Ago",
        "Lanternmaster admits prior visit; warned bond would fail; king refused to abandon duty.",
        "three-stack",
        [
            panel(
                "p12a",
                f"{CAEL} removing half-mask slightly; memory inset of younger Cael negotiating in same hall.",
                [
                    balloon(
                        "speech",
                        "Cael Vesper",
                        "I stood here years ago. I warned you the bond could not hold forever.",
                        50,
                        30,
                        "down",
                        maxWidthPct=44,
                    )
                ],
            ),
            panel(
                "p12b",
                "Younger Vaelor memory: proud, hand on young Thundervane's mane.",
                [
                    balloon(
                        "speech",
                        "King Vaelor Tempest",
                        "And I refused to abandon my duty. I refuse still.",
                        50,
                        35,
                        "down",
                        maxWidthPct=42,
                    )
                ],
            ),
            panel(
                "p12c",
                "Present: Thundervane's exhausted eye meeting Spark; Mira between ethics and crisis.",
                [
                    balloon("creature", "Thundervane", "*weak-rumble*", 40, 30, "down"),
                    balloon("speech", "Mira Eggwarden", "Duty that empties the one you love is not protection.", 60, 70, "up", maxWidthPct=40),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper", "vaelor-tempest"],
        creatures=["spark", "thundervane"],
        continuity=cont(12, {"location": "engine chamber", "cael": "prior-visit-revealed"}),
        requiredMoments=[12, 21],
        pageTurn="Sabotage.",
        atmosphere="storm",
    )
)

story.append(
    page_base(
        13,
        "Tower Sabotage",
        "Lightning tower explodes; Meridian agents activate stolen Lost City seals.",
        "three-stack",
        [
            panel(
                "p13a",
                "Exterior: lightning tower detonates in cyan-white blast; storm barrier crack visible in sky.",
                [
                    balloon("sfx", None, "BOOOOM", 50, 30),
                    balloon("shout", "Villager", "The tower—!", 30, 70, "right"),
                ],
            ),
            panel(
                "p13b",
                f"Meridian agents in storm cloaks activating stolen command seals (three-arc + Lost City motif); {SERIS} silhouette directing.",
                [
                    balloon("speech", "Seris Vale", "Component online. Tear the wall.", 50, 30, "down"),
                    balloon("sfx", None, "seal-CLICK", 65, 60),
                ],
            ),
            panel(
                "p13c",
                "Citadel alarms; Vaelor spinning toward window; Mira grabbing Spark.",
                [
                    balloon("speech", "King Vaelor Tempest", "Outsiders bring rot—", 40, 30, "down"),
                    balloon("speech", "Mira Eggwarden", "That seal is Meridian — Lost City work.", 65, 65, "up", maxWidthPct=38),
                ],
            ),
        ],
        characters=["mira-eggwarden", "vaelor-tempest", "seris-vale"],
        creatures=["spark"],
        continuity=cont(13, {"location": "citadel / tower", "meridian": "sabotage-active", "artifact": "lost-city-component"}),
        requiredMoments=[13, 14, 16],
        pageTurn="Meridian broadcast.",
        atmosphere="storm",
        artifacts=["lost-city-rift-component", "stolen-command-seals"],
    )
)

story.append(
    page_base(
        14,
        "Offer of Chains",
        "Seris broadcasts: king lost control; Meridian offers protection; citizens panic.",
        "three-stack",
        [
            panel(
                "p14a",
                "Sky projection / conduit broadcast of Seris Vale addressing the kingdom.",
                [
                    balloon(
                        "speech",
                        "Seris Vale",
                        "Tempestria — your king has lost control. Meridian offers orderly protection.",
                        50,
                        30,
                        "down",
                        maxWidthPct=46,
                    )
                ],
            ),
            panel(
                "p14b",
                "Village panic: people running under torn banners; children toward shelters.",
                [
                    balloon("sfx", None, "crowd-panic", 50, 40),
                    balloon("speech", "Villager B", "Protection or a new cage?", 60, 70, "up"),
                ],
            ),
            panel(
                "p14c",
                f"{VAELOR} enraged on balcony; Mira and Cael arguing for clarity over blame.",
                [
                    balloon("shout", "King Vaelor Tempest", "You came with them!", 40, 30, "down"),
                    balloon("speech", "Mira Eggwarden", "We came for a signal — not a seizure.", 65, 65, "up", maxWidthPct=36),
                ],
            ),
        ],
        characters=["mira-eggwarden", "vaelor-tempest", "seris-vale", "cael-vesper"],
        creatures=["spark"],
        continuity=cont(14, {"location": "citadel balcony / village", "public": "panic", "vaelor": "blames-outsiders"}),
        requiredMoments=[16],
        pageTurn="The wall tears.",
        atmosphere="storm",
    )
)

story.append(
    page_base(
        15,
        "Sky Tears Open",
        "Storm wall tears; corrupted flying creatures descend — large reveal.",
        "splash",
        [
            panel(
                "p15a",
                "Massive reveal splash: Tempestria storm barrier ripping open; corrupted aerial rift-creatures (original designs — jagged storm-wolves with wings, crystal parasites) pouring through; lightning towers firing; village below; empty caption zones.",
                [
                    balloon("narration", None, "When a wall built of weather fails, the sky itself becomes an invasion.", 50, 10, maxWidthPct=65),
                    balloon("sfx", None, "TEEEAR-KRACK", 55, 45),
                    balloon("caption", None, "CORRUPTED SKY HOST", 50, 88, maxWidthPct=45),
                ],
            )
        ],
        characters=["mira-eggwarden", "vaelor-tempest"],
        creatures=["spark", "thundervane"],
        continuity=cont(15, {"location": "sky over Tempestria", "barrier": "torn", "threat": "corrupted-aerial"}),
        requiredMoments=[14, 15],
        pageTurn="Summon Thundervane.",
        atmosphere="storm",
    )
)

story.append(
    page_base(
        16,
        "Neither Can the Kingdom",
        "King summons Thundervane despite condition; Mira argues; king answers.",
        "three-stack",
        [
            panel(
                "p16a",
                f"{VAELOR} raising storm blade; conduit igniting; {THUNDER} forced to rise on shaking legs.",
                [
                    balloon("speech", "King Vaelor Tempest", "Rise, old friend. One more wall.", 50, 30, "down"),
                    balloon("creature", "Thundervane", "*pained-roar*", 65, 65, "up"),
                ],
            ),
            panel(
                "p16b",
                f"{MIRA} pleading; Spark pressed to her leg glowing distress.",
                [
                    balloon(
                        "speech",
                        "Mira Eggwarden",
                        "He cannot survive another battle like this!",
                        50,
                        35,
                        "down",
                        maxWidthPct=40,
                    )
                ],
            ),
            panel(
                "p16c",
                "Close on Vaelor's storm-eye — grief under armor.",
                [
                    balloon("speech", "King Vaelor Tempest", "Neither can the kingdom.", 50, 40, "down"),
                    balloon("sfx", None, "wing-BEAT", 70, 70),
                ],
            ),
        ],
        characters=["mira-eggwarden", "vaelor-tempest"],
        creatures=["spark", "thundervane"],
        continuity=cont(16, {"location": "citadel roost", "thundervane": "forced-flight"}),
        requiredMoments=[16],
        pageTurn="Battle on the bridges.",
        atmosphere="storm",
    )
)

story.append(
    page_base(
        17,
        "Bridges of Thunder",
        "Battle across suspended bridges — companions use real abilities.",
        "four-grid",
        [
            panel(
                "p17a",
                "Bramblefox flanking along bridge rails, Forest Bond vines catching a winged corruptor.",
                [
                    balloon("creature", "Bramblefox", "*track-snap*", 40, 25, "down"),
                    balloon("sfx", None, "vine-WHIP", 65, 55),
                ],
            ),
            panel(
                "p17b",
                "Mossprig Living Bulwark shielding evacuating villagers on collapsing span.",
                [balloon("creature", "Mossprig", "*bulwark!*", 50, 30, "down")],
            ),
            panel(
                "p17c",
                "Thornling plugging into conductor; emergency route lights cyan; comic sparks in fur.",
                [
                    balloon("creature", "Thornling", "*zzzt-power*", 45, 28, "down"),
                    balloon("sfx", None, "conductor-ZAP", 70, 60),
                ],
            ),
            panel(
                "p17d",
                "Wisplet phasing through lightning cage; Galesprig Updraft lifting Mira and Spark to safer strut; Spirit Moth signaling engine vector.",
                [
                    balloon("creature", "Galesprig", "*updraft!*", 35, 25, "down"),
                    balloon("creature", "Wisplet", "*phase-hum*", 65, 55, "left"),
                    balloon("speech", "Mira Eggwarden", "Companions — hold the people first!", 50, 78, "up", maxWidthPct=40),
                ],
            ),
        ],
        characters=["mira-eggwarden"],
        creatures=["spark", "bramblefox", "mossprig", "thornling", "wisplet", "galesprig", "spirit-moth"],
        continuity=cont(17, {"location": "suspended bridges", "battle": "companions-active"}),
        requiredMoments=[19],
        pageTurn="Aerial war.",
        atmosphere="storm",
        cardTeases=["bramblefox", "mossprig", "galesprig"],
    )
)

story.append(
    page_base(
        18,
        "Crown Against the Host",
        "Large aerial/ground battle spread — Thundervane, towers, Meridian toward engine.",
        "splash",
        [
            panel(
                "p18a",
                f"Epic battle composition (single page splash standing in for spread energy): {THUNDER} clashing with corrupted sky beasts midair; lightning towers firing; {SPARK} dodging capture beams; {MIRA} coordinating; Meridian agents racing toward engine hatch; bridges collapsing; villagers evacuating; empty balloon-safe corners.",
                [
                    balloon("sfx", None, "SKYBREAKER", 30, 18),
                    balloon("sfx", None, "KRACK-BOOM", 75, 25),
                    balloon("shout", "Mira Eggwarden", "Spark — left!", 40, 55, "right"),
                    balloon("speech", "Seris Vale", "Secure the Resonance. Ignore the king.", 70, 70, "left", maxWidthPct=36),
                    balloon("creature", "Thundervane", "*battle-roar*", 55, 40, "down"),
                ],
            )
        ],
        characters=["mira-eggwarden", "seris-vale", "vaelor-tempest"],
        creatures=["spark", "thundervane", "bramblefox", "mossprig"],
        continuity=cont(18, {"location": "citadel skies", "battle": "peak", "meridian": "engine-push"}),
        requiredMoments=[15, 17, 19],
        pageTurn="Engine seizure attempt.",
        atmosphere="storm",
        cardTeases=["thundervane-skybreaker"],
    )
)

story.append(
    page_base(
        19,
        "Hunter's Cut",
        "Seris attempts remote Spark link; Nira sabotages; nearly exposed as Meridian traitor.",
        "three-stack",
        [
            panel(
                "p19a",
                f"{SERIS} at engine console connecting Lost City Rift component; cyan tether reaching toward Spark midair.",
                [
                    balloon("speech", "Seris Vale", "Replacement stabilizer online — Subject One, yield.", 50, 28, "down", maxWidthPct=44),
                    balloon("sfx", None, "tether-HUM", 65, 60),
                ],
            ),
            panel(
                "p19b",
                f"{NIRA} sabotaging the tether with quill-knife and counter-sigil; sparks flying; Spark freed mid-yelp.",
                [
                    balloon("speech", "Nira Quill", "Not like that. Not him.", 45, 30, "down"),
                    balloon("creature", "Spark", "*free-chirp!*", 70, 55, "left"),
                ],
            ),
            panel(
                "p19c",
                "Seris head-snapping toward Nira; Meridian agents turning; Nira already melting into storm shadows.",
                [
                    balloon("speech", "Seris Vale", "Quill—? You cut your own leash.", 50, 30, "down"),
                    balloon("whisper", "Nira Quill", "I cut theirs.", 50, 72),
                    balloon("speech", "Mira Eggwarden", "Nira—!", 30, 55, "right"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "seris-vale", "nira-quill"],
        creatures=["spark"],
        continuity=cont(19, {"location": "engine chamber", "nira": "open-disloyalty", "seris": "link-failed"}),
        requiredMoments=[17, 18],
        pageTurn="Spark enters the bond.",
        atmosphere="rift",
        artifacts=["lost-city-rift-component"],
    )
)

story.append(
    page_base(
        20,
        "Memory of the First Wall",
        "Spark resonance vision with Thundervane — original bond and centuries of strain.",
        "montage",
        [
            panel(
                "p20a",
                "Vision: young Vaelor and young Thundervane on peak raising first storm barrier together — hopeful, equal.",
                [
                    balloon("narration", None, "Once, the wall was a promise — not a prison.", 50, 15, maxWidthPct=55),
                    balloon("creature", "Young Thundervane", "*joy-rumble*", 60, 70, "up"),
                ],
            ),
            panel(
                "p20b",
                "Montage strip: centuries of strain — storms held, armor added, king aging oddly, companion weakening.",
                [
                    balloon("narration", None, "Years became walls. Walls became hunger.", 50, 20, maxWidthPct=50),
                    balloon("sfx", None, "time-HUM", 70, 60),
                ],
            ),
            panel(
                "p20c",
                f"Present vision-space: exhausted {THUNDER} forehead to forehead with {SPARK}; silent plea — release, don't replace.",
                [
                    balloon("telepathy", "Thundervane", "Do not become the next wall.", 50, 35, "down", maxWidthPct=42),
                    balloon("creature", "Spark", "*understand-glow*", 50, 70, "up"),
                ],
            ),
        ],
        characters=["vaelor-tempest"],
        creatures=["spark", "thundervane"],
        continuity=cont(20, {"location": "bond-vision", "truth": "forced-bond-strain"}),
        requiredMoments=[20, 21],
        pageTurn="Truth to Mira.",
        atmosphere="rift",
    )
)

story.append(
    page_base(
        21,
        "Loyalty Is Not Obligation",
        "Spark communicates truth; Thundervane rejects replacement; king sees confusion of loyalty/obligation.",
        "three-stack",
        [
            panel(
                "p21a",
                f"{SPARK} back in physical space pressed to {MIRA}'s hands; cyan memory light fading; Mira listening.",
                [
                    balloon("creature", "Spark", "*refuse-replace*", 40, 30, "down"),
                    balloon("speech", "Mira Eggwarden", "He won't take Thundervane's place. He won't be owned by an engine.", 60, 65, "up", maxWidthPct=40),
                ],
            ),
            panel(
                "p21b",
                f"{THUNDER} weak but clear eye-lock with {VAELOR}; armor lightning dimming.",
                [
                    balloon("telepathy", "Thundervane", "I stayed for love. You kept me for fear.", 50, 35, "down", maxWidthPct=42),
                ],
            ),
            panel(
                "p21c",
                "Vaelor's storm-eye dimming to human grief; hand trembling on gauntlet crystal.",
                [
                    balloon("speech", "King Vaelor Tempest", "I confused loyalty… with obligation.", 50, 40, "down", maxWidthPct=42),
                    balloon("whisper", "Cael Vesper", "Then choose which one remains.", 50, 75),
                ],
            ),
        ],
        characters=["mira-eggwarden", "vaelor-tempest", "cael-vesper"],
        creatures=["spark", "thundervane"],
        continuity=cont(21, {"location": "engine chamber", "vaelor": "realization", "spark": "refuses-replace"}),
        requiredMoments=[21, 22],
        pageTurn="Release the bond.",
        atmosphere="rift",
    )
)

story.append(
    page_base(
        22,
        "Release and Steady",
        "King releases forced bond; storm collapses briefly; team stabilizes engine without coercion.",
        "three-stack",
        [
            panel(
                "p22a",
                f"{VAELOR} ripping gauntlet crystal free — forced bond conduits snapping; cyan light fracturing.",
                [
                    balloon("speech", "King Vaelor Tempest", "I release you. Live — even if I fall.", 50, 30, "down", maxWidthPct=42),
                    balloon("sfx", None, "bond-SNAP", 70, 55),
                ],
            ),
            panel(
                "p22b",
                "Storm briefly collapsing to strange calm; cloud sea dropping; citizens looking up in shock.",
                [
                    balloon("narration", None, "For one breath, Tempestria had a sky.", 50, 20, maxWidthPct=50),
                    balloon("sfx", None, "silence…", 50, 60),
                ],
            ),
            panel(
                "p22c",
                f"Voluntary circle: {SPARK}, weakened {THUNDER}, Mossprig, Thornling, Wisplet, Echoquill, {MIRA}, {VAELOR} hands open (invite) stabilizing engine glow without ownership chains.",
                [
                    balloon("speech", "Mira Eggwarden", "Together — invite, don't own.", 40, 25, "down"),
                    balloon("creature", "Spark", "*steady-hum*", 60, 50, "left"),
                    balloon("creature", "Thundervane", "*free-breath*", 55, 75, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "vaelor-tempest"],
        creatures=["spark", "thundervane", "mossprig", "thornling", "wisplet", "echoquill"],
        continuity=cont(22, {"location": "engine chamber", "bond": "released", "engine": "voluntarily-stabilized"}),
        requiredMoments=[22, 23],
        pageTurn="Shatter Meridian control.",
        atmosphere="rift",
    )
)

story.append(
    page_base(
        23,
        "Combined Stormlight",
        "Action splash: companions combine; Meridian control shatters; corrupted host driven back.",
        "splash",
        [
            panel(
                "p23a",
                f"Action splash: combined power — Spark resonance, Thundervane Crown of Thunder field, Mossprig defense dome, Thornling conductor surge, Wisplet phase net, Bramblefox precision strike — Meridian control lattice shattering; corrupted creatures driven back through mending storm wall; {SERIS} stumbling; empty SFX zones.",
                [
                    balloon("sfx", None, "CROWN OF THUNDER", 50, 14),
                    balloon("sfx", None, "SHATTER-KRACK", 70, 40),
                    balloon("creature", "Spark", "*resonance!*", 35, 50, "right"),
                    balloon("shout", "Seris Vale", "The lattice—!", 65, 70, "left"),
                    balloon("narration", None, "A wall rebuilt by choice holds differently.", 50, 88, maxWidthPct=55),
                ],
            )
        ],
        characters=["mira-eggwarden", "seris-vale", "vaelor-tempest"],
        creatures=["spark", "thundervane", "mossprig", "thornling", "wisplet", "bramblefox"],
        continuity=cont(23, {"location": "citadel / sky", "meridian": "control-shattered", "host": "driven-back"}),
        requiredMoments=[19, 23],
        pageTurn="Aftermath and escape.",
        atmosphere="storm",
        cardTeases=["crown-of-thunder"],
    )
)

story.append(
    page_base(
        24,
        "Ledger of Doors",
        "Aftermath: Vaelor steps from absolute control; Thundervane free but weak; Seris escapes with royal trade ledger.",
        "three-stack",
        [
            panel(
                "p24a",
                f"{VAELOR} seated on lower steps (not throne), crown set aside; {THUNDER} resting free of armor chains; Mira and Spark nearby.",
                [
                    balloon("speech", "King Vaelor Tempest", "I remain king. I will not remain a wall.", 50, 28, "down", maxWidthPct=42),
                    balloon("creature", "Thundervane", "*grateful-rumble*", 60, 65, "up"),
                ],
            ),
            panel(
                "p24b",
                f"{SERIS} fleeing through storm tunnel with ornate royal trade ledger glowing faint cyan seals; Lost City component still on belt.",
                [
                    balloon("speech", "Seris Vale", "If the peak fails, the market opens.", 50, 30, "down", maxWidthPct=40),
                    balloon("sfx", None, "boot-dash", 70, 60),
                ],
            ),
            panel(
                "p24c",
                "Echoquill projecting faint map of merchant-route seals from ledger residue; Cael frowning.",
                [
                    balloon("creature", "Echoquill", "*archive-lock*", 40, 30, "down"),
                    balloon("speech", "Cael Vesper", "Those routes don't sell goods. They sell access.", 60, 70, "up", maxWidthPct=38),
                ],
            ),
        ],
        characters=["mira-eggwarden", "vaelor-tempest", "seris-vale", "cael-vesper"],
        creatures=["spark", "thundervane", "echoquill"],
        continuity=cont(24, {"location": "citadel aftermath", "vaelor": "shared-rule", "seris": "escaped-with-ledger"}),
        requiredMoments=[23, 24],
        pageTurn="Merchant cliffhanger.",
        atmosphere="dusk",
        artifacts=["royal-trade-ledger", "lost-city-rift-component"],
    )
)

story.append(
    page_base(
        25,
        "Every Door",
        "Cliffhanger: merchant receives ledger — 'I brought you every door.' → Merchant's Secret.",
        "splash",
        [
            panel(
                "p25a",
                "Dark luxurious trading hall / wagon interior: richly dressed Hooded Merchant (original design — amber lanterns, sealed crates, cyan-glow ledger ink) smiling as Seris Vale places stolen royal ledger on table; tiny inset of Tempestria peaks calming; empty zones for NEXT title.",
                [
                    balloon("speech", "Hooded Merchant", "You brought me a map.", 35, 28, "down"),
                    balloon("speech", "Seris Vale", "No. I brought you every door.", 65, 45, "left", maxWidthPct=36),
                    balloon("caption", None, "NEXT: THE MERCHANT'S SECRET", 50, 88, maxWidthPct=55),
                    balloon("sfx", None, "ledger-THUD", 50, 60),
                ],
            )
        ],
        characters=["seris-vale", "hooded-merchant"],
        creatures=[],
        continuity=cont(25, {"location": "hidden trading hall", "teaser": "the-merchants-secret", "ledger": "delivered"}),
        requiredMoments=[24, 25],
        pageTurn="End Issue #5.",
        atmosphere="night",
        locations=["Merchant Network (teaser)"],
        artifacts=["royal-trade-ledger"],
    )
)

assert len(story) == 25

# ── BOOK MATTER ─────────────────────────────────────────────
book: list[dict] = []

book.append(
    matter_page(
        1,
        "front-cover",
        "The Storm King — Cover",
        [
            panel(
                "cover",
                f"Premium cover plate: {VAELOR} and {THUNDER} atop Tempestria citadel inside supernatural storm; {MIRA} and {SPARK} small on ridge below; electric cyan lightning, slate peaks, gold crown accents; empty title zones.",
                [
                    balloon("caption", None, "LEGENDS OF THE RIFT", 50, 10),
                    balloon("caption", None, "THE STORM KING", 50, 82),
                    balloon("caption", None, "ISSUE #5", 50, 92),
                ],
            )
        ],
        characters=["mira-eggwarden", "vaelor-tempest"],
        creatures=["spark", "thundervane"],
        atmosphere="storm",
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
                "Quiet inside-cover: storm-map parchment, Compact lantern, Tempestria route marked from Aureth Vale; soft cyan glow; empty invitation zone.",
                [
                    balloon("narration", None, "Previously: Aureth Vale woke. The Guardian remembered. A signal answered from the peaks.", 50, 40, maxWidthPct=60),
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
                "Workshop / lore-desk with storm-ink quills, slate sample, companion sketches of Thundervane and Galesprig — no readable credit text in art.",
                [
                    balloon("caption", None, "THE STORM KING", 50, 14),
                    balloon("narration", None, "Story · Continuity · Lettering · Art Direction — Riftwilds Studio Pipeline. Keeper: Mira Eggwarden.", 50, 55, maxWidthPct=58),
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
        "Chapter Five — The Storm King",
        [
            panel(
                "title",
                f"Title spread energy without painted lettering: {MIRA}, Spark, companions on ridge; Tempestria citadel in storm break; empty center for title bake.",
                [
                    balloon("caption", None, "CHAPTER FIVE", 50, 20),
                    balloon("caption", None, "THE STORM KING", 50, 35),
                    balloon("narration", None, "Duty built a wall of weather. The wall began to eat its makers.", 50, 75, maxWidthPct=55),
                ],
            )
        ],
        characters=["mira-eggwarden"],
        creatures=["spark"],
        atmosphere="storm",
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
        "Next Issue — The Merchant's Secret",
        [
            panel(
                "teaser",
                "Teaser plate: amber lantern market crates, cyan-glow ledger, hooded merchant silhouette; empty title zone.",
                [
                    balloon("caption", None, "NEXT ISSUE", 50, 18),
                    balloon("narration", None, "Every door has a price. Someone is selling the hinges.", 50, 50, maxWidthPct=55),
                    balloon("caption", None, "THE MERCHANT'S SECRET", 50, 82),
                ],
            )
        ],
        atmosphere="night",
    )
)

book.append(
    matter_page(
        31,
        "profile",
        "Character Profile — King Vaelor Tempest",
        [
            panel(
                "prof-v",
                f"Character profile plate: {VAELOR} three-quarter portrait with storm conduit and Thundervane reflection; empty text zones.",
                [
                    balloon("caption", None, "KING VAELOR TEMPEST", 50, 12),
                    balloon("narration", None, "Storm King of Tempestria. Survived the First Rift by becoming the wall — until the wall demanded too much.", 50, 78, maxWidthPct=55),
                ],
            )
        ],
        characters=["vaelor-tempest"],
        atmosphere="storm",
    )
)

book.append(
    matter_page(
        32,
        "profile",
        "Companion Profile — Thundervane",
        [
            panel(
                "prof-t",
                f"Companion profile: {THUNDER} front/side/three-quarter; Skybreaker lightning; empty ability zones.",
                [
                    balloon("caption", None, "THUNDERVANE", 50, 12),
                    balloon("narration", None, "Stormbound Crown · Skybreaker · Crown of Thunder — Tank / Storm Control / Aerial Commander.", 50, 80, maxWidthPct=55),
                ],
            )
        ],
        creatures=["thundervane"],
        atmosphere="storm",
    )
)

book.append(
    matter_page(
        33,
        "lore",
        "Codex — Tempestria",
        [
            panel(
                "lore",
                "Codex plate: Tempestria cross-section — cloud sea, cliff villages, lightning towers, royal citadel, engine under throne; slate and cyan crystal.",
                [
                    balloon("caption", None, "CODEX — TEMPESTRIA", 50, 12),
                    balloon(
                        "narration",
                        None,
                        "Mountain kingdom inside a permanent storm barrier. Weather engines. Companion roosts. A throne that conducted duty into lightning.",
                        50,
                        78,
                        maxWidthPct=58,
                    ),
                ],
            )
        ],
        atmosphere="storm",
    )
)

book.append(
    matter_page(
        34,
        "lore",
        "Ability Spotlight — Crown of Thunder",
        [
            panel(
                "ability",
                "Ability spotlight: Thundervane creating storm field that shelters allies and knocks back corrupted flyers; empty rules zones.",
                [
                    balloon("caption", None, "ABILITY — CROWN OF THUNDER", 50, 14),
                    balloon("narration", None, "Create a storm field that damages enemies, protects allies, and changes movement rules for a limited duration.", 50, 78, maxWidthPct=55),
                ],
            )
        ],
        creatures=["thundervane"],
        atmosphere="storm",
    )
)

book.append(
    matter_page(
        35,
        "map",
        "World Map — Peaks to Market",
        [
            panel(
                "map",
                "Painterly world map: Riftwild Commons, Shellward, Lanternveil route, Aureth Vale, Tempestria peaks glowing, merchant-network teaser mark toward Commons Market. Empty label zones.",
                [
                    balloon("caption", None, "ROUTE OF THE STORM SIGNAL", 50, 10, maxWidthPct=50),
                    balloon("narration", None, "Aureth Vale → Tempestria → Merchant Roads (teaser)", 50, 85, maxWidthPct=55),
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
        "Editor's Note — Walls & Weather",
        [
            panel(
                "letters",
                "Quiet editor desk with storm-glass paperweight and Compact lantern; soft window light.",
                [
                    balloon("caption", None, "EDITOR'S NOTE", 50, 14),
                    balloon(
                        "narration",
                        None,
                        "Protection without exit becomes a prison. Issue #5 asks whether leaders can release the thing they love — and whether a kingdom can survive honesty.",
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
                "Inside back: Tempestria Storm Passage Permit aesthetic — abstract route stamps, lightning-rod icons, cracked royal seal; no real barcodes.",
                [
                    balloon("caption", None, "TEMPESTRIA STORM PASSAGE PERMIT", 50, 14, maxWidthPct=55),
                    balloon("narration", None, "Escort required beyond the cloud sea. Companion bonds voluntary. Engine access — RESTRICTED.", 50, 50, maxWidthPct=55),
                    balloon("whisper", None, "Barrier integrity — RESTORING", 50, 78),
                ],
            )
        ],
        atmosphere="storm",
    )
)

book.append(
    matter_page(
        38,
        "back-cover",
        "Back Cover — Every Door",
        [
            panel(
                "bc",
                "Back cover: Tempestria silhouette calming under mend-storm; tiny merchant lantern glow on horizon; Mira and Spark small on citadel balcony; empty blurb zones.",
                [
                    balloon("caption", None, "THE STORM KING", 50, 12),
                    balloon("narration", None, "The wall released its makers. The market opened its doors.", 50, 50, maxWidthPct=55),
                    balloon("caption", None, "ISSUE #5 · LEGENDS OF THE RIFT", 50, 88, maxWidthPct=50),
                ],
            )
        ],
        characters=["mira-eggwarden"],
        creatures=["spark"],
        atmosphere="night",
    )
)

synopsis = (
    "Mira Eggwarden, Spark, and the expedition enter Tempestria — a mountain kingdom inside a permanent storm. "
    "King Vaelor Tempest and companion Thundervane are dying inside a failing Rift weather engine. "
    "Veiled Meridian sabotage tears the barrier; Spark refuses to replace Thundervane; the king releases the forced bond. "
    "Seris Vale escapes with a royal ledger that opens Issue #6: The Merchant's Secret."
)

script = {
    "title": "The Storm King",
    "issueNumber": 5,
    "slug": "the-storm-king",
    "protagonist": "Mira Eggwarden",
    "synopsis": synopsis,
    "storyPageCount": 25,
    "requiredMoments": list(range(1, 26)),
    "themes": [
        "duty becoming obsession",
        "leadership",
        "sacrifice",
        "protection vs control",
        "loyalty",
        "pride",
        "grief",
        "letting go",
    ],
    "calReed": "NON-CANON — forbidden",
    "elaraVenn": "vision/counsel only — not present cast",
    "kingdom": "Tempestria",
    "stormKing": "King Vaelor Tempest",
    "stormCompanion": "Thundervane",
    "mountainCompanion": "Galesprig",
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
            {"id": "cael-vesper", "name": "Cael Vesper", "role": "Lanternmaster"},
            {"id": "tavi-brightline", "name": "Tavi Brightline", "role": "Trusted circus performer"},
            {"id": "nira-quill", "name": "Nira Quill", "role": "Uncertain hunter"},
            {"id": "seris-vale", "name": "Seris Vale", "role": "Meridian commander"},
            {"id": "vaelor-tempest", "name": "King Vaelor Tempest", "role": "Storm King"},
            {"id": "hooded-merchant", "name": "Hooded Merchant", "role": "Issue #6 teaser"},
            {"id": "elara-venn", "name": "Elara Venn", "role": "Vision/counsel only — not present"},
        ],
        "rejected": [{"id": "cal-reed", "note": "NON-CANON"}, {"id": "voltkit", "note": "legacy seed — not used"}],
    }
    (OUT / "characters.json").write_text(json.dumps(characters, indent=2) + "\n", encoding="utf-8")

    creatures = {
        "featured": [
            {"id": "spark", "name": "Spark", "note": "Resonance Line / Last Light"},
            {"id": "thundervane", "name": "Thundervane", "note": "See THUNDERVANE_CANON_PROPOSAL.md"},
            {"id": "galesprig", "name": "Galesprig", "note": "See GALESPRIG_CANON_PROPOSAL.md"},
            {"id": "echoquill", "name": "Echoquill", "purpose": "Living Archive"},
            {"id": "bramblefox", "name": "Bramblefox", "purpose": "Track / flank"},
            {"id": "mossprig", "name": "Mossprig", "purpose": "Living Bulwark"},
            {"id": "thornling", "name": "Thornling", "purpose": "Conductors"},
            {"id": "wisplet", "name": "Wisplet", "purpose": "Phase / barriers"},
            {"id": "spirit-moth", "name": "Spirit Moth", "purpose": "Lightning signals"},
            {"id": "lumenhare", "name": "Lumenhare", "purpose": "Circus companion light"},
        ]
    }
    (OUT / "creatures.json").write_text(json.dumps(creatures, indent=2) + "\n", encoding="utf-8")

    factions = {
        "factions": [
            {"id": "veiled-meridian", "name": "Veiled Meridian", "goal": "Seize storm engine + Spark"},
            {"id": "tempestria-crown", "name": "Tempestria Crown", "status": "reforming-from-absolute-rule"},
            {"id": "lanternveil-circus", "name": "Lanternveil Traveling Circus", "status": "ally-uneasy"},
            {"id": "hatchery-compact", "name": "Hatchery Compact", "status": "established"},
            {"id": "merchant-network", "name": "Merchant Network", "status": "teaser-issue-006"},
        ]
    }
    (OUT / "factions.json").write_text(json.dumps(factions, indent=2) + "\n", encoding="utf-8")

    locations = {
        "locations": [
            {"id": "tempestria", "name": "Tempestria", "blurb": "Storm Kingdom inside permanent barrier"},
            {"id": "cliffside-village", "name": "Cliffside Village", "blurb": "Lightning-rod homes"},
            {"id": "royal-citadel", "name": "Royal Citadel", "blurb": "Throne under storm conduit"},
            {"id": "storm-engine", "name": "Storm Engine Chamber", "blurb": "Beneath the throne"},
            {"id": "thunder-arena", "name": "Thunder Arena", "blurb": "Aerial defense ground"},
            {"id": "merchant-hall", "name": "Hidden Trading Hall", "blurb": "Issue #6 teaser"},
        ]
    }
    (OUT / "locations.json").write_text(json.dumps(locations, indent=2) + "\n", encoding="utf-8")

    artifacts = {
        "artifacts": [
            {"id": "storm-engine", "name": "Tempestria Storm Engine", "status": "voluntarily stabilized"},
            {"id": "lost-city-rift-component", "name": "Lost City Rift Component", "status": "with Seris"},
            {"id": "royal-trade-ledger", "name": "Royal Trade Ledger", "status": "stolen → merchant"},
            {"id": "circus-warded-crystal", "name": "Shellward Crystal", "status": "remains at Lanternveil"},
        ]
    }
    (OUT / "artifacts.json").write_text(json.dumps(artifacts, indent=2) + "\n", encoding="utf-8")

    covers = {
        "main": {"title": "The Storm King", "issue": 5, "prompt": book[0]["grokPrompt"]},
        "variant-a": {
            "label": "Storm King and Thundervane bond portrait",
            "prompt": f"{STYLE} Variant cover A: {VAELOR} and {THUNDER} bond portrait, empty title zones. NO text.",
        },
        "variant-b": {
            "label": "Spark facing storm engine",
            "prompt": f"{STYLE} Variant cover B: {SPARK} before Tempestria storm engine, {MIRA} silhouette. NO text.",
        },
        "foil": {
            "label": "Foil — lightning crown and cyan crystal",
            "prompt": f"{STYLE} Foil cover concept: lightning crown and cyan crystal shimmer; empty title zones. NO text.",
        },
    }
    (OUT / "covers.json").write_text(json.dumps(covers, indent=2) + "\n", encoding="utf-8")

    refs = {
        "sheets": [
            "mira-eggwarden",
            "spark",
            "cael-vesper",
            "nira-quill",
            "seris-vale",
            "vaelor-tempest",
            "thundervane",
            "galesprig",
            "bramblefox",
            "mossprig",
            "thornling",
            "wisplet",
            "spirit-moth",
            "lumenhare",
            "echoquill",
            "tempestria-architecture",
            "storm-engine",
            "lightning-towers",
            "meridian-symbols",
            "royal-trade-ledger",
        ]
    }
    (OUT / "references" / "INDEX.json").write_text(json.dumps(refs, indent=2) + "\n", encoding="utf-8")
    (OUT / "references" / "README.md").write_text(
        "# Issue #5 reference sheets\n\nPlaceholder index for character/location lock sheets. Generate art via pipeline when ready.\n",
        encoding="utf-8",
    )

    issue = {
        "slug": "the-storm-king",
        "issueNumber": 5,
        "title": "The Storm King",
        "subtitle": "Chapter Five — Tempestria's Wall",
        "synopsis": synopsis,
        "publishedAt": "2026-07-20",
        "status": "published",
        "storyPageCount": 25,
        "bookPageCount": len(book),
        "estimatedReadMinutes": 22,
        "protagonist": "Mira Eggwarden",
        "featuredCreatures": ["Spark", "Thundervane", "Galesprig", "Bramblefox", "Mossprig", "Thornling", "Wisplet", "Echoquill"],
        "locations": ["Tempestria", "Royal Citadel", "Storm Engine Chamber", "Merchant Hall (teaser)"],
        "unlockGates": [
            {"kind": "prior-issue", "slug": "the-lost-city", "label": "Complete Issue #4: The Lost City"},
            {"kind": "admin-dev", "label": "Admin / COMICS_DEV_UNLOCK override"},
        ],
        "nextIssueTeaser": {
            "slug": "the-merchants-secret",
            "hook": "You brought me a map. No — every door.",
        },
        "pipeline": {
            "artProvider": "grok",
            "lettering": "programmatic",
            "bakedLettering": True,
            "contentRoot": "content/comics/the-storm-king/issue-005",
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
            "id": f"the-storm-king-issue-005-p{nn}",
            "cleanArtRel": f"generated/raw-art/page-{nn}.webp",
            "letteredArtRel": f"generated/lettered-pages/page-{nn}.webp",
            "publicArtRel": f"assets/comics/the-storm-king/issue-005/pages/page-{nn}.webp",
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
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
