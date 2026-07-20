#!/usr/bin/env python3
"""
Emit complete The Merchant's Secret Issue #6 script + page JSON + prompts + continuity.
  python scripts/comics/issue-006/emit_issue_006.py

Does NOT touch issue-001–005 trees. Mira Eggwarden canon lock. Cal Reed forbidden.
Elara Venn vision only. Traitor cliffhanger: Cael Vesper.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "content/comics/the-merchants-secret/issue-006"

STYLE = (
    "Original high-energy Western fantasy comic storytelling with dynamic panel composition, "
    "dramatic inked linework, richly painted colors, expressive character acting, and clear cinematic action. "
    "Original Riftwilds IP only. Black lacquer wood and brass first; warm gold filigree, deep red merchant fabric, "
    "teal Rift glass lanterns and crystal accents. NO purple AI-fantasy neon default. "
    "NO Marvel/DC/Pokémon characters or logos."
)
NEG = (
    "readable dialogue text, captions, logos, watermarks, page numbers, UI chrome, Marvel, DC, Pokémon, "
    "manga screentone trademarks, extra limbs, duplicate characters, missing companions, purple neon fantasy "
    "default, photoreal modern clothing, Pikachu lookalike, Cal Reed, Voltkit, companion trafficking glorified"
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
AURELIA = (
    "Aurelia Voss the Gilded Merchant: tall elegant merchant leader, black lacquer coat with warm gold filigree, "
    "half-veil over one eye, amber lantern pin, teal Rift glass jewelry, composed smile hiding hard bargains"
)
LOCKJAW = (
    "Lockjaw Wisp: small feline-lizard companion, black fur with warm gold filigree markings, keyhole-shaped pupils, "
    "floating brass appraisal rings, silent gait, phases through sealed doors when invited by contract"
)
CINDERMINK = (
    "Cindermink: small sleek companion, ember-red fur, soot-black paws, bright gold eyes, chain scars around one hind leg, "
    "smoke-like tail, nervous but defiant"
)
SERIS = (
    "Seris Vale: Meridian commander, sharp features, storm-dark field coat with three-arc sigil, "
    "carries Lost City Rift component crystal and royal trade ledger"
)
NIRA = (
    "Nira Quill: uncertain hunter, lean, weather cloak, quill-knife kit, conflicted eyes, Meridian disloyalty exposed"
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
            f'Riftwilds comic "The Merchant\'s Secret" Issue #6, STORY PAGE {n}/25 — {title}.',
            f"Story purpose: {purpose}",
            f"Layout: {layout}. {len(panels)} panels with clear inked gutters.",
            " ".join(f"Panel {i+1} ({p['id']}): {p['description']}" for i, p in enumerate(panels)),
            f"Characters: {', '.join(chars)}. Creatures: {', '.join(creatures)}.",
            f"Spark design lock: {SPARK}.",
            f"Keeper lock: {MIRA}.",
            f"Merchant lock: {AURELIA}. Lockjaw lock: {LOCKJAW}.",
            f"Environment: {opts.get('environment', 'Gilded Crossroads moving bazaar')}. Time: {opts.get('time', 'night')}. Weather: {opts.get('weather', 'lantern-lit market mist')}.",
            f"Lighting: {opts.get('lighting', 'warm gold lanterns and teal Rift glass glow')}. Continuity: {json.dumps(opts.get('continuity') or {})}",
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
        or "Standard speech + narration; keep tails off faces and Spark's eyes; merchant speech polished/controlled.",
        "generationStatus": "pending",
        "letteringStatus": "pending",
        "approvalStatus": "script-complete",
        "artAlt": opts.get("artAlt") or f"{title} — The Merchant's Secret page {n}",
        "atmosphere": opts.get("atmosphere") or "market",
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
            f'Riftwilds comic book {role} page for The Merchant\'s Secret Issue #6 — {title}.',
            " ".join(p["description"] for p in panels),
            f"Keeper: {MIRA}. Spark: {SPARK}. Merchant: {AURELIA}.",
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
        "atmosphere": opts.get("atmosphere") or "market",
        "letteringInstructions": "Bake titles/credits programmatically.",
        "transcript": build_transcript(panels),
        "a11yTranscript": build_transcript(panels),
    }


story: list[dict] = []

# ── STORY 1–25 ──────────────────────────────────────────────
story.append(
    page_base(
        1,
        "Crossroads Spark",
        "Portal arrival at Gilded Crossroads; Spark hidden under cloak.",
        "splash",
        [
            panel(
                "p1a",
                f"Full-bleed splash: massive teal Rift portal opens onto the Gilded Crossroads — black lacquer stalls, warm gold filigree arches, deep red banners, floating lantern rows; portal engine rings in distance. Foreground: {MIRA}, {CAEL}, companions; {SPARK} hidden under Mira's cloak with only faint cyan glow. Empty caption zones.",
                [
                    balloon("narration", None, "Some markets move. This one moves through doors.", 50, 10, maxWidthPct=60),
                    balloon("caption", None, "GILDED CROSSROADS", 50, 88, maxWidthPct=42),
                    balloon("sfx", None, "portal-HUMMMM", 72, 40),
                ],
            )
        ],
        characters=["mira-eggwarden", "cael-vesper"],
        creatures=["spark", "bramblefox", "mossprig", "thornling", "wisplet", "spirit-moth", "lumenhare", "echoquill"],
        continuity=cont(1, {"location": "Gilded Crossroads portal gate", "spark": {"hidden": True}}),
        requiredMoments=[1, 2],
        pageTurn="Read the posted rules.",
        atmosphere="market",
        lighting="teal portal light on gold lanterns",
        environment="Gilded Crossroads arrival gate",
        codexLinks=["gilded-crossroads"],
    )
)

story.append(
    page_base(
        2,
        "Market Rules",
        "Cael explains market rules; Mira distrusts the commerce of doors.",
        "three-stack",
        [
            panel(
                "p2a",
                f"Posted rules board (black lacquer, gold lettering zones empty): {CAEL} gesturing; {MIRA} reading Compact charter stamp requirements.",
                [
                    balloon("speech", "Cael Vesper", "No weapons drawn. No unregistered spells. No touching sealed merchandise.", 50, 28, "down", maxWidthPct=44),
                    balloon("speech", "Mira Eggwarden", "And companions?", 35, 70, "right"),
                ],
            ),
            panel(
                "p2b",
                "Close on rule line: companion care stalls require Compact or rescue-charter stamps; holding pens forbidden.",
                [
                    balloon("narration", None, "Living cores are not SKUs — on paper.", 50, 25, maxWidthPct=50),
                    balloon("whisper", "Mira Eggwarden", "Paper and cages disagree.", 55, 72),
                ],
            ),
            panel(
                "p2c",
                f"{MIRA} side-eye at {CAEL}; Spark shifting nervously under cloak.",
                [
                    balloon("speech", "Cael Vesper", "I know the customs. Trust the route.", 40, 30, "down"),
                    balloon("thought", "Mira Eggwarden", "Routes are how doors get sold.", 60, 70, maxWidthPct=38),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper"],
        creatures=["spark"],
        continuity=cont(2, {"location": "central exchange rules post", "mira": "distrusts-market", "rules": "market-rules.json"}),
        requiredMoments=[3, 4],
        pageTurn="Enter the bazaar.",
        atmosphere="market",
        codexLinks=["market-rules"],
    )
)

story.append(
    page_base(
        3,
        "Lantern Entry",
        "Spirit Moth reads coded lanterns; Bramblefox catches Meridian scent.",
        "two-stack",
        [
            panel(
                "p3a",
                "Team passing under Spirit Moth lantern canopy — coded flicker patterns mapping safe lanes; Lumenhare blending with circus light cover.",
                [
                    balloon("creature", "Spirit Moth", "*pattern-blink*", 40, 25, "down"),
                    balloon("speech", "Cael Vesper", "Follow the moth. It reads merchant codes.", 60, 70, "up"),
                ],
            ),
            panel(
                "p3b",
                f"Bramblefox nose low, Forest Bond vines twitching toward a shadowed stall; Meridian three-arc sigil residue on crate seal.",
                [
                    balloon("creature", "Bramblefox", "*scent-alert*", 45, 30, "down"),
                    balloon("speech", "Mira Eggwarden", "Meridian. Already inside.", 55, 72, "up", maxWidthPct=36),
                    balloon("sfx", None, "crate-scrape", 70, 55),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper"],
        creatures=["spark", "bramblefox", "spirit-moth", "lumenhare"],
        continuity=cont(3, {"location": "lantern entry lane", "meridian": "scent-detected"}),
        requiredMoments=[5, 6],
        pageTurn="See the wonder and the price.",
        atmosphere="market",
    )
)

story.append(
    page_base(
        4,
        "Wonder and Danger",
        "Market montage — exotic wonders alongside predatory trade.",
        "montage",
        [
            panel(
                "p4a",
                "Wide montage strip: registered Rift keys, card plates, potion rows, teal glass curios — citizens marveling.",
                [
                    balloon("narration", None, "Legal trade glittered like a promise.", 50, 15, maxWidthPct=55),
                    balloon("whisper", "Shopper", "Credits for cosmetics — not souls.", 30, 55, "right"),
                ],
            ),
            panel(
                "p4b",
                "Counter montage: sealed crates with muffled movement; buyers whispering; auction placards with empty price zones.",
                [
                    balloon("narration", None, "Predators wore the same gold.", 50, 20, maxWidthPct=50),
                    balloon("sfx", None, "muted-chirp", 65, 60),
                ],
            ),
            panel(
                "p4c",
                f"{SPARK} peeking from cloak, distressed at resonance echo from sealed merchandise.",
                [
                    balloon("creature", "Spark", "*distress-chirp*", 45, 30, "down"),
                    balloon("speech", "Mira Eggwarden", "Not here. Not yet.", 60, 72, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden"],
        creatures=["spark"],
        continuity=cont(4, {"location": "central exchange floor", "tone": "wonder-and-danger"}),
        requiredMoments=[7],
        pageTurn="Find the rescue shelter.",
        atmosphere="market",
    )
)

story.append(
    page_base(
        5,
        "Shelter and Cry",
        "Legitimate rescue shelter; distant captive cry interrupts.",
        "three-stack",
        [
            panel(
                "p5a",
                "Compact-stamped rescue shelter stall: healers treating a freed companion, rescue charter visible; Mossprig helping calm patient.",
                [
                    balloon("speech", "Shelter Keeper", "We return freedom. That is the charter.", 50, 28, "down", maxWidthPct=42),
                    balloon("creature", "Mossprig", "*gentle-bulwark*", 40, 65, "up"),
                ],
            ),
            panel(
                "p5b",
                f"{MIRA} nodding approval — legal care vs trafficking distinction.",
                [
                    balloon("speech", "Mira Eggwarden", "This is what trade should look like.", 50, 35, "down"),
                    balloon("narration", None, "Rescue is not ownership.", 50, 75, maxWidthPct=45),
                ],
            ),
            panel(
                "p5c",
                "Distant muffled cry from below-market tunnels; Spark's ears perk; Echoquill recording.",
                [
                    balloon("sfx", None, "distant-CRY", 70, 30),
                    balloon("creature", "Echoquill", "*archive-lock*", 35, 55, "right"),
                    balloon("speech", "Nira Quill", "That wasn't a potion spill.", 55, 78, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "nira-quill"],
        creatures=["spark", "mossprig", "echoquill"],
        continuity=cont(5, {"location": "rescue shelter lane", "ethics": "rescue-vs-trafficking", "cry": "heard"}),
        requiredMoments=[8, 9],
        pageTurn="Meet the merchant.",
        atmosphere="market",
    )
)

story.append(
    page_base(
        6,
        "Resonance Less Cooperative",
        "Aurelia Voss formalized; names Spark; Cael debt hint.",
        "three-stack",
        [
            panel(
                "p6a",
                f"Private receiving hall: {AURELIA} lowering half-veil — same amber lanterns as Issue #5 hooded merchant; {SERIS}'s ledger residue on desk.",
                [
                    balloon("speech", "Aurelia Voss", "You brought me a map.", 35, 28, "down"),
                    balloon("speech", "Seris Vale", "No. I brought you every door.", 65, 45, "left", maxWidthPct=36),
                ],
            ),
            panel(
                "p6b",
                f"Present: {AURELIA} studying {MIRA}; Spark's cloak slipping — cyan flash; {LOCKJAW} floating appraisal rings circling.",
                [
                    balloon("speech", "Aurelia Voss", "Resonance is less cooperative when it chooses its Keeper.", 50, 30, "down", maxWidthPct=44),
                    balloon("creature", "Lockjaw Wisp", "*appraise-hum*", 65, 60, "left"),
                ],
            ),
            panel(
                "p6c",
                f"{CAEL} stiff at mention of old contract; hidden merchant token glint under lantern clasp.",
                [
                    balloon("whisper", "Aurelia Voss", "Lanternmaster. You still owe a door.", 40, 30, "down", maxWidthPct=38),
                    balloon("speech", "Cael Vesper", "…I pay my debts when I understand the price.", 60, 72, "up", maxWidthPct=40),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper", "aurelia-voss", "seris-vale"],
        creatures=["spark", "lockjaw-wisp"],
        continuity=cont(6, {"location": "merchant receiving hall", "aurelia": "formalized", "cael": "debt-hint", "dialogueLock": "map-every-door"}),
        requiredMoments=[10, 11, 12],
        pageTurn="A private bargain.",
        atmosphere="market",
        artifacts=["royal-trade-ledger"],
        cardTeases=["lockjaw-wisp"],
    )
)

story.append(
    page_base(
        7,
        "Key for a Buyer",
        "Private deal — Aurelia offers key to illegal buyer location.",
        "two-stack",
        [
            panel(
                "p7a",
                f"{AURELIA} sliding teal Rift glass key across lacquer table; {LOCKJAW} verifying seal.",
                [
                    balloon("speech", "Aurelia Voss", "I will give you the buyer's location. Not the buyer.", 50, 28, "down", maxWidthPct=44),
                    balloon("speech", "Mira Eggwarden", "And your price?", 35, 65, "right"),
                ],
            ),
            panel(
                "p7b",
                "Mira and Nira exchanging glances; Cael watching the key like a confession.",
                [
                    balloon("speech", "Aurelia Voss", "One favor. Unspecified. Compact-word.", 55, 35, "down", maxWidthPct=40),
                    balloon("whisper", "Nira Quill", "Unspecified favors built this market.", 50, 75),
                ],
            ),
        ],
        characters=["mira-eggwarden", "cael-vesper", "aurelia-voss", "nira-quill"],
        creatures=["lockjaw-wisp"],
        continuity=cont(7, {"location": "private deal chamber", "deal": "key-for-favor"}),
        requiredMoments=[13],
        pageTurn="Debate profit and preservation.",
        atmosphere="market",
        artifacts=["merchant-key"],
    )
)

story.append(
    page_base(
        8,
        "Profit vs Preservation",
        "Mira and Aurelia debate commerce of access vs living cores.",
        "three-stack",
        [
            panel(
                "p8a",
                f"{MIRA} standing over market map of route seals — Tempestria, Aureth, Circus pins.",
                [
                    balloon("speech", "Mira Eggwarden", "You sell routes. Meridian sells cages. Where do you stand?", 50, 30, "down", maxWidthPct=44),
                ],
            ),
            panel(
                "p8b",
                f"{AURELIA} calm, gold filigree catching teal light.",
                [
                    balloon(
                        "speech",
                        "Aurelia Voss",
                        "I preserve what profit would erase. Sometimes preservation looks like profit.",
                        50,
                        35,
                        "down",
                        maxWidthPct=44,
                    )
                ],
            ),
            panel(
                "p8c",
                "Spark pressed to Mira's side; distant auction drum beat beginning.",
                [
                    balloon("speech", "Mira Eggwarden", "Living cores are not SKUs. Not Spark. Not any egg.", 45, 30, "down", maxWidthPct=42),
                    balloon("sfx", None, "auction-DRUM", 70, 65),
                ],
            ),
        ],
        characters=["mira-eggwarden", "aurelia-voss"],
        creatures=["spark"],
        continuity=cont(8, {"location": "merchant strategy room", "debate": "profit-vs-preservation"}),
        requiredMoments=[14, 15],
        pageTurn="Follow the cages.",
        atmosphere="market",
    )
)

story.append(
    page_base(
        9,
        "Illegal Cages",
        "Thornling finds illegal holding pens; Cindermink glimpsed.",
        "three-stack",
        [
            panel(
                "p9a",
                "Thornling plugging into a rusted lock conduit; sparks revealing hidden door behind spice stall.",
                [
                    balloon("creature", "Thornling", "*lock-buzz*", 40, 28, "down"),
                    balloon("sfx", None, "hidden-CLICK", 65, 55),
                ],
            ),
            panel(
                "p9b",
                f"Illegal holding pens — black iron cages, Compact violation stamps scratched out; {CINDERMINK} visible in one pen, chain scar on hind leg.",
                [
                    balloon("narration", None, "Rescue charters don't use pens.", 50, 12, maxWidthPct=50),
                    balloon("creature", "Cindermink", "*defiant-hiss*", 55, 60, "up"),
                ],
            ),
            panel(
                "p9c",
                f"{MIRA} fury contained; Bramblefox growling at Meridian scent on cage locks.",
                [
                    balloon("speech", "Mira Eggwarden", "This is trafficking. Not trade.", 50, 35, "down"),
                    balloon("speech", "Nira Quill", "Meridian buyers. I know the marks.", 60, 72, "up", maxWidthPct=38),
                ],
            ),
        ],
        characters=["mira-eggwarden", "nira-quill"],
        creatures=["thornling", "cindermink", "bramblefox"],
        continuity=cont(9, {"location": "illegal holding pens", "trafficking": "confirmed", "cindermink": "found"}),
        requiredMoments=[16, 17],
        pageTurn="Reveal the full pens.",
        atmosphere="market",
        cardTeases=["cindermink"],
    )
)

story.append(
    page_base(
        10,
        "False Walls",
        "Mossprig senses captives; Wisplet reveals hidden pen walls.",
        "two-stack",
        [
            panel(
                "p10a",
                "Mossprig Living Bulwark extending toward captives through bars — sensing life signs; multiple species cramped.",
                [
                    balloon("creature", "Mossprig", "*sense-captives*", 45, 30, "down"),
                    balloon("speech", "Mira Eggwarden", "How many?", 65, 70, "up"),
                ],
            ),
            panel(
                "p10b",
                "Wisplet phasing through false wall — revealing doubled pen chamber and auction prep corridor.",
                [
                    balloon("creature", "Wisplet", "*phase-reveal*", 50, 35, "down"),
                    balloon("narration", None, "Walls lied. The market lied with them.", 50, 78, maxWidthPct=55),
                    balloon("sfx", None, "phase-HUM", 70, 50),
                ],
            ),
        ],
        characters=["mira-eggwarden"],
        creatures=["mossprig", "wisplet", "cindermink"],
        continuity=cont(10, {"location": "hidden pen complex", "captives": "many"}),
        requiredMoments=[18],
        pageTurn="Find the files.",
        atmosphere="market",
    )
)

story.append(
    page_base(
        11,
        "Recruitment File",
        "Nira finds partial childhood Meridian recruitment file.",
        "three-stack",
        [
            panel(
                "p11a",
                f"Underground archive antechamber: {ECHO} projecting genealogy plates; Nira frozen before a partial file.",
                [
                    balloon("creature", "Echoquill", "*record-trill*", 40, 25, "down"),
                    balloon("speech", "Nira Quill", "That's… my recruitment age.", 55, 65, "up", maxWidthPct=36),
                ],
            ),
            panel(
                "p11b",
                "File fragment: Meridian youth intake — Subject routing, companion bond training redacted.",
                [
                    balloon("narration", None, "They recruit children the way markets recruit hunger.", 50, 20, maxWidthPct=55),
                    balloon("whisper", "Nira Quill", "I wasn't saved. I was sorted.", 50, 72),
                ],
            ),
            panel(
                "p11c",
                f"{MIRA} hand on Nira's shoulder — trust incomplete but present.",
                [
                    balloon("speech", "Mira Eggwarden", "You cut their leash at Tempestria. That matters.", 50, 35, "down", maxWidthPct=42),
                    balloon("sfx", None, "auction-GONG", 70, 55),
                ],
            ),
        ],
        characters=["mira-eggwarden", "nira-quill"],
        creatures=["echoquill"],
        continuity=cont(11, {"location": "underground archive", "nira": "recruitment-file-partial"}),
        requiredMoments=[19, 20],
        pageTurn="The egg auction.",
        atmosphere="market",
    )
)

story.append(
    page_base(
        12,
        "Egg Auction Announced",
        "Dormant Riftborn egg auction announced; Spark violent reaction.",
        "splash-inset",
        [
            panel(
                "p12a",
                "Auction plaza broadcast: ornate placard silhouette of dormant Riftborn egg in restraint field; crowd gathering; Meridian buyers in storm-dark coats.",
                [
                    balloon("caption", None, "LOT ONE — DORMANT RIFBORN EGG", 50, 12, maxWidthPct=50),
                    balloon("speech", "Auctioneer", "Unhatched. Unbonded. Unregistered.", 50, 35, "down", maxWidthPct=40),
                    balloon("creature", "Spark", "*violent-flare!*", 35, 55, "right"),
                    balloon("shout", "Mira Eggwarden", "Spark—!", 65, 70, "left"),
                ],
            )
        ],
        characters=["mira-eggwarden", "seris-vale"],
        creatures=["spark"],
        continuity=cont(12, {"location": "auction plaza", "egg": "announced", "spark": {"reaction": "violent"}}),
        requiredMoments=[21, 22],
        pageTurn="Into the archive.",
        atmosphere="market",
        artifacts=["dormant-riftborn-egg"],
        cardTeases=["dormant-riftborn-egg"],
    )
)

story.append(
    page_base(
        13,
        "Underground Archive",
        "Team reaches Aurelia's underground archive beneath the bazaar.",
        "two-wide",
        [
            panel(
                "p13a",
                f"{LOCKJAW} opening sealed archive door under Aurelia's contract; rows of teal glass genealogy records and route seals.",
                [
                    balloon("creature", "Lockjaw Wisp", "*keyshift*", 45, 28, "down"),
                    balloon("speech", "Aurelia Voss", "Meridian thinks this auction is theirs. It is mine.", 55, 65, "up", maxWidthPct=40),
                ],
            ),
            panel(
                "p13b",
                "Mira reading First Rift architect references — Riftwright title redacted; Seris's ledger chained to vault.",
                [
                    balloon("narration", None, "Every door had a architect. The name was sealed.", 50, 15, maxWidthPct=55),
                    balloon("sfx", None, "vault-CHAIN", 70, 55),
                ],
            ),
        ],
        characters=["mira-eggwarden", "aurelia-voss"],
        creatures=["lockjaw-wisp", "echoquill"],
        continuity=cont(13, {"location": "underground archive", "riftwright": "title-teased"}),
        requiredMoments=[23],
        pageTurn="The trap springs.",
        atmosphere="market",
        codexLinks=["riftwright"],
    )
)

story.append(
    page_base(
        14,
        "Auction Trap",
        "Private auction revealed as trap; Meridian buyers unmasked.",
        "three-stack",
        [
            panel(
                "p14a",
                "Private auction chamber: dormant egg on restraint pedestal — teal field; Meridian buyers raising paddles.",
                [
                    balloon("speech", "Seris Vale", "Lot one opens the Resonance line. Bid accordingly.", 50, 28, "down", maxWidthPct=44),
                ],
            ),
            panel(
                "p14b",
                "Trap reveal: restraint field doubles as capture net for Spark if revealed; Wisplet showing shimmer walls.",
                [
                    balloon("speech", "Mira Eggwarden", "The egg is bait.", 40, 30, "down"),
                    balloon("creature", "Wisplet", "*barrier-flare*", 65, 55, "left"),
                ],
            ),
            panel(
                "p14c",
                "Meridian command buyers unmasked — three-arc sigils; Nira recognizing handlers from her file.",
                [
                    balloon("speech", "Nira Quill", "Handlers. Not collectors.", 50, 35, "down"),
                    balloon("shout", "Seris Vale", "Seize Subject One if it shows.", 65, 72, "left", maxWidthPct=36),
                ],
            ),
        ],
        characters=["mira-eggwarden", "seris-vale", "nira-quill"],
        creatures=["wisplet", "spark"],
        continuity=cont(14, {"location": "private auction trap", "buyers": "meridian-unmasked"}),
        requiredMoments=[24, 25],
        pageTurn="Network beyond control.",
        atmosphere="market",
    )
)

story.append(
    page_base(
        15,
        "Beyond Control",
        "Seris's network exceeds even Aurelia's control.",
        "three-stack",
        [
            panel(
                "p15a",
                f"{SERIS} connecting Lost City Rift component to auction console — ledger pages flying open as door maps.",
                [
                    balloon("speech", "Seris Vale", "Your network, Merchant. My keys.", 50, 30, "down", maxWidthPct=40),
                    balloon("sfx", None, "ledger-FLIP", 70, 55),
                ],
            ),
            panel(
                "p15b",
                f"{AURELIA} rare anger; routes on wall shifting without her consent.",
                [
                    balloon("speech", "Aurelia Voss", "Those doors are mine to close.", 45, 30, "down"),
                    balloon("speech", "Seris Vale", "Not anymore.", 65, 65, "left"),
                ],
            ),
            panel(
                "p15c",
                "Portal engine tremor; bazaar lanterns flickering red.",
                [
                    balloon("narration", None, "When a network outgrows its merchant, the market breaks.", 50, 20, maxWidthPct=55),
                    balloon("sfx", None, "engine-WHINE", 55, 70),
                ],
            ),
        ],
        characters=["aurelia-voss", "seris-vale"],
        creatures=["lockjaw-wisp"],
        continuity=cont(15, {"location": "auction control room", "seris": "beyond-aurelia-control"}),
        requiredMoments=[25, 26],
        pageTurn="The private auction begins.",
        atmosphere="market",
        artifacts=["royal-trade-ledger", "lost-city-rift-component"],
    )
)

story.append(
    page_base(
        16,
        "Private Auction",
        "Seris presides; egg restrained on pedestal.",
        "splash-inset",
        [
            panel(
                "p16a",
                f"Cinematic private auction: {SERIS} at podium; dormant Riftborn egg in teal restraint field on black lacquer pedestal; Meridian elites seated; {MIRA} and team hidden in gallery shadows; empty bid zones.",
                [
                    balloon("speech", "Seris Vale", "Doors are currency. This egg is a door.", 50, 25, "down", maxWidthPct=44),
                    balloon("caption", None, "PRIVATE CIRCLE — MERIDIAN ONLY", 50, 88, maxWidthPct=48),
                    balloon("sfx", None, "restraint-HUM", 72, 50),
                ],
            )
        ],
        characters=["mira-eggwarden", "seris-vale", "aurelia-voss"],
        creatures=["spark"],
        continuity=cont(16, {"location": "private auction floor", "egg": "restrained"}),
        requiredMoments=[26, 27],
        pageTurn="Bidding begins.",
        atmosphere="market",
        artifacts=["dormant-riftborn-egg"],
    )
)

story.append(
    page_base(
        17,
        "Bidding and Cry",
        "Frenzied bidding; captive cry from pens below.",
        "four-grid",
        [
            panel(
                "p17a",
                "Paddle frenzy — gold numbers flashing in empty zones; Seris smiling.",
                [balloon("speech", "Auctioneer", "Bid for the unhatched door!", 50, 30, "down")],
            ),
            panel(
                "p17b",
                "Cut below: Cindermink and captives crying out as guards tighten pens.",
                [
                    balloon("creature", "Cindermink", "*chain-rattle*", 45, 30, "down"),
                    balloon("sfx", None, "captive-CRY", 65, 55),
                ],
            ),
            panel(
                "p17c",
                f"{MIRA} breaking cover stance; Spark trembling.",
                [
                    balloon("speech", "Mira Eggwarden", "They bid on one cage while others scream.", 50, 35, "down", maxWidthPct=42),
                ],
            ),
            panel(
                "p17d",
                "Nira cutting a restraint sigil on gallery rail — small sabotage.",
                [
                    balloon("speech", "Nira Quill", "Then we break both.", 55, 70, "up"),
                    balloon("sfx", None, "sigil-SNAP", 70, 40),
                ],
            ),
        ],
        characters=["mira-eggwarden", "nira-quill", "seris-vale"],
        creatures=["spark", "cindermink"],
        continuity=cont(17, {"location": "auction floor / pens below", "bidding": "active", "cry": "captives"}),
        requiredMoments=[27, 28],
        pageTurn="Spark cannot hide.",
        atmosphere="market",
    )
)

story.append(
    page_base(
        18,
        "Spark Revealed",
        "Spark erupts from hiding — Resonance reveal.",
        "splash",
        [
            panel(
                "p18a",
                f"Dynamic splash: {MIRA}'s cloak thrown open; {SPARK} erupting in cyan-gold Resonance flare; restraint field cracking toward egg; Meridian buyers rising; Seris pointing; empty SFX zones.",
                [
                    balloon("sfx", None, "RESONANCE!", 50, 14),
                    balloon("shout", "Seris Vale", "Subject One — seize!", 70, 40, "left"),
                    balloon("creature", "Spark", "*protective-roar!*", 35, 50, "right"),
                    balloon("speech", "Mira Eggwarden", "He chooses. You don't.", 50, 82, "up", maxWidthPct=40),
                ],
            )
        ],
        characters=["mira-eggwarden", "seris-vale"],
        creatures=["spark"],
        continuity=cont(18, {"location": "auction floor", "spark": {"revealed": True}}),
        requiredMoments=[28, 29],
        pageTurn="Battle for the captives.",
        atmosphere="market",
    )
)

story.append(
    page_base(
        19,
        "Break the Auction",
        "Battle splash — rescue captives and egg.",
        "splash",
        [
            panel(
                "p19a",
                f"Action splash: Bramblefox attacking control devices; Mossprig shielding civilians; Thornling surging conductors; Cindermink mid-leap; Spark and Mira reaching dormant egg; Meridian guards falling; gold and teal glass shattering; empty balloon corners.",
                [
                    balloon("sfx", None, "AUCTION-BREAK", 50, 12),
                    balloon("creature", "Bramblefox", "*device-snap*", 30, 45, "right"),
                    balloon("creature", "Mossprig", "*bulwark!*", 55, 55, "down"),
                    balloon("shout", "Mira Eggwarden", "Companions first — always!", 65, 78, "left", maxWidthPct=38),
                ],
            )
        ],
        characters=["mira-eggwarden", "nira-quill"],
        creatures=["spark", "bramblefox", "mossprig", "thornling", "cindermink"],
        continuity=cont(19, {"location": "auction battle", "rescue": "in-progress"}),
        requiredMoments=[29, 30],
        pageTurn="Ledger opens doors.",
        atmosphere="market",
        cardTeases=["break-the-chain"],
    )
)

story.append(
    page_base(
        20,
        "Ledger Doors",
        "Seris weaponizes ledger; Nira destroys one route.",
        "three-stack",
        [
            panel(
                "p20a",
                f"{SERIS} opening royal trade ledger — teal door maps projecting across auction hall.",
                [
                    balloon("speech", "Seris Vale", "Every door Tempestria sealed — now mine.", 50, 28, "down", maxWidthPct=42),
                    balloon("sfx", None, "door-MAP", 70, 55),
                ],
            ),
            panel(
                "p20b",
                f"{NIRA} slashing one route sigil with quill-knife — map segment burning out.",
                [
                    balloon("speech", "Nira Quill", "Not all of them.", 45, 30, "down"),
                    balloon("sfx", None, "route-BURN", 65, 60),
                ],
            ),
            panel(
                "p20c",
                "Seris staggered; Aurelia coldly noting lost leverage.",
                [
                    balloon("speech", "Aurelia Voss", "She closed a door I wanted shut slower.", 55, 35, "down", maxWidthPct=42),
                    balloon("speech", "Mira Eggwarden", "Close the cages next.", 50, 72, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "seris-vale", "nira-quill", "aurelia-voss"],
        creatures=["spark"],
        continuity=cont(20, {"location": "auction hall", "ledger": "weaponized", "nira": "destroyed-one-route"}),
        requiredMoments=[30, 31],
        pageTurn="Seal the vault.",
        atmosphere="market",
        artifacts=["royal-trade-ledger"],
    )
)

story.append(
    page_base(
        21,
        "Break the Chain",
        "Cindermink Break the Chain; Lockjaw seals vault.",
        "three-stack",
        [
            panel(
                "p21a",
                f"{CINDERMINK} unleashing Break the Chain — ember flare severing pen restraints; captives spilling free.",
                [
                    balloon("sfx", None, "BREAK THE CHAIN", 50, 18),
                    balloon("creature", "Cindermink", "*ember-cut!*", 45, 45, "down"),
                ],
            ),
            panel(
                "p21b",
                f"{LOCKJAW} executing Closed Contract — sealing auction vault and Meridian control console.",
                [
                    balloon("creature", "Lockjaw Wisp", "*closed-contract*", 50, 30, "down"),
                    balloon("speech", "Aurelia Voss", "Vault sealed. Debts collected.", 60, 70, "up", maxWidthPct=38),
                ],
            ),
            panel(
                "p21c",
                "Mira gathering freed companions; Spark guarding dormant egg.",
                [
                    balloon("speech", "Mira Eggwarden", "Freedom is not a receipt.", 50, 35, "down"),
                    balloon("creature", "Spark", "*guard-hum*", 55, 72, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "aurelia-voss"],
        creatures=["cindermink", "lockjaw-wisp", "spark"],
        continuity=cont(21, {"location": "vault / pens", "cindermink": "break-the-chain", "lockjaw": "vault-sealed"}),
        requiredMoments=[31, 32],
        pageTurn="Engine overload.",
        atmosphere="market",
        cardTeases=["cindermink", "lockjaw-wisp"],
    )
)

story.append(
    page_base(
        22,
        "Bazaar Shifts",
        "Portal engine overload; entire bazaar relocates.",
        "splash-inset",
        [
            panel(
                "p22a",
                f"Portal engine core overloading — teal rings spinning; entire Gilded Crossroads lurching along old Rift route; stalls sliding; lanterns streaming; {SERIS} thrown; team braced.",
                [
                    balloon("narration", None, "When the engine breaks schedule, the market breaks geography.", 50, 10, maxWidthPct=60),
                    balloon("sfx", None, "SHIFT-ROOOAR", 55, 45),
                    balloon("shout", "Seris Vale", "You moved my exit!", 70, 70, "left"),
                ],
            )
        ],
        characters=["mira-eggwarden", "seris-vale", "aurelia-voss"],
        creatures=["spark"],
        continuity=cont(22, {"location": "portal engine core", "bazaar": "shifting"}),
        requiredMoments=[32, 33],
        pageTurn="Stabilize or lose everything.",
        atmosphere="rift",
        artifacts=["portal-engine"],
    )
)

story.append(
    page_base(
        23,
        "Stabilize the Egg",
        "Action splash — stabilize portal, save egg; Aurelia cuts Meridian routes.",
        "splash",
        [
            panel(
                "p23a",
                f"Action splash: voluntary circle — Spark resonance, Mossprig dome, Thornling conductor, Wisplet phase net stabilizing portal engine; Mira cradling dormant egg; Aurelia slicing Meridian route chains with teal glass blade; Seris fleeing into shifting corridor; empty SFX zones.",
                [
                    balloon("sfx", None, "STABILIZE", 50, 14),
                    balloon("speech", "Mira Eggwarden", "Invite — don't own!", 40, 50, "right"),
                    balloon("speech", "Aurelia Voss", "Meridian routes — closed.", 70, 40, "left", maxWidthPct=36),
                    balloon("creature", "Spark", "*steady-hum*", 55, 75, "up"),
                ],
            )
        ],
        characters=["mira-eggwarden", "aurelia-voss", "seris-vale"],
        creatures=["spark", "mossprig", "thornling", "wisplet"],
        continuity=cont(23, {"location": "shifting bazaar / engine", "egg": "saved", "aurelia": "cut-meridian-routes"}),
        requiredMoments=[33, 34],
        pageTurn="The Riftwright name.",
        atmosphere="rift",
    )
)

story.append(
    page_base(
        24,
        "The Riftwright",
        "Riftwright title revealed; Aurelia withholds full identity.",
        "three-stack",
        [
            panel(
                "p24a",
                "Archive vault opening post-battle: First Rift architect plate — title THE RIFTRIGHT glowing; face and name redacted with teal seal.",
                [
                    balloon("caption", None, "THE RIFTRIGHT", 50, 12, maxWidthPct=40),
                    balloon("narration", None, "The architect of the First Rift did not act alone.", 50, 75, maxWidthPct=55),
                ],
            ),
            panel(
                "p24b",
                f"{MIRA} reaching for unsealed name; {AURELIA} hand stopping her.",
                [
                    balloon("speech", "Mira Eggwarden", "Who were they?", 40, 30, "down"),
                    balloon("speech", "Aurelia Voss", "A title first. A name when you've paid more doors.", 60, 65, "up", maxWidthPct=42),
                ],
            ),
            panel(
                "p24c",
                "Dormant egg safe in Compact wrap; Cindermink free at Mira's feet; Cael watching from shadow.",
                [
                    balloon("speech", "Mira Eggwarden", "This egg is not property. Neither is Cindermink.", 50, 35, "down", maxWidthPct=44),
                    balloon("creature", "Cindermink", "*grateful-chuff*", 55, 72, "up"),
                ],
            ),
        ],
        characters=["mira-eggwarden", "aurelia-voss", "cael-vesper"],
        creatures=["spark", "cindermink"],
        continuity=cont(24, {"location": "archive vault", "riftwright": "title-revealed-withheld"}),
        requiredMoments=[34, 35],
        pageTurn="A message in the dark.",
        atmosphere="market",
        codexLinks=["riftwright"],
    )
)

story.append(
    page_base(
        25,
        "The Traitor's Gate",
        "Cliffhanger: Cael Vesper receives merchant token transmission.",
        "splash",
        [
            panel(
                "p25a",
                f"Dark service corridor beneath shifting bazaar: {CAEL} alone, half-mask lowered, merchant token in palm glowing warm gold; teal message sigil unfolding; Mira and Spark distant through arch — unaware. Empty zones for NEXT title.",
                [
                    balloon("whisper", "Merchant Signal", "The Keeper has the egg. Proceed to the next gate.", 50, 30, "down", maxWidthPct=46),
                    balloon("thought", "Cael Vesper", "…the price.", 35, 55, "right"),
                    balloon("caption", None, "NEXT: THE TRAITOR'S GATE", 50, 88, maxWidthPct=55),
                    balloon("sfx", None, "token-PULSE", 70, 65),
                ],
            )
        ],
        characters=["cael-vesper"],
        creatures=["spark"],
        continuity=cont(
            25,
            {
                "location": "service corridor",
                "teaser": "the-traitors-gate",
                "traitor": "cael-vesper",
                "transmission": "keeper-has-egg",
            },
        ),
        requiredMoments=[35, 36],
        pageTurn="End Issue #6.",
        atmosphere="night",
        artifacts=["merchant-token"],
    )
)

assert len(story) == 25

# ── BOOK MATTER ─────────────────────────────────────────────
book: list[dict] = []

book.append(
    matter_page(
        1,
        "front-cover",
        "The Merchant's Secret — Cover",
        [
            panel(
                "cover",
                f"Premium cover plate: {AURELIA} and {LOCKJAW} before Gilded Crossroads portal arches; {MIRA} and hidden {SPARK} in foreground; black lacquer, warm gold, deep red, teal Rift glass; empty title zones.",
                [
                    balloon("caption", None, "LEGENDS OF THE RIFT", 50, 10),
                    balloon("caption", None, "THE MERCHANT'S SECRET", 50, 82),
                    balloon("caption", None, "ISSUE #6", 50, 92),
                ],
            )
        ],
        characters=["mira-eggwarden", "aurelia-voss"],
        creatures=["spark", "lockjaw-wisp"],
        atmosphere="market",
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
                "Quiet inside-cover: merchant route map parchment, royal trade ledger silhouette, Tempestria-to-Crossroads route; warm gold glow; empty invitation zone.",
                [
                    balloon("narration", None, "Previously: Tempestria released its wall. Seris stole every door. The market answered.", 50, 40, maxWidthPct=62),
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
                "Workshop / lore-desk with lacquer sample, gold filigree tools, companion sketches of Lockjaw Wisp and Cindermink — no readable credit text in art.",
                [
                    balloon("caption", None, "THE MERCHANT'S SECRET", 50, 14),
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
        "Chapter Six — The Merchant's Secret",
        [
            panel(
                "title",
                f"Title spread energy without painted lettering: {MIRA}, Spark hidden, companions entering Gilded Crossroads portal; empty center for title bake.",
                [
                    balloon("caption", None, "CHAPTER SIX", 50, 20),
                    balloon("caption", None, "THE MERCHANT'S SECRET", 50, 35),
                    balloon("narration", None, "Every door has a price. Some prices wear familiar faces.", 50, 75, maxWidthPct=55),
                ],
            )
        ],
        characters=["mira-eggwarden"],
        creatures=["spark"],
        atmosphere="market",
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
        "Next Issue — The Traitor's Gate",
        [
            panel(
                "teaser",
                f"Teaser plate: merchant token glow, {CAEL} half-mask silhouette, teal gate sigil; empty title zone.",
                [
                    balloon("caption", None, "NEXT ISSUE", 50, 18),
                    balloon("narration", None, "The Keeper has the egg. Someone opened the next gate from within.", 50, 50, maxWidthPct=58),
                    balloon("caption", None, "THE TRAITOR'S GATE", 50, 82),
                ],
            )
        ],
        characters=["cael-vesper"],
        atmosphere="night",
    )
)

book.append(
    matter_page(
        31,
        "profile",
        "Character Profile — Aurelia Voss",
        [
            panel(
                "prof-a",
                f"Character profile plate: {AURELIA} three-quarter portrait with Lockjaw Wisp and teal glass keys; empty text zones.",
                [
                    balloon("caption", None, "AURELIA VOSS", 50, 12),
                    balloon("narration", None, "The Gilded Merchant. Preserves routes others would burn. Morally ambiguous uneasy ally.", 50, 78, maxWidthPct=55),
                ],
            )
        ],
        characters=["aurelia-voss"],
        atmosphere="market",
    )
)

book.append(
    matter_page(
        32,
        "profile",
        "Companion Profile — Lockjaw Wisp",
        [
            panel(
                "prof-l",
                f"Companion profile: {LOCKJAW} front/side/three-quarter; Appraiser's Eye / Keyshift / Closed Contract; empty ability zones.",
                [
                    balloon("caption", None, "LOCKJAW WISP", 50, 12),
                    balloon("narration", None, "Merchant companion — Appraiser's Eye · Keyshift · Closed Contract — Control / Utility / Information.", 50, 80, maxWidthPct=55),
                ],
            )
        ],
        creatures=["lockjaw-wisp"],
        atmosphere="market",
    )
)

book.append(
    matter_page(
        33,
        "lore",
        "Codex — Gilded Crossroads",
        [
            panel(
                "lore",
                "Codex plate: Gilded Crossroads cross-section — portal engine, central exchange, rescue shelters, illegal pen tunnels, archive vault; black lacquer and teal glass.",
                [
                    balloon("caption", None, "CODEX — GILDED CROSSROADS", 50, 12),
                    balloon(
                        "narration",
                        None,
                        "Moving bazaar along old Rift routes. Legal trade floor. Portal engine relocates the entire market. Companion trafficking forbidden — but pens exist.",
                        50,
                        78,
                        maxWidthPct=58,
                    ),
                ],
            )
        ],
        atmosphere="market",
    )
)

book.append(
    matter_page(
        34,
        "lore",
        "Ability Spotlight — Break the Chain",
        [
            panel(
                "ability",
                f"Ability spotlight: {CINDERMINK} Break the Chain freeing captive companions and damaging control devices; empty rules zones.",
                [
                    balloon("caption", None, "ABILITY — BREAK THE CHAIN", 50, 14),
                    balloon("narration", None, "Remove restraints from allied companions and deal Fire damage to controlling devices. Condemn trafficking; rescue is not ownership.", 50, 78, maxWidthPct=55),
                ],
            )
        ],
        creatures=["cindermink"],
        atmosphere="market",
    )
)

book.append(
    matter_page(
        35,
        "map",
        "World Map — Tempestria to Crossroads",
        [
            panel(
                "map",
                "Painterly world map: Riftwild Commons, Lanternveil, Aureth Vale, Tempestria peaks, Gilded Crossroads portal mark, Traitor's Gate teaser. Empty label zones.",
                [
                    balloon("caption", None, "ROUTE OF EVERY DOOR", 50, 10, maxWidthPct=45),
                    balloon("narration", None, "Tempestria → Gilded Crossroads → Traitor's Gate (teaser)", 50, 85, maxWidthPct=55),
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
        "Editor's Note — Doors and Prices",
        [
            panel(
                "letters",
                "Quiet editor desk with merchant token paperweight and Compact lantern; soft window light.",
                [
                    balloon("caption", None, "EDITOR'S NOTE", 50, 14),
                    balloon(
                        "narration",
                        None,
                        "Issue #6 distinguishes legal trade from companion trafficking. Living cores are not SKUs. The cliffhanger asks who sells trust from inside the circle.",
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
                "Inside back: Gilded Crossroads Merchant Pass aesthetic — route stamps, rescue charter icon, portal engine warning; no real barcodes.",
                [
                    balloon("caption", None, "GILDED CROSSROADS MERCHANT PASS", 50, 14, maxWidthPct=55),
                    balloon("narration", None, "Central exchange — weapons sheathed. Companion pens — FORBIDDEN. Portal engine — CIRCLE ONLY.", 50, 50, maxWidthPct=55),
                    balloon("whisper", None, "Living cores are not SKUs.", 50, 78),
                ],
            )
        ],
        atmosphere="market",
    )
)

book.append(
    matter_page(
        38,
        "back-cover",
        "Back Cover — The Traitor's Gate",
        [
            panel(
                "bc",
                f"Back cover: Gilded Crossroads silhouette shifting through portal; tiny merchant token glow; {MIRA} and Spark with dormant egg wrap; empty blurb zones.",
                [
                    balloon("caption", None, "THE MERCHANT'S SECRET", 50, 12),
                    balloon("narration", None, "Every door opened. One ally closed the wrong one.", 50, 50, maxWidthPct=55),
                    balloon("caption", None, "ISSUE #6 · LEGENDS OF THE RIFT", 50, 88, maxWidthPct=50),
                ],
            )
        ],
        characters=["mira-eggwarden"],
        creatures=["spark"],
        atmosphere="night",
    )
)

synopsis = (
    "Mira Eggwarden, Spark, and the expedition enter the Gilded Crossroads — a moving bazaar powered by old Rift routes. "
    "Aurelia Voss formalizes as the Gilded Merchant; Seris Vale weaponizes the stolen royal trade ledger at a trap auction "
    "for a dormant Riftborn egg. The team condemns companion trafficking, frees captives with Cindermink's Break the Chain, "
    "and saves the egg — but Cael Vesper's hidden merchant debt surfaces in a cliffhanger: The Traitor's Gate."
)

script = {
    "title": "The Merchant's Secret",
    "issueNumber": 6,
    "slug": "the-merchants-secret",
    "protagonist": "Mira Eggwarden",
    "synopsis": synopsis,
    "storyPageCount": 25,
    "requiredMoments": list(range(1, 37)),
    "themes": [
        "commerce vs exploitation",
        "legal trade vs trafficking",
        "trust and betrayal",
        "preservation vs profit",
        "doors and access",
        "voluntary bonds",
        "moral ambiguity",
        "identity withheld",
    ],
    "calReed": "NON-CANON — forbidden",
    "elaraVenn": "vision/counsel only — not present cast",
    "merchant": "Aurelia Voss",
    "merchantCompanion": "Lockjaw Wisp",
    "rescueCompanion": "Cindermink",
    "traitorCliffhanger": "Cael Vesper",
    "continuesFrom": "the-storm-king",
    "dialogueLock": {
        "hoodedMerchant": "You brought me a map.",
        "serisVale": "No. I brought you every door.",
        "aureliaFormalized": True,
    },
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
            {"id": "cael-vesper", "name": "Cael Vesper", "role": "Lanternmaster — traitor cliffhanger"},
            {"id": "aurelia-voss", "name": "Aurelia Voss", "role": "Gilded Merchant (formalized hooded merchant)"},
            {"id": "nira-quill", "name": "Nira Quill", "role": "Meridian-defect hunter"},
            {"id": "seris-vale", "name": "Seris Vale", "role": "Meridian commander"},
            {"id": "tavi-brightline", "name": "Tavi Brightline", "role": "Circus ally (light)"},
            {"id": "vaelor-tempest", "name": "King Vaelor Tempest", "role": "Off-page recovery"},
            {"id": "elara-venn", "name": "Elara Venn", "role": "Vision/counsel only — not present"},
        ],
        "rejected": [{"id": "cal-reed", "note": "NON-CANON"}, {"id": "voltkit", "note": "legacy seed — not used"}],
    }
    (OUT / "characters.json").write_text(json.dumps(characters, indent=2) + "\n", encoding="utf-8")

    creatures = {
        "featured": [
            {"id": "spark", "name": "Spark", "note": "Resonance Line / Last Light"},
            {"id": "lockjaw-wisp", "name": "Lockjaw Wisp", "note": "See LOCKJAW_WISP_CANON_PROPOSAL.md"},
            {"id": "cindermink", "name": "Cindermink", "note": "See CINDERMINK_CANON_PROPOSAL.md"},
            {"id": "dormant-riftborn-egg", "name": "Dormant Riftborn Egg", "note": "Auction trap centerpiece — rescued, not property"},
            {"id": "echoquill", "name": "Echoquill", "purpose": "Living Archive"},
            {"id": "bramblefox", "name": "Bramblefox", "purpose": "Meridian scent track"},
            {"id": "mossprig", "name": "Mossprig", "purpose": "Living Bulwark / sense captives"},
            {"id": "thornling", "name": "Thornling", "purpose": "Lock discovery"},
            {"id": "wisplet", "name": "Wisplet", "purpose": "Phase / reveal false walls"},
            {"id": "spirit-moth", "name": "Spirit Moth", "purpose": "Lantern codes"},
            {"id": "lumenhare", "name": "Lumenhare", "purpose": "Circus light cover"},
            {"id": "thundervane", "name": "Thundervane", "note": "Off-page recovery — not market combat lead"},
        ]
    }
    (OUT / "creatures.json").write_text(json.dumps(creatures, indent=2) + "\n", encoding="utf-8")

    factions = {
        "factions": [
            {"id": "veiled-meridian", "name": "Veiled Meridian", "goal": "Buy egg, seize Spark, control routes"},
            {"id": "merchant-circle", "name": "Merchant Circle", "leader": "Aurelia Voss", "status": "uneasy-ally"},
            {"id": "hatchery-compact", "name": "Hatchery Compact", "status": "established — condemns trafficking"},
            {"id": "lanternveil-circus", "name": "Lanternveil Traveling Circus", "status": "ally-uneasy"},
            {"id": "tempestria-crown", "name": "Tempestria Crown", "status": "reforming — off-page"},
        ]
    }
    (OUT / "factions.json").write_text(json.dumps(factions, indent=2) + "\n", encoding="utf-8")

    locations = {
        "locations": [
            {"id": "gilded-crossroads", "name": "Gilded Crossroads", "blurb": "Moving bazaar via portal engine"},
            {"id": "central-exchange", "name": "Central Exchange", "blurb": "Legal trade floor — weapons sheathed"},
            {"id": "rescue-shelter-lane", "name": "Rescue Shelter Lane", "blurb": "Compact-stamped legal care"},
            {"id": "illegal-holding-pens", "name": "Illegal Holding Pens", "blurb": "Trafficking violation"},
            {"id": "underground-archive", "name": "Underground Archive", "blurb": "Aurelia's genealogy vault"},
            {"id": "private-auction-chamber", "name": "Private Auction Chamber", "blurb": "Meridian trap floor"},
            {"id": "portal-engine-core", "name": "Portal Engine Core", "blurb": "Relocates entire bazaar"},
        ]
    }
    (OUT / "locations.json").write_text(json.dumps(locations, indent=2) + "\n", encoding="utf-8")

    artifacts = {
        "artifacts": [
            {"id": "royal-trade-ledger", "name": "Royal Trade Ledger", "status": "weaponized then partially burned"},
            {"id": "lost-city-rift-component", "name": "Lost City Rift Component", "status": "with Seris — fleeing"},
            {"id": "dormant-riftborn-egg", "name": "Dormant Riftborn Egg", "status": "rescued by Mira/Spark"},
            {"id": "merchant-key", "name": "Merchant Key", "status": "Aurelia's bargain token"},
            {"id": "merchant-token", "name": "Merchant Token", "status": "Cael's hidden debt — cliffhanger"},
            {"id": "portal-engine", "name": "Portal Engine", "status": "overloaded then stabilized"},
            {"id": "circus-warded-crystal", "name": "Shellward Crystal", "status": "Lanternveil-warded off-page"},
        ]
    }
    (OUT / "artifacts.json").write_text(json.dumps(artifacts, indent=2) + "\n", encoding="utf-8")

    covers = {
        "main": {"title": "The Merchant's Secret", "issue": 6, "prompt": book[0]["grokPrompt"]},
        "variant-a": {
            "label": "Aurelia Voss and Lockjaw Wisp portrait",
            "prompt": f"{STYLE} Variant cover A: {AURELIA} and {LOCKJAW} portrait, empty title zones. NO text.",
        },
        "variant-b": {
            "label": "Spark and dormant egg auction",
            "prompt": f"{STYLE} Variant cover B: {SPARK} before dormant egg restraint field, {MIRA} silhouette. NO text.",
        },
        "foil": {
            "label": "Foil — gold filigree and teal Rift glass",
            "prompt": f"{STYLE} Foil cover concept: gold filigree and teal glass shimmer; empty title zones. NO text.",
        },
    }
    (OUT / "covers.json").write_text(json.dumps(covers, indent=2) + "\n", encoding="utf-8")

    refs = {
        "sheets": [
            "mira-eggwarden",
            "spark",
            "cael-vesper",
            "aurelia-voss",
            "nira-quill",
            "seris-vale",
            "lockjaw-wisp",
            "cindermink",
            "bramblefox",
            "mossprig",
            "thornling",
            "wisplet",
            "spirit-moth",
            "lumenhare",
            "echoquill",
            "gilded-crossroads-architecture",
            "portal-engine",
            "royal-trade-ledger",
            "dormant-riftborn-egg",
            "merchant-token",
            "meridian-symbols",
        ]
    }
    (OUT / "references" / "INDEX.json").write_text(json.dumps(refs, indent=2) + "\n", encoding="utf-8")
    (OUT / "references" / "README.md").write_text(
        "# Issue #6 reference sheets\n\nPlaceholder index for character/location lock sheets. Generate art via pipeline when ready.\n",
        encoding="utf-8",
    )

    issue = {
        "slug": "the-merchants-secret",
        "issueNumber": 6,
        "title": "The Merchant's Secret",
        "subtitle": "Chapter Six — Every Door Has a Price",
        "synopsis": synopsis,
        "publishedAt": "2026-07-20",
        "status": "script-complete",
        "storyPageCount": 25,
        "bookPageCount": len(book),
        "estimatedReadMinutes": 22,
        "protagonist": "Mira Eggwarden",
        "featuredCreatures": ["Spark", "Lockjaw Wisp", "Cindermink", "Bramblefox", "Mossprig", "Thornling", "Wisplet", "Echoquill"],
        "locations": ["Gilded Crossroads", "Central Exchange", "Underground Archive", "Portal Engine Core"],
        "marketRulesRel": "market-rules.json",
        "unlockGates": [
            {"kind": "prior-issue", "slug": "the-storm-king", "label": "Complete Issue #5: The Storm King"},
            {"kind": "admin-dev", "label": "Admin / COMICS_DEV_UNLOCK override"},
        ],
        "nextIssueTeaser": {
            "slug": "the-traitors-gate",
            "hook": "The Keeper has the egg. Proceed to the next gate.",
            "traitor": "Cael Vesper",
        },
        "pipeline": {
            "artProvider": "grok",
            "lettering": "programmatic",
            "bakedLettering": True,
            "contentRoot": "content/comics/the-merchants-secret/issue-006",
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
        json.dumps({"required": list(range(1, 37)), "taggedInScript": moments_hit}, indent=2) + "\n",
        encoding="utf-8",
    )

    for p in book:
        nn = f"{p['pageNumber']:03d}"
        page_out = {
            **p,
            "id": f"the-merchants-secret-issue-006-p{nn}",
            "cleanArtRel": f"generated/raw-art/page-{nn}.webp",
            "letteredArtRel": f"generated/lettered-pages/page-{nn}.webp",
            "publicArtRel": f"assets/comics/the-merchants-secret/issue-006/pages/page-{nn}.webp",
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
