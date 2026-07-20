/**
 * Emit complete Spark's Journey Issue #2 script + page JSON + prompts + continuity.
 *   node scripts/comics/issue-002/write-full-script.mjs
 *
 * Does NOT touch the-first-rift / issue-001 trees.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const OUT = path.join(ROOT, "content/comics/sparks-journey/issue-002");

const STYLE =
  "Original high-energy Western fantasy comic storytelling with dynamic panel composition, dramatic inked linework, richly painted colors, expressive character acting, and clear cinematic action. Original Riftwilds IP only. Warm earth greens, sandstone, timber, moss first; cyan rift energy and amber hearth as accents only. NO purple AI-fantasy default. NO Marvel/DC/Pokémon characters or logos.";

const NEG =
  "readable dialogue text, captions, logos, watermarks, page numbers, UI chrome, Marvel, DC, Pokémon, manga screentone trademarks, extra limbs, duplicate characters, missing companions, purple neon fantasy default, photoreal modern clothing, Pikachu lookalike";

const SPARK_LOOK =
  "Spark the Glowpup-line Riftborn hatchling: soft luminous fur, cyan-gold rift markings, large expressive eyes, small crystal growths, glowing-tip emotional tail, unstable glow when frightened, steadier aura when bonded; cute but original — not a franchise mascot";

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
  let order = 0;
  for (const p of panels) {
    for (const b of p.bubbles || []) {
      if (b.readOrder == null) b.readOrder = order++;
      if (b.kind === "sfx") soundEffects.push({ panelId: p.id, ...b });
      else if (b.kind === "narration" || b.kind === "caption") captions.push({ panelId: p.id, ...b });
      else dialogue.push({ panelId: p.id, ...b });
    }
  }
  const grokPrompt = [
    STYLE,
    `Riftwilds comic "Spark's Journey" Issue #2, STORY PAGE ${n}/25 — ${title}.`,
    `Story purpose: ${purpose}`,
    `Layout: ${layout}. ${panels.length} panels with clear inked gutters.`,
    panels.map((p, i) => `Panel ${i + 1} (${p.id}): ${p.description}`).join(" "),
    `Characters: ${(opts.characters || ["mira-eggwarden"]).join(", ")}. Creatures: ${(opts.creatures || []).join(", ")}.`,
    `Spark design lock: ${SPARK_LOOK}.`,
    `Environment: ${opts.environment || "Riftwild Commons fringe"}. Time: ${opts.time || "dawn"}. Weather: ${opts.weather || "post-storm clear"}.`,
    `Lighting: ${opts.lighting || "soft dawn amber with cyan accents"}. Continuity: ${JSON.stringify(opts.continuity || {})}`,
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
    characters: opts.characters || ["mira-eggwarden"],
    creatures: opts.creatures || [],
    continuity: opts.continuity || {},
    grokPrompt,
    negativePrompt: NEG,
    pageTurnObjective: opts.pageTurn || "Turn to continue.",
    letteringInstructions: opts.lettering || "Standard speech + narration; keep tails off faces and Spark's eyes.",
    generationStatus: "pending",
    letteringStatus: "pending",
    approvalStatus: "script-complete",
    artAlt: opts.artAlt || `${title} — Spark's Journey page ${n}`,
    atmosphere: opts.atmosphere || "dawn",
    transcript: buildTranscript(panels),
  };
}

function buildTranscript(panels) {
  const lines = [];
  for (const p of panels) {
    for (const b of p.bubbles || []) {
      if (b.speaker) lines.push(`${b.kind.toUpperCase()} (${b.speaker}): ${b.text}`);
      else lines.push(`${b.kind.toUpperCase()}: ${b.text}`);
    }
  }
  return lines;
}

function matterPage(n, role, title, panels, opts = {}) {
  const dialogue = [];
  const captions = [];
  const soundEffects = [];
  let order = 0;
  for (const p of panels) {
    for (const b of p.bubbles || []) {
      if (b.readOrder == null) b.readOrder = order++;
      if (b.kind === "sfx") soundEffects.push({ panelId: p.id, ...b });
      else if (b.kind === "narration" || b.kind === "caption") captions.push({ panelId: p.id, ...b });
      else dialogue.push({ panelId: p.id, ...b });
    }
  }
  const grokPrompt = [
    STYLE,
    `Riftwilds comic book ${role} page for Spark's Journey Issue #2 — ${title}.`,
    panels.map((p) => p.description).join(" "),
    "Empty zones for title lettering. NO readable text in art.",
  ].join(" ");

  return {
    pageNumber: n,
    storyPageNumber: null,
    bookRole: role,
    title,
    storyPurpose: title,
    layout: { type: opts.layout || "splash", panelCount: panels.length },
    panels,
    dialogue,
    captions,
    soundEffects,
    characters: opts.characters || [],
    creatures: opts.creatures || [],
    continuity: opts.continuity || {},
    grokPrompt,
    negativePrompt: NEG,
    generationStatus: "pending",
    letteringStatus: "pending",
    approvalStatus: "script-complete",
    artAlt: title,
    atmosphere: opts.atmosphere || "day",
    letteringInstructions: "Bake titles/credits programmatically.",
    transcript: buildTranscript(panels),
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
    "The Pulse Did Not End",
    "Dawn aftermath; Mira with cracked pulse-egg; hatch begins.",
    "splash",
    [
      panel("p1a", {
        description:
          "Full-page splash: dawn over Riftwild Commons hatchery fringe after Issue #1's Second Pulse night. Mira Eggwarden (practical hatchery robes, egg-care satchel) sits cradling the pulse-egg with soft cyan-gold glow — the invitation she refused to abandon. Bramblefox rests nearby. Visible new crack spidering across shell. Space for top caption.",
        camera: "wide heroic dawn",
        bubbles: [
          balloon("narration", null, "The storm ended before sunrise. The pulse did not.", 50, 12, null, {
            maxWidthPct: 70,
          }),
          balloon("sfx", null, "shell-song…", 58, 48, null),
          balloon("whisper", "Mira Eggwarden", "Stay with me. Quiet now.", 35, 78, "up"),
        ],
      }),
    ],
    {
      characters: ["mira-eggwarden"],
      creatures: ["bramblefox"],
      continuity: cont(1, {
        spark: { form: "egg", emotion: "stirring", glow: "rising cyan-gold", crackLevel: 2 },
        keeper: {
          name: "Mira Eggwarden",
          clothing: "practical hatchery travel coat over Compact robes",
          injuries: [],
        },
        bramblefox: { injuries: ["front-leg scrape", "torn ear tip"], status: "guarding" },
        time: "dawn",
        weather: "post-storm clear",
        location: "Commons fringe clearing",
      }),
      pageTurn: "Egg cracks open.",
      atmosphere: "dawn",
      lighting: "first light through residual aurora haze",
    },
  ),
);

// PAGE 2
storyPages.push(
  pageBase(
    2,
    "First Eye",
    "Egg cracking sequence; Spark's eye opens; companions react.",
    "three-stack",
    [
      panel("p2a", {
        description: "Extreme close-up: shell fissures widening; cyan-gold light leaking.",
        bubbles: [balloon("sfx", null, "KRK-KRACK", 50, 40, null)],
      }),
      panel("p2b", {
        description: "Bramblefox watches cautiously; Mossprig shields tiny Thornling from flying shell fragments.",
        bubbles: [
          balloon("creature", "Thornling", "*eep!*", 70, 55, "up"),
          balloon("creature", "Mossprig", "*steady…*", 30, 60, "up"),
        ],
      }),
      panel("p2c", {
        description: "Inside shell: Spark's large eye opens — luminous, frightened, cyan-gold iris.",
        bubbles: [balloon("narration", null, "Something chooses the world — and flinches.", 50, 18, null, { maxWidthPct: 55 })],
      }),
    ],
    {
      creatures: ["bramblefox", "mossprig", "thornling", "spark"],
      continuity: cont(2, {
        spark: { form: "hatching", emotion: "awakening", glow: "bright unstable", crackLevel: 3 },
        mossprig: { status: "shielding Thornling" },
        thornling: { status: "startled" },
      }),
      pageTurn: "Spark emerges.",
    },
  ),
);

// PAGE 3
storyPages.push(
  pageBase(
    3,
    "Hatchling",
    "Spark emerges, panics with small pulse, hides behind Bramblefox; Mira kneels.",
    "grid-2x2",
    [
      panel("p3a", {
        description: `Spark emerges fully — ${SPARK_LOOK}. Wet fur, trembling.`,
        bubbles: [balloon("creature", "Spark", "*chirp—!*", 50, 30, "down")],
      }),
      panel("p3b", {
        description: "Small uncontrolled cyan-gold energy pulse knocks leaves; Wisplet drifts back.",
        bubbles: [balloon("sfx", null, "PULSE-THUM", 55, 45, null)],
      }),
      panel("p3c", {
        description: "Spark presses hard against Bramblefox's flank, refusing everyone else.",
        bubbles: [balloon("creature", "Bramblefox", "*soft rrk*", 40, 70, "up")],
      }),
      panel("p3d", {
        description: "Mira kneels at a respectful distance, open empty hands — not grabbing.",
        bubbles: [
          balloon("speech", "Mira Eggwarden", "I'm not going to grab you. Invite only.", 50, 25, "down", {
            maxWidthPct: 40,
          }),
          balloon("narration", null, "Compact starts at the first breath.", 50, 75, null),
        ],
      }),
    ],
    {
      characters: ["mira-eggwarden", "mira-eggwarden"],
      creatures: ["spark", "bramblefox", "wisplet"],
      continuity: cont(3, {
        spark: {
          form: "hatchling",
          emotion: "terrified",
          glow: "unstable flare",
          position: "behind Bramblefox",
          trusts: ["bramblefox"],
        },
        mira: { present: true },
      }),
      pageTurn: "Codex scan.",
    },
  ),
);

// PAGE 4
storyPages.push(
  pageBase(
    4,
    "Unknown Resonance",
    "Codex scan fails; UNKNOWN RESONANCE / NO MATCH FOUND lettered into image.",
    "two-col",
    [
      panel("p4a", {
        description:
          "Mira holds a palm Codex crystal toward Spark (still behind Bramblefox). Soft scan light washes markings. scan light washes Spark's markings.",
        bubbles: [
          balloon("speech", "Mira Eggwarden", "Easy. Just reading the shell-song you kept.", 40, 20, "down"),
          balloon("sfx", null, "scan-hummm", 60, 50, null),
        ],
      }),
      panel("p4b", {
        description:
          "Close on Codex readout glyphs (abstract shapes — no readable UI chrome) flashing rejection; Spark's markings flicker mismatched colors.",
        bubbles: [
          balloon("caption", null, "UNKNOWN RESONANCE", 50, 30, null, { maxWidthPct: 50 }),
          balloon("caption", null, "NO MATCH FOUND", 50, 48, null, { maxWidthPct: 50 }),
          balloon("thought", "Mira Eggwarden", "Not Nature. Not Storm. Not anything we catalogued.", 50, 75, "up", {
            maxWidthPct: 42,
          }),
        ],
      }),
    ],
    {
      characters: ["mira-eggwarden", "mira-eggwarden"],
      creatures: ["spark", "bramblefox"],
      continuity: cont(4, {
        spark: { emotion: "anxious", glow: "flickering multi-thread", codexStatus: "no-match" },
        items: ["codex crystal scanner"],
      }),
      pageTurn: "Ancient markings recognized.",
      environment: "Commons fringe / hatchery path",
    },
  ),
);

// PAGE 5
storyPages.push(
  pageBase(
    5,
    "Shellward Mark",
    "Scholar/Keeper recognizes ancient sanctuary symbol on Spark.",
    "three-stack",
    [
      panel("p5a", {
        description:
          "Elder Codex aide Solen's colleague or local scholar leans close to Spark's shoulder crystals — an ancient nested-arc sanctuary mark.",
        bubbles: [
          balloon("speech", "Keeper Scholar Len", "That mark… Shellward. Pre-Commons nesting law.", 50, 20, "down", {
            maxWidthPct: 45,
          }),
        ],
      }),
      panel("p5b", {
        description: "Inset: charcoal rubbing of matching sanctuary glyph from a Codex folio.",
        bubbles: [balloon("narration", null, "A door older than the plaza. A promise older than fear.", 50, 70, null)],
      }),
      panel("p5c", {
        description: "Mira and Scholar Len exchange looks; Spark peeks past Bramblefox, curious despite fear.",
        bubbles: [
          balloon("speech", "Mira Eggwarden", "If the Compact still means anything, we take it there — not to a cage.", 50, 30, "down", {
            maxWidthPct: 48,
          }),
        ],
      }),
    ],
    {
      characters: ["mira-eggwarden", "mira-eggwarden", "keeper-scholar-len"],
      creatures: ["spark", "bramblefox"],
      continuity: cont(5, {
        spark: { markings: "Shellward nested-arc confirmed", emotion: "wary-curious" },
        mission: "escort-to-shellward-sanctum",
      }),
      pageTurn: "Mission accepted; hunter watches.",
    },
  ),
);

// PAGE 6
storyPages.push(
  pageBase(
    6,
    "Before Destabilization",
    "Mission: reach sanctuary before Spark destabilizes; shadowed hunter on ridge.",
    "two-col",
    [
      panel("p6a", {
        description:
          "Mira packs travel kit; Spark half-asleep against Bramblefox; Mossprig and Thornling ready. she checks her Compact lantern charm.",
        bubbles: [
          balloon("speech", "Mira Eggwarden", "Take Spark to Shellward Sanctum before the pulse frays.", 45, 22, "down", {
            maxWidthPct: 42,
          }),
          balloon("speech", "Mira Eggwarden", "We walk. We invite. We don't make it a weapon.", 50, 70, "up"),
        ],
      }),
      panel("p6b", {
        description:
          "Distant rooftop/ridge: Veiled Meridian hunter silhouette with tracking lens and three-arc sigil charm. Commons below unaware.",
        bubbles: [
          balloon("whisper", "Hunter Spotter", "Subject One lives. Mark the trail.", 55, 28, "down"),
          balloon("narration", null, "Some invitations arrive with knives.", 50, 82, null, { maxWidthPct: 50 }),
        ],
      }),
    ],
    {
      characters: ["mira-eggwarden", "mira-eggwarden"],
      creatures: ["spark", "bramblefox", "mossprig", "thornling"],
      continuity: cont(6, {
        hunters: { status: "observing", faction: "Veiled Meridian", tracking: "pending" },
        mission: "active",
        time: "morning",
      }),
      pageTurn: "Departure.",
      atmosphere: "day",
    },
  ),
);

// PAGE 7
storyPages.push(
  pageBase(
    7,
    "Leaving the Hearth",
    "Quiet travel departure; Spark learns the group's rhythm.",
    "wide",
    [
      panel("p7a", {
        description:
          "Quiet travel page: path out of Riftwild Commons. Mira leads; Bramblefox paces left of Spark (carried in soft wrap against Mira's satchel); Mossprig right; Thornling on Mossprig's shoulder; Wisplet above. Soft morning light.",
        bubbles: [
          balloon("narration", null, "The road teaches tempo before it teaches danger.", 50, 10, null, {
            maxWidthPct: 60,
          }),
          balloon("creature", "Spark", "*…chir?*", 48, 45, "up"),
          balloon("speech", "Mira Eggwarden", "That's Bramblefox. Scout. That's Mossprig. Wall. Thornling… chaos with thorns.", 55, 78, "up", {
            maxWidthPct: 45,
          }),
        ],
      }),
    ],
    {
      creatures: ["spark", "bramblefox", "mossprig", "thornling", "wisplet"],
      continuity: cont(7, {
        spark: { emotion: "listening", glow: "low steady", position: "in wrap against Mira" },
        location: "road out of Commons",
        hunterPositions: "trailing beyond sight",
      }),
      pageTurn: "Warm bonding beat.",
      environment: "Commons outbound trail",
      time: "late morning",
    },
  ),
);

// PAGE 8
storyPages.push(
  pageBase(
    8,
    "Motes and Marks",
    "Spark imitates Thornling / chases motes; then markings flare.",
    "three-stack",
    [
      panel("p8a", {
        description: "Spark clumsily imitates Thornling's hop; Thornling delights.",
        bubbles: [
          balloon("creature", "Thornling", "*hee!*", 30, 40, "up"),
          balloon("creature", "Spark", "*chir-chir!*", 65, 50, "up"),
        ],
      }),
      panel("p8b", {
        description: "Spark chases floating rift-dust motes; Mira smiles warmly.",
        bubbles: [balloon("speech", "Mira Eggwarden", "Curiosity that can play is Keeper-shaped.", 50, 20, "down")],
      }),
      panel("p8c", {
        description: "Suddenly Spark's cyan-gold markings flare hard; motes shatter; companions brace.",
        bubbles: [
          balloon("sfx", null, "FLARE-CRACKLE", 55, 40, null),
          balloon("speech", "Mira Eggwarden", "Hey— hey. Breathe with me.", 40, 75, "up"),
        ],
      }),
    ],
    {
      creatures: ["spark", "thornling", "bramblefox", "mossprig"],
      continuity: cont(8, {
        spark: { emotion: "startled overload", glow: "flare spike", destabilization: 1 },
      }),
      pageTurn: "Enter scarred wilds.",
    },
  ),
);

// PAGE 9
storyPages.push(
  pageBase(
    9,
    "Scar of the First Tear",
    "Rift-scarred region: floating stones, damaged trees, reversed waterfall.",
    "splash",
    [
      panel("p9a", {
        description:
          "Dramatic establishing splash of fractured wilds: floating mossy stones, split trees glowing with old cyan scars, a waterfall running upward into cloud. Party small on path. Spark's glow answers the landscape.",
        bubbles: [
          balloon("narration", null, "Where the First Tear taught stone to forget gravity.", 50, 12, null, {
            maxWidthPct: 65,
          }),
          balloon("whisper", "Mira Eggwarden", "Stay close. This ground remembers wrong.", 35, 80, "up"),
          balloon("sfx", null, "rift-hummm", 70, 55, null),
        ],
      }),
    ],
    {
      continuity: cont(9, {
        location: "First-Rift scar wilds",
        weather: "warped air shimmer",
        spark: { emotion: "resonant unease", glow: "answering landscape" },
      }),
      pageTurn: "Civilians panic.",
      atmosphere: "rift",
      environment: "fractured wilds",
      time: "afternoon",
      lighting: "skewed daylight + cyan scar glow",
    },
  ),
);

// PAGE 10
storyPages.push(
  pageBase(
    10,
    "Fear Has a Finger",
    "Travelers see Spark; one panics and blames Spark for Rift damage.",
    "two-col",
    [
      panel("p10a", {
        description: "Merchant caravan travelers freeze seeing Spark's glow; a child points in wonder.",
        bubbles: [
          balloon("speech", "Travel Kid", "It shines like a Gateway…", 40, 25, "down"),
          balloon("creature", "Spark", "*chir?*", 60, 60, "up"),
        ],
      }),
      panel("p10b", {
        description: "Frightened adult traveler steps forward accusingly, gesturing at scarred trees and Spark.",
        bubbles: [
          balloon("shout", "Frightened Traveler", "That thing woke the tear! Look at our road!", 50, 28, "down", {
            maxWidthPct: 42,
          }),
          balloon("speech", "Merchant", "Keep it away from the wagons!", 55, 70, "up"),
        ],
      }),
    ],
    {
      characters: ["mira-eggwarden", "frightened-traveler"],
      creatures: ["spark", "bramblefox"],
      continuity: cont(10, {
        spark: { emotion: "hurt confusion", glow: "shrinking" },
        social: "public fear",
      }),
      pageTurn: "Mira defends Spark.",
      environment: "scar wilds trail / caravan stop",
    },
  ),
);

// PAGE 11
storyPages.push(
  pageBase(
    11,
    "Not a Weapon",
    "Mira publicly defends Spark; Spark withdraws emotionally.",
    "three-stack",
    [
      panel("p11a", {
        description: "Mira steps between Spark and the crowd, firm but not aggressive.",
        bubbles: [
          balloon("speech", "Mira Eggwarden", "It hatched after we sealed a wound. Blame the hand that opened it — not the pulse that survived.", 50, 30, "down", {
            maxWidthPct: 48,
          }),
        ],
      }),
      panel("p11b", {
        description: "Close-up: Spark's ears flatten; glow dims; eyes wet with fear of being unwanted.",
        bubbles: [balloon("creature", "Spark", "*…*", 50, 55, null)],
      }),
      panel("p11c", {
        description: "Mira glances back — sees Spark's withdrawal; restrained quiet beat.",
        bubbles: [
          balloon("thought", "Mira Eggwarden", "They heard a monster. It heard a verdict.", 50, 40, "up", {
            maxWidthPct: 42,
          }),
          balloon("whisper", "Mira Eggwarden", "You're not a weapon. I won't let them write you as one.", 50, 75, "up", {
            maxWidthPct: 45,
          }),
        ],
      }),
    ],
    {
      continuity: cont(11, {
        spark: { emotion: "unwanted / withdrawing", glow: "dim", trust: "fragile" },
        keeper: { stance: "public defense" },
      }),
      pageTurn: "Spark runs.",
    },
  ),
);

// PAGE 12
storyPages.push(
  pageBase(
    12,
    "Glow Into Dark",
    "Night: Spark runs away; hunters activate tracking.",
    "two-col",
    [
      panel("p12a", {
        description:
          "Night camp edge. Spark slips from wrap and bolts into forest; glow streak vanishing between trunks. Mira reaches too late.",
        bubbles: [
          balloon("sfx", null, "pad-pad-pad", 60, 40, null),
          balloon("shout", "Mira Eggwarden", "Spark—!", 35, 70, "up"),
        ],
      }),
      panel("p12b", {
        description:
          "Veiled Meridian hunters in veiled half-masks activate binding-compass devices; three-arc sigils light. Lead hunter Vex Halden cold; Nira Quill hesitant.",
        bubbles: [
          balloon("speech", "Vex Halden", "Trail lock. Alive capture only.", 50, 25, "down"),
          balloon("whisper", "Nira Quill", "If it's only a hatchling…", 45, 70, "up"),
          balloon("speech", "Vex Halden", "Subject One is inventory. Move.", 55, 85, "up"),
        ],
      }),
    ],
    {
      characters: ["mira-eggwarden", "vex-halden", "nira-quill"],
      creatures: ["spark"],
      continuity: cont(12, {
        spark: { emotion: "flight", glow: "vanishing", position: "forest unknown" },
        hunters: { status: "tracking active", devices: "binding-compass on" },
        time: "night",
      }),
      pageTurn: "Track Spark.",
      atmosphere: "night",
      time: "night",
    },
  ),
);

// PAGE 13
storyPages.push(
  pageBase(
    13,
    "Scent and Spirit",
    "Bramblefox tracks; Wisplet senses spiritual trail; Mira follows.",
    "three-stack",
    [
      panel("p13a", {
        description: "Bramblefox nose to disturbed leaves and cyan-gold mote residue.",
        bubbles: [balloon("creature", "Bramblefox", "*hunt-rrk*", 40, 55, "up")],
      }),
      panel("p13b", {
        description: "Wisplet leaves soft spirit-light breadcrumbs in air; Mossprig and Thornling follow.",
        bubbles: [balloon("creature", "Wisplet", "*chime…*", 55, 40, "down")],
      }),
      panel("p13c", {
        description: "Mira running with lantern, satchel bouncing; determined, not angry.",
        bubbles: [
          balloon("speech", "Mira Eggwarden", "I'm not reclaiming property. I'm answering a runaway invitation.", 50, 25, "down", {
            maxWidthPct: 48,
          }),
        ],
      }),
    ],
    {
      creatures: ["bramblefox", "wisplet", "mossprig", "thornling"],
      continuity: cont(13, {
        spark: { position: "ahead toward stone arch", glow: "intermittent" },
        tracking: "companion-led",
      }),
      pageTurn: "Sealed path opens.",
      atmosphere: "night",
    },
  ),
);

// PAGE 14
storyPages.push(
  pageBase(
    14,
    "The Arch That Waits",
    "Spark finds ancient stone arch that opens only for Spark; hidden road appears.",
    "two-col",
    [
      panel("p14a", {
        description:
          "Ancient stone arch half-swallowed by roots; dead to Mira's approach in inset memory — but as Spark nears alone, nested-arc glyphs ignite cyan-gold.",
        bubbles: [
          balloon("creature", "Spark", "*…chir*", 45, 70, "up"),
          balloon("sfx", null, "stone-awaken", 60, 40, null),
        ],
      }),
      panel("p14b", {
        description: "Hidden luminous road unfolds beyond the arch — soft sanctuary path light.",
        bubbles: [
          balloon("narration", null, "Some doors do not open for keys. They open for kinship.", 50, 15, null, {
            maxWidthPct: 55,
          }),
          balloon("caption", null, "SHELLWARD ROAD", 50, 85, null),
        ],
      }),
    ],
    {
      creatures: ["spark"],
      continuity: cont(14, {
        spark: { emotion: "wonder amid fear", glow: "door-keyed", sanctuaryProgress: "arch-opened" },
        path: "Shellward Road revealed",
      }),
      pageTurn: "Hunters surround.",
      environment: "ancient arch / Shellward Road",
    },
  ),
);

// PAGE 15
storyPages.push(
  pageBase(
    15,
    "Sigils Ignite",
    "Group reaches Spark; hunter sigils ignite; hunters step from concealment.",
    "grid-2x2",
    [
      panel("p15a", {
        description: "Mira's group reaches Spark at arch threshold; Spark hesitates between flee and return.",
        bubbles: [balloon("whisper", "Mira Eggwarden", "You found a door. You still get to choose the room.", 50, 20, "down")],
      }),
      panel("p15b", {
        description: "Ground rings of three-arc hunter sigils flare around the party.",
        bubbles: [balloon("sfx", null, "SIGIL-LOCK", 50, 50, null)],
      }),
      panel("p15c", {
        description: "Veiled Meridian hunters step from concealment with dampening rods and trained lean hound-companions.",
        bubbles: [balloon("speech", "Vex Halden", "Subject One. Step away from the Keepers.", 50, 30, "down")],
      }),
      panel("p15d", {
        description: "Nira Quill's eyes show doubt behind veil; Spark cowers.",
        bubbles: [balloon("thought", "Nira Quill", "It looks like a child of light — not a weapon crate.", 50, 60, "up")],
      }),
    ],
    {
      characters: ["mira-eggwarden", "vex-halden", "nira-quill"],
      creatures: ["spark", "bramblefox", "mossprig", "thornling", "wisplet"],
      continuity: cont(15, {
        hunters: { status: "surrounding", bindingField: "forming" },
        spark: { emotion: "trapped terror", position: "arch threshold" },
      }),
      pageTurn: "Refusal / battle begins.",
      atmosphere: "night",
    },
  ),
);

// PAGE 16
storyPages.push(
  pageBase(
    16,
    "Refuse the Cage",
    "Lead hunter demands Spark; Mira refuses; Nira uncertain; battle starts.",
    "three-stack",
    [
      panel("p16a", {
        description: "Vex extends binding collar relic toward Spark.",
        bubbles: [
          balloon("speech", "Vex Halden", "It belongs to the Meridian. Hand it over — alive.", 50, 25, "down", {
            maxWidthPct: 45,
          }),
        ],
      }),
      panel("p16b", {
        description: "Mira plants himself; companions brace.",
        bubbles: [
          balloon("speech", "Mira Eggwarden", "It belongs to its own becoming. Compact law. Back away.", 50, 35, "down", {
            maxWidthPct: 45,
          }),
          balloon("speech", "Nira Quill", "Vex— if the scan was wrong—", 40, 75, "up"),
        ],
      }),
      panel("p16c", {
        description: "Battle ignites: hunter companions leap; Bramblefox meets them; rods crackle.",
        bubbles: [
          balloon("sfx", null, "WHUMP", 30, 40, null),
          balloon("sfx", null, "SHIIING", 70, 50, null),
          balloon("creature", "Bramblefox", "*snarl*", 45, 70, "up"),
        ],
      }),
    ],
    {
      continuity: cont(16, {
        battle: "begun",
        spark: { emotion: "terrified center", glow: "erratic" },
        nira: { doubt: true },
      }),
      pageTurn: "Binding shot / Mossprig.",
      atmosphere: "night",
    },
  ),
);

// PAGE 17
storyPages.push(
  pageBase(
    17,
    "Living Bulwark",
    "Binding relic fires at Spark; Mossprig takes the hit with Living Bulwark.",
    "two-col",
    [
      panel("p17a", {
        description: "Binding relic beam streaks toward Spark; Mossprig lunges into the path, Living Bulwark vine-light blooming.",
        bubbles: [
          balloon("sfx", null, "BIND-LANCE", 60, 35, null),
          balloon("creature", "Mossprig", "*BULWARK!*", 40, 55, "up"),
        ],
      }),
      panel("p17b", {
        description:
          "Impact: Mossprig absorbs binding burn across shoulder moss-flesh; visible scorch; Spark stares in horror; Mira reaches.",
        bubbles: [
          balloon("sfx", null, "KRRRAAAK", 50, 30, null),
          balloon("creature", "Spark", "*chir—!!*", 65, 60, "up"),
          balloon("speech", "Mira Eggwarden", "Mossprig!", 30, 75, "up"),
        ],
      }),
    ],
    {
      creatures: ["mossprig", "spark", "bramblefox"],
      continuity: cont(17, {
        mossprig: { injuries: ["binding burn across shoulder"], status: "protecting Spark", ability: "Living Bulwark used" },
        spark: { emotion: "horror / guilt surge", glow: "building overload" },
      }),
      pageTurn: "Coordinated battle.",
    },
  ),
);

// PAGE 18
storyPages.push(
  pageBase(
    18,
    "Grove Against Veil",
    "Full coordinated battle; Spark frightened in center.",
    "grid-2x2",
    [
      panel("p18a", {
        description: "Bramblefox flanks with Forest Bond vine-light, tripping a hunter companion.",
        bubbles: [balloon("sfx", null, "LEAF-SNAP", 50, 40, null)],
      }),
      panel("p18b", {
        description: "Thornling unleashes Sprouting Energy spark-burst creating cover thorns.",
        bubbles: [balloon("creature", "Thornling", "*sprout-GO!*", 50, 50, "up")],
      }),
      panel("p18c", {
        description: "Wisplet phases through a restraint net; Spirit Moth omen-glint in background optional.",
        bubbles: [balloon("sfx", null, "phase-chime", 55, 45, null)],
      }),
      panel("p18d", {
        description: "Center: Spark curled, terrified, glow strobing; Mossprig still shielding despite burn; hunters press.",
        bubbles: [
          balloon("narration", null, "Power without choice is just another cage.", 50, 15, null, { maxWidthPct: 50 }),
          balloon("creature", "Spark", "*tremble-hum*", 50, 70, "up"),
        ],
      }),
    ],
    {
      creatures: ["bramblefox", "thornling", "wisplet", "mossprig", "spark", "spirit-moth"],
      continuity: cont(18, {
        spark: { emotion: "terrified", glow: "unstable cyan-gold", position: "behind Mossprig" },
        mossprig: { injuries: ["binding burn across shoulder"], status: "protecting Spark" },
        battle: "coordinated companions vs Meridian",
      }),
      pageTurn: "Overload / Keeper refuses to command.",
      lettering: "Dense SFX; keep center clear for Spark face.",
    },
  ),
);

// PAGE 19
storyPages.push(
  pageBase(
    19,
    "You Do Not Have To",
    "Hunters gaining; Spark sees Mossprig hurt; overload; Mira refuses to command Spark to fight.",
    "three-stack",
    [
      panel("p19a", {
        description: "Hunters' dampening field tightens; Mira knocked to a knee; Vex advances.",
        bubbles: [balloon("speech", "Vex Halden", "End this. Collar the anomaly.", 55, 30, "down")],
      }),
      panel("p19b", {
        description: "Spark stares at Mossprig's burn; resonance overload rings around Spark.",
        bubbles: [balloon("sfx", null, "RESONANCE+++", 50, 45, null)],
      }),
      panel("p19c", {
        description: "Mira, breathless, speaks to Spark without order — open hand.",
        bubbles: [
          balloon("speech", "Mira Eggwarden", "You don't have to fight for us. You don't have to be useful to be kept.", 50, 35, "down", {
            maxWidthPct: 48,
          }),
          balloon("whisper", "Mira Eggwarden", "If you run through that door, I'll still call you Spark.", 50, 75, "up", {
            maxWidthPct: 45,
          }),
        ],
      }),
    ],
    {
      continuity: cont(19, {
        spark: { emotion: "overload / listening", glow: "critical", resonance: 3 },
        keeper: { stance: "refuse-to-weaponize" },
        hunters: { advantage: true },
      }),
      pageTurn: "Vision.",
    },
  ),
);

// PAGE 20
storyPages.push(
  pageBase(
    20,
    "You Were Never Made to Obey",
    "Spark vision: ancient Keepers with several Spark-like young; invitation not command.",
    "splash",
    [
      panel("p20a", {
        description:
          "Vision splash: soft ancient sanctuary light. Robed ancient Keepers stand with several glowing young Riftborn similar to Spark. One Keeper kneels, hand open toward Spark — invitation gesture. No chains. Ethereal, not modern Commons.",
        bubbles: [
          balloon("caption", null, "You were never made to obey.", 50, 18, null, { maxWidthPct: 60 }),
          balloon("telepathy", "Ancient Keeper Echo", "Become. Then choose.", 50, 78, null, { maxWidthPct: 40 }),
        ],
      }),
    ],
    {
      creatures: ["spark"],
      continuity: cont(20, {
        spark: { emotion: "vision clarity", glow: "vision-stable", vision: "ancient Keepers / Riftborn kin" },
      }),
      pageTurn: "Voluntary return.",
      atmosphere: "rift",
      environment: "vision: pre-Commons sanctuary",
      lighting: "soft sacred cyan-gold",
    },
  ),
);

// PAGE 21
storyPages.push(
  pageBase(
    21,
    "Chosen Step",
    "Spark voluntarily returns beside Mira; no command; controlled Resonance activates.",
    "two-col",
    [
      panel("p21a", {
        description:
          "Back in battle night: Spark walks from cover to stand beside Mira — voluntary, deliberate. Mira does not grab or point.",
        bubbles: [
          balloon("creature", "Spark", "*chir…* (bond-warmth)", 45, 40, "up"),
          balloon("speech", "Mira Eggwarden", "Okay. Together — if you want.", 55, 70, "up"),
        ],
      }),
      panel("p21b", {
        description: "Spark's glow steadies into controlled aura; Rift Resonance rings visible as soft orbiting motes (max 3).",
        bubbles: [
          balloon("narration", null, "Resonance held — not spilled.", 50, 15, null),
          balloon("caption", null, "RIFT RESONANCE", 50, 85, null),
        ],
      }),
    ],
    {
      continuity: cont(21, {
        spark: {
          emotion: "chosen courage",
          glow: "controlled bright",
          bond: "voluntary with Mira",
          resonance: 3,
          abilityReady: "Prismatic Burst",
        },
      }),
      pageTurn: "Prismatic Burst splash.",
    },
  ),
);

// PAGE 22
storyPages.push(
  pageBase(
    22,
    "Prismatic Burst",
    "Spark unleashes controlled Prismatic Burst; group combines powers; binding field breaks — not instant win.",
    "splash",
    [
      panel("p22a", {
        description:
          "Action splash: Spark at center releases Prismatic Burst — structured cyan-gold-amber ribbons (not chaotic nuke). Bramblefox/Mossprig/Thornling/Wisplet abilities sync into the burst. Hunter binding field shatters. Hunters staggered but not vaporized. Mira shields eyes, standing with Spark.",
        bubbles: [
          balloon("sfx", null, "PRISM—BURST", 50, 22, null, { maxWidthPct: 40 }),
          balloon("sfx", null, "field-SHATTER", 70, 55, null),
          balloon("shout", "Vex Halden", "Dampening— hold the line!", 30, 70, "up"),
        ],
      }),
    ],
    {
      creatures: ["spark", "bramblefox", "mossprig", "thornling", "wisplet"],
      continuity: cont(22, {
        spark: { emotion: "strained resolve", glow: "burst afterglow", resonance: 0, ability: "Prismatic Burst used" },
        hunters: { bindingField: "broken", status: "staggered" },
        battle: "turning",
      }),
      pageTurn: "Retreat / sanctuary opens.",
      atmosphere: "night",
      lighting: "prismatic burst climax",
    },
  ),
);

// PAGE 23
storyPages.push(
  pageBase(
    23,
    "Door for One",
    "Battle ends; Nira stops Vex from harming Spark; hunters retreat; sanctuary doors open for Spark.",
    "three-stack",
    [
      panel("p23a", {
        description: "Nira Quill blocks Vex's finishing strike toward Spark with her own rod.",
        bubbles: [
          balloon("speech", "Nira Quill", "Alive capture — not a corpse for the ledger.", 50, 25, "down", {
            maxWidthPct: 45,
          }),
          balloon("speech", "Vex Halden", "You'll answer for this.", 55, 70, "up"),
        ],
      }),
      panel("p23b", {
        description: "Hunters retreat into trees; devices sparking dead.",
        bubbles: [balloon("narration", null, "The Meridian withdraws — not defeated forever.", 50, 50, null)],
      }),
      panel("p23c", {
        description:
          "At road's end: Shellward Sanctum doors of living stone and nested-arc metal open as Spark approaches alone; Mira's party waits at threshold respectfully.",
        bubbles: [
          balloon("speech", "Mira Eggwarden", "It opens for you. We'll wait our turn.", 40, 75, "up"),
          balloon("creature", "Spark", "*invite-chirp*", 60, 55, "up"),
        ],
      }),
    ],
    {
      continuity: cont(23, {
        hunters: { status: "retreated", nira: "defected-soft" },
        sanctuaryProgress: "doors-open-for-Spark",
        mossprig: { injuries: ["binding burn across shoulder"], status: "stable" },
      }),
      pageTurn: "Mural revelation.",
      time: "pre-dawn",
    },
  ),
);

// PAGE 24
storyPages.push(
  pageBase(
    24,
    "Riftborn",
    "Sanctuary mural: multiple Spark-like beings linked to world Rifts; Mira realizes Spark is one of several.",
    "two-col",
    [
      panel("p24a", {
        description:
          "Interior Shellward Sanctum: vast mural of several Glowpup-like Riftborn connected by luminous threads to different regional Rifts across Aeryndra. Spark stands small before it.",
        bubbles: [
          balloon("narration", null, "Not a mistake. A lineage of thresholds.", 50, 12, null, { maxWidthPct: 55 }),
          balloon("speech", "Mira Eggwarden", "You're one of several… Riftborn.", 40, 75, "up"),
        ],
      }),
      panel("p24b", {
        description: "Close: Spark's markings mirror mural figures; quiet awe.",
        bubbles: [
          balloon("caption", null, "CODEX CLASS: RIFTBORN (PROVISIONAL)", 50, 20, null, { maxWidthPct: 50 }),
          balloon("creature", "Spark", "*soft wonder-hum*", 50, 70, "up"),
        ],
      }),
    ],
    {
      continuity: cont(24, {
        spark: { emotion: "identity awakening", glow: "sanctuary-steady", classification: "Riftborn" },
        location: "Shellward Sanctum interior",
        revelation: "multiple Riftborn exist",
      }),
      pageTurn: "Cliffhanger.",
      environment: "Shellward Sanctum",
      time: "dawn inside stone",
    },
  ),
);

// PAGE 25
storyPages.push(
  pageBase(
    25,
    "Begin the Collection",
    "Empty pedestal; map marks Traveling Circus; Meridian message; TO BE CONTINUED Issue #3.",
    "splash",
    [
      panel("p25a", {
        description:
          "Cliffhanger splash: empty crystal pedestal with disturbed dust (someone already took the relic). Magical map activates on floor marking Commons → Sanctum path and a glowing pin at Traveling Circus wagons. Tiny three-arc sigil chalked near pedestal. Spark and Mira silhouettes at edge.",
        bubbles: [
          balloon("narration", null, "Someone reached the heart first.", 50, 10, null, { maxWidthPct: 55 }),
          balloon("telepathy", "Veiled Meridian Channel", "Subject One has awakened. Begin the collection.", 50, 48, null, {
            maxWidthPct: 55,
          }),
          balloon("caption", null, "TO BE CONTINUED IN ISSUE #3", 50, 72, null, { maxWidthPct: 60 }),
          balloon("caption", null, "THE TRAVELING CIRCUS", 50, 84, null, { maxWidthPct: 55 }),
        ],
      }),
    ],
    {
      continuity: cont(25, {
        spark: { emotion: "uneasy resolve", glow: "steady with Mira", bond: "voluntary" },
        sanctuaryProgress: "entered; crystal missing",
        items: { pedestalCrystal: "stolen-before-arrival" },
        cliffhanger: "collection begins → Traveling Circus",
        nextIssue: "the-traveling-circus",
      }),
      pageTurn: "End Issue #2.",
      atmosphere: "rift",
      lighting: "map glow + empty pedestal gloom",
    },
  ),
);

// Attach story page numbers
for (const p of storyPages) {
  p.storyPageNumber = p.pageNumber;
}

// ── BOOK ASSEMBLY ──────────────────────────────────────────
const book = [];
let bp = 1;

book.push(
  matterPage(
    bp++,
    "front-cover",
    "Spark's Journey — Cover",
    [
      panel("cover", {
        description:
          "Main cover: Spark foreground cyan-gold; Mira Eggwarden reaching toward Spark without touching; Bramblefox and Mossprig flanking; rift-scarred forest behind; distant hunter silhouettes; ancient Shellward nested-arc symbol above; cyan-gold energy trail as path. Trade dress space top/bottom. Original Riftwilds — not Marvel/DC.",
        bubbles: [
          balloon("caption", null, "RIFTWILDS", 50, 8, null),
          balloon("caption", null, "SPARK'S JOURNEY", 50, 18, null),
          balloon("caption", null, "ISSUE #2", 50, 88, null),
        ],
      }),
    ],
    { characters: ["mira-eggwarden"], creatures: ["spark", "bramblefox", "mossprig"], atmosphere: "rift" },
  ),
);

book.push(
  matterPage(
    bp++,
    "inside-cover",
    "Inside Front Cover",
    [
      panel("ifc", {
        description: "Quiet parchment-light inside cover: Shellward nested-arc watermark, soft Gateway glow, invitation to read.",
        bubbles: [
          balloon("narration", null, "Legends of the Rift · Volume One · Issue Two", 50, 40, null, { maxWidthPct: 55 }),
          balloon("caption", null, "Previously: The First Rift", 50, 70, null),
        ],
      }),
    ],
  ),
);

book.push(
  matterPage(
    bp++,
    "credits",
    "Credits",
    [
      panel("cred", {
        description: "Workshop lore-desk scene: quills, rift-ink, maps — empty credit boxes for lettering.",
        bubbles: [
          balloon("caption", null, "SPARK'S JOURNEY", 50, 20, null),
          balloon(
            "narration",
            null,
            "Story & Continuity · Riftwilds Lore Desk  ·  Art Pipeline · Grok + programmatic lettering  ·  Original Riftwilds IP",
            50,
            55,
            null,
            { maxWidthPct: 65 },
          ),
        ],
      }),
    ],
  ),
);

book.push(
  matterPage(
    bp++,
    "title",
    "Chapter Two — Hatchling of the Pulse",
    [
      panel("title", {
        description: "Title spread energy: Spark silhouette on Shellward Road, Mira and companions behind, no painted lettering.",
        bubbles: [
          balloon("caption", null, "CHAPTER TWO", 50, 30, null),
          balloon("caption", null, "HATCHLING OF THE PULSE", 50, 45, null),
          balloon("narration", null, "Trust is not a collar. It is a step taken twice.", 50, 70, null, {
            maxWidthPct: 55,
          }),
        ],
      }),
    ],
    { creatures: ["spark"], atmosphere: "dawn" },
  ),
);

const storyStartBookPage = bp;
for (const sp of storyPages) {
  const page = { ...sp, pageNumber: bp, storyPageNumber: sp.storyPageNumber };
  book.push(page);
  bp++;
}

book.push(
  matterPage(
    bp++,
    "teaser",
    "Next Issue — The Traveling Circus",
    [
      panel("teaser", {
        description:
          "Teaser plate: lantern wagons at dusk approaching Commons plaza; masked host silhouette; Spark cameo optional at edge under Compact rules. No logos.",
        bubbles: [
          balloon("caption", null, "NEXT ISSUE", 50, 15, null),
          balloon("caption", null, "THE TRAVELING CIRCUS", 50, 28, null),
          balloon("narration", null, "Lantern wagons. Honest applause. A collection already in motion.", 50, 70, null, {
            maxWidthPct: 55,
          }),
        ],
      }),
    ],
    { atmosphere: "festival" },
  ),
);

book.push(
  matterPage(
    bp++,
    "profile",
    "Keeper Profile — Mira Eggwarden",
    [
      panel("prof-mira", {
        description: "Character profile plate: Mira Eggwarden portrait in hatchery mentor portrait — Compact robes, soft braid, satchel; empty text zones.",
        bubbles: [
          balloon(
            "narration",
            null,
            "MIRA EGGWARDEN — Hatchery mentor. Bond philosophy: keep, don't own. Compact first. Refuses to treat companions as weapons even when the Meridian calls them inventory.",
            50,
            55,
            null,
            { maxWidthPct: 65 },
          ),
        ],
      }),
    ],
    { characters: ["mira-eggwarden"] },
  ),
);

book.push(
  matterPage(
    bp++,
    "profile",
    "Companion Profile — Spark",
    [
      panel("prof-spark", {
        description: `Companion profile plate: full-body Spark — ${SPARK_LOOK}. Empty lore boxes.`,
        bubbles: [
          balloon(
            "narration",
            null,
            "SPARK — Glowpup-line Riftborn hatchling. Codex: UNKNOWN RESONANCE → provisional Riftborn. Communicates in chirps and bond-warmth. Passive: Rift Resonance. Ultimate: Prismatic Burst.",
            50,
            60,
            null,
            { maxWidthPct: 65 },
          ),
        ],
      }),
    ],
    { creatures: ["spark"] },
  ),
);

book.push(
  matterPage(
    bp++,
    "lore",
    "Codex — Riftborn",
    [
      panel("codex", {
        description: "Codex lore plate: mural motif of multiple Riftborn linked to world Rifts; ornate crystal frame; empty text box.",
        bubbles: [
          balloon(
            "narration",
            null,
            "CODEX ENTRY (DRAFT): Riftborn — rare companions whose affinity does not lock to a single element. Linked to threshold Rifts across Aeryndra. Shellward Sanctum catalogs them as kin, not inventory. Status: provisional · Subject One awakened.",
            50,
            55,
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
    "Ability Spotlight — Rift Resonance",
    [
      panel("abil", {
        description: "Ability spotlight: Spark with orbiting Resonance motes; allies using elemental abilities feeding the rings.",
        bubbles: [
          balloon(
            "narration",
            null,
            "RIFT RESONANCE — When another companion uses an elemental ability, Spark gains 1 Resonance (max 3). Prismatic Burst consumes Resonance to strike and briefly boost allies. Not domination — shared pulse.",
            50,
            55,
            null,
            { maxWidthPct: 65 },
          ),
        ],
      }),
    ],
    { creatures: ["spark"] },
  ),
);

book.push(
  matterPage(
    bp++,
    "map",
    "World Map — Commons to Shellward",
    [
      panel("map", {
        description:
          "Stylized in-world map: Riftwild Commons, outbound trail, First-Rift scar wilds, ancient arch, Shellward Sanctum NW. Pin for Traveling Circus foreshadow. Empty legend boxes.",
        bubbles: [
          balloon("caption", null, "RIFTWILD COMMONS → SHELLWARD SANCTUM", 50, 85, null, { maxWidthPct: 70 }),
        ],
      }),
    ],
  ),
);

book.push(
  matterPage(
    bp++,
    "letters",
    "Editor's Note — Trust & Choice",
    [
      panel("ed", {
        description: "Letters page atmosphere: soft desk lamp, open Compact seal wax, Spark pawprint sketch.",
        bubbles: [
          balloon(
            "narration",
            null,
            "EDITOR'S NOTE: Spark's Journey is about trust under fear — the difference between protection and control. A companion who can run away and still be invited back is the Compact made flesh. Write the Lore Desk. Keep invitations honest.",
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
    "inside-cover",
    "Inside Back Cover",
    [
      panel("ibc", {
        description: "Quiet night Commons silhouette; circus lanterns faint on horizon; space for house links.",
        bubbles: [
          balloon(
            "narration",
            null,
            "Continue in Live World · Study Riftborn in the Codex · Visit the Hatchery under Compact law",
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
    "Back Cover — Traveling Lantern Caravan",
    [
      panel("bc", {
        description:
          "In-universe ad for Traveling Lantern Caravan / Riftwild Traveling Circus: lantern wagons, companion performances, mysterious masked host, one slightly unsettling three-arc charm half-hidden under a wagon. Empty poster text zones. No gambling.",
        bubbles: [
          balloon("caption", null, "THE TRAVELING LANTERN CARAVAN", 50, 18, null, { maxWidthPct: 70 }),
          balloon(
            "narration",
            null,
            "Lanterns. Companion acts. Honest cheers — never SOL in the hat. Masked Host invites Keepers who listen. (In-world advertisement · not a real-money offer.)",
            50,
            70,
            null,
            { maxWidthPct: 65 },
          ),
        ],
      }),
    ],
    { atmosphere: "festival" },
  ),
);

// Write files
fs.mkdirSync(path.join(OUT, "pages"), { recursive: true });
fs.mkdirSync(path.join(OUT, "prompts"), { recursive: true });
fs.mkdirSync(path.join(OUT, "reports"), { recursive: true });
fs.mkdirSync(path.join(OUT, "generated", "raw-art"), { recursive: true });
fs.mkdirSync(path.join(OUT, "generated", "lettered-pages"), { recursive: true });
fs.mkdirSync(path.join(OUT, "generated", "thumbnails"), { recursive: true });
fs.mkdirSync(path.join(OUT, "generated", "covers"), { recursive: true });

const script = {
  title: "Spark's Journey",
  issue: 2,
  subtitle: "Hatchling of the Pulse",
  protagonist: "Mira Eggwarden",
  companion: "Spark",
  synopsis:
    "The pulse-egg under Mira Eggwarden's Compact care hatches into Spark, an unstable Glowpup-line Riftborn. Mira escorts Spark toward Shellward Sanctum while Veiled Meridian hunters try to capture Subject One. Spark flees fear, returns by choice, unlocks Prismatic Burst, and discovers it is one of several Riftborn — as the Meridian begins the collection at the Traveling Circus.",
  themes: [
    "trust",
    "fear of being different",
    "found family",
    "responsibility",
    "protection versus control",
    "bond",
    "identity",
    "courage",
  ],
  storyPageCount: 25,
  bookPageCount: book.length,
  storyStartBookPage,
  requiredMoments: Array.from({ length: 25 }, (_, i) => i + 1),
  pages: storyPages.map((p) => ({
    pageNumber: p.storyPageNumber,
    title: p.title,
    beat: p.storyPurpose,
    transcript: p.transcript,
  })),
};

fs.writeFileSync(path.join(OUT, "script.json"), JSON.stringify(script, null, 2) + "\n");
fs.writeFileSync(path.join(OUT, "continuity.json"), JSON.stringify({ pages: continuityTrack }, null, 2) + "\n");

fs.writeFileSync(
  path.join(OUT, "characters.json"),
  JSON.stringify(
    {
      cast: [
        { id: "mira-eggwarden", name: "Mira Eggwarden", role: "Keeper protagonist · Hatchery mentor" },
        { id: "keeper-scholar-len", name: "Keeper Scholar Len", role: "Recognizes Shellward mark" },
        { id: "vex-halden", name: "Vex Halden", role: "Veiled Meridian lead hunter" },
        { id: "nira-quill", name: "Nira Quill", role: "Meridian hunter — doubts mission" },
        { id: "frightened-traveler", name: "Frightened Traveler", role: "Blames Spark" },
      ],
    },
    null,
    2,
  ) + "\n",
);

fs.writeFileSync(
  path.join(OUT, "creatures.json"),
  JSON.stringify(
    {
      featured: [
        { id: "spark", name: "Spark", note: "See SPARK_CANON_PROPOSAL.md" },
        { id: "bramblefox", name: "Bramblefox", purpose: "Scout and protector" },
        { id: "mossprig", name: "Mossprig", purpose: "Defender; Living Bulwark" },
        { id: "thornling", name: "Thornling", purpose: "Comic relief / Sprouting Energy" },
        { id: "wisplet", name: "Wisplet", purpose: "Spiritual trail" },
        { id: "spirit-moth", name: "Spirit Moth", purpose: "Omen cameo" },
      ],
    },
    null,
    2,
  ) + "\n",
);

fs.writeFileSync(
  path.join(OUT, "factions.json"),
  JSON.stringify(
    {
      factions: [
        {
          id: "veiled-meridian",
          name: "Veiled Meridian",
          status: "new-canon-issue-002",
          goal: "Capture Spark alive (Subject One)",
          methods: ["tracking sigils", "binding relics", "rift dampeners", "trained hunter companions"],
          note: "Field cell of Issue #1 Hooded Observer — full org not revealed",
        },
        { id: "hatchery-compact", name: "Hatchery Compact", status: "established" },
        { id: "commons-keepers", name: "Commons Keepers Circle", status: "established" },
      ],
    },
    null,
    2,
  ) + "\n",
);

const covers = {
  main: {
    title: "Spark's Journey",
    issue: 2,
    prompt: book[0].grokPrompt,
  },
  "variant-a": {
    label: "Spark portrait with ancient markings",
    prompt: `${STYLE} Variant cover A: intimate Spark portrait, Shellward nested-arc markings glowing, cyan-gold aura, empty title zones. ${SPARK_LOOK}. NO text.`,
  },
  "variant-b": {
    label: "Companion team protecting Spark",
    prompt: `${STYLE} Variant cover B: Bramblefox, Mossprig, Thornling, Wisplet forming protective ring around Spark; Mira silhouette behind. NO text.`,
  },
  foil: {
    label: "Foil — animated cyan-gold Rift markings",
    prompt: `${STYLE} Foil cover treatment concept: Spark with heightened cyan-gold rift marking shimmer suitable for foil overlay; empty title zones. NO text.`,
  },
};

fs.writeFileSync(path.join(OUT, "covers.json"), JSON.stringify(covers, null, 2) + "\n");

const issue = {
  slug: "sparks-journey",
  issueNumber: 2,
  title: "Spark's Journey",
  subtitle: "Chapter Two — Hatchling of the Pulse",
  synopsis: script.synopsis,
  publishedAt: "2026-07-20",
  status: "published",
  storyPageCount: 25,
  bookPageCount: book.length,
  estimatedReadMinutes: 20,
  protagonist: "Mira Eggwarden",
  featuredCreatures: ["Spark", "Bramblefox", "Mossprig", "Thornling", "Wisplet"],
  locations: ["Riftwild Commons", "First-Rift scar wilds", "Shellward Sanctum"],
  unlockGates: [
    { kind: "prior-issue", slug: "the-first-rift", label: "Complete Issue #1: The First Rift" },
    { kind: "admin-dev", label: "Admin / COMICS_DEV_UNLOCK override" },
  ],
  nextIssueTeaser: { slug: "the-traveling-circus", hook: "Subject One has awakened. Begin the collection." },
  pipeline: {
    artProvider: "grok",
    lettering: "programmatic",
    bakedLettering: true,
    contentRoot: "content/comics/sparks-journey/issue-002",
  },
  bookPages: book.map((p) => ({
    pageNumber: p.pageNumber,
    storyPageNumber: p.storyPageNumber ?? null,
    role: p.bookRole,
    title: p.title,
  })),
};

fs.writeFileSync(path.join(OUT, "issue.json"), JSON.stringify(issue, null, 2) + "\n");

for (const p of book) {
  const nn = String(p.pageNumber).padStart(3, "0");
  const pageOut = {
    ...p,
    id: `sparks-journey-issue-002-p${nn}`,
    cleanArtRel: `generated/raw-art/page-${nn}.png`,
    letteredArtRel: `generated/lettered-pages/page-${nn}.webp`,
    publicArtRel: `assets/comics/sparks-journey/issue-002/pages/page-${nn}.webp`,
  };
  fs.writeFileSync(path.join(OUT, "pages", `page-${nn}.json`), JSON.stringify(pageOut, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT, "prompts", `page-${nn}.prompt.txt`), pageOut.grokPrompt + "\n");
}

console.log(
  JSON.stringify(
    {
      out: OUT,
      storyPages: storyPages.length,
      bookPages: book.length,
      continuityPages: continuityTrack.length,
    },
    null,
    2,
  ),
);
