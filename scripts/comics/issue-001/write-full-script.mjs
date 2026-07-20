/**
 * Emit complete The First Rift Issue #1 script + page JSON + prompts + continuity.
 *   node scripts/comics/issue-001/write-full-script.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const OUT = path.join(ROOT, "content/comics/the-first-rift/issue-001");

const STYLE =
  "Original high-energy Western fantasy comic storytelling with dynamic panel composition, dramatic inked linework, richly painted colors, expressive character acting, and clear cinematic action. Original Riftwilds IP only. Warm earth greens, sandstone, timber, moss first; cyan rift energy and amber hearth as accents only. NO purple AI-fantasy default. NO Marvel/DC/Pokémon characters or logos.";

const NEG =
  "readable dialogue text, captions, logos, watermarks, page numbers, UI chrome, Marvel, DC, Pokémon, manga screentone trademarks, extra limbs, duplicate characters, missing companions, purple neon fantasy default, photoreal modern clothing";

function balloon(kind, speaker, text, x, y, tail, extras = {}) {
  return {
    kind,
    speaker: speaker || undefined,
    text,
    x,
    y,
    tail,
    readOrder: extras.readOrder,
    maxWidthPct: extras.maxWidthPct ?? 34,
    ...extras,
  };
}

function panel(id, desc) {
  return { id, ...desc };
}

function pageBase(n, title, purpose, layout, panels, opts = {}) {
  const dialogue = [];
  const captions = [];
  const soundEffects = [];
  for (const p of panels) {
    for (const b of p.bubbles || []) {
      if (b.kind === "sfx") soundEffects.push({ panelId: p.id, ...b });
      else if (b.kind === "narration" || b.kind === "caption") captions.push({ panelId: p.id, ...b });
      else dialogue.push({ panelId: p.id, ...b });
    }
  }
  const grokPrompt = [
    STYLE,
    `Riftwilds comic "The First Rift" Issue #1, STORY PAGE ${n}/25 — ${title}.`,
    `Story purpose: ${purpose}`,
    `Layout: ${layout}. ${panels.length} panels with clear inked gutters.`,
    panels.map((p, i) => `Panel ${i + 1} (${p.id}): ${p.description}`).join(" "),
    `Characters: ${(opts.characters || ["cal-reed"]).join(", ")}. Creatures: ${(opts.creatures || []).join(", ")}.`,
    `Environment: ${opts.environment || "Riftwild Commons fringe"}. Time: ${opts.time || "dusk"}. Weather: ${opts.weather || "unnatural aurora"}.`,
    `Continuity: ${JSON.stringify(opts.continuity || {})}`,
    "Leave empty balloon-safe and narration-safe negative space in upper/lower panel corners. NO readable text of any kind in the artwork.",
  ].join(" ");

  return {
    pageNumber: n,
    bookRole: "story",
    title,
    storyPurpose: purpose,
    layout: { type: layout, panelCount: panels.length },
    panels,
    dialogue,
    captions,
    soundEffects,
    characters: opts.characters || ["cal-reed"],
    creatures: opts.creatures || [],
    continuity: opts.continuity || {},
    grokPrompt,
    negativePrompt: NEG,
    pageTurnObjective: opts.pageTurn || "Turn to continue.",
    letteringInstructions: opts.lettering || "Standard speech + narration; keep tails off faces.",
    generationStatus: "pending",
    letteringStatus: "pending",
    approvalStatus: "script-complete",
    artAlt: opts.artAlt || `${title} — The First Rift page ${n}`,
    atmosphere: opts.atmosphere || "dusk",
  };
}

const continuityTrack = [];
function cont(page, state) {
  continuityTrack.push({ page, ...state });
  return state;
}

const storyPages = [];

// ── PAGE 1 SPLASH ──────────────────────────────────────────
storyPages.push(
  pageBase(
    1,
    "The Pulse Below",
    "Establish Commons under abnormal aurora; companion senses danger first.",
    "splash",
    [
      panel("p1a", {
        description:
          "Full-bleed splash: Riftwild Commons plaza under an unnatural cyan-amber aurora. Cal Reed and Bramblefox silhouettes in foreground on the plaza stones. Lanterns flicker wrong. Bramblefox mid-turn toward the Elderwood fringe, ears sharp.",
        camera: "wide establishing, slight low angle",
        expressions: { cal: "awe", bramblefox: "alert" },
        bubbles: [
          balloon("narration", null, "Riftwild Commons never forgot the sky tearing — but tonight the earth answers back.", 50, 12, null, {
            maxWidthPct: 70,
            readOrder: 0,
          }),
          balloon("sfx", null, "THRUMMM", 68, 42, null, { readOrder: 1 }),
          balloon("creature", "Bramblefox", "*rrrk—!*", 28, 72, "up", { readOrder: 2 }),
        ],
      }),
    ],
    {
      characters: ["cal-reed"],
      creatures: ["bramblefox"],
      environment: "Riftwild Commons plaza",
      time: "night",
      weather: "unnatural aurora",
      atmosphere: "rift",
      continuity: cont(1, {
        keeper: { clothing: "clean field coat", injuries: [] },
        bramblefox: { healthState: "alert", injuries: [] },
        egg: { location: "none", crackLevel: 0 },
        chamberDamage: 0,
      }),
      pageTurn: "Companion turns toward the forest — why?",
      artAlt: "Commons under unnatural aurora; Cal and Bramblefox silhouettes",
    },
  ),
);

// PAGE 2
storyPages.push(
  pageBase(
    2,
    "Wrong Wind",
    "Companion agitation; environmental clues; Cal tries to calm Bramblefox.",
    "three-stack",
    [
      panel("p2a", {
        description: "Close on Bramblefox bristling; floating leaves reverse midair beside its nose.",
        camera: "close-up",
        bubbles: [
          balloon("speech", "Cal Reed", "Hey — easy. It's only wind.", 70, 28, "down-left", { readOrder: 0 }),
          balloon("creature", "Bramblefox", "*vine-hiss*", 30, 55, "up", { readOrder: 1 }),
        ],
      }),
      panel("p2b", {
        description: "Wide: reversed rain beads rising from plaza stones; glowing hairline cracks in cobble; silent birds frozen on a roof.",
        camera: "wide",
        bubbles: [
          balloon("narration", null, "Leaves climb. Rain forgets down. The plaza holds its breath.", 50, 18, null, {
            maxWidthPct: 60,
            readOrder: 2,
          }),
          balloon("sfx", null, "…hush…", 78, 60, null, { readOrder: 3 }),
        ],
      }),
      panel("p2c", {
        description: "Cal kneeling, hand out; Bramblefox tugging his sleeve toward the treeline.",
        camera: "medium",
        bubbles: [
          balloon("speech", "Cal Reed", "Okay. You lead. I follow.", 55, 30, "down", { readOrder: 4 }),
          balloon("thought", "Cal Reed", "If Bramblefox bolts, Solen's going to write a whole page about me.", 22, 70, "up-right", {
            readOrder: 5,
          }),
        ],
      }),
    ],
    {
      creatures: ["bramblefox"],
      continuity: cont(2, {
        keeper: { clothing: "clean field coat", injuries: [] },
        bramblefox: { healthState: "agitated", injuries: [] },
        egg: { location: "none", crackLevel: 0 },
      }),
      pageTurn: "They leave the safe path.",
    },
  ),
);

// PAGE 3
storyPages.push(
  pageBase(
    3,
    "Lantern Wings",
    "Wisplet and Spirit Moth guide; ancient symbol on stone.",
    "two-col",
    [
      panel("p3a", {
        description:
          "Spirit Moth drifts from elderwood shadows with soft lantern-wing glow; Wisplet phases beside it. Cal and Bramblefox stop on a root path.",
        camera: "medium wide",
        bubbles: [
          balloon("speech", "Cal Reed", "Wisplet? You're supposed to be in the Marsh lesson pens—", 40, 22, "down", {
            readOrder: 0,
          }),
          balloon("creature", "Wisplet", "*hummm*", 70, 48, "left", { readOrder: 1 }),
          balloon("sfx", null, "soft wing-chime", 55, 70, null, { readOrder: 2 }),
        ],
      }),
      panel("p3b", {
        description:
          "Cal's hand brushes an ancient standing stone carved with a three-arc Lattice-like sigil. Spirit Moth lands on the top edge. Cyan dust in the grooves.",
        camera: "close on stone + Cal hand",
        bubbles: [
          balloon("whisper", "Cal Reed", "That mark isn't in Solen's beginner Codex.", 35, 25, "down", { readOrder: 3 }),
          balloon("narration", null, "Some doors remember hands that have not been born yet.", 50, 82, null, {
            maxWidthPct: 55,
            readOrder: 4,
          }),
        ],
      }),
    ],
    {
      creatures: ["bramblefox", "wisplet", "spirit-moth"],
      continuity: cont(3, {
        keeper: { clothing: "clean field coat", injuries: [] },
        sigilSeen: true,
        egg: { location: "none", crackLevel: 0 },
      }),
      pageTurn: "The spirit guides lead into denser ruins.",
    },
  ),
);

// PAGE 4
storyPages.push(
  pageBase(
    4,
    "Root Roads",
    "Follow spirit guide through dense ruins; vertical tension panels.",
    "three-stack",
    [
      panel("p4a", {
        description: "Narrow vertical-feeling composition: roots like ribs; Spirit Moth ahead as a pale spark; Cal ducking under a fallen lintel.",
        camera: "tall tracking",
        bubbles: [
          balloon("speech", "Cal Reed", "These foundations aren't Commons work. Too old. Too… precise.", 50, 20, "down", {
            readOrder: 0,
          }),
        ],
      }),
      panel("p4b", {
        description: "Mossprig and Thornling catch up from the brush, alert. Bramblefox glances back acknowledging the Grove pack.",
        camera: "medium group",
        bubbles: [
          balloon("creature", "Mossprig", "*soft rustle*", 30, 40, "up", { readOrder: 1 }),
          balloon("creature", "Thornling", "*tik-tik*", 65, 45, "up", { readOrder: 2 }),
          balloon("speech", "Cal Reed", "Stay close. Grove pack rules — no heroes, no scattering.", 50, 75, "up", {
            readOrder: 3,
          }),
        ],
      }),
      panel("p4c", {
        description: "End panel: cyan light leaks from ahead through stone lattice; dust floats upward.",
        camera: "over-shoulder toward light",
        bubbles: [
          balloon("sfx", null, "RIFT-HUMMM", 60, 40, null, { readOrder: 4 }),
          balloon("thought", "Cal Reed", "Please be a lesson. Please don't be a Fracture.", 28, 70, "up", { readOrder: 5 }),
        ],
      }),
    ],
    {
      creatures: ["bramblefox", "mossprig", "thornling", "wisplet", "spirit-moth"],
      continuity: cont(4, {
        keeper: { clothing: "dusty field coat", injuries: [] },
        companionsPresent: ["bramblefox", "mossprig", "thornling", "wisplet", "spirit-moth"],
      }),
      pageTurn: "Light ahead — sealed door.",
    },
  ),
);

// PAGE 5
storyPages.push(
  pageBase(
    5,
    "The Sealed Door",
    "Sealed stone door with Riftkeeper symbols; companion activates it.",
    "grid-2x2",
    [
      panel("p5a", {
        description: "Massive sealed stone door with Riftkeeper glyphs and the three-arc sigil. Vines dead across the seam.",
        camera: "wide",
        bubbles: [
          balloon("narration", null, "A door built to be forgotten by cities that had not learned their names.", 50, 15, null, {
            maxWidthPct: 60,
            readOrder: 0,
          }),
        ],
      }),
      panel("p5b", {
        description: "Cal reading glyphs with a Codex slate; confused frown.",
        camera: "medium",
        bubbles: [
          balloon("speech", "Cal Reed", "Riftkeeper warding… pre-Commons. This shouldn't still have charge.", 50, 30, "down", {
            readOrder: 1,
          }),
        ],
      }),
      panel("p5c", {
        description: "Bramblefox places a paw on the sigil; green Forest Bond spark jumps unintentionally.",
        camera: "close paw + sigil",
        bubbles: [
          balloon("creature", "Bramblefox", "*yk!*", 30, 35, "down", { readOrder: 2 }),
          balloon("sfx", null, "LEAF-SNAP", 70, 50, null, { readOrder: 3 }),
          balloon("magic", "Grove", "Bond-touch… accepted?", 50, 75, null, { readOrder: 4 }),
        ],
      }),
      panel("p5d", {
        description: "Door seams blaze cyan; stone teeth unlocking; dust blast; Cal shields face.",
        camera: "dynamic tilt",
        bubbles: [
          balloon("shout", "Cal Reed", "Wait—!", 40, 30, "down", { readOrder: 5 }),
          balloon("sfx", null, "KRRRAAAK", 65, 55, null, { readOrder: 6 }),
        ],
      }),
    ],
    {
      creatures: ["bramblefox", "mossprig", "thornling", "wisplet", "spirit-moth"],
      continuity: cont(5, {
        keeper: { clothing: "dusty field coat", injuries: [] },
        doorState: "opening",
      }),
      pageTurn: "Chamber reveal next.",
    },
  ),
);

// PAGE 6 LARGE REVEAL
storyPages.push(
  pageBase(
    6,
    "Dormant Heart",
    "Chamber opens: dormant Rift above altar; egg beneath.",
    "splash",
    [
      panel("p6a", {
        description:
          "Vast reveal splash: circular chamber, dormant cyan Rift suspended like a vertical wound above a stone altar. Beneath the Rift, a pale shell egg with faint glyph veins. Companions clustered at Cal's legs. Empty upper caption zone.",
        camera: "wide cinematic reveal",
        bubbles: [
          balloon("narration", null, "Inside: a Rift that slept through the founding of every safe path.", 50, 10, null, {
            maxWidthPct: 65,
            readOrder: 0,
          }),
          balloon("whisper", "Cal Reed", "…There's an egg.", 30, 78, "up", { readOrder: 1 }),
          balloon("sfx", null, "…shell-song…", 70, 70, null, { readOrder: 2 }),
        ],
      }),
    ],
    {
      creatures: ["bramblefox", "mossprig", "thornling", "wisplet", "spirit-moth"],
      atmosphere: "ruin",
      continuity: cont(6, {
        egg: { location: "on altar under rift", crackLevel: 0, design: "pale glyph-veined shell" },
        riftState: "dormant",
      }),
      pageTurn: "Will they approach?",
    },
  ),
);

// PAGE 7
storyPages.push(
  pageBase(
    7,
    "Older Than Cities",
    "Keeper approaches; companions fear; place predates known cities.",
    "two-col",
    [
      panel("p7a", {
        description: "Cal steps toward altar; Mossprig grips his boot with mossy fingers; Thornling spines raised; Bramblefox low growl.",
        camera: "medium",
        bubbles: [
          balloon("speech", "Cal Reed", "I know. I see you. I'm not leaving it under that.", 55, 22, "down", {
            readOrder: 0,
          }),
          balloon("creature", "Mossprig", "*whuff*", 25, 60, "up", { readOrder: 1 }),
          balloon("creature", "Thornling", "*prrrik*", 75, 58, "up", { readOrder: 2 }),
        ],
      }),
      panel("p7b", {
        description: "Cal's face reflected in dormant Rift surface — for a flash, older architecture overlays the reflection.",
        camera: "close reflection",
        bubbles: [
          balloon("narration", null, "The stone remembers cities that never learned how to be kind.", 50, 15, null, {
            maxWidthPct: 55,
            readOrder: 3,
          }),
          balloon("thought", "Cal Reed", "Elara said the Fracture had a first night. What if it had a first hand?", 40, 72, "up", {
            readOrder: 4,
          }),
        ],
      }),
    ],
    {
      creatures: ["bramblefox", "mossprig", "thornling"],
      continuity: cont(7, {
        egg: { location: "on altar under rift", crackLevel: 0 },
        riftState: "stirring",
      }),
      pageTurn: "Rift about to activate.",
    },
  ),
);

// PAGE 8
storyPages.push(
  pageBase(
    8,
    "Shared Pull",
    "Rift activates; gravity shifts; pulled into shared vision.",
    "three-stack",
    [
      panel("p8a", {
        description: "Rift flares from dormant cyan to violent white-cyan; altar cracks; egg lifts an inch.",
        camera: "low angle up at rift",
        bubbles: [
          balloon("sfx", null, "FWOOOM", 50, 35, null, { readOrder: 0 }),
          balloon("shout", "Cal Reed", "Down—!", 30, 70, "up", { readOrder: 1 }),
        ],
      }),
      panel("p8b", {
        description: "Gravity skew: dust and Mossprig float sideways; Cal grabs egg instinctively to his chest.",
        camera: "dutch tilt action",
        bubbles: [
          balloon("speech", "Cal Reed", "I've got you— I've got you—", 60, 40, "down-left", { readOrder: 2 }),
          balloon("sfx", null, "WHUMP", 25, 65, null, { readOrder: 3 }),
        ],
      }),
      panel("p8c", {
        description: "Whiteout: characters silhouettes stretched into a vision tunnel of ancient light.",
        camera: "abstract tunnel",
        bubbles: [
          balloon("narration", null, "The Pulse Below opens a memory that does not belong to any living Keeper.", 50, 50, null, {
            maxWidthPct: 60,
            readOrder: 4,
          }),
        ],
      }),
    ],
    {
      creatures: ["bramblefox", "mossprig", "thornling", "wisplet", "spirit-moth"],
      atmosphere: "rift",
      continuity: cont(8, {
        egg: { location: "under Cal's left arm", crackLevel: 0 },
        riftState: "active-vision",
        keeper: { clothing: "dusty field coat", injuries: [], holdingEgg: true },
      }),
      pageTurn: "Vision begins.",
    },
  ),
);

// PAGE 9
storyPages.push(
  pageBase(
    9,
    "Before the Tear",
    "Vision: world before catastrophe; connected peaceful regions.",
    "wide",
    [
      panel("p9a", {
        description:
          "Vision palette (warmer gold): ancient Aeryndra panorama — linked gateways between verdant regions, no Fracture scars. Tiny companion flocks with ancient Keepers on bridges. Cal's translucent present-day outline ghosted at edge.",
        camera: "epic panorama",
        bubbles: [
          balloon("caption", null, "VISION — BEFORE", 18, 10, null, { readOrder: 0 }),
          balloon("narration", null, "Once the roads agreed with each other. Once the Gateways sang in one key.", 50, 20, null, {
            maxWidthPct: 65,
            readOrder: 1,
          }),
          balloon("whisper", "Cal Reed", "It's… beautiful.", 70, 75, "up", { readOrder: 2 }),
        ],
      }),
    ],
    {
      atmosphere: "day",
      continuity: cont(9, { visionBeat: "pre-catastrophe", egg: { location: "under Cal's left arm", crackLevel: 0 } }),
      pageTurn: "Ancient Keepers gather at the engine.",
    },
  ),
);

// PAGE 10
storyPages.push(
  pageBase(
    10,
    "Hands on the Engine",
    "Ancient Keepers around original Rift engine; secret ritual change.",
    "two-col",
    [
      panel("p10a", {
        description:
          "Ring of ancient Keepers around a crystalline Rift engine. Companion armies (including Emberfox and Ashwing silhouettes) stand ready. Ceremony light is orderly.",
        camera: "wide ceremonial",
        bubbles: [
          balloon("narration", null, "They called it Activation — a promise to feed the world forever.", 50, 12, null, {
            maxWidthPct: 60,
            readOrder: 0,
          }),
          balloon("caption", null, "Someone changes the rite.", 50, 85, null, { readOrder: 1 }),
        ],
      }),
      panel("p10b", {
        description:
          "Close: a hooded ancient hand adjusts a three-arc sigil plate on the engine while others look skyward — sabotage moment.",
        camera: "insert close-up",
        bubbles: [
          balloon("sfx", null, "click…", 40, 40, null, { readOrder: 2 }),
          balloon("thought", "Cal Reed", "That mark — it's the same as the stone.", 55, 70, "up", { readOrder: 3 }),
        ],
      }),
    ],
    {
      creatures: ["emberfox", "ashwing"],
      continuity: cont(10, { visionBeat: "ritual-altered", betrayerSigilConfirmed: true }),
      pageTurn: "Overload incoming.",
    },
  ),
);

// PAGE 11
storyPages.push(
  pageBase(
    11,
    "Containment Breaks",
    "Machine overloads; companion armies try to contain it.",
    "grid-2x2",
    [
      panel("p11a", {
        description: "Engine cracks with cyan-white overload; Keepers shout (no readable text painted).",
        camera: "wide chaos",
        bubbles: [
          balloon("sfx", null, "CRACKLE-VASH", 50, 40, null, { readOrder: 0 }),
          balloon("narration", null, "Power without consent becomes a wound.", 50, 15, null, { readOrder: 1 }),
        ],
      }),
      panel("p11b", {
        description: "Ashwing flock tries to shield civilians with ember-wing barriers; Emberfox herds children.",
        camera: "action mid",
        bubbles: [balloon("sfx", null, "SHIIING", 60, 50, null, { readOrder: 2 })],
      }),
      panel("p11c", {
        description: "Grove companions root into earth forming living nets around the engine — failing.",
        camera: "low",
        bubbles: [balloon("sfx", null, "GROOOWL", 40, 55, null, { readOrder: 3 })],
      }),
      panel("p11d", {
        description: "Eggs — Soft Exodus shells — begin to form midair as light condenses from screaming Gateways.",
        camera: "upward",
        bubbles: [
          balloon("narration", null, "Living stories fled into shells.", 50, 25, null, { readOrder: 4 }),
          balloon("sfx", null, "SHELL-SONG", 55, 70, null, { readOrder: 5 }),
        ],
      }),
    ],
    {
      creatures: ["emberfox", "ashwing", "bramblefox"],
      continuity: cont(11, { visionBeat: "overload" }),
      pageTurn: "Catastrophe splash.",
    },
  ),
);

// PAGE 12 SPLASH / SPREAD OPPORTUNITY
storyPages.push(
  pageBase(
    12,
    "The First Rift",
    "Catastrophe tears world; eggs scatter; companions protect civilians.",
    "splash",
    [
      panel("p12a", {
        description:
          "Full splash catastrophe: cities splitting along cyan seams, oceans heaving, eggs scattering through storm sky, elemental storms, ancient companions shielding civilians. Dramatic diagonal energy. Empty lower caption band.",
        camera: "epic catastrophe splash",
        bubbles: [
          balloon("narration", null, "The First Rift was not a weather. It was a choice that learned how to scream.", 50, 12, null, {
            maxWidthPct: 70,
            readOrder: 0,
          }),
          balloon("sfx", null, "KRRRAAAK", 35, 45, null, { readOrder: 1 }),
          balloon("sfx", null, "FWOOOM", 70, 55, null, { readOrder: 2 }),
          balloon("caption", null, "THE SKY LEARNS TO LAYER", 50, 88, null, { readOrder: 3 }),
        ],
      }),
    ],
    {
      atmosphere: "storm",
      creatures: ["ashwing", "emberfox", "bramblefox", "mossprig"],
      continuity: cont(12, { visionBeat: "catastrophe-peak" }),
      pageTurn: "Snap back to present — Rift awake.",
      lettering: "Big SFX; keep faces clear in lower third.",
    },
  ),
);

// PAGE 13
storyPages.push(
  pageBase(
    13,
    "Awake",
    "Return to present; Rift awakened; corruption spreads.",
    "two-col",
    [
      panel("p13a", {
        description:
          "Snap-back: chamber now corrupted — black-cyan veins crawl stone; dormant Rift becomes active vertical wound. Cal on knees clutching egg. Companions shake off vision.",
        camera: "medium chaotic",
        bubbles: [
          balloon("shout", "Cal Reed", "We're back— the Rift's awake!", 40, 25, "down", { readOrder: 0 }),
          balloon("creature", "Bramblefox", "*SNARL*", 70, 55, "left", { readOrder: 1 }),
          balloon("sfx", null, "RIFT-HUMMM", 55, 75, null, { readOrder: 2 }),
        ],
      }),
      panel("p13b", {
        description: "Corruption puddles birth incomplete husk silhouettes in the dark arches.",
        camera: "wide ominous",
        bubbles: [
          balloon("narration", null, "Wounds remember the shape of hunger.", 50, 18, null, { readOrder: 3 }),
          balloon("whisper", "Cal Reed", "It answered our companions. Our bond-light woke it.", 35, 70, "up", {
            readOrder: 4,
          }),
        ],
      }),
    ],
    {
      creatures: ["bramblefox", "mossprig", "thornling", "wisplet", "spirit-moth"],
      atmosphere: "rift",
      continuity: cont(13, {
        riftState: "awakened",
        chamberDamage: 1,
        egg: { location: "under Cal's left arm", crackLevel: 0 },
        corruptionSpreading: true,
      }),
      pageTurn: "Enemies emerge.",
    },
  ),
);

// PAGE 14
storyPages.push(
  pageBase(
    14,
    "Shapes in the Arch",
    "Corrupted creatures enter; silhouettes before full reveal.",
    "three-stack",
    [
      panel("p14a", {
        description: "Three corrupted husk silhouettes in archway — too many joints, Lattice veins glowing.",
        camera: "silhouette lineup",
        bubbles: [
          balloon("sfx", null, "…skritch…", 40, 50, null, { readOrder: 0 }),
          balloon("speech", "Cal Reed", "Not Riftlings. Not anything Solen catalogued.", 55, 20, "down", { readOrder: 1 }),
        ],
      }),
      panel("p14b", {
        description: "Partial reveal: one husk face like a cracked mask of moss and void light.",
        camera: "close horror",
        bubbles: [balloon("sfx", null, "GROOOWL", 60, 45, null, { readOrder: 2 })],
      }),
      panel("p14c", {
        description: "Cal backs to altar wall, egg protected; companions form a crescent.",
        camera: "medium defensive",
        bubbles: [
          balloon("speech", "Cal Reed", "Protect the egg. Protect each other. That's the whole plan.", 50, 25, "down", {
            readOrder: 3,
          }),
          balloon("creature", "Thornling", "*ready spines*", 70, 65, "up", { readOrder: 4 }),
        ],
      }),
    ],
    {
      creatures: ["bramblefox", "mossprig", "thornling"],
      continuity: cont(14, { enemies: "corrupted-husks-entering", chamberDamage: 1 }),
      pageTurn: "First attack.",
    },
  ),
);

// PAGE 15
storyPages.push(
  pageBase(
    15,
    "First Strike",
    "First attack; Keeper commands protect the egg.",
    "two-col",
    [
      panel("p15a", {
        description: "Husk lunges; claws rake stone where Cal stood a second ago; speed lines.",
        camera: "action",
        bubbles: [
          balloon("sfx", null, "WHUMP", 55, 40, null, { readOrder: 0 }),
          balloon("shout", "Cal Reed", "Bramblefox— flank!", 30, 25, "down", { readOrder: 1 }),
        ],
      }),
      panel("p15b", {
        description: "Cal clutched egg tight; small cut appears on his cheek from flying stone; determined eyes.",
        camera: "close",
        bubbles: [
          balloon("speech", "Cal Reed", "You don't get to eat a story that hasn't started.", 50, 30, "down", {
            readOrder: 2,
          }),
          balloon("thought", "Cal Reed", "Keep. Not own. Keep.", 40, 75, "up", { readOrder: 3 }),
        ],
      }),
    ],
    {
      creatures: ["bramblefox", "mossprig", "thornling"],
      continuity: cont(15, {
        keeper: {
          clothing: "dusty field coat",
          injuries: ["small cut on cheek"],
          holdingEgg: true,
        },
        egg: { location: "under Cal's left arm", crackLevel: 0 },
        chamberDamage: 2,
      }),
      pageTurn: "Forest Bond activates.",
    },
  ),
);

// PAGE 16 Forest Bond
storyPages.push(
  pageBase(
    16,
    "Forest Bond",
    "Bramblefox uses Forest Bond enabled by Nature allies present.",
    "three-stack",
    [
      panel("p16a", {
        description:
          "Bramblefox leaps; Mossprig and Thornling visible nearby (Nature presence). Green vine-light threads spiral from Bramblefox's thorn-tail into living armor.",
        camera: "dynamic leap",
        bubbles: [
          balloon("caption", null, "ABILITY · FOREST BOND", 50, 12, null, { readOrder: 0 }),
          balloon("narration", null, "When Nature stands together, the grove answers as armor — not a leash.", 50, 22, null, {
            maxWidthPct: 60,
            readOrder: 1,
          }),
          balloon("sfx", null, "LEAF-SNAP", 70, 55, null, { readOrder: 2 }),
        ],
      }),
      panel("p16b", {
        description: "Vine-light braces against husk claws; sparks of green vs cyan-black.",
        camera: "impact close",
        bubbles: [
          balloon("creature", "Bramblefox", "*vine-hum!*", 30, 40, "right", { readOrder: 3 }),
          balloon("magic", "Grove", "Bond accepted — roots remember both names.", 55, 70, null, { readOrder: 4 }),
        ],
      }),
      panel("p16c", {
        description: "Cal nods; egg safe; Bramblefox lands with scrape on front leg.",
        camera: "medium",
        bubbles: [
          balloon("speech", "Cal Reed", "That's it — Forest Bond! Hold the line!", 50, 28, "down", { readOrder: 5 }),
        ],
      }),
    ],
    {
      creatures: ["bramblefox", "mossprig", "thornling"],
      continuity: cont(16, {
        bramblefox: { healthState: "fighting", injuries: ["scrape on front leg"], forestBondActive: true },
        natureAlliesPresent: true,
      }),
      pageTurn: "Mossprig Living Bulwark.",
    },
  ),
);

// PAGE 17 Living Bulwark
storyPages.push(
  pageBase(
    17,
    "Living Bulwark",
    "Mossprig Living Bulwark protects Thornling and Keeper.",
    "two-col",
    [
      panel("p17a", {
        description:
          "Mossprig expands a living moss barrier dome covering Cal+egg and Thornling as a husk slam hits the bulwark.",
        camera: "wide defensive",
        bubbles: [
          balloon("caption", null, "ABILITY · LIVING BULWARK", 50, 10, null, { readOrder: 0 }),
          balloon("creature", "Mossprig", "*WHUFF—!*", 35, 45, "up", { readOrder: 1 }),
          balloon("sfx", null, "WHUMP", 70, 40, null, { readOrder: 2 }),
        ],
      }),
      panel("p17b", {
        description: "Inside the bulwark: Cal shields egg; Thornling looks up at Mossprig with trust; cracks spider across moss wall.",
        camera: "interior medium",
        bubbles: [
          balloon("speech", "Cal Reed", "I've got the egg. You've got us. That's enough.", 50, 25, "down", {
            readOrder: 3,
          }),
          balloon("narration", null, "A bulwark is a promise with weight.", 50, 80, null, { readOrder: 4 }),
        ],
      }),
    ],
    {
      creatures: ["mossprig", "thornling", "bramblefox"],
      continuity: cont(17, {
        mossprig: { healthState: "straining", livingBulwarkActive: true },
        keeper: { clothing: "mud-stained field coat", injuries: ["small cut on cheek"], holdingEgg: true },
      }),
      pageTurn: "Action splash coordination.",
    },
  ),
);

// PAGE 18 ACTION SPLASH
storyPages.push(
  pageBase(
    18,
    "Together",
    "Companions coordinate against large corrupted attacker; diagonal action.",
    "splash",
    [
      panel("p18a", {
        description:
          "Diagonal splash: oversized corrupted husk; Bramblefox vine-armored mid-leap, Mossprig bulwark shards, Thornling launching bloom sparks, Wisplet phasing through husk torso with spirit light. Cal at lower left clutching egg. Dynamic speed lines. Empty SFX zones.",
        camera: "dramatic diagonal splash",
        bubbles: [
          balloon("sfx", null, "FWOOOM", 55, 30, null, { readOrder: 0 }),
          balloon("sfx", null, "SHIIING", 72, 55, null, { readOrder: 1 }),
          balloon("shout", "Cal Reed", "Now— as one!", 22, 70, "right", { readOrder: 2 }),
          balloon("creature", "Wisplet", "*phase-chime*", 60, 75, "up", { readOrder: 3 }),
        ],
      }),
    ],
    {
      creatures: ["bramblefox", "mossprig", "thornling", "wisplet"],
      atmosphere: "rift",
      continuity: cont(18, {
        chamberDamage: 3,
        bramblefox: { healthState: "tired", injuries: ["scrape on front leg"] },
        mossprig: { healthState: "tired" },
      }),
      pageTurn: "Thornling Sprouting Energy.",
    },
  ),
);

// PAGE 19 Sprouting Energy
storyPages.push(
  pageBase(
    19,
    "Sprouting Energy",
    "Thornling Sprouting Energy feeds team for decisive action.",
    "three-stack",
    [
      panel("p19a", {
        description: "Thornling roots glow; natural amber-cyan Rift Energy blooms upward into allies.",
        camera: "hero medium on Thornling",
        bubbles: [
          balloon("caption", null, "ABILITY · SPROUTING ENERGY", 50, 12, null, { readOrder: 0 }),
          balloon("creature", "Thornling", "*bloom…!*", 40, 50, "up", { readOrder: 1 }),
          balloon("magic", "Grove", "Energy shared — grow the next breath.", 55, 75, null, { readOrder: 2 }),
        ],
      }),
      panel("p19b", {
        description: "Energy threads hit Bramblefox and Mossprig; second wind vine/moss surge topples the large husk.",
        camera: "wide payoff",
        bubbles: [
          balloon("sfx", null, "THRUMMM", 50, 40, null, { readOrder: 3 }),
          balloon("speech", "Cal Reed", "That's Sprouting Energy — spend it!", 30, 70, "up", { readOrder: 4 }),
        ],
      }),
      panel("p19c", {
        description: "Husk collapses into inert Lattice ash; chamber quieter for one beat.",
        camera: "aftermath",
        bubbles: [
          balloon("narration", null, "For a heartbeat, the wound listens.", 50, 30, null, { readOrder: 5 }),
        ],
      }),
    ],
    {
      creatures: ["thornling", "bramblefox", "mossprig"],
      continuity: cont(19, {
        thornling: { healthState: "spent", sproutingEnergyUsed: true },
        majorHusk: "down",
        egg: { location: "under Cal's left arm", crackLevel: 1 },
      }),
      pageTurn: "Sigil reveal via Spirit Moth.",
    },
  ),
);

// PAGE 20
storyPages.push(
  pageBase(
    20,
    "Sigil in the Wound",
    "Spirit Moth enters Rift; reveals concealed betrayer sigil.",
    "two-col",
    [
      panel("p20a", {
        description: "Spirit Moth flies into the active Rift surface; wings become constellation trails.",
        camera: "up toward rift",
        bubbles: [
          balloon("speech", "Cal Reed", "Spirit Moth— no, wait—!", 35, 70, "up", { readOrder: 0 }),
          balloon("sfx", null, "soft wing-chime", 60, 40, null, { readOrder: 1 }),
        ],
      }),
      panel("p20b", {
        description:
          "Inside Rift shimmer: the three-arc betrayer sigil burns clear; Spirit Moth returns trailing the afterimage onto chamber air for Cal to see.",
        camera: "reveal insert",
        bubbles: [
          balloon("narration", null, "The mark of a hand that wanted Activation more than mercy.", 50, 15, null, {
            maxWidthPct: 55,
            readOrder: 2,
          }),
          balloon("whisper", "Cal Reed", "Someone did this. On purpose.", 40, 75, "up", { readOrder: 3 }),
        ],
      }),
    ],
    {
      creatures: ["spirit-moth", "wisplet"],
      continuity: cont(20, { betrayerSigilRevealed: true, egg: { location: "under Cal's left arm", crackLevel: 1 } }),
      pageTurn: "Realize how to seal.",
    },
  ),
);

// PAGE 21
storyPages.push(
  pageBase(
    21,
    "Resonance",
    "Egg must return to resonance point to close Rift; egg cracks.",
    "three-stack",
    [
      panel("p21a", {
        description: "Cal studies altar glyphs matching egg veins; realization dawns.",
        camera: "medium",
        bubbles: [
          balloon("speech", "Cal Reed", "It closes if the egg returns to the resonance seat — not if we smash the Rift.", 50, 25, "down", {
            readOrder: 0,
            maxWidthPct: 40,
          }),
        ],
      }),
      panel("p21b", {
        description: "Egg in his arms shows first hairline crack; soft light leaks.",
        camera: "close egg",
        bubbles: [
          balloon("sfx", null, "soft crack", 50, 40, null, { readOrder: 1 }),
          balloon("thought", "Cal Reed", "Don't hatch into a war. Please.", 45, 70, "up", { readOrder: 2 }),
        ],
      }),
      panel("p21c", {
        description: "Remaining husks rally; Cal steps toward altar with egg; companions limp into guard positions.",
        camera: "wide",
        bubbles: [
          balloon("speech", "Cal Reed", "Cover me. I'm putting it home.", 50, 30, "down", { readOrder: 3 }),
          balloon("creature", "Bramblefox", "*tired yip*", 25, 65, "up", { readOrder: 4 }),
        ],
      }),
    ],
    {
      creatures: ["bramblefox", "mossprig", "thornling"],
      continuity: cont(21, {
        egg: { location: "under Cal's left arm", crackLevel: 1 },
        plan: "return-egg-to-resonance",
      }),
      pageTurn: "Sealing gauntlet.",
    },
  ),
);

// PAGE 22
storyPages.push(
  pageBase(
    22,
    "At Cost",
    "Companions defend sealing attempt; exhaustion, injury, loyalty.",
    "grid-2x2",
    [
      panel("p22a", {
        description: "Bramblefox intercepts a husk; Forest Bond flickering; more scrapes.",
        camera: "action",
        bubbles: [
          balloon("creature", "Bramblefox", "*rrrk!*", 40, 40, "down", { readOrder: 0 }),
          balloon("sfx", null, "LEAF-SNAP", 65, 55, null, { readOrder: 1 }),
        ],
      }),
      panel("p22b", {
        description: "Mossprig Living Bulwark cracks; Mossprig winces but holds.",
        camera: "medium",
        bubbles: [balloon("creature", "Mossprig", "*…whuff*", 50, 45, "up", { readOrder: 2 })],
      }),
      panel("p22c", {
        description: "Cal places egg onto resonance seat; cyan light syncs; his cheek cut bleeds more from grit.",
        camera: "close hands+egg",
        bubbles: [
          balloon("speech", "Cal Reed", "You're not a weapon. You're a keep.", 50, 25, "down", { readOrder: 3 }),
        ],
      }),
      panel("p22d", {
        description: "Thornling last Sprouting Energy spark into the seal; spines drooping exhausted.",
        camera: "low hero",
        bubbles: [
          balloon("narration", null, "Loyalty is a stance you hold when your legs want to leave.", 50, 80, null, {
            readOrder: 4,
          }),
        ],
      }),
    ],
    {
      creatures: ["bramblefox", "mossprig", "thornling"],
      continuity: cont(22, {
        keeper: {
          clothing: "mud-stained, left sleeve torn",
          injuries: ["small cut on cheek", "scraped knuckles"],
          leftSleeve: "torn",
        },
        bramblefox: { healthState: "exhausted", injuries: ["scrape on front leg", "torn ear tip"] },
        mossprig: { healthState: "exhausted" },
        thornling: { healthState: "exhausted" },
        egg: { location: "resonance seat", crackLevel: 1 },
      }),
      pageTurn: "Rift closes; collapse.",
    },
  ),
);

// PAGE 23
storyPages.push(
  pageBase(
    23,
    "Seal / Collapse",
    "Rift closes; chamber collapses; Keeper escapes with egg.",
    "three-stack",
    [
      panel("p23a", {
        description: "Rift stitches shut with a reverse inhale of light; husks dissolve to ash.",
        camera: "wide",
        bubbles: [
          balloon("sfx", null, "THRUMMM…", 50, 40, null, { readOrder: 0 }),
          balloon("narration", null, "The wound closes — for now.", 50, 15, null, { readOrder: 1 }),
        ],
      }),
      panel("p23b", {
        description: "Ceiling begins to fall; Cal scoops egg back under arm; runs; companions scramble.",
        camera: "tracking run",
        bubbles: [
          balloon("shout", "Cal Reed", "Move—!", 40, 30, "down", { readOrder: 2 }),
          balloon("sfx", null, "KRRRAAAK", 70, 55, null, { readOrder: 3 }),
        ],
      }),
      panel("p23c", {
        description: "Exit burst into night forest; dust plume behind; egg glowing softly in Cal's arms.",
        camera: "exterior emerge",
        bubbles: [balloon("creature", "Wisplet", "*hum…*", 60, 40, "left", { readOrder: 4 })],
      }),
    ],
    {
      creatures: ["bramblefox", "mossprig", "thornling", "wisplet", "spirit-moth"],
      continuity: cont(23, {
        riftState: "sealed",
        chamberDamage: 5,
        egg: { location: "under Cal's left arm", crackLevel: 1 },
        escaped: true,
      }),
      pageTurn: "Quiet aftermath.",
    },
  ),
);

// PAGE 24
storyPages.push(
  pageBase(
    24,
    "Heartbeat",
    "Quiet aftermath; egg heartbeat; promise to protect.",
    "two-col",
    [
      panel("p24a", {
        description:
          "Quiet clearing at Commons fringe dawn-edge. Exhausted companions rest against Cal. Egg emits a visible soft heartbeat pulse of light. Mira Shellbright approaches from path with lantern.",
        camera: "soft wide",
        bubbles: [
          balloon("narration", null, "Dawn tries again — carefully.", 50, 12, null, { readOrder: 0 }),
          balloon("sfx", null, "…thum… thum…", 55, 45, null, { readOrder: 1 }),
          balloon("speech", "Mira Shellbright", "Cal Reed. That shell is singing. Quiet steps.", 30, 70, "up", {
            readOrder: 2,
          }),
        ],
      }),
      panel("p24b", {
        description: "Close: Cal forehead to egg; tear-streaked dirt; companions watching with soft eyes.",
        camera: "intimate close",
        bubbles: [
          balloon("speech", "Cal Reed", "I'll keep you. Not own you. I swear it on the Pulse.", 50, 30, "down", {
            readOrder: 3,
          }),
          balloon("creature", "Bramblefox", "*soft rrk*", 70, 70, "up", { readOrder: 4 }),
        ],
      }),
    ],
    {
      characters: ["cal-reed", "mira-shellbright"],
      creatures: ["bramblefox", "mossprig", "thornling"],
      atmosphere: "dawn",
      continuity: cont(24, {
        egg: { location: "in Cal's arms", crackLevel: 1, heartbeat: true },
        location: "Commons fringe clearing",
      }),
      pageTurn: "Cliffhanger observer.",
    },
  ),
);

// PAGE 25 CLIFFHANGER
storyPages.push(
  pageBase(
    25,
    "Only the Beginning",
    "Hidden observer with matching sigil; First Rift was deliberate; TO BE CONTINUED.",
    "splash",
    [
      panel("p25a", {
        description:
          "Distant ridge overlooking Commons dawn. Hooded Observer holds a medallion with the identical three-arc betrayer sigil, glowing faintly. Tiny Cal group in valley far below. Ominous negative space for final captions.",
        camera: "over-shoulder of observer toward Commons",
        bubbles: [
          balloon("narration", null, "Far from the clearing, a matching mark warms in a waiting hand.", 50, 12, null, {
            maxWidthPct: 60,
            readOrder: 0,
          }),
          balloon("speech", "Hooded Observer", "Good. The Pulse remembers how to open.", 55, 40, "down-left", {
            readOrder: 1,
          }),
          balloon("caption", null, "THE FIRST RIFT WAS ONLY THE BEGINNING.", 50, 72, null, {
            maxWidthPct: 70,
            readOrder: 2,
          }),
          balloon("caption", null, "TO BE CONTINUED IN ISSUE #2", 50, 86, null, { maxWidthPct: 55, readOrder: 3 }),
        ],
      }),
    ],
    {
      characters: ["hooded-observer"],
      creatures: [],
      atmosphere: "dawn",
      continuity: cont(25, {
        observerHasSigil: true,
        cliffhanger: "first-rift-deliberate",
        egg: { location: "with Cal", crackLevel: 1 },
      }),
      pageTurn: "End issue — teaser follows.",
    },
  ),
);

// ── Front / back matter book pages (not story 1-25) ─────────
function matterPage(bookPage, role, title, panels, opts = {}) {
  return {
    pageNumber: bookPage,
    storyPageNumber: null,
    bookRole: role,
    title,
    storyPurpose: opts.purpose || role,
    layout: { type: opts.layout || "splash", panelCount: panels.length },
    panels,
    dialogue: panels.flatMap((p) => (p.bubbles || []).filter((b) => !["sfx", "narration", "caption"].includes(b.kind))),
    captions: panels.flatMap((p) => (p.bubbles || []).filter((b) => ["narration", "caption"].includes(b.kind))),
    soundEffects: panels.flatMap((p) => (p.bubbles || []).filter((b) => b.kind === "sfx")),
    characters: opts.characters || [],
    creatures: opts.creatures || [],
    continuity: {},
    grokPrompt: `${STYLE} Riftwilds comic book ${role} page for The First Rift Issue #1 — ${title}. ${panels.map((p) => p.description).join(" ")} Empty zones for title lettering. NO readable text in art.`,
    negativePrompt: NEG,
    generationStatus: "pending",
    letteringStatus: "pending",
    approvalStatus: "script-complete",
    artAlt: opts.artAlt || title,
    atmosphere: opts.atmosphere || "rift",
    credits: opts.credits,
    letteringInstructions: opts.lettering || "Bake titles/credits programmatically.",
  };
}

const book = [];
let bp = 1;

book.push(
  matterPage(
    bp++,
    "front-cover",
    "The First Rift — Cover",
    [
      panel("cover", {
        description:
          "Dramatic cover composition: Cal Reed holding glyph egg, Bramblefox/Mossprig/Thornling at sides, awakened cyan Rift behind, Spirit Moth above. Space at top for logo/title, bottom for issue box. Original Riftwilds trade dress — not Marvel/DC.",
        bubbles: [
          balloon("caption", null, "RIFTWILDS", 50, 8, null),
          balloon("caption", null, "THE FIRST RIFT", 50, 18, null),
          balloon("caption", null, "ISSUE #1", 50, 88, null),
        ],
      }),
    ],
    { purpose: "Front cover", creatures: ["bramblefox", "mossprig", "thornling", "spirit-moth"], characters: ["cal-reed"] },
  ),
);

book.push(
  matterPage(
    bp++,
    "inside-cover",
    "Inside Front Cover",
    [
      panel("ifc", {
        description: "Quiet parchment atmosphere, soft Gateway glow, Riftwilds emblem space, invitation to read. No busy cast.",
        bubbles: [
          balloon(
            "narration",
            null,
            "Legends of the Rift — stories of Keepers, companions, and the wounds that made the world layered. The First Rift Issue #1. Fiction within the Riftwilds game world. © Riftwilds. Play: Archive Shelves · Live World Commons.",
            50,
            40,
            null,
            { maxWidthPct: 70 },
          ),
        ],
      }),
    ],
    { purpose: "Series intro + legal" },
  ),
);

book.push(
  matterPage(
    bp++,
    "credits",
    "Credits",
    [
      panel("cred", {
        description: "Workshop / lore-desk vignette: quills, rift-ink, maps — empty center for credits lettering.",
        bubbles: [
          balloon(
            "caption",
            null,
            "Story & Script: Riftwilds Narrative Studio · Art Direction: Riftwilds · Illustration: AI-assisted (Grok) + studio direction · Lettering: Programmatic Riftwilds lettering engine · Editing / Lore: Canon desk · Game Design: Riftwilds systems · Created by: Riftwilds · Special Thanks: Keepers who chose care first",
            50,
            45,
            null,
            { maxWidthPct: 70 },
          ),
        ],
      }),
    ],
    {
      purpose: "Credits with AI disclosure",
      credits: {
        story: "Riftwilds Narrative Studio",
        script: "Riftwilds Narrative Studio",
        artDirection: "Riftwilds",
        illustration: "AI-assisted (Grok image generation) under studio direction",
        lettering: "Programmatic lettering engine",
        editing: "Canon desk",
        gameDesign: "Riftwilds",
        createdBy: "Riftwilds",
        specialThanks: "Keepers who chose care first",
        aiDisclosure: "Illustration is AI-assisted; lettering and script are studio-authored.",
      },
    },
  ),
);

book.push(
  matterPage(
    bp++,
    "title",
    "Chapter One — The Pulse Below",
    [
      panel("title", {
        description:
          "Dramatic establishing: Commons aurora edge and sealed forest path. Large empty title band center for THE FIRST RIFT / CHAPTER ONE / THE PULSE BELOW.",
        bubbles: [
          balloon("caption", null, "THE FIRST RIFT", 50, 30, null),
          balloon("caption", null, "CHAPTER ONE", 50, 42, null),
          balloon("caption", null, "“THE PULSE BELOW”", 50, 54, null),
          balloon(
            "narration",
            null,
            "A junior Keeper follows a companion's fear into a chamber the Commons was never meant to reopen.",
            50,
            75,
            null,
            { maxWidthPct: 60 },
          ),
        ],
      }),
    ],
    { purpose: "Story title page", characters: ["cal-reed"], creatures: ["bramblefox"] },
  ),
);

const storyStartBookPage = bp;
for (const sp of storyPages) {
  book.push({
    ...sp,
    pageNumber: bp,
    storyPageNumber: sp.pageNumber,
    bookRole: "story",
  });
  bp++;
}

book.push(
  matterPage(
    bp++,
    "teaser",
    "Next Issue Teaser",
    [
      panel("teaser", {
        description:
          "Ominous new location tease: shadowed Celestora-adjacent archive stacks OR Alloy-adjacent machine silhouette; partial creature silhouette with Lattice veins; empty text bands.",
        bubbles: [
          balloon("caption", null, "NEXT", 50, 15, null),
          balloon("narration", null, "The mark has a keeper. The ledger has missing pages.", 50, 40, null, {
            maxWidthPct: 55,
          }),
          balloon("caption", null, "CONTINUE IN ISSUE #2 — COMING SOON", 50, 80, null),
        ],
      }),
    ],
    { purpose: "Issue #2 tease — no full spoilers" },
  ),
);

book.push(
  matterPage(
    bp++,
    "profile",
    "Keeper Profile — Cal Reed",
    [
      panel("prof", {
        description: "Character profile plate: Cal Reed three-quarter portrait with empty text panels for bio lettering; Bramblefox small at feet.",
        bubbles: [
          balloon(
            "caption",
            null,
            "CAL REED — Junior Keeper · Codex student under Archivist Solen. Curious, loyal, refuses to abandon becoming lives. Comic POV for Issue #1 (see canon audit).",
            50,
            70,
            null,
            { maxWidthPct: 65 },
          ),
        ],
      }),
    ],
    { characters: ["cal-reed"], creatures: ["bramblefox"] },
  ),
);

book.push(
  matterPage(
    bp++,
    "profile",
    "Companion Profile — Bramblefox",
    [
      panel("cprof", {
        description: "Bramblefox profile with Forest Bond vine-light visual diagram space (no readable UI).",
        bubbles: [
          balloon(
            "caption",
            null,
            "BRAMBLEFOX — Grove · Forest Bond: living vine-light armor when Nature allies stand near. Scout heart. Card: rotr-c-bramblefox.",
            50,
            75,
            null,
            { maxWidthPct: 65 },
          ),
        ],
      }),
    ],
    { creatures: ["bramblefox"] },
  ),
);

book.push(
  matterPage(
    bp++,
    "lore",
    "Codex — Pulse Below Chamber",
    [
      panel("codex", {
        description: "Illustrated Codex plate of the chamber Rift and three-arc sigil; parchment margins for entry text.",
        bubbles: [
          balloon(
            "narration",
            null,
            "CODEX ENTRY (DRAFT): Pulse Below — sealed Riftkeeper chamber near Commons. Dormant Rift responds to companion bond-energy. Associated sigil matches Activation-era sabotage marks. Status: sealed by Cal Reed field team; monitoring required.",
            50,
            50,
            null,
            { maxWidthPct: 70 },
          ),
        ],
      }),
    ],
  ),
);

book.push(
  matterPage(
    bp++,
    "lore",
    "Ability Spotlight — Forest Bond",
    [
      panel("abil", {
        description: "Ability spotlight art: Bramblefox + Mossprig/Thornling enabling vine armor; empty caption boxes.",
        bubbles: [
          balloon(
            "narration",
            null,
            "FOREST BOND — When another Nature companion is present, Bramblefox wraps allies in living vine-light. Not a leash. Not fire. Grove answering grove.",
            50,
            55,
            null,
            { maxWidthPct: 65 },
          ),
        ],
      }),
    ],
    { creatures: ["bramblefox", "mossprig", "thornling"] },
  ),
);

book.push(
  matterPage(
    bp++,
    "map",
    "World Map — Commons & Chamber",
    [
      panel("map", {
        description:
          "Stylized in-world map: Riftwild Commons plaza marked, Elderwood fringe path, X for Pulse Below chamber northwest. Decorative, empty legend boxes.",
        bubbles: [
          balloon("caption", null, "RIFTWILD COMMONS · PULSE BELOW CHAMBER (SEALED)", 50, 85, null, {
            maxWidthPct: 70,
          }),
        ],
      }),
    ],
  ),
);

book.push(
  matterPage(
    bp++,
    "letters",
    "Editor's Welcome",
    [
      panel("letters", {
        description: "Letters-page layout with empty columns; warm desk lamp; egg motif watermark.",
        bubbles: [
          balloon(
            "narration",
            null,
            "EDITOR'S WELCOME — Thank you for opening Issue #1. Send future Keeper letters to the Archive Shelves desk. This page will host reader mail once the shelves are full. Until then: care first.",
            50,
            45,
            null,
            { maxWidthPct: 70 },
          ),
        ],
      }),
    ],
  ),
);

book.push(
  matterPage(
    bp++,
    "inside-cover",
    "Inside Back Cover",
    [
      panel("ibc", {
        description: "Quiet night Commons silhouette; soft cyan afterglow on horizon; space for house ads.",
        bubbles: [
          balloon(
            "narration",
            null,
            "Continue the story in Live World · Study companions in the Riftling Codex · Build with care in Deck Atelier.",
            50,
            50,
            null,
            { maxWidthPct: 60 },
          ),
        ],
      }),
    ],
  ),
);

book.push(
  matterPage(
    bp++,
    "back-cover",
    "Back Cover — Keeper Recruitment",
    [
      panel("bc", {
        description:
          "In-universe Riftkeeper recruitment poster art: warm lantern plaza, companions at side, empty poster text zones. Clearly fictional in-world ad energy — no gambling.",
        bubbles: [
          balloon("caption", null, "WANTED: KEEPERS WHO LISTEN", 50, 20, null),
          balloon(
            "narration",
            null,
            "Riftwild Commons Hatchery Compact: Invite. Wait. Keep the invitation honest. (In-world advertisement · not a real-money offer.)",
            50,
            70,
            null,
            { maxWidthPct: 65 },
          ),
        ],
      }),
    ],
  ),
);

// Write files
fs.mkdirSync(path.join(OUT, "pages"), { recursive: true });
fs.mkdirSync(path.join(OUT, "prompts"), { recursive: true });
fs.mkdirSync(path.join(OUT, "reports"), { recursive: true });

const script = {
  title: "The First Rift",
  issue: 1,
  subtitle: "The Pulse Below",
  protagonist: "Cal Reed",
  synopsis:
    "Junior Keeper Cal Reed follows Bramblefox to a sealed chamber near Riftwild Commons, where a dormant Rift and resonance egg trigger visions of the deliberate First Rift catastrophe. Grove companions fight with Forest Bond, Living Bulwark, and Sprouting Energy to reseal the wound — while a hooded observer proves the awakening was intentional.",
  themes: ["loyalty", "fear", "responsibility", "discovery", "ancient betrayal"],
  storyPageCount: 25,
  bookPageCount: book.length,
  storyStartBookPage,
  pages: storyPages,
};

fs.writeFileSync(path.join(OUT, "script.json"), JSON.stringify(script, null, 2));
fs.writeFileSync(path.join(OUT, "continuity.json"), JSON.stringify({ pages: continuityTrack }, null, 2));

const issue = {
  slug: "the-first-rift",
  issueNumber: 1,
  title: "The First Rift",
  subtitle: "Chapter One — The Pulse Below",
  synopsis: script.synopsis,
  publishedAt: "2026-07-20",
  status: "published",
  storyPageCount: 25,
  bookPageCount: book.length,
  estimatedReadMinutes: 18,
  protagonist: "Cal Reed",
  featuredCreatures: ["Bramblefox", "Mossprig", "Thornling", "Wisplet", "Spirit Moth"],
  locations: ["Riftwild Commons", "Pulse Below Chamber", "Vision: Pre-Fracture Aeryndra"],
  pipeline: {
    artProvider: "grok",
    lettering: "programmatic",
    bakedLettering: true,
    contentRoot: "content/comics/the-first-rift/issue-001",
  },
  bookPages: book.map((p) => ({
    pageNumber: p.pageNumber,
    storyPageNumber: p.storyPageNumber,
    role: p.bookRole,
    title: p.title,
  })),
};

fs.writeFileSync(path.join(OUT, "issue.json"), JSON.stringify(issue, null, 2));

for (const p of book) {
  const num = String(p.pageNumber).padStart(3, "0");
  fs.writeFileSync(path.join(OUT, "pages", `page-${num}.json`), JSON.stringify(p, null, 2));
  fs.writeFileSync(path.join(OUT, "prompts", `page-${num}.prompt.txt`), `${p.grokPrompt}\n\nNEGATIVE:\n${p.negativePrompt}\n`);
}

console.log(`Wrote ${book.length} book pages (${storyPages.length} story) to ${OUT}`);
console.log(`Story starts at book page ${storyStartBookPage}`);
