from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]

# --- generate-and-letter.mjs ---
p = ROOT / "scripts/comics/issue-006/generate-and-letter.mjs"
t = p.read_text(encoding="utf-8")
replacements = [
    ("The Storm King Issue #5", "The Merchant's Secret Issue #6"),
    ("content/comics/the-storm-king/issue-005", "content/comics/the-merchants-secret/issue-006"),
    ("public/assets/comics/the-storm-king/issue-005/pages", "public/assets/comics/the-merchants-secret/issue-006/pages"),
    ("05-the-storm-king", "06-merchants-secret"),
    ("issue-005/generate", "issue-006/generate"),
    ("04-the-lost-city", "06-merchants-secret"),
]
for a, b in replacements:
    t = t.replace(a, b)
p.write_text(t, encoding="utf-8")
print("patched", p)

# --- emit-issue-006-catalog.mts ---
p2 = ROOT / "scripts/comics/emit-issue-006-catalog.mts"
t2 = p2.read_text(encoding="utf-8")
t2 = t2.replace("issue-005", "issue-006")
t2 = t2.replace("the-storm-king", "the-merchants-secret")
t2 = t2.replace("ISSUE_005", "ISSUE_006")
t2 = t2.replace("Issue #005", "Issue #006")
t2 = t2.replace("05-the-storm-king.png", "06-merchants-secret.png")
t2 = t2.replace("the-storm-king-issue-004", "the-merchants-secret-issue-006")
t2 = t2.replace("the-storm-king-issue-006", "the-merchants-secret-issue-006")
# Update character blurbs for issue 6
old_chars = """  characters: [
    { name: "Mira Eggwarden", role: "Keeper", blurb: "Leads the expedition — refuses Spark as an engine part." },
    { name: "Spark", role: "Riftborn / Resonance Line", blurb: "Refuses to replace Thundervane; steadies by invitation." },
    { name: "King Vaelor Tempest", role: "Storm King", blurb: "Duty became a wall — until he released the forced bond." },
    { name: "Cael Vesper", role: "Lanternmaster", blurb: "Warned Tempestria years ago; knows royal routes." },
    { name: "Seris Vale", role: "Meridian commander", blurb: "Sabotages the barrier; escapes with a merchant ledger." },
    { name: "Nira Quill", role: "Uncertain hunter", blurb: "Cuts the Spark tether; open Meridian disloyalty." },
    { name: "Thundervane", role: "Storm companion", blurb: "Stormbound Crown · Skybreaker · Crown of Thunder.", speciesSlug: "thundervane" },
    { name: "Galesprig", role: "Mountain scout", blurb: "Tailwind · Updraft · Clear Sky.", speciesSlug: "galesprig" },
    { name: "Elara Venn", role: "Vision echo only", blurb: "Not present — Soft Exodus counsel only if invoked." },
  ],
  locations: [
    { name: "Tempestria", blurb: "Mountain kingdom inside a permanent storm barrier." },
    { name: "Royal Citadel", blurb: "Throne under a living storm conduit." },
    { name: "Storm Engine Chamber", blurb: "Bond-fed weather core beneath the throne." },
    { name: "Merchant Network", blurb: "Issue #6 teaser — every door." },
  ],
  timelineNote: "After The Lost City — storm-mountain signal answered.",
  playChapterHref: "/live-world",
  playChapterLabel: "Travel toward Stormspire",
  unlockGates: [
    { kind: "prior-issue", slug: "the-lost-city", label: "Complete Issue #4: The Lost City" },
    { kind: "admin-dev", label: "Admin / COMICS_DEV_UNLOCK override" },
  ],
  nextIssueTeaser: {
    slug: "the-merchants-secret",
    hook: "You brought me a map. No — every door.",
  },"""

new_chars = """  characters: [
    { name: "Mira Eggwarden", role: "Keeper", blurb: "Enters the Crossroads — refuses companion trafficking." },
    { name: "Spark", role: "Riftborn / Resonance Line", blurb: "Senses the dormant egg; reveals to protect captives." },
    { name: "Aurelia Voss", role: "Gilded Merchant", blurb: "Formalized from Issue #5 Hooded Merchant — uneasy ally." },
    { name: "Cael Vesper", role: "Lanternmaster", blurb: "Knows market customs — traitor cliffhanger." },
    { name: "Seris Vale", role: "Meridian commander", blurb: "Weaponizes the royal trade ledger at auction." },
    { name: "Nira Quill", role: "Uncertain hunter", blurb: "Burns her Meridian path destroying a ledger door." },
    { name: "Lockjaw Wisp", role: "Merchant companion", blurb: "Appraiser's Eye · Keyshift · Closed Contract.", speciesSlug: "lockjaw-wisp" },
    { name: "Cindermink", role: "Rescue companion", blurb: "Cornered Flame · Smoke Slip · Break the Chain.", speciesSlug: "cindermink" },
    { name: "Elara Venn", role: "Vision echo only", blurb: "Not present — Soft Exodus counsel only if invoked." },
  ],
  locations: [
    { name: "Gilded Crossroads", blurb: "Moving bazaar on old Rift routes." },
    { name: "Underground Archive", blurb: "Keys, genealogy, First Rift records." },
    { name: "Private Auction Chamber", blurb: "Trap for a dormant Riftborn egg." },
    { name: "Tempestria", blurb: "Prior issue — recovering off-page." },
  ],
  timelineNote: "After The Storm King — every door leads here.",
  playChapterHref: "/marketplace",
  playChapterLabel: "Visit Marketplace",
  unlockGates: [
    { kind: "prior-issue", slug: "the-storm-king", label: "Complete Issue #5: The Storm King" },
    { kind: "admin-dev", label: "Admin / COMICS_DEV_UNLOCK override" },
  ],
  nextIssueTeaser: {
    slug: "the-traitors-gate",
    hook: "The Keeper has the egg. Proceed to the next gate.",
  },"""

if old_chars in t2:
    t2 = t2.replace(old_chars, new_chars)
    print("character block replaced")
else:
    print("WARN: character block not found — catalog will need manual edit")

# tags
t2 = t2.replace(
    '["storm-king", "tempestria", "thundervane", "riftborn", "issue-005", "veiled-meridian", "mira-eggwarden"]',
    '["merchants-secret", "gilded-crossroads", "aurelia-voss", "riftborn", "issue-006", "veiled-meridian", "mira-eggwarden"]',
)
t2 = t2.replace(
    """  factions: [
    { name: "Veiled Meridian", blurb: "Tempestria sabotage — Seris Vale's storm cell." },
    { name: "Tempestria Crown", blurb: "Releasing absolute control after the bond snaps." },
    { name: "Lanternveil Circus", blurb: "Uneasy allies; crystal remains warded off-page." },
    { name: "Hatchery Compact", blurb: "Invite. Wait. Keep the invitation honest." },
  ],""",
    """  factions: [
    { name: "Gilded Merchant Circle", blurb: "Fractured — Aurelia uneasy ally." },
    { name: "Veiled Meridian", blurb: "Egg auction + ledger doors." },
    { name: "Lanternveil Circus", blurb: "Ally compromised by Cael's debt." },
    { name: "Hatchery Compact", blurb: "Living cores are not SKUs." },
  ],""",
)

p2.write_text(t2, encoding="utf-8")
print("patched", p2)
