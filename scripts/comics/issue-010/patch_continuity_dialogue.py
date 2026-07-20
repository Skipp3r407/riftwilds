#!/usr/bin/env python3
"""Patch Issue #10 dialogue for Issue #9 re-lock carry-forward."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
PAGES = ROOT / "content/comics/the-shattered-star/issue-010/pages"


def rebuild_transcript(page: dict) -> list[str]:
    lines: list[str] = []
    order = 0
    for panel in page.get("panels") or []:
        for b in panel.get("bubbles") or []:
            b["readOrder"] = order
            order += 1
            if b.get("speaker"):
                lines.append(f"{b['kind'].upper()} ({b['speaker']}): {b['text']}")
            else:
                lines.append(f"{b['kind'].upper()}: {b['text']}")
    page["transcript"] = lines
    page["a11yTranscript"] = lines
    # sync dialogue arrays lightly from bubbles
    dialogue, captions, sfx = [], [], []
    for panel in page.get("panels") or []:
        for b in panel.get("bubbles") or []:
            entry = {"panelId": panel["id"], **b}
            if b["kind"] == "sfx":
                sfx.append(entry)
            elif b["kind"] in ("narration", "caption"):
                captions.append(entry)
            else:
                dialogue.append(entry)
    page["dialogue"] = dialogue
    page["captions"] = captions
    page["soundEffects"] = sfx
    return lines


def main() -> None:
    p10 = json.loads((PAGES / "page-010.json").read_text(encoding="utf-8"))
    for panel in p10.get("panels") or []:
        for b in panel.get("bubbles") or []:
            if b.get("text") == "I will not fail a door again.":
                b["text"] = "I stand with you — under watch. I will not fail a door again."
            if b.get("text") == "Then we bargain with the sky.":
                b["text"] = "I am still uneasy… but we bargain with the sky."
            if "I will not fail a door again." in b.get("text", "") and "under watch" not in b.get("text", ""):
                b["text"] = "I stand with you — under watch. I will not fail a door again."
            if b.get("text") == "Then we bargain with the sky." or (
                "bargain with the sky" in b.get("text", "") and "uneasy" not in b.get("text", "")
            ):
                b["text"] = "I am still uneasy… but we bargain with the sky."
    rebuild_transcript(p10)
    (PAGES / "page-010.json").write_text(json.dumps(p10, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    p25 = json.loads((PAGES / "page-025.json").read_text(encoding="utf-8"))
    old = "The Network was never complete without this."
    new = "Arkan would have smiled at this sync… The Network was never complete without this."
    for panel in p25.get("panels") or []:
        for b in panel.get("bubbles") or []:
            if b.get("text") == old or (old in b.get("text", "") and "Arkan" not in b.get("text", "")):
                b["text"] = new
        if panel.get("id") == "p21b":
            texts = [b.get("text", "") for b in panel.get("bubbles") or []]
            if not any("older than Meridian" in t for t in texts):
                panel.setdefault("bubbles", []).append(
                    {
                        "kind": "whisper",
                        "speaker": "Professor Elyan Voss",
                        "text": "Whoever rewrote the old protocols… still older than Meridian. Unsolved.",
                        "x": 55,
                        "y": 70,
                        "tail": "up",
                        "maxWidthPct": 42,
                    }
                )
    rebuild_transcript(p25)
    (PAGES / "page-025.json").write_text(json.dumps(p25, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    p7 = json.loads((PAGES / "page-007.json").read_text(encoding="utf-8"))
    for panel in p7.get("panels") or []:
        if panel.get("id") == "p3b":
            texts = [b.get("text", "") for b in panel.get("bubbles") or []]
            if not any("Ascendant" in t or "retired" in t.lower() for t in texts):
                # insert before Mira's closing line
                bubbles = panel.get("bubbles") or []
                insert_at = max(0, len(bubbles) - 1)
                bubbles.insert(
                    insert_at,
                    {
                        "kind": "speech",
                        "speaker": "Professor Elyan Voss",
                        "text": "I am retired from engines… not from hope. The Ascendant fell — but an older hand still hides.",
                        "x": 50,
                        "y": 50,
                        "tail": "down",
                        "maxWidthPct": 46,
                    },
                )
                panel["bubbles"] = bubbles
    rebuild_transcript(p7)
    (PAGES / "page-007.json").write_text(json.dumps(p7, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print("Patched pages 007, 010, 025 for Issue #9 re-lock")


if __name__ == "__main__":
    main()
