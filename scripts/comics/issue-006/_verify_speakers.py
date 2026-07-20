import json
from pathlib import Path

root = Path(__file__).resolve().parents[3] / "content/comics/the-merchants-secret/issue-006/pages"
speakers = set()
cal_speaker = False
for p in sorted(root.glob("*.json")):
    d = json.loads(p.read_text(encoding="utf-8"))
    for b in d.get("dialogue", []):
        sp = b.get("speaker")
        if sp:
            speakers.add(sp)
            if "Cal" in sp:
                cal_speaker = True
    for panel in d.get("panels", []):
        for b in panel.get("bubbles", []):
            sp = b.get("speaker")
            if sp:
                speakers.add(sp)
                if "Cal" in sp:
                    cal_speaker = True

print("speakers:", sorted(speakers))
print("cal_as_speaker:", cal_speaker)
for n in range(5, 30):
    d = json.loads((root / f"page-{n:03d}.json").read_text(encoding="utf-8"))
    print(f"s{d['storyPageNumber']:02d}", d["title"])
