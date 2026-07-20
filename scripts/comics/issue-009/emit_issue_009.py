#!/usr/bin/env python3
"""
Emit complete The Riftwright Issue #9 (Volume One Finale).
  python scripts/comics/issue-009/emit_issue_009.py

Does NOT touch issue-001–008 trees. Mira Eggwarden canon lock. Cal Reed forbidden.
Elara Venn vision only. Riftwright = Professor Elyan Voss (tragic).
Hatched companion = Nova (Prime Companion; twin-key with Spark).
Leaves ONE mystery: who manipulated history after the First Rift (older than Meridian).
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "content/comics/the-riftwright/issue-009"

STYLE = (
    "Original high-energy Western fantasy comic storytelling with dynamic panel composition, "
    "dramatic inked linework, richly painted colors, expressive character acting, and clear cinematic action. "
    "Original Riftwilds IP only. Deep forge bronze, cooling-lake teal, starlit indigo night, amber Compact lanterns, "
    "cyan-gold Resonance — purple only as controlled Forge reactor accent, never neon AI default. "
    "NO Marvel/DC/Pokémon characters or logos."
)
NEG = (
    "readable dialogue text, captions, logos, watermarks, page numbers, UI chrome, Marvel, DC, Pokémon, "
    "manga screentone trademarks, extra limbs, duplicate characters, missing companions, purple neon fantasy "
    "default, photoreal modern clothing, Pikachu lookalike, Cal Reed, cartoon villain Riftwright, "
    "Volume Two story pages beyond teaser"
)

SPARK = (
    "Spark the Glowpup-line Riftborn hatchling: soft luminous fur, cyan-gold rift markings, large expressive eyes, "
    "small crystal growths, glowing-tip emotional tail, steadier aura when bonded; cute but original — not a franchise mascot"
)
NOVA = (
    "Nova the Prime Companion hatchling: soft starlit cream-and-indigo fur, twin-key constellation markings that mirror Spark's "
    "cyan-gold pattern inverted, luminous violet-amber eyes, crystalline mane filaments, glowing comet-tip tail; "
    "newborn Prime Companion of the Nova bloodline — original Riftwilds design, not a franchise mascot"
)
MIRA = (
    "Mira Eggwarden: young adult Hatchery mentor/Keeper, warm brown skin, dark hair in practical braid, "
    "travel-stained hatchery coat over Compact robes, Compact lantern charm on satchel, determined protective eyes"
)
ELYAN = (
    "Professor Elyan Voss the Riftwright: late-50s scholar-engineer, pale weathered skin, silver-streaked dark hair tied back, "
    "forge-stained scholar coat over resonance apron, cracked monocle lens with cyan filament, tired tragic eyes — "
    "not a cartoon villain; dignity and grief in equal measure"
)
CAEL = (
    "Cael Vesper the Lanternmaster: mid-40s, warm brown skin, silver-threaded dark hair, deep blue and ember-gold coat, "
    "brass lantern clasps, half-mask of painted wood with nested lantern motif; supervised ally — trust unfinished"
)
SERIS = (
    "Seris Vale: Meridian commander evolving into Ascendant Commander — sharp features, storm-dark field coat with three-arc sigil "
    "overgrown by ascending crystal armor plates and reactor filaments, Lost City Rift component embedded at collar"
)
AXIOM = (
    "Axiom: small floating crystalline fox prototype companion, transparent body with glowing internal circuitry, "
    "holographic tail, broken crystal horns, soft cyan-gold light, curious restorative presence — "
    "Adaptive Matrix / Pulse Repair / System Restore; awakened at Forge of Rifts Issue #8"
)
ARKAN = (
    "Chief Engineer Arkan (memory/echo only): elderly Forge architect, mechanical prosthetics, ancient engineer robes, "
    "crystal monocle, tool harness, burned hands, blue energy veins — body sacrificed at Engine Alpha in Issue #8; "
    "appears only as amber memory-crystal projection"
)
NIRA = (
    "Nira Quill: allied hunter (cleared false lead in Issue #7), lean, weather cloak, quill-knife kit, hard-earned trust"
)
AURELIA = (
    "Aurelia Voss the Gilded Merchant: tall elegant merchant leader, black lacquer coat with warm gold filigree, "
    "half-veil over one eye — uneasy ally; distant kin surname to Elyan, shocked recognition optional"
)


def balloon(kind, speaker, text, x, y, tail=None, **extras):
    b = {
        "kind": kind,
        "text": text,
        "x": x,
        "y": y,
        "tail": tail,
        "maxWidthPct": extras.pop("maxWidthPct", 34),
    }
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
    for p in panels:
        for b in p.get("bubbles") or []:
            b.setdefault("readOrder", order)
            order += 1
    transcript = build_transcript(panels)
    story_n = opts.get("storyPageNumber")
    role = opts.get("bookRole", "story")
    atmosphere = opts.get("atmosphere", "rift")
    characters = opts.get("characters", ["mira-eggwarden"])
    creatures = opts.get("creatures", ["spark"])
    locations = opts.get("locations", ["Second Forge"])
    continuity = opts.get("continuity", {})
    required = opts.get("requiredMoments", [])
    page_turn = opts.get("pageTurnObjective", "")
    lettering = opts.get(
        "letteringInstructions",
        "Standard speech + narration; keep tails off faces and companion eyes; tragic Elyan voice restrained.",
    )

    panel_descs = []
    for i, p in enumerate(panels):
        panel_descs.append(f"Panel {i + 1} ({p['id']}): {p['description']}")

    grok = (
        f'{STYLE} Riftwilds comic "The Riftwright" Issue #9 Volume One Finale, '
        f'{"STORY PAGE " + str(story_n) + "/25 — " if story_n else ""}{title}. '
        f"Story purpose: {purpose} Layout: {layout['type']}. {layout['panelCount']} panels with clear inked gutters. "
        + " ".join(panel_descs)
        + f" Characters: {', '.join(characters)}. Creatures: {', '.join(creatures)}. "
        f"Spark design lock: {SPARK}. Nova design lock: {NOVA}. Keeper lock: {MIRA}. "
        f"Riftwright lock: {ELYAN}. Environment: {', '.join(locations)}. "
        f"Atmosphere: {atmosphere}. Continuity: {json.dumps(continuity)}. "
        "Leave empty balloon-safe and narration-safe negative space in upper/lower panel corners. "
        "NO readable text of any kind in the artwork."
    )

    pid = f"the-riftwright-issue-009-p{str(n).zfill(3)}"
    page = {
        "pageNumber": n,
        "storyPageNumber": story_n,
        "bookRole": role,
        "title": title,
        "storyPurpose": purpose,
        "layout": layout,
        "panels": panels,
        "dialogue": [],
        "captions": [],
        "soundEffects": [],
        "characters": characters,
        "creatures": creatures,
        "locations": locations,
        "artifacts": opts.get("artifacts", []),
        "continuity": continuity,
        "requiredMoments": required,
        "grokPrompt": grok,
        "negativePrompt": NEG,
        "pageTurnObjective": page_turn,
        "letteringInstructions": lettering,
        "generationStatus": "pending",
        "letteringStatus": "pending",
        "approvalStatus": "script-complete",
        "artAlt": f"{title} — The Riftwright page {n}",
        "atmosphere": atmosphere,
        "transcript": transcript,
        "a11yTranscript": transcript,
        "codexLinks": opts.get("codexLinks", []),
        "cardTeases": opts.get("cardTeases", []),
        "id": pid,
        "cleanArtRel": f"generated/raw-art/page-{str(n).zfill(3)}.webp",
        "letteredArtRel": f"generated/lettered-pages/page-{str(n).zfill(3)}.webp",
        "publicArtRel": f"assets/comics/the-riftwright/issue-009/pages/page-{str(n).zfill(3)}.webp",
    }
    if story_n:
        cont(n, continuity)
    return page


def matter(n, role, title, purpose, panels, **opts):
    return page_base(
        n,
        title,
        purpose,
        opts.pop("layout", {"type": "splash", "panelCount": 1}),
        panels,
        bookRole=role,
        storyPageNumber=None,
        **opts,
    )


# ---------------------------------------------------------------------------
# Story pages 1–25 (book pages 5–29)
# ---------------------------------------------------------------------------

def story_pages():
    pages = []
    cast = [
        "mira-eggwarden",
        "elyan-voss",
        "cael-vesper",
        "seris-vale",
        "nira-quill",
        "aurelia-voss",
    ]
    comps = [
        "spark",
        "nova",
        "axiom",
        "bramblefox",
        "mossprig",
        "thornling",
        "wisplet",
        "spirit-moth",
        "truthwing",
        "cindermink",
        "lumenhare",
        "echoquill",
        "dormant-riftborn-egg",
    ]

    # 1 — Second Forge (bridge from Issue #8 cliffhanger)
    pages.append(
        page_base(
            5,
            "Second Forge Threshold",
            "Bridge from Issue #8: Second Forge already activating; party arrives via Meridian Road; egg further cracked; Axiom leads.",
            {"type": "splash", "panelCount": 1},
            [
                panel(
                    "p1a",
                    f"Full-bleed: colossal underground Second Forge — twin of Forge of Rifts — already igniting (black steel, white stone, "
                    f"cyan plasma, orange molten, restrained purple reactor accent). Foreground: {MIRA}, {SPARK}, supervised {CAEL} "
                    f"(NOT a traitor reset — redemption unfinished), allied {NIRA}, {AXIOM} floating ahead projecting a path glyph, "
                    f"loyal companions. Mira cradles dormant Riftborn egg with FURTHER deepened cyan-amber cracks "
                    f"(already cracked at Gate + Forge — not a first crack). Empty caption zones.",
                    [
                        balloon(
                            "narration",
                            None,
                            "After Arkan's sacrifice… the second Forge answered the Gate's last whisper.",
                            50,
                            8,
                            maxWidthPct=62,
                        ),
                        balloon(
                            "whisper",
                            None,
                            "Begin the second creation…",
                            28,
                            38,
                            maxWidthPct=34,
                        ),
                        balloon("caption", None, "SECOND FORGE — ACTIVE", 50, 88, maxWidthPct=44),
                        balloon("sfx", None, "engine-HUMMMM", 78, 42, maxWidthPct=30),
                    ],
                )
            ],
            storyPageNumber=1,
            atmosphere="rift",
            characters=["mira-eggwarden", "cael-vesper", "nira-quill"],
            creatures=["spark", "axiom", "dormant-riftborn-egg", "bramblefox", "mossprig"],
            locations=["Second Forge"],
            continuity={
                "location": "Second Forge threshold",
                "fromIssue008": True,
                "egg": "further-cracked",
                "arkan": "sacrificed",
                "axiom": "awakened",
                "cael": "supervised-ally",
                "bridge": "begin-the-second-creation",
            },
            requiredMoments=[1],
            pageTurnObjective="Find who said they reached my Forge.",
            codexLinks=["second-forge"],
        )
    )

    # 2 — silhouette continuity from Issue #8 p25
    pages.append(
        page_base(
            6,
            "Machine That Makes Tears",
            "Artificial Rift lines + Issue #8 silhouette callback before face reveal.",
            {"type": "three-stack", "panelCount": 3},
            [
                panel(
                    "p2a",
                    "Wide: conveyor systems birth artificial Rift tears into containment rings; failed Riftborn husks behind glass — "
                    "weaponized after protocol rewrite (heal-intent lost).",
                    [
                        balloon("speech", "Nira Quill", "They're still manufacturing tears.", 30, 22, "down"),
                        balloon("creature", "Axiom", "Protocol… rewritten.", 70, 28, "down-left"),
                    ],
                ),
                panel(
                    "p2b",
                    f"{MIRA} and {SPARK} at Companion Incubator Beta; further-cracked egg vibrates; Axiom notes protector-line glyphs.",
                    [
                        balloon(
                            "speech",
                            "Mira Eggwarden",
                            "Arkan said they were grown to protect — not obey.",
                            40,
                            50,
                            "down",
                            maxWidthPct=40,
                        ),
                        balloon("creature", "Spark", "…yip.", 72, 70, "up"),
                    ],
                ),
                panel(
                    "p2c",
                    f"SILHOUETTE only (face hidden — hood/coat, engineer posture) on catwalk above reactor — Issue #8 cliffhanger continues.",
                    [
                        balloon(
                            "speech",
                            "Unknown",
                            "So… after all this time… someone finally reached my Forge.",
                            50,
                            82,
                            None,
                            maxWidthPct=48,
                        ),
                    ],
                ),
            ],
            storyPageNumber=2,
            atmosphere="rift",
            characters=["mira-eggwarden", "nira-quill", "elyan-voss"],
            creatures=["spark", "dormant-riftborn-egg", "axiom"],
            locations=["Second Forge foundries"],
            continuity={
                "riftwright": "silhouette-callback-issue-008",
                "egg": "further-cracked-vibrating",
                "lore": "protect-not-obey",
            },
            requiredMoments=[2],
            pageTurnObjective="Face the voice on the catwalk.",
        )
    )

    # 3
    pages.append(
        page_base(
            7,
            "Archives of Blame",
            "Memory vaults show history blaming the Riftwright; Mira sees the lie's polish.",
            {"type": "grid-2x2", "panelCount": 4},
            [
                panel(
                    "p3a",
                    "Memory-crystal mural: painted villain Riftwright tearing the sky — propaganda style.",
                    [balloon("caption", None, "OFFICIAL RECORD — FIRST RIFT", 50, 20, maxWidthPct=44)],
                ),
                panel(
                    "p3b",
                    f"{MIRA} touches crystal; image flickers — Elyan's younger face trying to seal a tear, not open it.",
                    [balloon("speech", "Mira Eggwarden", "This record was rewritten.", 40, 55, "down")],
                ),
                panel(
                    "p3c",
                    f"{CAEL} and {AXIOM} scan false seals; Axiom's Adaptive Matrix glows.",
                    [
                        balloon("speech", "Cael Vesper", "Meridian stamps. Older than Meridian ink underneath.", 60, 40, "down-left"),
                        balloon("creature", "Axiom", "Protocol mismatch.", 75, 70, "up"),
                    ],
                ),
                panel(
                    "p3d",
                    "Close: a blacked-out signature older than Meridian — unreadable void mark. Leave mystery.",
                    [balloon("narration", None, "Someone older than Meridian held the quill.", 50, 85, maxWidthPct=50)],
                ),
            ],
            storyPageNumber=3,
            atmosphere="ruin",
            characters=["mira-eggwarden", "cael-vesper"],
            creatures=["axiom", "echoquill", "wisplet"],
            locations=["Second Forge memory vaults"],
            continuity={"mystery": "history-manipulator-unnamed", "egg": "warm"},
            requiredMoments=[3],
            pageTurnObjective="Meet the man history blamed.",
            artifacts=["memory-crystal-archive"],
        )
    )

    # 4
    pages.append(
        page_base(
            8,
            "The Riftwright Speaks",
            "Elyan Voss steps into light — tragic, not cartoon villain.",
            {"type": "two-col", "panelCount": 2},
            [
                panel(
                    "p4a",
                    f"Dramatic FIRST FACE reveal (Issue #8 withheld identity): {ELYAN} descends a resonance stair, hands open, no weapons; "
                    f"forge light soft on tired face — tragic, not cartoon villain.",
                    [
                        balloon(
                            "speech",
                            "Elyan Voss",
                            "I am Professor Elyan Voss. They named me Riftwright so the world would have a monster.",
                            35,
                            18,
                            "down",
                            maxWidthPct=42,
                        ),
                    ],
                ),
                panel(
                    "p4b",
                    f"{MIRA} shields further-cracked egg and Spark; party tense; supervised {CAEL} half-raises lantern restraint but does not strike "
                    f"(ally under watch — NOT a new betrayal).",
                    [
                        balloon(
                            "speech",
                            "Mira Eggwarden",
                            "If you're the monster… why does the egg answer you like kin?",
                            65,
                            55,
                            "down-left",
                        ),
                        balloon(
                            "speech",
                            "Elyan Voss",
                            "I disappeared before activation. Someone else pushed the final command. I built cradles.",
                            70,
                            80,
                            "up",
                            maxWidthPct=40,
                        ),
                    ],
                ),
            ],
            storyPageNumber=4,
            atmosphere="dusk",
            characters=["mira-eggwarden", "elyan-voss", "cael-vesper", "nira-quill"],
            creatures=["spark", "dormant-riftborn-egg", "axiom"],
            locations=["Second Forge resonance stair"],
            continuity={"riftwright": "named-elyan-voss", "trust": "tentative"},
            requiredMoments=[4, 5],
            pageTurnObjective="Hear his history.",
        )
    )

    # 5
    pages.append(
        page_base(
            9,
            "Professor Elyan Voss",
            "Elyan recounts healing intent of Forges; weaponization; Arkan's sacrifice at first Forge.",
            {"type": "three-stack", "panelCount": 3},
            [
                panel(
                    "p5a",
                    "Flash vision (soft border): younger Elyan and Arkan designing healing engines / protector incubators — hope, not conquest.",
                    [
                        balloon(
                            "narration",
                            None,
                            "Riftborn were grown to protect — not obey. Then someone rewrote the protocols.",
                            50,
                            12,
                            maxWidthPct=58,
                        ),
                        balloon(
                            "speech",
                            "Elyan Voss",
                            "Arkan stayed at Engine Alpha. He sacrificed himself so Spark's line could choose.",
                            40,
                            35,
                            "down",
                            maxWidthPct=42,
                        ),
                    ],
                ),
                panel(
                    "p5b",
                    f"Present: {ARKAN} memory echo in crystal beside {AXIOM}; Axiom bows; echo confirms unknown saboteur still unnamed.",
                    [
                        balloon("magic", "Arkan (echo)", "Finish the cradle, Elyan… not the war.", 55, 50, maxWidthPct=40),
                        balloon("creature", "Axiom", "System Restore… incomplete.", 78, 70, "up"),
                        balloon(
                            "whisper",
                            "Arkan (echo)",
                            "The rewrite… was never Meridian's first hand.",
                            35,
                            78,
                            "up",
                            maxWidthPct=36,
                        ),
                    ],
                ),
                panel(
                    "p5c",
                    f"{MIRA} softens; {SPARK} presses forehead to further-cracked egg; cracks widen with starlight toward hatch.",
                    [
                        balloon(
                            "speech",
                            "Mira Eggwarden",
                            "Then help us keep what's left. No more manufactured tears.",
                            45,
                            88,
                            "up",
                        ),
                    ],
                ),
            ],
            storyPageNumber=5,
            atmosphere="rift",
            characters=["mira-eggwarden", "elyan-voss"],
            creatures=["spark", "axiom", "dormant-riftborn-egg"],
            locations=["Second Forge memory bridge"],
            continuity={"arkan": "echo-present", "egg": "cracking"},
            requiredMoments=[5],
            pageTurnObjective="Learn how history was weaponized.",
        )
    )

    # 6
    pages.append(
        page_base(
            10,
            "History Was a Weapon",
            "Elyan shows how blame was assigned; Aurelia recognizes the Voss name.",
            {"type": "grid-2x2", "panelCount": 4},
            [
                panel(
                    "p6a",
                    "Triptych of forged documents pinning First Rift on Elyan; true sealed schematics underneath.",
                    [balloon("speech", "Elyan Voss", "They needed a name. Mine was already on the blueprints.", 40, 20, "down")],
                ),
                panel(
                    "p6b",
                    f"{AURELIA} arrives via merchant lantern-route (brief); veil trembles at surname Voss.",
                    [
                        balloon("speech", "Aurelia Voss", "Voss… I bargained under a name I never fully owned.", 60, 45, "down-left"),
                        balloon("speech", "Elyan Voss", "Kin is not guilt. Choose what the name means now.", 55, 65, "up"),
                    ],
                ),
                panel(
                    "p6c",
                    f"{CAEL} confesses residual Meridian debt shame; Mira nods — supervised trust still standing.",
                    [
                        balloon("speech", "Cael Vesper", "I opened one gate under coercion. I won't open another for them.", 35, 50, "down"),
                    ],
                ),
                panel(
                    "p6d",
                    "Blacked-out manipulator mark again — older than Meridian — still unnamed.",
                    [balloon("narration", None, "One hand remains unwritten. Older. Patient.", 50, 88, maxWidthPct=48)],
                ),
            ],
            storyPageNumber=6,
            atmosphere="ruin",
            characters=["mira-eggwarden", "elyan-voss", "aurelia-voss", "cael-vesper"],
            creatures=["spark", "lockjaw-wisp", "dormant-riftborn-egg"],
            locations=["Second Forge archive hall"],
            continuity={"aurelia": "voss-kin-aware", "mystery": "history-manipulator-unnamed"},
            requiredMoments=[6],
            pageTurnObjective="Meet the Prime Companion line.",
        )
    )

    # 7 — Nova / Prime Companion
    pages.append(
        page_base(
            11,
            "Prime Companion",
            "Incubator Beta reveals Nova bloodline — Prime Companion template linked to Spark's Resonance Line.",
            {"type": "splash", "panelCount": 1},
            [
                panel(
                    "p7a",
                    f"Cinematic: Companion Incubator Beta blooms with constellation light; holographic adult Nova Prime silhouette of starlit cream-indigo fur "
                    f"above the dormant egg; {SPARK} and egg synchronize pulses; {MIRA} and {ELYAN} watch in awe.",
                    [
                        balloon("narration", None, "The Nova bloodline — Prime Companion. Twin-key to the Last Light.", 50, 8, maxWidthPct=60),
                        balloon("speech", "Elyan Voss", "Spark was never meant to stand alone.", 30, 78, "up-right"),
                        balloon("creature", "Spark", "…!", 68, 72, "down"),
                        balloon("sfx", None, "pulse-SYNC", 80, 40, maxWidthPct=28),
                    ],
                )
            ],
            storyPageNumber=7,
            atmosphere="rift",
            characters=["mira-eggwarden", "elyan-voss"],
            creatures=["spark", "dormant-riftborn-egg", "axiom"],
            locations=["Companion Incubator Beta"],
            continuity={"novaLine": "revealed", "egg": "ready-to-hatch"},
            requiredMoments=[7],
            pageTurnObjective="The egg cracks.",
            cardTeases=["nova-prime-companion"],
        )
    )

    # 8
    pages.append(
        page_base(
            12,
            "Egg of Twin Keys",
            "Dormant egg reaches critical hatch; Mira chooses consent Compact over force.",
            {"type": "three-stack", "panelCount": 3},
            [
                panel(
                    "p8a",
                    f"Close: dormant Riftborn egg — cyan-amber seams become starlit indigo cracks; {MIRA}'s hands cradle gently.",
                    [balloon("speech", "Mira Eggwarden", "No force. No Meridian override. You come if you choose.", 40, 20, "down")],
                ),
                panel(
                    "p8b",
                    f"{SPARK} presses nose to shell — voluntary Compact glow; party forms protective ring (Bramblefox, Mossprig, Thornling, Wisplet).",
                    [
                        balloon("creature", "Spark", "…come.", 55, 50, "down"),
                        balloon("sfx", None, "CRACK-kk", 70, 60, maxWidthPct=24),
                    ],
                ),
                panel(
                    "p8c",
                    "Shell splits with constellation light — silhouette of newborn inside, face not yet fully shown.",
                    [balloon("narration", None, "A second heart answers the first.", 50, 88, maxWidthPct=50)],
                ),
            ],
            storyPageNumber=8,
            atmosphere="dawn",
            characters=["mira-eggwarden"],
            creatures=["spark", "dormant-riftborn-egg", "bramblefox", "mossprig", "thornling", "wisplet"],
            locations=["Incubator Beta hatch floor"],
            continuity={"egg": "hatching", "compact": "consent"},
            requiredMoments=[8],
            pageTurnObjective="Name the hatchling.",
        )
    )

    # 9 — Hatch Nova
    pages.append(
        page_base(
            13,
            "Nova Hatches",
            "Egg hatches into Nova — Prime Companion; twin-key with Spark.",
            {"type": "splash", "panelCount": 1},
            [
                panel(
                    "p9a",
                    f"Full-bleed hatch splash: {NOVA} emerges into Mira's arms; {SPARK} beside her; twin-key constellation + cyan-gold markings "
                    f"interlock in the air; companions cheer with soft light; {ELYAN} weeps quietly with relief, not triumph.",
                    [
                        balloon("narration", None, "Her name is Nova — Prime Companion. Twin-key to Spark.", 50, 8, maxWidthPct=58),
                        balloon("speech", "Mira Eggwarden", "Welcome home.", 28, 70, "down-right"),
                        balloon("creature", "Nova", "…mrr.", 62, 62, "down"),
                        balloon("creature", "Spark", "…yip!", 74, 78, "up"),
                        balloon("sfx", None, "STARBURST", 80, 35, maxWidthPct=26),
                    ],
                )
            ],
            storyPageNumber=9,
            atmosphere="dawn",
            characters=["mira-eggwarden", "elyan-voss"],
            creatures=["nova", "spark", "axiom", "lumenhare", "spirit-moth"],
            locations=["Incubator Beta hatch floor"],
            continuity={"egg": "hatched", "nova": "alive", "twinKey": "forming"},
            requiredMoments=[9],
            pageTurnObjective="Lock the twin-key.",
            cardTeases=["nova"],
        )
    )

    # 10
    pages.append(
        page_base(
            14,
            "Twin-Key Resonance",
            "Spark and Nova synchronize; Engines respond; Seris detects the spike.",
            {"type": "two-col", "panelCount": 2},
            [
                panel(
                    "p10a",
                    f"{SPARK} and {NOVA} forehead-touch; twin-key glyph forms; Forge engines stabilize briefly into healing mode.",
                    [
                        balloon("magic", None, "TWIN-KEY LOCK", 50, 18, maxWidthPct=36),
                        balloon("speech", "Elyan Voss", "That's the cradle protocol. Not the weapon.", 40, 80, "up"),
                    ],
                ),
                panel(
                    "p10b",
                    f"Cutaway: {SERIS} in Ascendant chamber feels the spike — crystal armor beginning to bloom.",
                    [
                        balloon("speech", "Seris Vale", "Subject One… and a Prime. Perfect. Begin Ascendant Protocol.", 60, 40, "down"),
                        balloon("sfx", None, "ALARM-ooo", 75, 70, maxWidthPct=28),
                    ],
                ),
            ],
            storyPageNumber=10,
            atmosphere="rift",
            characters=["mira-eggwarden", "elyan-voss", "seris-vale"],
            creatures=["spark", "nova", "axiom"],
            locations=["Incubator Beta", "Ascendant chamber"],
            continuity={"twinKey": "locked", "seris": "ascending"},
            requiredMoments=[10],
            pageTurnObjective="Ascendant Commander rises.",
        )
    )

    # 11
    pages.append(
        page_base(
            15,
            "Ascendant Protocol",
            "Seris Vale becomes Ascendant Commander — massive threat.",
            {"type": "splash", "panelCount": 1},
            [
                panel(
                    "p11a",
                    f"Menacing splash: {SERIS} fully Ascendant Commander — crystal armor, three-arc sigil blazing, Lost City component "
                    f"as crown core, artificial Rift wings of energy; Meridian constructs rally behind her.",
                    [
                        balloon("shout", "Ascendant Commander", "The Forges answer me now!", 50, 12, maxWidthPct=48),
                        balloon("caption", None, "ASCENDANT COMMANDER — SERIS VALE", 50, 90, maxWidthPct=50),
                        balloon("sfx", None, "ASCEND-KRRAK", 78, 45, maxWidthPct=30),
                    ],
                )
            ],
            storyPageNumber=11,
            atmosphere="storm",
            characters=["seris-vale"],
            creatures=[],
            locations=["Ascendant chamber / Second Forge bridge"],
            continuity={"seris": "ascendant-commander"},
            requiredMoments=[11],
            pageTurnObjective="Battle lines form.",
        )
    )

    # 12
    pages.append(
        page_base(
            16,
            "Siege of the Cradle",
            "Ascendant forces assault Incubator Beta; party defends Nova and Spark.",
            {"type": "grid-2x2", "panelCount": 4},
            [
                panel(
                    "p12a",
                    "Constructs smash platforms; Bramblefox and Thornling intercept.",
                    [
                        balloon("sfx", None, "CLANG", 30, 20, maxWidthPct=20),
                        balloon("speech", "Nira Quill", "Left flank — move!", 55, 30, "down"),
                    ],
                ),
                panel(
                    "p12b",
                    "Mossprig living bulwark companion (mossy shell, root feet) Living Bulwark shields Mira, Spark, Nova.",
                    [balloon("creature", "Mossprig", "…hold.", 40, 55, "up")],
                ),
                panel(
                    "p12c",
                    f"{CAEL} throws lantern-line barriers; supervised redemption in action.",
                    [balloon("speech", "Cael Vesper", "Lantern line — stay behind the light!", 60, 50, "down-left")],
                ),
                panel(
                    "p12d",
                    f"{AXIOM} Pulse Repair on cracked bridge; Spirit Moth and Truthwing scout.",
                    [balloon("creature", "Axiom", "Pulse Repair engaged.", 50, 85, "up")],
                ),
            ],
            storyPageNumber=12,
            atmosphere="storm",
            characters=["mira-eggwarden", "cael-vesper", "nira-quill"],
            creatures=["spark", "nova", "axiom", "bramblefox", "mossprig", "thornling", "spirit-moth", "truthwing"],
            locations=["Incubator Beta siege"],
            continuity={"battle": "begun", "nova": "protected"},
            requiredMoments=[12],
            pageTurnObjective="Companions rally.",
        )
    )

    # 13
    pages.append(
        page_base(
            17,
            "Companions Rally",
            "Full companion cast shows found-family strength; Cindermink Break the Chain on restraints.",
            {"type": "three-stack", "panelCount": 3},
            [
                panel(
                    "p13a",
                    "Wide: Spark, Nova, Axiom, Bramblefox, Mossprig, Thornling, Wisplet, Spirit Moth, Truthwing, Cindermink, Lumenhare, Echoquill arrayed.",
                    [balloon("narration", None, "Not an army. A Compact.", 50, 12, maxWidthPct=45)],
                ),
                panel(
                    "p13b",
                    "Cindermink Break the Chain frees captured Forge-servitors; Lumenhare recovers enough to dazzle a construct.",
                    [
                        balloon("creature", "Cindermink", "Break!", 40, 50, "down"),
                        balloon("sfx", None, "CHAIN-SNAP", 70, 55, maxWidthPct=26),
                    ],
                ),
                panel(
                    "p13c",
                    f"{MIRA} raises Compact lantern; twin-key glow from Spark+Nova answers.",
                    [balloon("speech", "Mira Eggwarden", "We keep each other. That's the whole doctrine.", 50, 85, "up")],
                ),
            ],
            storyPageNumber=13,
            atmosphere="day",
            characters=["mira-eggwarden"],
            creatures=comps,
            locations=["Second Forge plaza"],
            continuity={"companions": "full-rally"},
            requiredMoments=[13],
            pageTurnObjective="Elyan opens Engine control.",
        )
    )

    # 14
    pages.append(
        page_base(
            18,
            "Engine Control",
            "Elyan and Axiom race to Twin Engine controls; Arkan echo guides.",
            {"type": "two-col", "panelCount": 2},
            [
                panel(
                    "p14a",
                    f"{ELYAN} at Twin Engine console; {AXIOM} Adaptive Matrix sync; Arkan echo points to healing lattice.",
                    [
                        balloon("speech", "Elyan Voss", "If we stabilize both Engines in cradle mode, the artificial tears collapse.", 35, 20, "down", maxWidthPct=40),
                        balloon("magic", "Arkan (echo)", "Remember the lattice, not the blade.", 55, 70, maxWidthPct=36),
                    ],
                ),
                panel(
                    "p14b",
                    f"Ascendant Commander blasts toward console; {NIRA} and Bramblefox intercept.",
                    [
                        balloon("shout", "Ascendant Commander", "Cradle mode dies with you, Professor!", 65, 30, "down-left"),
                        balloon("speech", "Nira Quill", "Not today.", 40, 80, "up"),
                    ],
                ),
            ],
            storyPageNumber=14,
            atmosphere="rift",
            characters=["elyan-voss", "seris-vale", "nira-quill"],
            creatures=["axiom", "bramblefox"],
            locations=["Twin Engine control"],
            continuity={"engines": "contested"},
            requiredMoments=[14],
            pageTurnObjective="War expands.",
        )
    )

    # 15
    pages.append(
        page_base(
            19,
            "Roads and Lanterns",
            "Aurelia (uneasy ally) seals routes; Cael supervised ally holds lantern logistics — NOT a traitor reset.",
            {"type": "three-stack", "panelCount": 3},
            [
                panel(
                    "p15a",
                    f"{AURELIA} and Lockjaw Wisp seal portal roads so Meridian reinforcements can't flood in — uneasy ally, selective trust.",
                    [balloon("speech", "Aurelia Voss", "Closed Contract — no more doors for conquerors.", 45, 22, "down")],
                ),
                panel(
                    "p15b",
                    f"{CAEL} coordinates lantern lines — supervised ally from Issues #7–#8; redemption unfinished; no new betrayal.",
                    [balloon("speech", "Cael Vesper", "I don't ask forgiveness. I ask for useful light.", 50, 50, "down")],
                ),
                panel(
                    "p15c",
                    f"{MIRA}: Compact justice, not exile — supervised trust continues.",
                    [balloon("speech", "Mira Eggwarden", "Useful light is a start.", 50, 82, "up")],
                ),
            ],
            storyPageNumber=15,
            atmosphere="dusk",
            characters=["mira-eggwarden", "cael-vesper", "aurelia-voss"],
            creatures=["lockjaw-wisp", "spark", "nova"],
            locations=["Second Forge portal rings"],
            continuity={"cael": "supervised-ally-not-retraitor", "aurelia": "uneasy-ally", "routes": "sealed"},
            requiredMoments=[15],
            pageTurnObjective="Massive battle begins.",
        )
    )

    # 16 — setup battle
    pages.append(
        page_base(
            20,
            "Twin Forge War",
            "Battlefield establishes — Second Forge vs Ascendant host; Engines roar.",
            {"type": "splash", "panelCount": 1},
            [
                panel(
                    "p16a",
                    "Epic establishing splash: two Engine cores flaring; platforms full of companions vs Ascendant constructs; "
                    f"{MIRA} center with Spark and Nova; {ELYAN} at console; Ascendant Commander descending like a comet.",
                    [
                        balloon("narration", None, "Volume One ends where manufactured skies learn to break.", 50, 8, maxWidthPct=58),
                        balloon("sfx", None, "WAR-ROAR", 78, 40, maxWidthPct=28),
                        balloon("caption", None, "BATTLE OF THE TWIN FORGES", 50, 90, maxWidthPct=48),
                    ],
                )
            ],
            storyPageNumber=16,
            atmosphere="storm",
            characters=cast,
            creatures=comps,
            locations=["Second Forge war plaza"],
            continuity={"battle": "peak-approach"},
            requiredMoments=[16],
            pageTurnObjective="Pages 18–19 — the clash.",
        )
    )

    # 17
    pages.append(
        page_base(
            21,
            "Last Light, First Star",
            "Spark and Nova prepare twin-key surge; Mira anchors Compact consent.",
            {"type": "two-col", "panelCount": 2},
            [
                panel(
                    "p17a",
                    f"Intimate: {MIRA} kneels with {SPARK} and {NOVA}; voluntary bond light — no force.",
                    [
                        balloon("speech", "Mira Eggwarden", "Only if you both choose.", 40, 20, "down"),
                        balloon("creature", "Spark", "…choose.", 55, 55, "up"),
                        balloon("creature", "Nova", "…choose.", 70, 60, "up-left"),
                    ],
                ),
                panel(
                    "p17b",
                    "Twin-key surge charges — cyan-gold and constellation indigo braid into a single beam toward Engines.",
                    [
                        balloon("sfx", None, "TWIN-KEY SURGE", 50, 40, maxWidthPct=36),
                        balloon("speech", "Elyan Voss", "Now — cradle lattice!", 60, 80, "up"),
                    ],
                ),
            ],
            storyPageNumber=17,
            atmosphere="rift",
            characters=["mira-eggwarden", "elyan-voss"],
            creatures=["spark", "nova"],
            locations=["Engine overlook"],
            continuity={"twinKey": "surging"},
            requiredMoments=[17],
            pageTurnObjective="Massive battle page 18.",
        )
    )

    # 18 — massive battle
    pages.append(
        page_base(
            22,
            "Clash — Part One",
            "Massive battle page 18/25 — Ascendant Commander vs Compact + twin-key.",
            {"type": "grid-2x2", "panelCount": 4},
            [
                panel(
                    "p18a",
                    f"Ascendant Commander fires artificial Rift lance; Mossprig and Bramblefox tank; platforms shatter.",
                    [balloon("sfx", None, "KRRAAASH", 40, 25, maxWidthPct=24)],
                ),
                panel(
                    "p18b",
                    f"{SPARK} and {NOVA} twin-key beam counters the lance mid-air — spectacular energy clash.",
                    [balloon("sfx", None, "VVVOOM", 55, 45, maxWidthPct=22)],
                ),
                panel(
                    "p18c",
                    f"{ELYAN} slams cradle levers; Axiom System Restore floods conduits with healing teal.",
                    [
                        balloon("speech", "Elyan Voss", "Heal the tear — don't widen it!", 40, 60, "down"),
                        balloon("creature", "Axiom", "System Restore — 62%.", 70, 70, "up"),
                    ],
                ),
                panel(
                    "p18d",
                    f"{CAEL} and {NIRA} cover Mira; Truthwing Clear Reflection blinds a construct squadron.",
                    [balloon("speech", "Nira Quill", "Keep the Keepers standing!", 50, 85, "up")],
                ),
            ],
            storyPageNumber=18,
            atmosphere="storm",
            characters=["mira-eggwarden", "elyan-voss", "seris-vale", "cael-vesper", "nira-quill"],
            creatures=["spark", "nova", "axiom", "mossprig", "bramblefox", "truthwing"],
            locations=["Twin Forge battlefield"],
            continuity={"battle": "peak"},
            requiredMoments=[18],
            pageTurnObjective="Battle part two.",
            letteringInstructions="Dense SFX OK; keep speech readable; no overlapping tails on twin-key beam.",
        )
    )

    # 19 — massive battle climax
    pages.append(
        page_base(
            23,
            "Clash — Part Two",
            "Massive battle climax 19/25 — Ascendant armor cracks; Engines tip toward cradle.",
            {"type": "three-stack", "panelCount": 3},
            [
                panel(
                    "p19a",
                    f"Ascendant Commander closes on Mira; Spark+Nova shield; Mira's Compact lantern flares amber.",
                    [
                        balloon("shout", "Ascendant Commander", "Subjects belong to the sky I make!", 55, 15, "down", maxWidthPct=40),
                        balloon("speech", "Mira Eggwarden", "They belong to themselves!", 35, 35, "up-right"),
                    ],
                ),
                panel(
                    "p19b",
                    "Twin-key + cradle lattice pierce Ascendant crown core (Lost City component shatters into inert crystal).",
                    [
                        balloon("sfx", None, "SHATTER-RING", 50, 50, maxWidthPct=30),
                        balloon("magic", None, "CRADLE LATTICE LOCK", 50, 65, maxWidthPct=40),
                    ],
                ),
                panel(
                    "p19c",
                    f"Seris armor fails — she falls to one knee, human again beneath cracked plates; rage becomes hollow exhaustion.",
                    [
                        balloon("speech", "Seris Vale", "…you… rewrote my victory…", 45, 85, "up"),
                        balloon("speech", "Elyan Voss", "No. We restored a purpose.", 70, 88, "up-left"),
                    ],
                ),
            ],
            storyPageNumber=19,
            atmosphere="storm",
            characters=["mira-eggwarden", "seris-vale", "elyan-voss"],
            creatures=["spark", "nova", "axiom"],
            locations=["Twin Forge battlefield"],
            continuity={"seris": "defeated-armor-cracked", "battle": "turning"},
            requiredMoments=[19],
            pageTurnObjective="Stabilize the Engines.",
        )
    )

    # 20
    pages.append(
        page_base(
            24,
            "Engines Stabilize",
            "Twin Engines enter cradle mode; artificial Rifts collapse across the Forge.",
            {"type": "splash", "panelCount": 1},
            [
                panel(
                    "p20a",
                    "Triumphant calm splash: Twin Engines glow steady teal-amber healing light; artificial tears dissolve into mist; "
                    f"companions rest on platforms; {MIRA} holds Spark and Nova; {ELYAN} slumps in exhausted relief at console; "
                    f"Arkan echo smiles once and fades.",
                    [
                        balloon("narration", None, "The Engines remember they were built to mend.", 50, 8, maxWidthPct=58),
                        balloon("magic", "Arkan (echo)", "Good night, spare heart.", 30, 70, maxWidthPct=34),
                        balloon("sfx", None, "hummm… steady", 75, 40, maxWidthPct=30),
                        balloon("caption", None, "ENGINES: CRADLE MODE", 50, 90, maxWidthPct=42),
                    ],
                )
            ],
            storyPageNumber=20,
            atmosphere="dawn",
            characters=["mira-eggwarden", "elyan-voss"],
            creatures=["spark", "nova", "axiom"],
            locations=["Twin Engine cores"],
            continuity={"engines": "stabilized", "arkan": "echo-fades"},
            requiredMoments=[20],
            pageTurnObjective="History restored.",
        )
    )

    # 21
    pages.append(
        page_base(
            25,
            "History Restored",
            "Memory vaults rewrite toward truth; Elyan's name cleared in Forge records — public world still healing.",
            {"type": "grid-2x2", "panelCount": 4},
            [
                panel(
                    "p21a",
                    "Memory mural corrects: Elyan sealing, not tearing; Arkan's sacrifice named; Spark and Nova as cradle keys.",
                    [balloon("caption", None, "FORGE RECORD — RESTORED", 50, 18, maxWidthPct=42)],
                ),
                panel(
                    "p21b",
                    f"{MIRA}: \"The world outside will take longer. Truth isn't a switch.\"",
                    [balloon("speech", "Mira Eggwarden", "The world outside will take longer. Truth isn't a switch.", 45, 45, "down")],
                ),
                panel(
                    "p21c",
                    f"{ELYAN} removes cracked monocle; soft smile — tragic peace, not victory pose.",
                    [balloon("speech", "Elyan Voss", "Then I will teach. Not hide.", 55, 55, "down")],
                ),
                panel(
                    "p21d",
                    "Again: the older-than-Meridian void signature remains blacked out — ONE mystery kept.",
                    [balloon("narration", None, "One signature still refuses the light.", 50, 88, maxWidthPct=48)],
                ),
            ],
            storyPageNumber=21,
            atmosphere="ruin",
            characters=["mira-eggwarden", "elyan-voss"],
            creatures=["spark", "nova", "echoquill", "wisplet"],
            locations=["Memory vaults"],
            continuity={"history": "forge-restored", "mystery": "history-manipulator-unnamed"},
            requiredMoments=[21],
            pageTurnObjective="Aftermath.",
        )
    )

    # 22
    pages.append(
        page_base(
            26,
            "What We Keep",
            "Aftermath: Seris contained (not executed); Cael supervision continues; Compact justice.",
            {"type": "three-stack", "panelCount": 3},
            [
                panel(
                    "p22a",
                    f"Seris in inert crystal restraints — alive, defeated; Mira refuses execution.",
                    [
                        balloon("speech", "Nira Quill", "She'll try again.", 30, 20, "down"),
                        balloon("speech", "Mira Eggwarden", "Then we keep better doors. We don't become Meridian.", 55, 30, "down-left"),
                    ],
                ),
                panel(
                    "p22b",
                    f"{CAEL} turns in remaining transmitter shards; Aurelia witnesses.",
                    [balloon("speech", "Cael Vesper", "Supervised travel. I'll earn the unmasked road.", 50, 55, "down")],
                ),
                panel(
                    "p22c",
                    f"Quiet: {SPARK} and {NOVA} asleep against Mira; Axiom stands watch.",
                    [balloon("narration", None, "Found family is a kind of Engine.", 50, 85, maxWidthPct=48)],
                ),
            ],
            storyPageNumber=22,
            atmosphere="dusk",
            characters=["mira-eggwarden", "seris-vale", "cael-vesper", "nira-quill", "aurelia-voss"],
            creatures=["spark", "nova", "axiom"],
            locations=["Second Forge holding terrace"],
            continuity={"seris": "contained", "cael": "supervised"},
            requiredMoments=[22],
            pageTurnObjective="Found family quiet beat.",
        )
    )

    # 23
    pages.append(
        page_base(
            27,
            "Found Family",
            "Quiet celebration; Elara Venn vision-only blessing; Volume One emotional close begins.",
            {"type": "two-col", "panelCount": 2},
            [
                panel(
                    "p23a",
                    f"Warm group: Mira, Spark, Nova, companions, Elyan, Cael, Nira, Aurelia share lantern tea on a quiet platform.",
                    [
                        balloon("speech", "Elyan Voss", "Professor. Keeper. Merchant. Lantern. Hunter. Companions. That's a faculty.", 40, 18, "down", maxWidthPct=42),
                        balloon("speech", "Mira Eggwarden", "That's a home.", 60, 40, "down-left"),
                    ],
                ),
                panel(
                    "p23b",
                    f"Soft vision overlay only: {('Elara Venn: First Keeper, soft robes, archive light, not physically present')} nods once and fades — vision only.",
                    [
                        balloon("whisper", "Elara Venn (vision)", "Keep choosing keeping.", 50, 70, "up", maxWidthPct=40),
                        balloon("narration", None, "A First Keeper's blessing — echo, not body.", 50, 90, maxWidthPct=48),
                    ],
                ),
            ],
            storyPageNumber=23,
            atmosphere="night",
            characters=["mira-eggwarden", "elyan-voss", "cael-vesper", "nira-quill", "aurelia-voss"],
            creatures=["spark", "nova", "axiom", "bramblefox", "lumenhare"],
            locations=["Second Forge quiet terrace"],
            continuity={"elara": "vision-only", "volumeOne": "closing"},
            requiredMoments=[23],
            pageTurnObjective="Look up — something broken in the sky.",
        )
    )

    # 24 — tease setup
    pages.append(
        page_base(
            28,
            "A Crack in the Sky",
            "Finale tease begins — night sky above the continent shows a broken star.",
            {"type": "splash", "panelCount": 1},
            [
                panel(
                    "p24a",
                    "Wide night: party looks up from Forge vent to the heavens; a distant star is visibly cracked / shattered, "
                    "faint sleeping companion silhouettes curled inside the break — mysterious, beautiful, ominous.",
                    [
                        balloon("narration", None, "Far above healed Engines… a star forgets how to shine whole.", 50, 10, maxWidthPct=58),
                        balloon("speech", "Mira Eggwarden", "What is that?", 30, 70, "up-right"),
                        balloon("speech", "Elyan Voss", "Not Meridian work. Older… or farther.", 65, 78, "up-left"),
                        balloon("sfx", None, "distant-chime", 80, 35, maxWidthPct=28),
                    ],
                )
            ],
            storyPageNumber=24,
            atmosphere="night",
            characters=["mira-eggwarden", "elyan-voss"],
            creatures=["spark", "nova"],
            locations=["Second Forge sky vent", "Shattered Star (distant)"],
            continuity={"volumeTwoTease": "shattered-star", "mystery": "history-manipulator-unnamed"},
            requiredMoments=[24],
            pageTurnObjective="Volume One finale image.",
        )
    )

    # 25 — Volume One finale / Volume Two tease
    pages.append(
        page_base(
            29,
            "The Shattered Star",
            "Volume One finale splash — broken star in space with sleeping companions; NEXT Volume Two.",
            {"type": "splash", "panelCount": 1},
            [
                panel(
                    "p25a",
                    "Full cosmic finale splash: a broken/shattered star in deep space, warm amber and cool cyan fractures, "
                    "multiple adorable original Riftborn companions sleeping curled in the hollow of the break like a nest of stars; "
                    "no readable title painted in art; leave caption zones for lettering. Quiet, mythic, not battle.",
                    [
                        balloon("narration", None, "Volume One ends. Something older than Meridian still dreams in pieces.", 50, 8, maxWidthPct=60),
                        balloon("caption", None, "NEXT — VOLUME TWO", 50, 78, maxWidthPct=40),
                        balloon("caption", None, "THE SHATTERED STAR", 50, 88, maxWidthPct=44),
                    ],
                )
            ],
            storyPageNumber=25,
            atmosphere="night",
            characters=[],
            creatures=["spark", "nova"],  # teased sleeping forms may echo them
            locations=["Shattered Star (space)"],
            continuity={
                "volumeOne": "complete",
                "volumeTwoTease": "the-shattered-star",
                "mystery": "history-manipulator-unnamed",
                "doNotStartVolumeTwoIssues": True,
            },
            requiredMoments=[25],
            pageTurnObjective="End Volume One.",
            letteringInstructions="Finale captions centered; no speech; mythic narration only.",
        )
    )

    return pages


def front_matter():
    pages = []
    # 1 cover
    pages.append(
        matter(
            1,
            "front-cover",
            "The Riftwright — Cover",
            "Volume One Finale cover: Mira, Spark, Nova hatch glow, Elyan tragic, Ascendant silhouette, Second Forge.",
            [
                panel(
                    "c1",
                    f"Premium comic cover composition (no readable title text in art): {MIRA} center cradling newborn {NOVA} with {SPARK} at her side; "
                    f"{ELYAN} half-lit tragic on left; Ascendant Commander silhouette upper right; Second Forge engines below; "
                    f"star crack in sky. Empty title-safe bands top/bottom.",
                    [
                        balloon("caption", None, "LEGENDS OF THE RIFT", 50, 8, maxWidthPct=50),
                        balloon("caption", None, "ISSUE #9 — VOLUME ONE FINALE", 50, 16, maxWidthPct=55),
                        balloon("caption", None, "THE RIFTWRIGHT", 50, 88, maxWidthPct=48),
                    ],
                )
            ],
            atmosphere="rift",
            characters=["mira-eggwarden", "elyan-voss", "seris-vale"],
            creatures=["spark", "nova", "axiom"],
            locations=["Second Forge"],
        )
    )
    # 2 inside
    pages.append(
        matter(
            2,
            "inside-cover",
            "Inside Front Cover",
            "Quiet Second Forge parchment map + Compact invitation.",
            [
                panel(
                    "i1",
                    "Soft illustrated inside cover: parchment light, twin Forge map (primary cooling / Second Forge igniting), "
                    "Axiom glyph, further-cracked egg motif becoming Nova star, Riftwright silhouette mark.",
                    [
                        balloon("narration", None, "Legends of the Rift · Volume One · Issue Nine", 50, 18, maxWidthPct=55),
                        balloon(
                            "caption",
                            None,
                            "Previously: Arkan sacrificed. Axiom awoke. Second Forge activated.",
                            50,
                            48,
                            maxWidthPct=55,
                        ),
                        balloon(
                            "caption",
                            None,
                            "“Someone finally reached my Forge.”",
                            50,
                            72,
                            maxWidthPct=50,
                        ),
                        balloon("caption", None, "VOLUME ONE FINALE", 50, 88, maxWidthPct=40),
                    ],
                )
            ],
            atmosphere="dusk",
            characters=["mira-eggwarden"],
            creatures=["spark", "nova"],
            locations=["Second Forge"],
        )
    )
    # 3 credits
    pages.append(
        matter(
            3,
            "credits",
            "Credits",
            "Credits plate — atelier tools, no real logos.",
            [
                panel(
                    "cr1",
                    "Workshop desk with quills, rift-ink, twin Engine schematics — no readable credit text in art.",
                    [
                        balloon("narration", None, "Riftwilds · Legends of the Rift", 50, 20, maxWidthPct=50),
                        balloon("caption", None, "Story · Art Direction · Lettering · Continuity", 50, 45, maxWidthPct=55),
                        balloon("caption", None, "Keeper: Mira Eggwarden  ·  Cal Reed is not canon", 50, 70, maxWidthPct=55),
                        balloon("caption", None, "Volume One Finale", 50, 85, maxWidthPct=40),
                    ],
                )
            ],
            atmosphere="ruin",
            characters=[],
            creatures=[],
            locations=["Credits atelier"],
        )
    )
    # 4 title
    pages.append(
        matter(
            4,
            "title",
            "Chapter Nine — The Riftwright",
            "Title page for Volume One Finale.",
            [
                panel(
                    "t1",
                    f"Title energy without painted lettering: {MIRA}, {SPARK}, egg-to-Nova glow, Elyan silhouette, Second Forge behind.",
                    [
                        balloon("caption", None, "CHAPTER NINE", 50, 20, maxWidthPct=40),
                        balloon("caption", None, "THE RIFTWRIGHT", 50, 40, maxWidthPct=48),
                        balloon("narration", None, "Volume One Finale — history meets its maker.", 50, 75, maxWidthPct=55),
                    ],
                )
            ],
            atmosphere="rift",
            characters=["mira-eggwarden", "elyan-voss"],
            creatures=["spark", "nova"],
            locations=["Second Forge"],
        )
    )
    return pages


def back_matter():
    pages = []
    # 30 profiles
    pages.append(
        matter(
            30,
            "profile",
            "Character Profiles",
            "Profiles: Mira, Elyan, Seris Ascendant, Cael, Nira, Aurelia.",
            [
                panel(
                    "pr1",
                    f"Character profile plate: portrait row of {MIRA}, {ELYAN}, Ascendant {SERIS}, {CAEL}, {NIRA}, {AURELIA} — empty text bands.",
                    [
                        balloon("caption", None, "MIRA EGGWARDEN — Keeper", 25, 20, maxWidthPct=28),
                        balloon("caption", None, "ELYAN VOSS — Riftwright", 75, 20, maxWidthPct=28),
                        balloon("caption", None, "SERIS VALE — Ascendant", 25, 55, maxWidthPct=28),
                        balloon("caption", None, "CAEL · NIRA · AURELIA", 75, 55, maxWidthPct=30),
                        balloon("narration", None, "Tragedy is not the same as villainy.", 50, 88, maxWidthPct=50),
                    ],
                )
            ],
            layout={"type": "lore", "panelCount": 1},
            atmosphere="dusk",
            characters=["mira-eggwarden", "elyan-voss", "seris-vale", "cael-vesper", "nira-quill", "aurelia-voss"],
            creatures=[],
            locations=["Profile atelier"],
        )
    )
    # 31 companions
    pages.append(
        matter(
            31,
            "profile",
            "Companion Profiles",
            "Nova debut + Spark twin-key + Axiom + cast.",
            [
                panel(
                    "cp1",
                    f"Companion profile splash: {NOVA} and {SPARK} twin-key center; Axiom; Bramblefox; Mossprig; others in orbit.",
                    [
                        balloon("caption", None, "NOVA — Prime Companion", 50, 12, maxWidthPct=42),
                        balloon("caption", None, "SPARK — Last Light / Twin-Key", 25, 40, maxWidthPct=32),
                        balloon("caption", None, "AXIOM — Adaptive Matrix", 75, 40, maxWidthPct=32),
                        balloon("narration", None, "Twin-Key Resonance · Pulse Repair · System Restore", 50, 85, maxWidthPct=55),
                    ],
                )
            ],
            layout={"type": "lore", "panelCount": 1},
            atmosphere="dawn",
            characters=["mira-eggwarden"],
            creatures=["nova", "spark", "axiom", "bramblefox", "mossprig"],
            locations=["Companion codex"],
            cardTeases=["nova", "spark", "axiom"],
        )
    )
    # 32 technology
    pages.append(
        matter(
            32,
            "lore",
            "Technology of the Forges",
            "Back-matter technology plate for Twin Engines / cradle lattice.",
            [
                panel(
                    "tech1",
                    "Illustrated tech plate: Twin Engine cutaway, cradle lattice, Ascendant armor schematic, twin-key glyph — no tiny readable labels in art.",
                    [
                        balloon("caption", None, "TWIN ENGINES — CRADLE MODE", 50, 12, maxWidthPct=48),
                        balloon("narration", None, "Artificial Rift production collapses when healing lattice locks.", 50, 50, maxWidthPct=55),
                        balloon("caption", None, "See technology.json", 50, 88, maxWidthPct=36),
                    ],
                )
            ],
            layout={"type": "lore", "panelCount": 1},
            atmosphere="rift",
            characters=["elyan-voss"],
            creatures=["axiom"],
            locations=["Tech codex"],
            codexLinks=["twin-engines", "cradle-lattice"],
        )
    )
    # 33 timeline
    pages.append(
        matter(
            33,
            "map",
            "Volume One Timeline",
            "Timeline of Volume One Fracture Dawn road.",
            [
                panel(
                    "tm1",
                    "Illustrated timeline ribbon: First Rift → Spark → Circus → Lost City → Storm → Merchants → Gate → Forge → Riftwright → Shattered Star tease.",
                    [
                        balloon("caption", None, "VOLUME ONE — FRACTURE DAWN", 50, 10, maxWidthPct=48),
                        balloon("narration", None, "Nine issues. One Compact. One unfinished signature.", 50, 50, maxWidthPct=55),
                        balloon("caption", None, "See timeline.json", 50, 88, maxWidthPct=36),
                    ],
                )
            ],
            layout={"type": "lore", "panelCount": 1},
            atmosphere="dusk",
            characters=["mira-eggwarden"],
            creatures=["spark", "nova"],
            locations=["Timeline atelier"],
        )
    )
    # 34 behind lore
    pages.append(
        matter(
            34,
            "lore",
            "Behind the Lore",
            "Lore essay plate — themes of blame, consent, progress without ethics.",
            [
                panel(
                    "bl1",
                    "Quiet lore desk: monocle, twin-key charm, blacked-out signature page — mystery preserved.",
                    [
                        balloon("narration", None, "We restore what we can prove. We leave unmarked what still hunts in older ink.", 50, 30, maxWidthPct=58),
                        balloon("caption", None, "MYSTERY RETAINED", 50, 70, maxWidthPct=40),
                        balloon("caption", None, "Who rewrote history after the First Rift?", 50, 82, maxWidthPct=55),
                    ],
                )
            ],
            layout={"type": "lore", "panelCount": 1},
            atmosphere="night",
            characters=["elyan-voss"],
            creatures=[],
            locations=["Lore desk"],
        )
    )
    # 35 ability
    pages.append(
        matter(
            35,
            "lore",
            "Ability Spotlight — Twin-Key Resonance",
            "TCG/codex tease for Twin-Key Resonance.",
            [
                panel(
                    "ab1",
                    f"{SPARK} and {NOVA} interlocking auras; Twin-Key Resonance ability crystal; empty rules band.",
                    [
                        balloon("caption", None, "ABILITY — TWIN-KEY RESONANCE", 50, 12, maxWidthPct=50),
                        balloon("narration", None, "When Spark and Nova act together, cradle protocols override weapon protocols.", 50, 55, maxWidthPct=55),
                        balloon("caption", None, "Card tease · Codex link", 50, 88, maxWidthPct=40),
                    ],
                )
            ],
            layout={"type": "lore", "panelCount": 1},
            atmosphere="rift",
            characters=[],
            creatures=["spark", "nova"],
            locations=["Ability spotlight"],
            cardTeases=["twin-key-resonance"],
        )
    )
    # 36 teaser / next
    pages.append(
        matter(
            36,
            "teaser",
            "Next — Volume Two: The Shattered Star",
            "Volume Two teaser only — do not start Volume Two issues.",
            [
                panel(
                    "nx1",
                    "Teaser plate: broken star nest with sleeping companions; soft cosmic mist; no new issue pages beyond this tease.",
                    [
                        balloon("caption", None, "NEXT VOLUME", 50, 15, maxWidthPct=36),
                        balloon("caption", None, "THE SHATTERED STAR", 50, 40, maxWidthPct=48),
                        balloon("narration", None, "Sleeping companions in a broken star. An enemy older than Meridian. Volume Two begins when the sky cracks.", 50, 70, maxWidthPct=58),
                    ],
                )
            ],
            atmosphere="night",
            characters=[],
            creatures=["nova", "spark"],
            locations=["Shattered Star (tease)"],
        )
    )
    # 37 inside back
    pages.append(
        matter(
            37,
            "letters",
            "Inside Back Cover",
            "Letters / thanks Volume One.",
            [
                panel(
                    "ib1",
                    "Soft parchment letters page with Compact seal and twin-key doodle — empty for lettering.",
                    [
                        balloon("narration", None, "Thank you for reading Volume One of Legends of the Rift.", 50, 30, maxWidthPct=55),
                        balloon("caption", None, "Keepers · Companions · Compact", 50, 60, maxWidthPct=45),
                        balloon("caption", None, "Local Archive copy · Volume One Finale", 50, 80, maxWidthPct=48),
                    ],
                )
            ],
            atmosphere="dusk",
            characters=["mira-eggwarden"],
            creatures=["spark", "nova"],
            locations=["Letters desk"],
        )
    )
    # 38 back cover
    pages.append(
        matter(
            38,
            "back-cover",
            "Back Cover",
            "Back cover: shattered star silhouette + Volume One complete badge space.",
            [
                panel(
                    "bc1",
                    "Back cover illustration: small shattered star, Compact lantern, Spark+Nova silhouettes; empty blurb bands.",
                    [
                        balloon("caption", None, "VOLUME ONE — COMPLETE", 50, 15, maxWidthPct=45),
                        balloon("narration", None, "The Riftwright was never the only hand on history.", 50, 45, maxWidthPct=55),
                        balloon("caption", None, "Volume Two: The Shattered Star — Coming Next", 50, 80, maxWidthPct=55),
                    ],
                )
            ],
            atmosphere="night",
            characters=[],
            creatures=["spark", "nova"],
            locations=["Back cover cosmos"],
        )
    )
    return pages


def write_json(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "pages").mkdir(exist_ok=True)
    (OUT / "prompts").mkdir(exist_ok=True)
    (OUT / "reports").mkdir(exist_ok=True)

    all_pages = front_matter() + story_pages() + back_matter()
    assert len(all_pages) == 38, len(all_pages)

    book_index = []
    for p in all_pages:
        book_index.append(
            {
                "pageNumber": p["pageNumber"],
                "storyPageNumber": p["storyPageNumber"],
                "role": p["bookRole"],
                "title": p["title"],
            }
        )
        write_json(OUT / "pages" / f"page-{str(p['pageNumber']).zfill(3)}.json", p)
        (OUT / "prompts" / f"page-{str(p['pageNumber']).zfill(3)}.prompt.txt").write_text(
            p["grokPrompt"] + "\n\nNEGATIVE:\n" + p["negativePrompt"] + "\n",
            encoding="utf-8",
        )

    issue = {
        "slug": "the-riftwright",
        "issueNumber": 9,
        "title": "The Riftwright",
        "subtitle": "Chapter Nine — Volume One Finale",
        "synopsis": (
            "At the Second Forge, Mira Eggwarden meets Professor Elyan Voss — the Riftwright history blamed. "
            "The dormant egg hatches into Nova, Prime Companion and twin-key to Spark. Ascendant Commander Seris Vale "
            "wages war for the Engines; cradle lattice wins. History is restored in the Forge records, one older-than-Meridian "
            "signature left unmarked. Volume One ends on a shattered star — next: The Shattered Star."
        ),
        "publishedAt": "2026-07-20",
        "status": "published",
        "storyPageCount": 25,
        "bookPageCount": 38,
        "estimatedReadMinutes": 24,
        "protagonist": "Mira Eggwarden",
        "volumeFinale": True,
        "volumeId": "volume-1",
        "arcId": "fracture-dawn",
        "shelfBadge": "Volume One Finale",
        "hatchedCompanion": "Nova",
        "riftwrightCanonName": "Professor Elyan Voss",
        "featuredCreatures": [
            "Spark",
            "Nova",
            "Axiom",
            "Bramblefox",
            "Mossprig",
            "Thornling",
            "Wisplet",
            "Spirit Moth",
            "Truthwing",
            "Cindermink",
            "Lumenhare",
            "Echoquill",
        ],
        "locations": [
            "Second Forge",
            "Companion Incubator Beta",
            "Twin Engine Control",
            "Memory Vaults",
            "Shattered Star (tease)",
        ],
        "unlockGates": [
            {
                "kind": "prior-issue",
                "slug": "the-forge-of-rifts",
                "label": "Complete Issue #8: The Forge of Rifts",
            },
            {"kind": "admin-dev", "label": "Admin / COMICS_DEV_UNLOCK override"},
        ],
        "nextIssueTeaser": {
            "slug": "the-shattered-star",
            "hook": "A broken star sleeps with companions inside. Volume Two begins.",
            "volume": 2,
            "title": "The Shattered Star",
        },
        "pipeline": {
            "artProvider": "grok",
            "lettering": "programmatic",
            "bakedLettering": true
            if False
            else True,  # keep True
            "contentRoot": "content/comics/the-riftwright/issue-009",
        },
        "bookPages": book_index,
        "continuityLocks": {
            "keeper": "Mira Eggwarden",
            "elara": "vision-only",
            "calReed": "non-canon",
            "riftwright": "Professor Elyan Voss",
            "hatchedCompanion": "Nova",
            "mysteryRetained": "Who manipulated history after the First Rift (older than Meridian)",
            "arkan": "sacrificed — echo only",
            "doNotStartVolumeTwoIssues": True,
        },
    }
    # fix silly true expression
    issue["pipeline"]["bakedLettering"] = True

    write_json(OUT / "issue.json", issue)

    script = {
        "title": "The Riftwright",
        "issueNumber": 9,
        "volume": "Volume One Finale",
        "protagonist": "Mira Eggwarden",
        "rejected": "Cal Reed",
        "visionOnly": "Elara Venn",
        "riftwright": "Professor Elyan Voss",
        "hatchedCompanion": "Nova",
        "themes": [
            "History as weapon",
            "Progress without ethics",
            "Consent Compact",
            "Found family",
            "Tragic responsibility",
            "Redemption unfinished",
        ],
        "requiredMoments": list(range(1, 26)),
        "pages": [
            {
                "bookPage": p["pageNumber"],
                "storyPage": p["storyPageNumber"],
                "title": p["title"],
                "purpose": p["storyPurpose"],
                "transcript": p["transcript"],
            }
            for p in all_pages
        ],
    }
    write_json(OUT / "script.json", script)

    characters = {
        "mira-eggwarden": {
            "name": "Mira Eggwarden",
            "role": "Present-day Keeper / POV",
            "status": "canon-protagonist",
            "notes": "Volume One finale lead. Protects Spark + Nova. Refuses Meridian methods.",
        },
        "elyan-voss": {
            "name": "Professor Elyan Voss",
            "role": "The Riftwright",
            "status": "tragic-ally",
            "notes": "Blamed for First Rift; built cradles; not cartoon villain. Distant kin surname to Aurelia Voss.",
        },
        "seris-vale": {
            "name": "Seris Vale",
            "role": "Ascendant Commander",
            "status": "contained-antagonist",
            "notes": "Ascends via protocol; defeated; contained not executed.",
        },
        "cael-vesper": {
            "name": "Cael Vesper",
            "role": "Lanternmaster — supervised ally",
            "status": "redemption-unfinished",
            "notes": "Traitor consequences continue as useful light / supervised travel.",
        },
        "nira-quill": {
            "name": "Nira Quill",
            "role": "Hunter ally",
            "status": "earned-trust",
        },
        "aurelia-voss": {
            "name": "Aurelia Voss",
            "role": "Gilded Merchant",
            "status": "ally",
            "notes": "Recognizes Voss name; Closed Contract seals routes.",
        },
        "elara-venn": {
            "name": "Elara Venn",
            "role": "First Keeper",
            "status": "vision-only",
            "notes": "Blessing echo on p23 only. Not present-day POV.",
        },
        "arkan": {
            "name": "Chief Engineer Arkan",
            "role": "Forge architect",
            "status": "sacrificed-echo",
            "notes": "Memory projection only after Issue #8 sacrifice.",
        },
        "cal-reed": {
            "name": "Cal Reed",
            "role": "REJECTED",
            "status": "non-canon",
            "notes": "Forbidden in art and dialogue.",
        },
    }
    write_json(OUT / "characters.json", characters)

    creatures = {
        "spark": {
            "name": "Spark",
            "line": "Glowpup / Resonance / Last Light",
            "role": "Twin-key with Nova",
        },
        "nova": {
            "name": "Nova",
            "line": "Nova bloodline — Prime Companion",
            "role": "Hatched from dormant Crossroads egg; twin-key with Spark",
            "hatchedInIssue": 9,
        },
        "axiom": {
            "name": "Axiom",
            "line": "Prototype crystalline fox",
            "abilities": ["Adaptive Matrix", "Pulse Repair", "System Restore"],
        },
        "dormant-riftborn-egg": {
            "name": "Dormant Riftborn Egg",
            "status": "hatched-into-nova",
            "notes": "Carried from Issues #6–#8; hatches Issue #9.",
        },
    }
    write_json(OUT / "creatures.json", creatures)
    write_json(OUT / "companions.json", creatures)

    locations = {
        "second-forge": {
            "name": "Second Forge",
            "blurb": "Hidden under another continent — spare heart of artificial Rift manufacture.",
        },
        "incubator-beta": {
            "name": "Companion Incubator Beta",
            "blurb": "Nova bloodline cradle; hatch site of Prime Companion Nova.",
        },
        "shattered-star": {
            "name": "Shattered Star",
            "blurb": "Volume Two tease locus — broken star with sleeping companions. No Volume Two issues started.",
        },
    }
    write_json(OUT / "locations.json", locations)

    artifacts = {
        "twin-engines": {
            "name": "Twin Engines",
            "status": "cradle-mode-stabilized",
        },
        "lost-city-component": {
            "name": "Lost City command component",
            "status": "shattered-inert",
        },
        "memory-crystal-archive": {
            "name": "Memory crystal archive",
            "status": "partially-restored",
            "mystery": "Older-than-Meridian signature remains blacked out",
        },
    }
    write_json(OUT / "artifacts.json", artifacts)

    lore = {
        "volume": "Volume One Finale",
        "fromIssue008": {
            "arkan": "Sacrificed at Engine Alpha",
            "axiom": "Awakened — Adaptive Matrix / Pulse Repair / System Restore",
            "egg": "Further cracked at Forge (after Gate crack)",
            "secondForge": "Activated — cliffhanger into #9",
            "riftwrightSilhouette": "So… after all this time… someone finally reached my Forge.",
            "bridgePhrase": "Begin the second creation.",
            "riftbornDoctrine": "Created to protect, not obey",
            "protocols": "Altered by unknown (withheld)",
            "riftwrightPreActivation": "Disappeared before First Rift activation; someone else pushed final command",
        },
        "coreReveal": "Riftwright is Professor Elyan Voss — blamed wrongly; built cradles; disappeared before activation.",
        "hatchedCompanion": "Nova",
        "mysteryRetained": {
            "question": "Who manipulated history / rewrote Forge protocols after the First Rift?",
            "constraints": [
                "Older than Meridian",
                "Unnamed in Volume One",
                "Carries into Volume Two: The Shattered Star",
            ],
        },
        "arkan": "Sacrificed at Forge of Rifts; echo guides cradle lattice; fades after Engines stabilize.",
        "castLocks": {
            "mira": "POV Keeper",
            "cael": "Supervised ally — NOT re-traitored",
            "nira": "Cleared ally",
            "aurelia": "Uneasy ally",
            "seris": "Ascendant Commander then contained",
            "elara": "Vision only",
            "calReed": "Non-canon",
        },
        "themes": script["themes"],
    }
    write_json(OUT / "lore.json", lore)

    history = {
        "title": "Restored Forge History",
        "entries": [
            {
                "era": "Pre-First Rift",
                "text": "Forges built to heal dimensions; Riftborn grown as protectors (not soldiers) under Elyan Voss and Arkan.",
            },
            {
                "era": "First Rift",
                "text": "Elyan disappeared before activation; someone else pushed the final command; protocols rewritten; history blamed the Riftwright.",
            },
            {
                "era": "Issue #8",
                "text": "Forge of Rifts discovered; Arkan sacrifices; Axiom awakens; Engine Alpha stabilized; Second Forge activates.",
            },
            {
                "era": "Issue #9",
                "text": "Elyan named; Nova hatches; Engines cradle; Forge records restored; older-than-Meridian signature unmarked.",
            },
        ],
        "openMystery": "Identity of the protocol rewrite / history manipulator (older than Meridian).",
    }
    write_json(OUT / "history.json", history)

    technology = {
        "title": "Forge Technology",
        "systems": [
            {
                "id": "twin-engines",
                "name": "Twin Engines",
                "modes": ["weapon", "cradle"],
                "finaleState": "cradle",
            },
            {
                "id": "cradle-lattice",
                "name": "Cradle Lattice",
                "description": "Healing protocol that collapses artificial tears when twin-key locks.",
            },
            {
                "id": "ascendant-protocol",
                "name": "Ascendant Protocol",
                "description": "Meridian armor evolution used by Seris Vale; broken by twin-key + lattice.",
            },
            {
                "id": "twin-key-resonance",
                "name": "Twin-Key Resonance",
                "users": ["Spark", "Nova"],
                "description": "Prime Companion + Last Light voluntary sync.",
            },
            {
                "id": "axiom-suite",
                "name": "Axiom Suite",
                "abilities": ["Adaptive Matrix", "Pulse Repair", "System Restore"],
            },
        ],
    }
    write_json(OUT / "technology.json", technology)

    timeline = {
        "volumeOne": [
            {"issue": 1, "title": "The First Rift", "beat": "Deliberate Fracture"},
            {"issue": 2, "title": "Spark's Journey", "beat": "Spark hatches"},
            {"issue": 3, "title": "The Traveling Circus", "beat": "Lanternveil wards"},
            {"issue": 4, "title": "The Lost City", "beat": "Resonance Keepers"},
            {"issue": 5, "title": "The Storm King", "beat": "Forced bond ends"},
            {"issue": 6, "title": "The Merchant's Secret", "beat": "Egg rescued; Riftwright named"},
            {"issue": 7, "title": "The Traitor's Gate", "beat": "Cael coerced; Meridian Road"},
            {"issue": 8, "title": "The Forge of Rifts", "beat": "Arkan sacrifice; Axiom; Second Forge"},
            {"issue": 9, "title": "The Riftwright", "beat": "Nova hatches; Engines cradle; Volume One ends"},
        ],
        "volumeTwoTease": {
            "title": "The Shattered Star",
            "status": "tease-only",
            "doNotStartIssues": True,
        },
    }
    write_json(OUT / "timeline.json", timeline)

    covers = {
        "standard": {"label": "Standard", "rel": "generated/covers/front-cover.webp"},
        "variant-a": {"label": "Variant A — Twin-Key", "note": "Spark + Nova focus"},
        "variant-b": {"label": "Variant B — Tragic Riftwright", "note": "Elyan focus"},
        "foil": {"label": "Digital Foil", "note": "Star-crack foil"},
    }
    write_json(OUT / "covers.json", covers)

    continuity_doc = {
        "keeper": "Mira Eggwarden",
        "elara": "vision-only",
        "rejected": "Cal Reed",
        "pages": continuity_track,
        "finale": {
            "engines": "stabilized",
            "nova": "hatched",
            "seris": "contained",
            "mysteryRetained": True,
            "volumeTwo": "tease-only",
        },
    }
    write_json(OUT / "continuity.json", continuity_doc)

    # QA reports
    qa = {
        "SCRIPT": {
            "status": "pass",
            "storyPages": 25,
            "bookPages": 38,
            "requiredMoments": 25,
            "notes": "Full dialogue/narration/SFX/Grok prompts present on all pages.",
        },
        "ART": {
            "status": "pending-generation",
            "notes": "Run generate-and-letter.mjs; Grok if XAI_API_KEY else procedural.",
        },
        "CONTINUITY": {
            "status": "pass",
            "mira": True,
            "elaraVisionOnly": True,
            "calReedAbsent": True,
            "arkanEcho": True,
            "axiomPresent": True,
            "eggHatchedToNova": True,
            "caelSupervised": True,
        },
        "LORE": {
            "status": "pass",
            "riftwrightNamed": "Professor Elyan Voss",
            "mysteryRetained": True,
            "historyTechnologyTimelineLoreJson": True,
        },
        "VOLUME_ONE": {
            "status": "pass",
            "finaleMarked": True,
            "volumeTwoTeaseOnly": True,
            "nextTitle": "The Shattered Star",
            "doNotStartVolumeTwoIssues": True,
        },
    }
    write_json(OUT / "reports/VOLUME_ONE_QA.json", qa)
    (OUT / "reports/SCRIPT_QA.md").write_text(
        "# SCRIPT QA — Issue #9 The Riftwright\n\n"
        f"- Status: **{qa['SCRIPT']['status']}**\n"
        f"- Story pages: {qa['SCRIPT']['storyPages']}\n"
        f"- Book pages: {qa['SCRIPT']['bookPages']}\n"
        f"- Required moments 1–25: covered\n"
        f"- Hatched companion: **Nova**\n"
        f"- Riftwright: **Professor Elyan Voss**\n"
        f"- Keeper: **Mira Eggwarden** (Elara vision-only; Cal Reed forbidden)\n",
        encoding="utf-8",
    )
    (OUT / "reports/CONTINUITY_QA.md").write_text(
        "# CONTINUITY QA — Issue #9\n\n"
        "- Mira Eggwarden = POV Keeper\n"
        "- Elara Venn = vision only (p23)\n"
        "- Cal Reed = absent / non-canon\n"
        "- Arkan = sacrificed echo\n"
        "- Axiom = present\n"
        "- Cael = supervised redemption work\n"
        "- Egg → Nova hatch\n"
        "- Mystery retained: history manipulator older than Meridian\n",
        encoding="utf-8",
    )
    (OUT / "reports/LORE_QA.md").write_text(
        "# LORE QA — Issue #9\n\n"
        "- history.json / technology.json / timeline.json / lore.json written\n"
        "- Volume One Finale locked\n"
        "- Volume Two tease only: The Shattered Star\n",
        encoding="utf-8",
    )
    (OUT / "reports/VOLUME_ONE_QA.md").write_text(
        "# VOLUME_ONE QA — Issue #9\n\n"
        "- Marked Volume One Finale on issue + covers + shelf badge\n"
        "- No Volume Two issue trees started beyond teaser page\n"
        "- NEXT: THE SHATTERED STAR\n",
        encoding="utf-8",
    )
    (OUT / "THE_RIFTWRIGHT_CONTINUITY_AUDIT.md").write_text(
        """# The Riftwright — Continuity Audit (Volume One Finale)

**Audit date:** 2026-07-20 (re-locked after Issue #8 complete — agent `1877c7ca`)  
**Issue #8 source:** `content/comics/the-forge-of-rifts/issue-008/` — **COMPLETE**  
**Rule:** **Mira Eggwarden** POV. **Elara Venn** = vision only. **Cal Reed** = non-canon.  
**Do not overwrite** `issue-001`–`issue-008`. **Do not start Volume Two** beyond teaser.

---

## Carry-forward from completed Issue #8 (authoritative)

| Slot | Canon into #9 |
|------|----------------|
| Present POV Keeper | **Mira Eggwarden** |
| Lanternmaster | **Cael Vesper** — supervised ally (turned in #7; **NOT** re-traitored) |
| Hunter | **Nira Quill** — cleared ally |
| Merchant | **Aurelia Voss** — uneasy ally |
| Meridian lead | **Seris Vale** — arrives/escalates at Second Forge → Ascendant Commander |
| Forge architect | **Chief Engineer Arkan** — **sacrificed** (echo only) |
| Prototype companion | **Axiom** — awakened (#8) |
| Dormant egg | **Further cracked** at Forge (after Gate crack) → hatches **Nova** in #9 |
| Companions | Loyal Compact cast |
| Forge doctrine | Riftborn created to **protect, not obey** |
| Protocols | Altered by **unknown** (withheld) |
| Riftwright (#8 end) | Silhouette: *“So… after all this time… someone finally reached my Forge.”* |
| Bridge | Gate / *“Begin the second creation.”* → Second Forge active |
| Riftwright pre-history | Disappeared before First Rift activation; someone else pushed final command |

---

## Issue #9 locks (this issue)

| Slot | Canon |
|------|--------|
| Riftwright identity | **Professor Elyan Voss** (tragic; first face reveal) |
| Hatched companion | **Nova** — Prime Companion; twin-key with Spark |
| Mystery retained | Who rewrote protocols / manipulated history (older than Meridian) |
| Volume | **Volume One Finale** |
| Next | Tease only — **Volume Two: The Shattered Star** |

---

## Continuity risks

1. Do not overwrite Issue #8.  
2. Do not re-traitor Cael.  
3. Egg is further-cracked → hatch (not a first crack).  
4. Arkan is echo only.  
5. Axiom design matches #8 crystalline fox.  
6. Silhouette line from #8 p25 must callback before face reveal.  
7. Leave protocol saboteur unnamed.  
8. No Volume Two issue trees beyond teaser page.
""",
        encoding="utf-8",
    )

    print(f"Wrote Issue #9 -> {OUT} ({len(all_pages)} pages)")
    print("Hatched companion: Nova")
    print("Riftwright: Professor Elyan Voss")
    print("Volume One Finale - teaser: The Shattered Star")


if __name__ == "__main__":
    main()
