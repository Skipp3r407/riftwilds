#!/usr/bin/env python3
"""Re-lock Issue #8 page JSON against completed Issue #7 continuity. Does not touch issue-007."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "content/comics/the-forge-of-rifts/issue-008"

PREV = (
    "Previously: Cael Vesper's coercion broke at the Traitor's Gate — Lumenhare freed, "
    "Nira cleared, egg cracked once. Gate open. Meridian Road lit. A voice from the Forge: "
    "Begin the second creation."
)
OPEN = (
    "The Gate had opened. The second creation had already begun. "
    "Beyond Meridian Road waited the machine that made the First Rift possible."
)
OLD_OPEN = (
    "Beyond the Traitor's Gate waited a machine that had been waiting longer than any living Keeper."
)


def build_tr(page: dict) -> list[str]:
    lines = []
    for pan in page.get("panels") or []:
        for b in pan.get("bubbles") or []:
            if b.get("speaker"):
                lines.append(f"{b['kind'].upper()} ({b['speaker']}): {b['text']}")
            else:
                lines.append(f"{b['kind'].upper()}: {b['text']}")
    return lines


def main() -> None:
    # page 002 — inside cover recap
    p2_path = OUT / "pages" / "page-002.json"
    p2 = json.loads(p2_path.read_text(encoding="utf-8"))
    for b in p2["panels"][0]["bubbles"]:
        if b.get("kind") == "narration":
            b["text"] = PREV
    for c in p2["captions"]:
        if c.get("kind") == "narration":
            c["text"] = PREV
    p2["transcript"] = [f"NARRATION: {PREV}", "CAPTION: CONTINUE THE FRACTURE DAWN"]
    p2["a11yTranscript"] = list(p2["transcript"])
    p2["continuity"] = {
        "fromIssue7": "complete",
        "traitor": "cael-vesper-supervised-turned",
        "egg": "cracked-once",
        "cliffhanger": "begin-the-second-creation",
        "nira": "cleared",
        "lumenhare": "freed",
        "aurelia": "uneasy-ally-offpage",
        "companions": "loyal",
        "seris": "retreated-returns-at-forge",
    }
    p2_path.write_text(json.dumps(p2, indent=2) + "\n", encoding="utf-8")

    # page 005 — story 1
    p5_path = OUT / "pages" / "page-005.json"
    p5 = json.loads(p5_path.read_text(encoding="utf-8"))
    for b in p5["panels"][0]["bubbles"]:
        if b.get("text") == OLD_OPEN:
            b["text"] = OPEN
    for c in p5.get("captions") or []:
        if c.get("text") == OLD_OPEN:
            c["text"] = OPEN
    # also replace if already partially updated from emitter mismatch
    for b in p5["panels"][0]["bubbles"]:
        if b.get("kind") == "narration" and "second creation" not in b.get("text", ""):
            b["text"] = OPEN
    for c in p5.get("captions") or []:
        if c.get("kind") == "narration" and "second creation" not in c.get("text", ""):
            c["text"] = OPEN
    p5["transcript"] = build_tr(p5)
    p5["a11yTranscript"] = list(p5["transcript"])
    p5["continuity"] = {
        "location": "Forge threshold / Meridian Road",
        "spark": "violent-reaction",
        "egg": "cracked-once-from-gate",
        "fromIssue7": "second-creation",
        "cael": "supervised-turned",
        "nira": "cleared-ally",
    }
    p5_path.write_text(json.dumps(p5, indent=2) + "\n", encoding="utf-8")

    # page 006 — story 2
    p6_path = OUT / "pages" / "page-006.json"
    p6 = json.loads(p6_path.read_text(encoding="utf-8"))
    p6["continuity"] = {
        **(p6.get("continuity") or {}),
        "egg": "glowing-cracked-once",
        "cael": "supervised-turned",
        "nira": "cleared-ally",
    }
    p6_path.write_text(json.dumps(p6, indent=2) + "\n", encoding="utf-8")

    # page 022 — story 18 further crack
    p22_path = OUT / "pages" / "page-022.json"
    p22 = json.loads(p22_path.read_text(encoding="utf-8"))
    p22["continuity"] = {
        **(p22.get("continuity") or {}),
        "egg": "cracks-further-second-time",
        "priorCrack": "gate-issue-007",
    }
    p22_path.write_text(json.dumps(p22, indent=2) + "\n", encoding="utf-8")

    # continuity.json
    cont_path = OUT / "continuity.json"
    cont = json.loads(cont_path.read_text(encoding="utf-8"))
    for row in cont["pages"]:
        if row.get("page") == 1:
            row.update(
                {
                    "egg": "cracked-once-from-gate",
                    "fromIssue7": "second-creation",
                    "cael": "supervised-turned",
                }
            )
        if row.get("page") == 2:
            row.update(
                {
                    "egg": "glowing-cracked-once",
                    "cael": "supervised-turned",
                    "nira": "cleared-ally",
                }
            )
        if row.get("page") == 18:
            row.update(
                {
                    "egg": "cracks-further-second-time",
                    "priorCrack": "gate-issue-007",
                }
            )
    cont_path.write_text(json.dumps(cont, indent=2) + "\n", encoding="utf-8")

    # issue.json synopsis note
    issue_path = OUT / "issue.json"
    issue = json.loads(issue_path.read_text(encoding="utf-8"))
    issue["continuesFrom"] = {
        "slug": "the-traitors-gate",
        "issueNumber": 7,
        "locks": [
            "Cael Vesper coerced traitor — turned — supervised",
            "Lumenhare freed",
            "Nira Quill cleared false lead",
            "egg cracked once at Gate",
            "Gate open to Meridian Road / artificial Rift",
            "cliffhanger: Begin the second creation",
            "Aurelia Voss uneasy ally",
            "companions loyal",
        ],
    }
    issue_path.write_text(json.dumps(issue, indent=2) + "\n", encoding="utf-8")

    print(
        json.dumps(
            {
                "patched": ["page-002", "page-005", "page-006", "page-022", "continuity.json", "issue.json"],
                "issue007Touched": False,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
