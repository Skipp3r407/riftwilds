/**
 * Bootstrap The First Rift issue-001 content tree + page JSON from authored script.
 *   node scripts/comics/bootstrap-issue-001.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
/** Brief path (authoritative) + mirror under src/content for Next imports of related docs */
const ISSUE = path.join(ROOT, "content/comics/the-first-rift/issue-001");
const ISSUE_SRC = path.join(ROOT, "src/content/comics/the-first-rift/issue-001");
const PUB = path.join(ROOT, "public/assets/comics/the-first-rift/issue-001");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

/** @typedef {{ kind: string, speaker?: string, text: string, x?: number, y?: number, tail?: string }} Line */
/** @typedef {{ id: string, layout: string, title?: string, atmosphere?: string, artPrompt: string, panels: { caption?: string, lines: Line[] }[], beat: string, generationStatus: string }} StoryPage */

/** 25 story pages — full dialogue */
const STORY = /** @type {StoryPage[]} */ ([
  {
    id: "story-01",
    layout: "two-col",
    atmosphere: "dusk",
    beat: "Present — Mira feels the pulse under Commons cobbles",
    artPrompt:
      "Two-panel comic page, no text. Left: Mira Eggwarden (young hatchery mentor, practical robes, egg-care satchel) kneeling on warm Commons cobbles at dusk, hand on vibrating stone. Right: timber plaza of Riftwild Commons, amber lanterns, cyan hairline crack underfoot. Painterly fantasy comic, earth tones, cyan accent only.",
    panels: [
      {
        lines: [
          { kind: "narration", text: "Riftwild Commons. Dusk. The cobbles remember a scream the town pretends was weather.", x: 50, y: 12 },
          { kind: "speech", speaker: "Mira Eggwarden", text: "That's not a cart. That's a pulse.", x: 28, y: 55, tail: "down" },
        ],
      },
      {
        lines: [
          { kind: "thought", speaker: "Mira Eggwarden", text: "Compact law says invite. It doesn't say ignore the floor when it answers.", x: 70, y: 40, tail: "down-left" },
          { kind: "sfx", text: "THRUMMM", x: 55, y: 78 },
        ],
      },
    ],
  },
  {
    id: "story-02",
    layout: "wide",
    atmosphere: "night",
    beat: "Unstable ancient Rift at Commons fringe",
    artPrompt:
      "Splash-leaning comic page, no text. Mira at the mossy fringe of Riftwild Commons where a vertical cyan Fracture tear hangs wrong over mud and birch. Ancient stone teeth half-swallowed by roots. Tension, not horror-movie gore. Earth greens and sandstone; cyan only on the tear.",
    panels: [
      {
        lines: [
          { kind: "narration", text: "Beyond the last honest lamp, the fringe still argues with the Fracture.", x: 50, y: 10 },
          { kind: "speech", speaker: "Mira Eggwarden", text: "You're not on any survey map. Good. Maps lie when roads rewrite.", x: 30, y: 62, tail: "up" },
          { kind: "sfx", text: "RIFT-HUMMM", x: 72, y: 48 },
        ],
      },
    ],
  },
  {
    id: "story-03",
    layout: "grid-2x2",
    atmosphere: "rift",
    beat: "Vision seizure — pulled into First Rift memory",
    artPrompt:
      "Four-panel comic page, no text. 1: cyan light floods Mira's eyes. 2: Commons dissolves into layered desert-forest roads. 3: silhouette of Elara Venn with glowing egg. 4: Mira falling through tear into warm past light. No lettering in art.",
    panels: [
      { lines: [{ kind: "sfx", text: "FWOOOM", x: 50, y: 40 }] },
      { lines: [{ kind: "speech", speaker: "Mira Eggwarden", text: "—wait—!", x: 50, y: 50, tail: "down" }] },
      {
        lines: [
          { kind: "narration", text: "The tear does not ask permission.", x: 50, y: 30 },
          { kind: "caption", text: "VISION — AGE OF FIRST EGGS", x: 50, y: 70 },
        ],
      },
      { lines: [{ kind: "whisper", speaker: "Unknown", text: "Keep…", x: 50, y: 55 }] },
    ],
  },
  {
    id: "story-04",
    layout: "two-col",
    atmosphere: "dusk",
    beat: "Elara on Fracture road with egg",
    artPrompt:
      "Two-panel page, no text. Elara Venn (warm brown skin, dark braids with amber beads, travel cloak) carrying a soft glowing egg across Fracture-layered road where desert meets forest wrongly. Painterly comic.",
    panels: [
      {
        lines: [
          { kind: "narration", text: "Nine days before the Commons had a name.", x: 50, y: 12 },
          { kind: "speech", speaker: "Elara Venn", text: "The egg is warm. That is enough to keep walking.", x: 35, y: 58, tail: "down" },
        ],
      },
      {
        lines: [
          { kind: "speech", speaker: "Stranger", text: "Take the crown road — safer.", x: 70, y: 30, tail: "down-left" },
          { kind: "speech", speaker: "Elara Venn", text: "Safer for whom?", x: 32, y: 72, tail: "up" },
        ],
      },
    ],
  },
  {
    id: "story-05",
    layout: "narrative",
    atmosphere: "night",
    beat: "Waybread — keep not own",
    artPrompt:
      "Single cinematic comic page, no text. Night camp: Elara shares waybread with a lost child; soft egg glow; amber fire; distant cyan rift hairline. Emotional, warm.",
    panels: [
      {
        lines: [
          { kind: "narration", text: "She shared waybread with a child who had lost a name.", x: 50, y: 12 },
          { kind: "speech", speaker: "Elara Venn", text: "Call the creature yours to keep — not yours to own.", x: 40, y: 48, tail: "down" },
          { kind: "caption", text: "CODEX ECHO — Waybread on the First Night", x: 50, y: 82 },
          { kind: "sfx", text: "SHELL-SONG", x: 75, y: 65 },
        ],
      },
    ],
  },
  {
    id: "story-06",
    layout: "lore",
    atmosphere: "rift",
    beat: "Gateway Hearts fragment",
    artPrompt:
      "Lore plate comic page, no text. Living Gateway Heart crystal-core in ancient sandstone ruins; soft cyan pulse; moss and earth dominant. Room at bottom for caption box. No painted words.",
    panels: [
      {
        lines: [
          { kind: "narration", text: "Hearts were living cores. Stones are travel shards.", x: 50, y: 18 },
          { kind: "caption", text: "The Commons Riftstone is a fragment of the Prime — maps of places not yet found.", x: 50, y: 78 },
        ],
      },
    ],
  },
  {
    id: "story-07",
    layout: "splash",
    atmosphere: "dawn",
    beat: "Riftstone claims mud — founding gathering",
    artPrompt:
      "Full-bleed splash, no text. Farmers, healers, Keepers gather where stable paths intersect; cyan Riftstone rising from mud at dawn; Elara with egg at center. Warm earth first.",
    panels: [
      {
        lines: [
          { kind: "narration", text: "Farmers, healers, and Keepers gathered where stable paths still intersected.", x: 50, y: 12 },
          { kind: "sfx", text: "KRRRAAAK", x: 60, y: 55 },
        ],
      },
    ],
  },
  {
    id: "story-08",
    layout: "grid-2x2",
    atmosphere: "day",
    beat: "Hatch — First Riftling",
    artPrompt:
      "Four-panel hatch scene, no text. Young Mira-like child wonder; soft hatch light; village elder; newborn First Riftling pale shell-glow curious eyes. Warm Commons day.",
    panels: [
      {
        lines: [
          { kind: "speech", speaker: "Child", text: "Is it… looking at me?", x: 40, y: 40, tail: "down" },
          { kind: "speech", speaker: "Elara Venn", text: "It is remembering the world. Help it stay gentle.", x: 60, y: 65, tail: "up" },
        ],
      },
      {
        lines: [
          { kind: "sfx", text: "HATCH—!", x: 50, y: 45 },
          { kind: "narration", text: "The Soft Exodus had closed into eggs. Battle culture would come later.", x: 50, y: 75 },
        ],
      },
      {
        lines: [
          { kind: "speech", speaker: "Village elder", text: "What do we call you?", x: 40, y: 35, tail: "down" },
          { kind: "speech", speaker: "Elara Venn", text: "Courier. Keeper, if the egg agrees.", x: 65, y: 60, tail: "up" },
        ],
      },
      {
        lines: [
          { kind: "thought", speaker: "First Riftling", text: "…keep…", x: 50, y: 50 },
          { kind: "caption", text: "FIRST-LIGHT-01", x: 50, y: 80 },
        ],
      },
    ],
  },
  {
    id: "story-09",
    layout: "three-stack",
    atmosphere: "day",
    beat: "Bramblefox — Forest Bond",
    artPrompt:
      "Three horizontal panels, no text. Bramblefox (vine-fur fox Riftling, leaf ears) bonds with green Forest Bond threads to Keeper and First Riftling in sunlit grove. Official creature silhouette.",
    panels: [
      {
        caption: "Ability — Forest Bond",
        lines: [
          { kind: "narration", text: "When Bramblefox chooses a Keeper, the grove answers with green thread — Forest Bond, not a leash.", x: 50, y: 20 },
          { kind: "creature", speaker: "Bramblefox", text: "*vine-hum…*", x: 30, y: 55 },
          { kind: "sfx", text: "LEAF-SNAP", x: 72, y: 50 },
        ],
      },
      {
        lines: [
          { kind: "magic", speaker: "Grove", text: "Bond accepted — roots remember both names.", x: 50, y: 40 },
          { kind: "whisper", speaker: "Elara Venn", text: "Softly. Bonds break when shouted at.", x: 28, y: 70, tail: "up" },
        ],
      },
      {
        lines: [
          { kind: "shout", speaker: "Village kid", text: "It glowed!", x: 40, y: 35, tail: "down" },
          { kind: "speech", speaker: "Elara Venn", text: "It agreed. That is rarer than glowing.", x: 68, y: 55, tail: "down-left" },
        ],
      },
    ],
  },
  {
    id: "story-10",
    layout: "two-col",
    atmosphere: "day",
    beat: "Mossprig — Living Bulwark",
    artPrompt:
      "Two-panel page, no text. Mossprig (cervine-botanical, moss cape, leaf antlers) raises a living moss wall between egg and tumbling Fracture debris. Living Bulwark pose.",
    panels: [
      {
        caption: "Ability — Living Bulwark",
        lines: [
          { kind: "narration", text: "Mossprig does not charge first. It becomes the wall the egg deserves.", x: 50, y: 14 },
          { kind: "sfx", text: "WHUMP", x: 60, y: 55 },
        ],
      },
      {
        lines: [
          { kind: "speech", speaker: "Elara Venn", text: "Thank you for choosing the cradle over the chase.", x: 45, y: 40, tail: "down" },
          { kind: "creature", speaker: "Mossprig", text: "*soft moss-settle*", x: 70, y: 70 },
        ],
      },
    ],
  },
  {
    id: "story-11",
    layout: "three-stack",
    atmosphere: "dusk",
    beat: "Thornling — Sprouting Energy",
    artPrompt:
      "Three-stack panels, no text. Thornling (bristly plant Riftling) releases Sprouting Energy — vines burst to tangle shadow-shard scavengers away from the egg without killing.",
    panels: [
      {
        caption: "Ability — Sprouting Energy",
        lines: [
          { kind: "narration", text: "Thornling's answer is growth with teeth — Sprouting Energy to trip cruelty, not crown it.", x: 50, y: 18 },
          { kind: "sfx", text: "CRACKLE-VASH", x: 70, y: 50 },
        ],
      },
      {
        lines: [
          { kind: "speech", speaker: "Scavenger", text: "Just a shell—!", x: 30, y: 40, tail: "down" },
          { kind: "shout", speaker: "Elara Venn", text: "It is a promise!", x: 65, y: 55, tail: "down-left" },
        ],
      },
      {
        lines: [{ kind: "creature", speaker: "Thornling", text: "*root-snap*", x: 50, y: 50 }],
      },
    ],
  },
  {
    id: "story-12",
    layout: "wide",
    atmosphere: "night",
    beat: "Wisplet — Lantern Soft",
    artPrompt:
      "Wide night page, no text. Wisplet (small lantern-spirit Riftling) casts Lantern Soft glow through fog around Elara and egg; companions silhouetted. Amber + soft cyan accents.",
    panels: [
      {
        caption: "Ability — Lantern Soft",
        lines: [
          { kind: "narration", text: "Wisplet does not blind the dark. It teaches the dark where feet may land.", x: 50, y: 12 },
          { kind: "speech", speaker: "Elara Venn", text: "Stay with us, little light. The Compact starts with honesty — even to fog.", x: 40, y: 60, tail: "up" },
          { kind: "sfx", text: "soft lantern whoosh", x: 70, y: 40 },
        ],
      },
    ],
  },
  {
    id: "story-13",
    layout: "two-col",
    atmosphere: "dusk",
    beat: "Emberfox Ashen Hide + Ashwing Kindled Spirit",
    artPrompt:
      "Two-panel page, no text. Left: Emberfox flares Ashen Hide against cold Fracture wind. Right: Ashwing (ember-feathered avian) Kindled Spirit dive-assist over mud plaza. Official silhouettes.",
    panels: [
      {
        caption: "Ashen Hide · Kindled Spirit",
        lines: [
          { kind: "narration", text: "Heat that guards. Fire that listens.", x: 50, y: 12 },
          { kind: "creature", speaker: "Emberfox", text: "*ash-ruff*", x: 35, y: 55 },
        ],
      },
      {
        lines: [
          { kind: "creature", speaker: "Ashwing", text: "*cinder-cry*", x: 65, y: 40 },
          { kind: "speech", speaker: "Elara Venn", text: "None of you are weapons. You are the reason weapons can wait.", x: 45, y: 70, tail: "up" },
        ],
      },
    ],
  },
  {
    id: "story-14",
    layout: "grid-2x2",
    atmosphere: "storm",
    beat: "Clash — protect the egg",
    artPrompt:
      "Four-panel action page, no text. Companions coordinate: Forest Bond vines, Living Bulwark wall, Sprouting Energy tangle, Kindled Spirit dive — vs angular Fracture scrap-hounds. Egg protected center. No logos.",
    panels: [
      { lines: [{ kind: "sfx", text: "LEAF-SNAP", x: 50, y: 45 }] },
      { lines: [{ kind: "sfx", text: "WHUMP", x: 50, y: 50 }] },
      { lines: [{ kind: "sfx", text: "FWOOOM", x: 50, y: 45 }] },
      {
        lines: [
          { kind: "speech", speaker: "Elara Venn", text: "Hold the cradle!", x: 50, y: 40, tail: "down" },
          { kind: "narration", text: "Loyalty is a formation.", x: 50, y: 75 },
        ],
      },
    ],
  },
  {
    id: "story-15",
    layout: "narrative",
    atmosphere: "dawn",
    beat: "Aftermath — Compact spoken before ink",
    artPrompt:
      "Narrative page, no text. Soft dawn after battle; Elara kneeling; companions resting; child reaches toward First Riftling. Mud and names mood.",
    panels: [
      {
        lines: [
          { kind: "narration", text: "Mud took bootprints. The Riftstone took names.", x: 50, y: 12 },
          { kind: "speech", speaker: "Healer", text: "We can raise walls. Or we can raise Keepers.", x: 30, y: 45, tail: "down" },
          { kind: "speech", speaker: "Elara Venn", text: "Raise Keepers who know which wall is a cradle.", x: 68, y: 58, tail: "down-left" },
          { kind: "sfx", text: "soft dawn wind", x: 50, y: 82 },
        ],
      },
    ],
  },
  {
    id: "story-16",
    layout: "two-col",
    atmosphere: "day",
    beat: "Fear allowed — force is not",
    artPrompt:
      "Two-panel page, no text. Child afraid near egg; Elara gentle; First Riftling stays. Compact law beat.",
    panels: [
      {
        lines: [
          { kind: "speech", speaker: "Child", text: "Will the egg leave if I am scared?", x: 40, y: 40, tail: "down" },
          { kind: "speech", speaker: "Elara Venn", text: "Fear is allowed. Force is not.", x: 65, y: 60, tail: "up" },
        ],
      },
      {
        lines: [
          { kind: "narration", text: "That was the first Compact law — spoken before ink existed.", x: 50, y: 30 },
          { kind: "thought", speaker: "First Riftling", text: "…stay…", x: 50, y: 65 },
        ],
      },
    ],
  },
  {
    id: "story-17",
    layout: "three-stack",
    atmosphere: "dusk",
    beat: "Fracture roads rearrange",
    artPrompt:
      "Three-stack, no text. Roads twist; scout confused; Elara walks by egg-warmth not map; cyan path rewrite.",
    panels: [
      {
        lines: [
          { kind: "narration", text: "On the seventh night the Fracture roads rearranged again.", x: 50, y: 18 },
          { kind: "speech", speaker: "Scout", text: "East gate is west. West gate is… soup.", x: 40, y: 55, tail: "down" },
        ],
      },
      {
        lines: [
          { kind: "speech", speaker: "Elara Venn", text: "Then we walk by warmth, not by map.", x: 50, y: 45, tail: "down" },
          { kind: "thought", speaker: "First Riftling", text: "…warm…", x: 70, y: 65 },
        ],
      },
      {
        lines: [
          { kind: "caption", text: "Codex stub — Fracture roads", x: 50, y: 40 },
          { kind: "sfx", text: "path rewrite… hum", x: 55, y: 70 },
        ],
      },
    ],
  },
  {
    id: "story-18",
    layout: "narrative",
    atmosphere: "night",
    beat: "Crown-shard refused",
    artPrompt:
      "Night confrontation page, no text. Crown courier offers bright shard; Elara shields egg; wrong gold light vs soft egg cyan.",
    panels: [
      {
        lines: [
          { kind: "narration", text: "A stranger offered a crown-shard for the egg — bright, legal-looking, wrong.", x: 50, y: 12 },
          { kind: "speech", speaker: "Crown courier", text: "Name a price. The realm will keep it safer than mud.", x: 70, y: 40, tail: "down-left" },
          { kind: "speech", speaker: "Elara Venn", text: "If safety needs a price, it is already theft.", x: 30, y: 62, tail: "up" },
          { kind: "sfx", text: "shard reject — clink", x: 55, y: 82 },
        ],
      },
    ],
  },
  {
    id: "story-19",
    layout: "splash",
    atmosphere: "rift",
    beat: "Something listens beyond the tear",
    artPrompt:
      "Splash page, no text. Wide Fracture tear; faint silhouette listening beyond; Elara small in foreground with egg; ominous but beautiful. Cyan + deep earth.",
    panels: [
      {
        lines: [
          { kind: "narration", text: "Beyond the tear, something practiced patience.", x: 50, y: 14 },
          { kind: "telepathy", speaker: "Beyond", text: "…who keeps the invitation…", x: 50, y: 48 },
          { kind: "caption", text: "SECOND PULSE", x: 50, y: 82 },
        ],
      },
    ],
  },
  {
    id: "story-20",
    layout: "two-col",
    atmosphere: "rift",
    beat: "Mira jolts between vision and present",
    artPrompt:
      "Two-panel page, no text. Left: Elara era. Right: Mira gasping at present-day fringe Rift, same cyan frequency. Match lighting bridge.",
    panels: [
      {
        lines: [
          { kind: "speech", speaker: "Elara Venn", text: "If you are listening from later — do not sell the story's consent.", x: 40, y: 50, tail: "down" },
        ],
      },
      {
        lines: [
          { kind: "shout", speaker: "Mira Eggwarden", text: "I'm here— I'm here—!", x: 55, y: 40, tail: "down" },
          { kind: "narration", text: "The vision loosens. The pulse does not.", x: 50, y: 75 },
        ],
      },
    ],
  },
  {
    id: "story-21",
    layout: "narrative",
    atmosphere: "night",
    beat: "Present — Mira finds carved deliberate mark",
    artPrompt:
      "Narrative page, no text. Mira's lantern reveals an intentional Fracture glyph carved under moss — too clean to be accident. Present-day Commons fringe.",
    panels: [
      {
        lines: [
          { kind: "narration", text: "Under the moss: a mark that was not weather.", x: 50, y: 12 },
          { kind: "speech", speaker: "Mira Eggwarden", text: "Someone opened this on purpose.", x: 40, y: 48, tail: "down" },
          { kind: "thought", speaker: "Mira Eggwarden", text: "Elara kept an egg. Who kept the knife?", x: 65, y: 70 },
        ],
      },
    ],
  },
  {
    id: "story-22",
    layout: "three-stack",
    atmosphere: "dawn",
    beat: "Loyalty / responsibility — Mira chooses Compact",
    artPrompt:
      "Three-stack, no text. Mira returns toward Commons Hatchery lights; Bramblefox-like fringe watcher optional silhouette; dawn responsibility mood.",
    panels: [
      {
        lines: [
          { kind: "narration", text: "Responsibility is not a crown. It is a walk you finish.", x: 50, y: 20 },
          { kind: "speech", speaker: "Mira Eggwarden", text: "Hatchery Compact still holds. Invite. Wait. Tell the truth about the tear.", x: 45, y: 55, tail: "down" },
        ],
      },
      {
        lines: [{ kind: "caption", text: "Theme — loyalty · responsibility · ancient betrayal", x: 50, y: 50 }],
      },
      {
        lines: [
          { kind: "speech", speaker: "Mira Eggwarden", text: "I will not make the egg pay for someone else's curiosity.", x: 50, y: 45, tail: "up" },
        ],
      },
    ],
  },
  {
    id: "story-23",
    layout: "wide",
    atmosphere: "rift",
    beat: "Cliffhanger — First Rift was deliberate",
    artPrompt:
      "Wide cinematic page, no text. Split: ancient Elara with egg / present Mira at glyph. Center: Prime Gateway scream frozen mid-opening with tool-marks in stone. Cliffhanger energy.",
    panels: [
      {
        lines: [
          { kind: "narration", text: "The First Rift was not an accident.", x: 50, y: 14 },
          { kind: "caption", text: "CLIFFHANGER", x: 50, y: 40 },
          { kind: "telepathy", speaker: "Beyond", text: "We opened a door. You only named a town.", x: 50, y: 62 },
          { kind: "sfx", text: "SECOND-PULSE", x: 50, y: 85 },
        ],
      },
    ],
  },
  {
    id: "story-24",
    layout: "two-col",
    atmosphere: "dusk",
    beat: "Spirit Moth cameo + Mira reports",
    artPrompt:
      "Two-panel page, no text. Left: faint Spirit Moth TCG-accurate silhouette near lantern (cameo only). Right: Mira speaking to Hatchery doorway silhouette. No invented moth powers.",
    panels: [
      {
        lines: [
          { kind: "narration", text: "A pale moth drifts the lamp-line — archive weather, not a weapon.", x: 50, y: 20 },
          { kind: "caption", text: "Spirit Moth — cameo (TCG silhouette)", x: 50, y: 70 },
        ],
      },
      {
        lines: [
          { kind: "speech", speaker: "Mira Eggwarden", text: "Log it. Unstable ancient Rift. Deliberate tooling. Vision confirmed Elara's road.", x: 45, y: 45, tail: "down" },
          { kind: "whisper", speaker: "Mira Eggwarden", text: "And something still listening.", x: 55, y: 75 },
        ],
      },
    ],
  },
  {
    id: "story-25",
    layout: "splash",
    atmosphere: "night",
    beat: "End splash — egg / pulse / next road",
    artPrompt:
      "End splash, no text. Mira on Commons ridge looking toward distant Fracture glow; soft egg-shaped cyan reflection in her satchel glass vial; companions of legend as faint constellation shapes in sky. Hopeful cliffhanger.",
    panels: [
      {
        lines: [
          { kind: "narration", text: "The Commons keeps its name. The pulse keeps its secret.", x: 50, y: 14 },
          { kind: "speech", speaker: "Mira Eggwarden", text: "I'm still inviting. Don't make me regret waiting.", x: 40, y: 55, tail: "up" },
          { kind: "caption", text: "END OF ISSUE #001 — THE PULSE BELOW", x: 50, y: 82 },
        ],
      },
    ],
  },
]);

const FRONT = [
  {
    role: "front-cover",
    title: "The First Rift",
    artPrompt:
      "Premium fantasy comic COVER, no text/logos. Elara Venn with glowing egg before cyan Prime Gateway tear over mud that will be Commons; Bramblefox and Mossprig silhouettes. Earth tones, cyan accent. 3:4.",
  },
  {
    role: "inside-cover",
    title: "Inside front",
    artPrompt: "Quiet inside-cover atmosphere, no text. Soft Gateway glow through timber arch; invitation to read. Warm parchment light.",
  },
  {
    role: "credits",
    title: "Credits",
    artPrompt: "Lore-desk workshop, no readable text. Quills, cyan rift-ink, maps of Fracture roads, amber lantern.",
  },
  {
    role: "title",
    title: "THE PULSE BELOW",
    artPrompt:
      "Story title splash energy WITHOUT painted lettering. Mira at present Rift fringe dissolving into Elara-with-egg vision. Leave clear upper third for title lettering pass.",
  },
];

const BACK = [
  {
    role: "teaser",
    title: "Next: Spark's Journey",
    artPrompt: "Teaser plate, no text. Glowpup Spark on mossy hatchery path; Mira silhouette. Warm curiosity.",
  },
  {
    role: "inside-back",
    title: "Inside back",
    artPrompt: "Letters/mail atmosphere, no readable text. Wax seals, egg sketches, Compact pamphlet shapes.",
  },
  {
    role: "back-cover",
    title: "Back cover",
    artPrompt: "Back-cover vista of Riftwild Commons under soft riftlight, no text/logos. Premium comic finish.",
  },
];

function wipePages(dir) {
  const pages = path.join(dir, "pages");
  if (fs.existsSync(pages)) {
    for (const f of fs.readdirSync(pages)) {
      if (f.endsWith(".json")) fs.unlinkSync(path.join(pages, f));
    }
  }
}

function main() {
  ensureDir(ISSUE);
  wipePages(ISSUE);
  wipePages(ISSUE_SRC);
  for (const sub of ["pages", "prompts", "generated/clean", "generated/lettered", "reports", "fonts"]) {
    ensureDir(path.join(ISSUE, sub));
    ensureDir(path.join(ISSUE_SRC, sub));
  }
  ensureDir(path.join(PUB, "pages"));
  ensureDir(path.join(PUB, "covers"));

  // Private fonts note (NOT in /public)
  fs.writeFileSync(
    path.join(ISSUE, "fonts", "README.md"),
    `# Lettering fonts (private)

Place licensed/system lettering fonts here for the bake pipeline.

**Do NOT copy these into \`/public\`.** The reader only serves flattened page images.

Suggested: Georgia / Times locally via OS, or drop \`.ttf\` here and point \`LETTERING_FONT_PATH\` at this folder.
`,
    "utf8",
  );

  writeJson(path.join(ISSUE, "characters.json"), {
    characters: [
      {
        id: "mira-eggwarden",
        name: "Mira Eggwarden",
        role: "Present-day POV · Hatchery mentor",
        canon: "established",
        notes: "Frame narrator; not First Keeper.",
      },
      {
        id: "elara-venn",
        name: "Elara Venn",
        role: "First Keeper · vision lead",
        canon: "established",
        codexId: "wl-elara",
        npcId: "elara-venn",
      },
      {
        id: "first-riftling",
        name: "First Riftling",
        role: "Soft Exodus archive hatch",
        canon: "established-archetype",
      },
      { id: "healer", name: "Healer", role: "Commons founder", canon: "supporting" },
      { id: "crown-courier", name: "Crown courier", role: "Antagonistic offer", canon: "supporting" },
    ],
  });

  writeJson(path.join(ISSUE, "creatures.json"), {
    creatures: [
      { id: "bramblefox", name: "Bramblefox", ability: "Forest Bond", abilityId: "forest-bond", exists: true },
      { id: "mossprig", name: "Mossprig", ability: "Living Bulwark", abilityId: "living-bulwark", exists: true },
      { id: "thornling", name: "Thornling", ability: "Sprouting Energy", abilityId: "sprouting-energy", exists: true },
      { id: "wisplet", name: "Wisplet", ability: "Lantern Soft", abilityId: "lantern-soft", exists: true },
      { id: "emberfox", name: "Emberfox", ability: "Ashen Hide", abilityId: "ashen-hide", exists: true },
      { id: "ashwing", name: "Ashwing", ability: "Kindled Spirit", abilityId: "kindled-spirit", exists: true },
      {
        id: "spirit-moth",
        name: "Spirit Moth",
        ability: null,
        exists: "tcg-card-only",
        notes: "Cameo silhouette only; distinct from Citadelmoth.",
      },
    ],
  });

  const bookPages = [];
  let n = 1;
  const pushPage = (meta, story) => {
    const pageNumber = n++;
    const nn = String(pageNumber).padStart(3, "0");
    const page = {
      pageNumber,
      id: `the-first-rift-issue-001-p${nn}`,
      role: meta.role || "story",
      title: meta.title || story?.title || null,
      layout: story?.layout || (meta.role === "front-cover" || meta.role === "back-cover" || meta.role === "title" ? "splash" : "narrative"),
      atmosphere: story?.atmosphere || "dusk",
      beat: story?.beat || meta.title || meta.role,
      artPrompt: (story?.artPrompt || meta.artPrompt) + " Original Riftwilds IP only. NO dialogue text, captions, logos, watermarks, or UI in the image.",
      panels: story?.panels || [{ lines: meta.lines || [] }],
      generationStatus: "pending",
      letteringStatus: "pending",
      cleanArtRel: `generated/clean/page-${nn}.png`,
      letteredArtRel: `generated/lettered/page-${nn}.webp`,
      publicArtRel: `assets/comics/the-first-rift/issue-001/pages/page-${nn}.webp`,
      bakedLettering: true,
      composedPlate: true,
    };
    bookPages.push(page);
    writeJson(path.join(ISSUE, "pages", `page-${nn}.json`), page);
    fs.writeFileSync(
      path.join(ISSUE, "prompts", `page-${nn}.txt`),
      page.artPrompt + "\n",
      "utf8",
    );
  };

  for (const f of FRONT) {
    const lines =
      f.role === "inside-cover"
        ? [
            { kind: "caption", text: "Riftwilds Comic Publishing — original fantasy. No crypto required to read.", x: 50, y: 30 },
            { kind: "narration", text: "Credits & cosmetics may unlock along the way. The story itself stays free.", x: 50, y: 55 },
          ]
        : f.role === "credits"
          ? [
              { kind: "caption", text: "Story · Riftwilds Lore Desk", x: 50, y: 25 },
              { kind: "caption", text: "Art · Commons Archive plates + Grok pipeline", x: 50, y: 40 },
              { kind: "caption", text: "Lettering · Issue #001 engine (flattened)", x: 50, y: 55 },
              { kind: "narration", text: "Canon · World Codex · Riftling Codex · Legends of the Rift TCG", x: 50, y: 75 },
            ]
          : f.role === "title"
            ? [
                { kind: "caption", text: "LEGENDS OF THE RIFT · ISSUE #001", x: 50, y: 22 },
                { kind: "caption", text: "THE PULSE BELOW", x: 50, y: 42 },
                { kind: "narration", text: "A present-day Keeper touches an ancient tear — and the First Rift answers.", x: 50, y: 68 },
              ]
            : [
                { kind: "caption", text: "LEGENDS OF THE RIFT", x: 50, y: 18 },
                { kind: "caption", text: "THE FIRST RIFT", x: 50, y: 38 },
                { kind: "narration", text: "When the Prime broke, a courier chose to keep.", x: 50, y: 62 },
              ];
    pushPage({ ...f, lines }, null);
  }

  for (const s of STORY) pushPage({ role: "story" }, s);

  for (const b of BACK) {
    const lines =
      b.role === "teaser"
        ? [
            { kind: "caption", text: "NEXT ISSUE", x: 50, y: 20 },
            { kind: "caption", text: "SPARK'S JOURNEY", x: 50, y: 40 },
            { kind: "narration", text: "A Glowpup learns the road between hatchery and heart.", x: 50, y: 65 },
          ]
        : b.role === "inside-back"
          ? [
              { kind: "caption", text: "LETTERS FROM THE COMMONS", x: 50, y: 25 },
              { kind: "narration", text: "Write the Lore Desk. Keep invitations honest.", x: 50, y: 55 },
            ]
          : [
              { kind: "caption", text: "LEGENDS OF THE RIFT", x: 50, y: 30 },
              { kind: "narration", text: "Play the chapter in Live World when you are ready.", x: 50, y: 55 },
            ];
    pushPage({ ...b, lines }, null);
  }

  writeJson(path.join(ISSUE, "script.json"), {
    issueSlug: "the-first-rift",
    issueNumber: 1,
    storyTitle: "THE PULSE BELOW",
    themes: ["loyalty", "responsibility", "ancient betrayal"],
    pageCount: bookPages.length,
    storyPageCount: 25,
    pages: bookPages.map((p) => ({
      pageNumber: p.pageNumber,
      role: p.role,
      title: p.title,
      beat: p.beat,
      transcript: p.panels.flatMap((panel) =>
        (panel.lines || []).map((l) =>
          l.speaker ? `${l.kind.toUpperCase()} (${l.speaker}): ${l.text}` : `${l.kind.toUpperCase()}: ${l.text}`,
        ),
      ),
    })),
  });

  writeJson(path.join(ISSUE, "continuity.json"), {
    issueSlug: "the-first-rift",
    frame: "Mira Eggwarden present → Elara Venn vision → deliberate-Rift cliffhanger",
    mustNotContradict: [
      "Elara is First Keeper / courier founder (About + Codex)",
      "Soft Exodus eggs are becoming, not inventory",
      "Hatchery Compact: invite, wait, honest invitations",
      "Gateway Hearts ≠ travel stones",
    ],
    newTension: {
      claim: "The First Rift was deliberate",
      status: "story cliffhanger — pending Codex patch approval",
    },
    creatureAppearances: {
      bramblefox: [9],
      mossprig: [10],
      thornling: [11],
      wisplet: [12],
      emberfox: [13],
      ashwing: [13],
      "spirit-moth": [24],
    },
  });

  writeJson(path.join(ISSUE, "issue.json"), {
    schemaVersion: 1,
    slug: "the-first-rift",
    issueNumber: 1,
    issueId: "issue-001",
    title: "The First Rift",
    storyTitle: "THE PULSE BELOW",
    subtitle: "When the Prime broke, a courier chose to keep.",
    synopsis:
      "Present-day Hatchery mentor Mira Eggwarden finds an unstable ancient Rift near Riftwild Commons and is pulled into visions of Elara Venn's First Rift — egg, companions, Compact — until a cliffhanger reveals the opening was deliberate.",
    status: "in-production",
    pipeline: {
      art: "text-free Grok / cursor-local plate",
      lettering: "programmatic flatten (no HTML bubbles)",
    },
    structure: {
      frontCover: 1,
      insideFront: 1,
      credits: 1,
      title: 1,
      story: 25,
      teaser: 1,
      insideBack: 1,
      backCover: 1,
      total: bookPages.length,
    },
    covers: {
      standard: "covers/standard.webp",
      variantA: "covers/variant-a.webp",
      variantB: "covers/variant-b.webp",
      foil: "covers/foil.webp",
    },
    pages: bookPages.map((p) => ({
      pageNumber: p.pageNumber,
      role: p.role,
      file: `pages/page-${String(p.pageNumber).padStart(3, "0")}.json`,
      generationStatus: p.generationStatus,
      letteringStatus: p.letteringStatus,
      publicArtRel: p.publicArtRel,
    })),
    reader: {
      bakedLettering: true,
      hideHtmlBubbles: true,
      transcriptDrawer: true,
    },
  });

  // Generation status report seed
  writeJson(path.join(ISSUE, "reports", "GENERATION_STATUS.json"), {
    updatedAt: new Date().toISOString(),
    totalPages: bookPages.length,
    pendingArt: bookPages.length,
    pendingLettering: bookPages.length,
    resume:
      "npx tsx scripts/comics/run-issue-001-pipeline.mts --from=1 --to=32",
  });

  // Mirror JSON tree into src/content for docs co-location / IDE navigation
  const mirrorFiles = [
    "issue.json",
    "script.json",
    "continuity.json",
    "characters.json",
    "creatures.json",
    "THE_FIRST_RIFT_CANON_AUDIT.md",
  ];
  // Write canon audit into content root
  const auditSrc = path.join(ROOT, "src/content/comics/the-first-rift/issue-001/THE_FIRST_RIFT_CANON_AUDIT.md");
  if (fs.existsSync(auditSrc)) {
    fs.copyFileSync(auditSrc, path.join(ISSUE, "THE_FIRST_RIFT_CANON_AUDIT.md"));
  }
  for (const f of mirrorFiles) {
    const from = path.join(ISSUE, f);
    if (fs.existsSync(from)) fs.copyFileSync(from, path.join(ISSUE_SRC, f));
  }
  for (const f of fs.readdirSync(path.join(ISSUE, "pages"))) {
    fs.copyFileSync(path.join(ISSUE, "pages", f), path.join(ISSUE_SRC, "pages", f));
  }
  for (const f of fs.readdirSync(path.join(ISSUE, "prompts"))) {
    fs.copyFileSync(path.join(ISSUE, "prompts", f), path.join(ISSUE_SRC, "prompts", f));
  }

  console.log(`Bootstrapped ${bookPages.length} pages → ${path.relative(ROOT, ISSUE)}`);
  console.log(`Mirrored → ${path.relative(ROOT, ISSUE_SRC)}`);
}

main();
