# Collectible Books & Lore Catalog

**Goal:** Hundreds of collectible titles as a structured catalog; first wave includes full short texts. Remaining entries are stubs ready for authors/generators.

In-game pickup can later map to Codex entries (`src/content/codex/world-lore.ts`) without changing quest IDs.

---

## Catalog structure

Each book has: `id`, `title`, `series`, `regionBias`, `rarity`, `era`, `pages` (or stub blurb), `unlockHint`.

### Series index (planned volume counts)

| Series code | Series name | Target count | Theme |
|---|---|---|---|
| GH | Gateway Hymns | 24 | Pre-Fracture Heart songs |
| FC | Fracture Chronicles | 36 | Survivor accounts |
| EK | Elara’s Kindling (apocrypha) | 12 | Semi-myth Keeper tales |
| HC | Hatchery Compact Commentaries | 18 | Care ethics |
| RR | Regional Field Registers | 12×8=96 | 8 booklets per launch region |
| CE | Celestora Epistles | 40 | Scholar letters |
| AL | Alloy Schematics-as-Poems | 20 | Machine-song |
| SM | Spirit Marsh Lantern Notes | 30 | Memory slips |
| VF | Void Facsimiles | 16 | Hush koans |
| SP | Spirewind Kite-Letters | 24 | Aerial gossip |
| ST | Stoneheart Fossil Ledgers | 20 | Memory-law |
| TW | Twinmoon Tide Charts | 18 | Navigation lore |
| EM | Ember Slag Gospels | 16 | Forge philosophy |
| FR | Frostveil Lodge Songs | 16 | Warmth covenants |
| RA | Radiant Garden Annals | 22 | Healing history |
| CW | Commons Waybread Tales | 28 | Plaza folklore |
| MX | Mixed Anonymous | 50 | Oddities / unreliable narrators |
| XP | Expansion Fragments | 40 | Future foreshadow stubs |
| **Total planned** | | **~526** | Structured catalog |

---

## First-wave full texts (readable now)

### CW-01 — *Waybread on the First Night*

*Commons · Common · Age VI*

When the Riftstone was only a glowing wound set in mud, nobody baked fancy. They baked waybread: dense, honest, shareable. A woman who refused titles — Elara — broke hers in half for a child who had lost a name. The child asked what to call the glowing creature beside her. Elara said, “Call it yours to keep, not yours to own.” The plaza still smells like that sentence when the ovens start.

### GH-01 — *Hymn of the Balanced Heat*

*Ember/Radiant · Uncommon · Age I*

Heat without cold is a tyrant. Cold without heat is a tomb. The Heart between them taught us to temper. If you force every Heart to sing your hunger at once, you will eat the song. (Margin note in Solen’s hand: *They wrote the warning. We filed it under poetry.*)

### FC-03 — *Nine Days (Courier Fragment)*

*Elderwood · Rare · Age VI*

Day three: the egg weighed more when I doubted. Day six: the paths rearranged to punish haste. Day nine: it opened, and the light looked like a map that forgave me for being late. I will not write its name. Names become cages when kings are hungry.

### HC-01 — *Invite, Wait, Keep Honest*

*Commons Hatchery · Common · Age VIII*

Article One of the Compact, in plain speech Mira uses with newcomers: You may want a bond. The Riftling may want a future. Those wants meet in the middle or not at all. Credits buy mossmeal. Credits do not buy consent.

### CE-07 — *Letter on Living Cores*

*Radiant · Rare · Age III*

To the Lattice Coalition: understanding is not ownership. The cores answer music because music is how weather remembers joy. If you wire joy to a switch, do not be surprised when grief overloads the circuit. — *A Celestora hand, unsigned*

### AL-04 — *Schematic That Refused to Be a Weapon*

*Alloy · Uncommon · Age II*

Gear grows toward the light that feeds it. We built pumps that drank river without shaming fish. If your schematic ends in a blade, ask which Heart you stopped listening to.

### SM-02 — *Lantern Note: Missing Memory*

*Spirit · Rare · Present*

The Marsh keeps what the living drop. Lately the lanterns hum a gap — not a name, a loneliness shaped like a Prime. Do not fill the gap with a sword. Fill it with company.

### VF-01 — *Hush Koan*

*Void · Uncommon · Age V*

Q: What remains when the network screams?  
A: The quiet that lets eggs finish becoming.  
Q: Is quiet death?  
A: Only if you use it to erase the singers.

### SP-11 — *Kite-Letter from Above the Beacon*

*Stormspire · Uncommon · Age VII*

Harness first. Pride second. The wind does not care which aerie your grandparents owed. Your Riftling already knows the gust that will lie to you.

### ST-05 — *Fossil Ledger: Future-Echo Warning*

*Stoneheart · Rare · Age X*

Shelf 19-C showed a bridge that has not been built. Three diggers walked it in dreams and woke with rope-burns. Dig the past. Do not mine the maybe.

### TW-02 — *Tide Chart of Shores That Moved*

*Moonwater · Uncommon · Age V*

Old Tidehold pier marks no longer meet water. Tide Riftlings swim the old lines anyway. Follow them when maps argue. Believe the current that still remembers home.

### EM-03 — *Slag Gospel: Temper Twice*

*Ember · Common · Age VIII*

Vessa’s shop copy: Quench twice. Brag once. Heat is a teacher with poor bedside manner. Listen anyway.

### FR-01 — *Lodge Song of Shared Coal*

*Frostveil · Common · Age VI*

One coal in one fist freezes. One coal in a circle becomes a people. Tithes of warmth are not cruelty when winter is honest — they are cruelty when someone sells the circle’s last coal.

### RA-09 — *Garden Annal: Discovery Day*

*Radiant · Rare · Age III*

We went under the Citadel to prove a machine. We found a pulse that knew our names. Half of us wept. Half of us reached for levers. History split on that floor like a seed.

### XP-01 — *Fragment: Crown of Gears*

*Unknown · Epic · Expansion foreshadow*

…and above the fog the Gearwild Crown still turns, growing streets the way coral grows, waiting for salvage hearts that remember how not to conquer…

### MX-12 — *Unreliable: The Call Is a Door*

*Celestial · Rare · Present*

Some say the Celestial call is a door outward. Some say inward. My Riftling tilts its head like both are true. I am writing this on floating stone. If the ink slides uphill, believe the Riftling.

---

## Stub entry template (for the remaining ~500)

```yaml
id: RR-EMBER-03
title: Caldera Breath Notes
series: RR
regionBias: ember-crater
rarity: common
era: Age of Exploration
stub: "Kael-style path notes; heat bloom signs; Emberkit behavior."
unlockHint: "Ember survey job completion"
fullText: null  # fill in waves
```

Regional Field Registers (`RR-*`) should be generated 8 per region × 12 regions = 96 stubs in implementation pass (Codex importer or content script) — not required to ship all prose in this bible drop.

---

## Collectibility rules

- Books are **lore rewards** (Codex + flavor), not SOL sinks.
- Duplicate titles stack as “well-read” cosmetics / Academy quiz fuel.
- Redacted pages (Serae) can unlock as quest-choice variants of the same `id` with `-redacted` / `-restored` suffixes.
