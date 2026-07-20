/**
 * Issue #3 story pages + book assembly — Mira Eggwarden canon.
 */
const STYLE =
  "Original high-energy Western fantasy comic storytelling with dynamic panel composition, dramatic inked linework, richly painted colors, expressive character acting, and clear cinematic action. Original Riftwilds IP only. Warm earth greens, sandstone, timber, moss first; deep blue and ember-gold circus fabrics; cyan rift energy and amber lantern accents only. NO purple AI-fantasy default. NO Marvel/DC/Pokémon characters or logos.";

const NEG =
  "readable dialogue text, captions, logos, watermarks, page numbers, UI chrome, Marvel, DC, Pokémon, manga screentone trademarks, extra limbs, duplicate characters, missing companions, purple neon fantasy default, photoreal modern clothing, Pikachu lookalike, Cal Reed";

const SPARK_LOOK =
  "Spark the Glowpup-line Riftborn hatchling: soft luminous fur, cyan-gold rift markings, large expressive eyes, small crystal growths, glowing-tip emotional tail; steadier aura when bonded to Mira; cute but original — not a franchise mascot";

const LUMEN_LOOK =
  "Lumenhare: small indigo hare-like Rift companion, long luminous ears with gold tips, gold star markings, lantern-shaped tail glow, expressive eyes, illusion afterimages when leaping";

const MIRA_LOOK =
  "Mira Eggwarden: young hatchery mentor/Keeper, practical robes and egg-care satchel, warm determined expression, travel-stained coat, Compact lantern charm";

const LANTERN_LOOK =
  "Cael Vesper the Lanternmaster: mid-40s theatrical host, deep blue and ember-gold coat, brass lantern clasps, hand-painted half-mask with lantern motif, charismatic posture";

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
    `Riftwilds comic "The Traveling Circus" Issue #3, STORY PAGE ${n}/25 — ${title}.`,
    `Story purpose: ${purpose}`,
    `Layout: ${layout}. ${panels.length} panels with clear inked gutters.`,
    panels.map((p, i) => `Panel ${i + 1} (${p.id}): ${p.description}`).join(" "),
    `Characters: ${(opts.characters || ["mira-eggwarden"]).join(", ")}. Creatures: ${(opts.creatures || []).join(", ")}.`,
    `Mira design lock: ${MIRA_LOOK}. Spark design lock: ${SPARK_LOOK}. Lumenhare: ${LUMEN_LOOK}. Lanternmaster: ${LANTERN_LOOK}.`,
    `Environment: ${opts.environment || "Lanternveil Traveling Circus"}. Time: ${opts.time || "twilight"}. Weather: ${opts.weather || "soft magical fog"}.`,
    `Lighting: ${opts.lighting || "ember-gold lanterns with cyan rift accents"}. Continuity: ${JSON.stringify(opts.continuity || {})}`,
    "Leave empty balloon-safe and narration-safe negative space. NO readable text of any kind in the artwork. NO Cal Reed.",
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
    letteringInstructions: opts.lettering || "Standard speech + narration; keep tails off faces and Spark/Lumenhare eyes.",
    generationStatus: "pending",
    letteringStatus: "pending",
    approvalStatus: "script-complete",
    artAlt: opts.artAlt || `${title} — The Traveling Circus page ${n}`,
    atmosphere: opts.atmosphere || "festival",
    transcript: buildTranscript(panels),
  };
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
    `Riftwilds comic book ${role} page for The Traveling Circus Issue #3 — ${title}.`,
    panels.map((p) => p.description).join(" "),
    "Empty zones for title lettering. NO readable text in art. NO Cal Reed.",
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
    atmosphere: opts.atmosphere || "festival",
    letteringInstructions: "Bake titles/credits programmatically.",
    transcript: buildTranscript(panels),
  };
}

export function buildBook() {
  const continuityTrack = [];
  function cont(page, state) {
    continuityTrack.push({ page, ...state });
    return state;
  }
  const storyPages = [];

  storyPages.push(
    pageBase(
      1,
      "Roads Beneath Lanterns",
      "Full splash: team sees Lanternveil Circus at twilight; Spark glows.",
      "splash",
      [
        panel("p1a", {
          description:
            "Full-bleed splash: Lanternveil Traveling Circus at twilight — floating lanterns, painted deep-blue ember-gold wagons, crowds, companion performers, grand pavilion, Riftwild hills behind. Mira Eggwarden and companions in foreground; Spark glowing cyan-gold reacting to lanterns. Balloon-safe top.",
          camera: "wide establishing low angle",
          bubbles: [
            balloon("narration", null, "Some places are built on roads. Others build the road beneath them.", 50, 12, null, {
              maxWidthPct: 70,
            }),
            balloon("sfx", null, "lantern-hum…", 62, 40, null),
            balloon("creature", "Spark", "*bright pulse!*", 30, 78, "up"),
          ],
        }),
      ],
      {
        characters: ["mira-eggwarden"],
        creatures: ["spark", "bramblefox", "mossprig", "thornling", "wisplet"],
        continuity: cont(1, {
          location: "Lanternveil approach",
          time: "twilight",
          spark: { emotion: "wonder-alert", glow: "lantern-resonance" },
          mira: { stance: "cautious-curious" },
        }),
        pageTurn: "Enter the circus.",
        atmosphere: "festival",
        lighting: "twilight ember + cyan lanterns",
        environment: "circus approach road",
      },
    ),
  );

  storyPages.push(
    pageBase(
      2,
      "Step Right In",
      "Team enters; Thornling distracted; Bramblefox scans; Spark watches ring leaps.",
      "three-stack",
      [
        panel("p2a", {
          description: "Gate of painted wagons; Mira leads Spark; crowd cheers. Greeter silhouette ahead.",
          bubbles: [
            balloon("speech", "Mira Eggwarden", "Stay close. Wonder first — answers second.", 40, 30, "down", {
              maxWidthPct: 40,
            }),
          ],
        }),
        panel("p2b", {
          description: "Thornling lunges toward candy-ribbon stall; Mossprig tries to block.",
          bubbles: [
            balloon("creature", "Thornling", "*WANT!*", 70, 40, "up"),
            balloon("creature", "Mossprig", "*hold—*", 28, 55, "up"),
          ],
        }),
        panel("p2c", {
          description:
            "Bramblefox ears sharp scanning masked crowd; Spark watches luminous companion leap rings of light.",
          bubbles: [
            balloon("creature", "Bramblefox", "*rrrk…*", 25, 70, "up"),
            balloon("creature", "Spark", "*chirp awe*", 65, 35, "down"),
          ],
        }),
      ],
      {
        creatures: ["spark", "bramblefox", "mossprig", "thornling"],
        continuity: cont(2, { thornling: { status: "food-distracted" }, bramblefox: { status: "scanning-masks" } }),
        pageTurn: "Greeter notices Spark.",
      },
    ),
  );

  storyPages.push(
    pageBase(
      3,
      "The Greeter Notices",
      "Masked greeter welcomes Mira; Spark markings pulse to lantern; greeter hides reaction.",
      "two-col",
      [
        panel("p3a", {
          description:
            "Masked acrobat greeter bows with floating lantern; Mira polite but guarded; Spark markings pulse toward lantern.",
          bubbles: [
            balloon(
              "speech",
              "Masked Greeter",
              "Welcome, Keepers. Lanternveil opens for the curious — and the careful.",
              55,
              25,
              "down",
              { maxWidthPct: 42 },
            ),
            balloon("sfx", null, "pulse…", 30, 60, null),
          ],
        }),
        panel("p3b", {
          description:
            "Close on greeter eyes behind mask: recognition flicker at Spark's cyan-gold marks, then smooth smile — hides reaction. Three-arc charm half-hidden under sleeve cuff.",
          bubbles: [
            balloon("thought", "Masked Greeter", "…Riftborn markings. Not here. Not loud.", 50, 40, null, {
              maxWidthPct: 40,
            }),
            balloon("whisper", "Mira Eggwarden", "You felt that too.", 50, 78, "up"),
          ],
        }),
      ],
      {
        characters: ["mira-eggwarden", "masked-greeter"],
        creatures: ["spark"],
        continuity: cont(3, {
          greeter: { noticedSpark: true, hidReaction: true },
          spark: { glow: "lantern-sync" },
        }),
        pageTurn: "Warm montage.",
      },
    ),
  );

  storyPages.push(
    pageBase(
      4,
      "Wonder Market",
      "Warm montage: food, care tents, card booths, games, merchants, kids meeting companions.",
      "grid-2x2",
      [
        panel("p4a", {
          description: "Food stalls with steam and ember-gold banners; kids laughing.",
          bubbles: [balloon("sfx", null, "sizzle!", 40, 50, null)],
        }),
        panel("p4b", {
          description: "Creature care tent: gentle healers checking companion paws; Mossprig soft curiosity.",
          bubbles: [balloon("creature", "Mossprig", "*soft rustle*", 50, 70, "up")],
        }),
        panel("p4c", {
          description: "Card-trading booth with theatrical ability demo props (not gambling); Spark watches.",
          bubbles: [balloon("caption", null, "CARD BOOTHS · CHEERS ONLY", 50, 20, null, { maxWidthPct: 45 })],
        }),
        panel("p4d", {
          description: "Games and merchants; Spirit Moth drifts toward a lantern signal in distance.",
          bubbles: [balloon("creature", "Spirit Moth", "*signal-flicker*", 70, 30, "down")],
        }),
      ],
      {
        creatures: ["mossprig", "spark", "spirit-moth"],
        continuity: cont(4, { mood: "warm-joyful", spiritMoth: { tracking: "lantern-signal" } }),
        pageTurn: "Comic food incident.",
      },
    ),
  );

  storyPages.push(
    pageBase(
      5,
      "Snack Catastrophe",
      "Thornling comic food stall incident; Mossprig helps; Spark briefly laughs/relaxes.",
      "three-stack",
      [
        panel("p5a", {
          description: "Thornling topples stacked caramel-root cones; sticky chaos.",
          bubbles: [
            balloon("sfx", null, "SPLORP", 50, 40, null),
            balloon("creature", "Thornling", "*eep!*", 70, 60, "up"),
          ],
        }),
        panel("p5b", {
          description: "Mossprig Living Bulwark mini-dome catches falling trays; vendor relieved.",
          bubbles: [
            balloon("speech", "Vendor", "Hero moss!", 60, 25, "down"),
            balloon("creature", "Mossprig", "*steady…*", 35, 70, "up"),
          ],
        }),
        panel("p5c", {
          description: "Spark chirps a laugh-pulse; Mira soft smile — rare ease.",
          bubbles: [
            balloon("creature", "Spark", "*yip-laugh!*", 45, 40, "up"),
            balloon("speech", "Mira Eggwarden", "Even chaos can be Compact if nobody gets hurt.", 55, 75, "up", {
              maxWidthPct: 42,
            }),
          ],
        }),
      ],
      {
        creatures: ["thornling", "mossprig", "spark"],
        continuity: cont(5, { spark: { emotion: "relaxed-brief" }, mira: { emotion: "warm" } }),
        pageTurn: "Meet Lanternmaster.",
      },
    ),
  );

  storyPages.push(
    pageBase(
      6,
      "Lanternmaster Knows the Name",
      "Mira meets Lanternmaster; he knows Spark's name; Mira sees ancient Rift symbol on wall.",
      "two-col",
      [
        panel("p6a", {
          description: `Rich wagon interior. ${LANTERN_LOOK} seated with tea lanterns. Mira and Spark enter. Lumenhare on cushion.`,
          bubbles: [
            balloon(
              "speech",
              "Lanternmaster",
              "Mira Eggwarden. And Spark — Subject One, if the hunters' gossip is to be believed.",
              55,
              22,
              "down",
              { maxWidthPct: 44 },
            ),
            balloon("speech", "Mira Eggwarden", "We don't use that name.", 30, 70, "up"),
          ],
        }),
        panel("p6b", {
          description:
            "Mira notices nested ancient Rift symbol painted behind curtain — matches Shellward / First Rift language. Spark uneasy.",
          bubbles: [
            balloon("speech", "Lanternmaster", "Safety is a stage light. It shows what I choose to show.", 50, 20, "down", {
              maxWidthPct: 40,
            }),
            balloon("thought", "Mira Eggwarden", "That mark… Shellward's cousin.", 50, 78, null, { maxWidthPct: 35 }),
          ],
        }),
      ],
      {
        characters: ["mira-eggwarden", "lanternmaster"],
        creatures: ["spark", "lumenhare"],
        continuity: cont(6, { lanternmaster: { knowsSparkName: true }, mira: { noticedRiftSymbol: true } }),
        pageTurn: "Riftborn question avoided.",
      },
    ),
  );

  storyPages.push(
    pageBase(
      7,
      "Not Neatly in a Codex",
      "Lanternmaster: shelters that don't fit Codex; Mira asks Riftborn; he avoids.",
      "three-stack",
      [
        panel("p7a", {
          description: "Lanternmaster gestures to window showing odd companions in care pens — kind public face.",
          bubbles: [
            balloon("speech", "Lanternmaster", "We shelter what does not fit neatly inside a Codex.", 50, 25, "down", {
              maxWidthPct: 45,
            }),
          ],
        }),
        panel("p7b", {
          description: "Mira leans forward; Spark glow steady.",
          bubbles: [
            balloon("speech", "Mira Eggwarden", "Riftborn. Say the word if you know it.", 50, 40, "down", {
              maxWidthPct: 40,
            }),
          ],
        }),
        panel("p7c", {
          description: "Lanternmaster turns away to mask rack — theatrical dodge; Lumenhare ears dim.",
          bubbles: [
            balloon(
              "speech",
              "Lanternmaster",
              "Words are costumes. Come see the show — truth prefers an audience.",
              50,
              35,
              "down",
              { maxWidthPct: 45 },
            ),
            balloon("whisper", "Mira Eggwarden", "That's not an answer.", 50, 78, "up"),
          ],
        }),
      ],
      {
        characters: ["mira-eggwarden", "lanternmaster"],
        creatures: ["spark", "lumenhare"],
        continuity: cont(7, { lanternmaster: { avoidedRiftborn: true }, theme: "masks" }),
        pageTurn: "Main performance.",
      },
    ),
  );

  storyPages.push(
    pageBase(
      8,
      "Curtain Call Begins",
      "Main performance; introduce Lumenhare; acrobatics/illusion/elemental demos.",
      "splash",
      [
        panel("p8a", {
          description:
            "Grand pavilion performance: companion acrobatics, illusion rings, elemental sparks. Lumenhare center stage Lantern Leap through gold rings. Crowd awe. Mira's team in seats; Spark watches intently.",
          bubbles: [
            balloon("sfx", null, "BRASS FANFARE", 50, 12, null),
            balloon("caption", null, "LUMENHARE — LANTERN LEAP", 50, 28, null, { maxWidthPct: 50 }),
            balloon("creature", "Lumenhare", "*thump-leap!*", 55, 55, "up"),
            balloon("narration", null, "Wonder is honest. Motives rarely are.", 50, 88, null, { maxWidthPct: 55 }),
          ],
        }),
      ],
      {
        creatures: ["lumenhare", "spark", "bramblefox"],
        continuity: cont(8, { performance: "main-begun", lumenhare: { introduced: true } }),
        pageTurn: "Wisplet detects under-stage.",
      },
    ),
  );

  storyPages.push(
    pageBase(
      9,
      "Ghosts Under the Boards",
      "Wisplet detects trapped spirits under stage; Spirit Moth pulse; Spark uneasy.",
      "grid-2x2",
      [
        panel("p9a", {
          description: "Wisplet drifts down toward stage boards; faint ghostly companion silhouettes beneath.",
          bubbles: [balloon("creature", "Wisplet", "*warning-chime*", 50, 40, "up")],
        }),
        panel("p9b", {
          description: "Spirit Moth reacts to hidden lantern pulse backstage.",
          bubbles: [balloon("sfx", null, "hidden-pulse", 60, 45, null)],
        }),
        panel("p9c", {
          description: "Spark unease — glow strobes; Mira notices.",
          bubbles: [
            balloon("creature", "Spark", "*uneasy hum*", 45, 50, "up"),
            balloon("speech", "Mira Eggwarden", "Something's wrong under the stage.", 55, 75, "up", { maxWidthPct: 38 }),
          ],
        }),
        panel("p9d", {
          description: "Crowd still cheering above; contrast joy vs under-stage gloom.",
          bubbles: [balloon("narration", null, "Applause can be a lid.", 50, 50, null, { maxWidthPct: 40 })],
        }),
      ],
      {
        creatures: ["wisplet", "spirit-moth", "spark"],
        continuity: cont(9, { underStage: "trapped-spirits-detected", spark: { emotion: "uneasy" } }),
        pageTurn: "Spark meets Lumenhare.",
      },
    ),
  );

  storyPages.push(
    pageBase(
      10,
      "Resonance Meeting",
      "Spark meets Lumenhare backstage; nonverbal resonance recognition.",
      "two-col",
      [
        panel("p10a", {
          description:
            "Backstage quiet: Spark and Lumenhare face each other; ear-light and cyan-gold pulse exchange; no humans between them.",
          bubbles: [
            balloon("creature", "Spark", "*question-pulse*", 35, 40, "up"),
            balloon("creature", "Lumenhare", "*answer-glow*", 65, 45, "up"),
          ],
        }),
        panel("p10b", {
          description:
            "Shared resonance flare — Lumenhare recognizes Spark as kin-route; Mira watches from doorway without interrupting.",
          bubbles: [
            balloon("narration", null, "They speak without owning each other.", 50, 15, null, { maxWidthPct: 50 }),
            balloon("speech", "Mira Eggwarden", "Invite only. Always.", 40, 80, "up"),
          ],
        }),
      ],
      {
        creatures: ["spark", "lumenhare"],
        characters: ["mira-eggwarden"],
        continuity: cont(10, { sparkLumenhare: { bond: "resonance-recognition" } }),
        pageTurn: "Meridian sigil warning.",
      },
    ),
  );

  storyPages.push(
    pageBase(
      11,
      "Don't Ask Backstage",
      "Performer warns Mira; Bramblefox sees Meridian tracking sigil.",
      "three-stack",
      [
        panel("p11a", {
          description: "Performer (Seris Vale in disguise) blocks corridor; fake smile.",
          bubbles: [
            balloon(
              "speech",
              "Seris Vale",
              "Keepers shouldn't ask questions backstage. Spoilers ruin the act.",
              50,
              30,
              "down",
              { maxWidthPct: 45 },
            ),
          ],
        }),
        panel("p11b", {
          description: "Bramblefox nose to performer's cuff — three-arc Meridian tracking sigil charm.",
          bubbles: [
            balloon("creature", "Bramblefox", "*growl-low*", 40, 55, "up"),
            balloon("sfx", null, "sigil-glint", 70, 35, null),
          ],
        }),
        panel("p11c", {
          description: "Mira locks eyes with Seris; Spark half-hides behind Mira's satchel.",
          bubbles: [
            balloon("speech", "Mira Eggwarden", "Funny. Spoilers usually hide behind badges.", 50, 40, "down", {
              maxWidthPct: 40,
            }),
          ],
        }),
      ],
      {
        characters: ["mira-eggwarden", "seris-vale"],
        creatures: ["bramblefox", "spark"],
        continuity: cont(11, { infiltrator: "seris-vale-identified", meridian: { onSite: true } }),
        pageTurn: "Thornling restricted wagon.",
      },
    ),
  );

  storyPages.push(
    pageBase(
      12,
      "Restricted Wagon",
      "Thornling chases snack cart into restricted wagon; crates; broken Rift restraint.",
      "grid-2x2",
      [
        panel("p12a", {
          description: "Thornling races after glowing snack toy past RESTRICTED curtain.",
          bubbles: [balloon("creature", "Thornling", "*chase!*", 60, 40, "up")],
        }),
        panel("p12b", {
          description: "Inside wagon: crates with ancient symbols; Thornling skids.",
          bubbles: [balloon("sfx", null, "skrrt", 50, 50, null)],
        }),
        panel("p12c", {
          description: "Open crate: broken Rift restraint collar with Meridian tooling marks.",
          bubbles: [balloon("narration", null, "Not circus brass. Hunter iron.", 50, 20, null, { maxWidthPct: 40 })],
        }),
        panel("p12d", {
          description: "Mossprig pulls Thornling out; Mira and Bramblefox arrive.",
          bubbles: [
            balloon("speech", "Mira Eggwarden", "That's a collar. Not a costume.", 50, 70, "up", { maxWidthPct: 38 }),
          ],
        }),
      ],
      {
        creatures: ["thornling", "mossprig", "bramblefox"],
        characters: ["mira-eggwarden"],
        continuity: cont(12, { clue: "broken-rift-restraint", thornling: { foundRestricted: true } }),
        pageTurn: "Archive records.",
      },
    ),
  );

  // pages 13-25 continue in story-data-part2 — import merge below
  const more = buildStoryPages13to25(pageBase, panel, balloon, cont);
  storyPages.push(...more);

  for (const p of storyPages) p.storyPageNumber = p.pageNumber;

  const book = [];
  let bp = 1;
  book.push(
    matterPage(bp++, "front-cover", "The Traveling Circus — Cover", [
      panel("cover", {
        description:
          "Main cover: Spark centered beneath floating lanterns; Mira Eggwarden and companions entering circus; Lanternmaster above grand pavilion; Lumenhare leaping illusion rings; Meridian agents in shadows; sanctuary crystal glow in wagon; Lost City silhouette distant. Trade dress empty zones. Original Riftwilds.",
        bubbles: [
          balloon("caption", null, "RIFTWILDS", 50, 8, null),
          balloon("caption", null, "THE TRAVELING CIRCUS", 50, 18, null),
          balloon("caption", null, "ISSUE #3", 50, 88, null),
        ],
      }),
    ], { characters: ["mira-eggwarden", "lanternmaster"], creatures: ["spark", "lumenhare", "bramblefox"] }),
  );
  book.push(
    matterPage(bp++, "inside-cover", "Inside Front Cover", [
      panel("ifc", {
        description: "Quiet lantern-parchment inside cover; nested lantern watermark.",
        bubbles: [
          balloon("narration", null, "Legends of the Rift · Volume One · Issue Three", 50, 40, null, { maxWidthPct: 55 }),
          balloon("caption", null, "Previously: Spark's Journey", 50, 70, null),
        ],
      }),
    ]),
  );
  book.push(
    matterPage(bp++, "credits", "Credits", [
      panel("cred", {
        description: "Circus workshop desk: masks, quills, lantern ink — empty credit boxes.",
        bubbles: [
          balloon("caption", null, "THE TRAVELING CIRCUS", 50, 20, null),
          balloon(
            "narration",
            null,
            "Story & Continuity · Riftwilds Lore Desk  ·  Art Pipeline · Grok + programmatic lettering  ·  Original Riftwilds IP · Keeper: Mira Eggwarden",
            50,
            55,
            null,
            { maxWidthPct: 65 },
          ),
        ],
      }),
    ]),
  );
  book.push(
    matterPage(bp++, "title", "Chapter Three — Lanternveil", [
      panel("title", {
        description: "Title energy: circus pavilion silhouette, Spark and Lumenhare leap, Mira on threshold.",
        bubbles: [
          balloon("caption", null, "CHAPTER THREE", 50, 30, null),
          balloon("caption", null, "LANTERNVEIL", 50, 45, null),
          balloon("narration", null, "Masks protect. Masks hide. Choose which light you trust.", 50, 70, null, {
            maxWidthPct: 55,
          }),
        ],
      }),
    ], { creatures: ["spark", "lumenhare"] }),
  );

  for (const sp of storyPages) {
    book.push({ ...sp, pageNumber: bp, storyPageNumber: sp.storyPageNumber });
    bp++;
  }

  book.push(
    matterPage(bp++, "teaser", "Next Issue — The Lost City", [
      panel("teaser", {
        description: "Teaser: Lost City towers lighting; Guardian shadow; map pin pulse.",
        bubbles: [
          balloon("caption", null, "NEXT ISSUE", 50, 15, null),
          balloon("caption", null, "THE LOST CITY", 50, 28, null),
          balloon("narration", null, "The Guardian remembers. The collection is already walking.", 50, 70, null, {
            maxWidthPct: 55,
          }),
        ],
      }),
    ], { atmosphere: "rift" }),
  );
  book.push(
    matterPage(bp++, "profile", "Character Profile — The Lanternmaster", [
      panel("prof", {
        description: "Cael Vesper portrait with mask on/off split; Lumenhare; lantern symbol.",
        bubbles: [
          balloon("caption", null, "CAEL VESPER · THE LANTERNMASTER", 50, 15, null, { maxWidthPct: 60 }),
          balloon(
            "narration",
            null,
            "Charismatic · Theatrical · Never fully direct · Protects unusual companions along Rift lines",
            50,
            55,
            null,
            { maxWidthPct: 55 },
          ),
        ],
      }),
    ], { characters: ["lanternmaster"], creatures: ["lumenhare"] }),
  );
  book.push(
    matterPage(bp++, "profile", "Companion Profile — Lumenhare", [
      panel("comp", {
        description: "Lumenhare reference: front/side/leap; indigo gold stars; ability effect sketches without text.",
        bubbles: [
          balloon("caption", null, "LUMENHARE", 50, 12, null),
          balloon(
            "narration",
            null,
            "Support · Illusion · Mobility — Curtain Call · Lantern Leap · Grand Illusion",
            50,
            70,
            null,
            { maxWidthPct: 55 },
          ),
        ],
      }),
    ], { creatures: ["lumenhare"] }),
  );
  book.push(
    matterPage(bp++, "lore", "Codex — Lanternveil Traveling Circus", [
      panel("codex", {
        description: "Illustrated codex plate: wagons, pavilion, vault, rift engine silhouette.",
        bubbles: [
          balloon("caption", null, "CODEX: LANTERNVEIL TRAVELING CIRCUS", 50, 12, null, { maxWidthPct: 65 }),
          balloon(
            "narration",
            null,
            "A roaming sanctuary that follows ancient Rift lines. Wonder in public. Wards in private.",
            50,
            70,
            null,
            { maxWidthPct: 55 },
          ),
        ],
      }),
    ]),
  );
  book.push(
    matterPage(bp++, "lore", "Ability Spotlight — Grand Illusion", [
      panel("abil", {
        description: "Lumenhare creating illusion copies of Spark and Bramblefox absorbing strikes.",
        bubbles: [
          balloon("caption", null, "ABILITY: GRAND ILLUSION", 50, 15, null),
          balloon(
            "narration",
            null,
            "Temporary illusion copies of allies absorb one attack each — stagecraft as shield.",
            50,
            75,
            null,
            { maxWidthPct: 55 },
          ),
        ],
      }),
    ], { creatures: ["lumenhare", "spark"] }),
  );
  book.push(
    matterPage(bp++, "map", "World Map — Sanctum to Circus to Lost City", [
      panel("map", {
        description: "Stylized map: Commons, Shellward Sanctum, Lanternveil Circus route, Lost City pulse pin.",
        bubbles: [
          balloon("caption", null, "THRESHOLD ROUTES", 50, 12, null),
          balloon(
            "narration",
            null,
            "Where the crystal slept. Where lanterns roll. Where the Guardian stirs.",
            50,
            80,
            null,
            { maxWidthPct: 55 },
          ),
        ],
      }),
    ]),
  );
  book.push(
    matterPage(bp++, "letters", "Editor's Note", [
      panel("ed", {
        description: "Editor desk with mask and lantern; warm parchment light.",
        bubbles: [
          balloon("caption", null, "EDITOR'S NOTE", 50, 15, null),
          balloon(
            "narration",
            null,
            "Performance can be kindness or cage. This issue asks Keepers to tell the difference — and to free what was never meant to be an act.",
            50,
            50,
            null,
            { maxWidthPct: 60 },
          ),
        ],
      }),
    ]),
  );
  book.push(
    matterPage(bp++, "inside-cover", "Inside Back Cover", [
      panel("ibc", {
        description: "Quiet aftershow: Ironmantle resting, Spark and Lumenhare nearby, damaged pavilion lanterns.",
        bubbles: [
          balloon(
            "narration",
            null,
            "Continue in Live World · Event key traveling_circus · Study companions in the Codex",
            50,
            50,
            null,
            { maxWidthPct: 60 },
          ),
        ],
      }),
    ]),
  );
  book.push(
    matterPage(bp++, "back-cover", "Back Cover — Lanternveil Grand Performance", [
      panel("bc", {
        description:
          "In-universe ad: floating lanterns, companion performers, ticket graphic empty zones, hidden ancient symbol, moonrise warning mood. No gambling.",
        bubbles: [
          balloon("caption", null, "LANTERNVEIL GRAND PERFORMANCE", 50, 18, null, { maxWidthPct: 70 }),
          balloon(
            "narration",
            null,
            "Floating lanterns. Companion acts. Honest cheers — never SOL in the hat. Keep companions close after moonrise. (In-world advertisement · not a real-money offer.)",
            50,
            70,
            null,
            { maxWidthPct: 65 },
          ),
        ],
      }),
    ]),
  );

  return { storyPages, book, continuityTrack, STYLE };
}

function buildStoryPages13to25(pageBase, panel, balloon, cont) {
  const pages = [];
  pages.push(
    pageBase(
      13,
      "Archive of Routes",
      "Archive wagon: Riftborn records MISSING/CAPTURED/HIDDEN.",
      "splash",
      [
        panel("p13a", {
          description:
            "Mobile archive wagon: illustrated ledgers of Riftborn companions across eras. Mira, Spark, Wisplet, Spirit Moth. Stamps as icon marks (not readable text): missing/captured/hidden motifs.",
          bubbles: [
            balloon("narration", null, "They kept records the Codex never dared to finish.", 50, 12, null, {
              maxWidthPct: 60,
            }),
            balloon("speech", "Mira Eggwarden", "Missing. Captured. Hidden…", 40, 45, "up"),
            balloon("creature", "Spark", "*afraid-hum*", 70, 70, "up"),
          ],
        }),
      ],
      {
        creatures: ["spark", "wisplet", "spirit-moth"],
        continuity: cont(13, { archive: "riftborn-ledger-found" }),
        pageTurn: "Ember Route note.",
        atmosphere: "rift",
      },
    ),
  );
  pages.push(
    pageBase(
      14,
      "Ember Route",
      "Spark sees self-like image; Resonance Bearer Ember Route; multiple routes.",
      "two-col",
      [
        panel("p14a", {
          description: "Close: ledger illustration of creature resembling Spark with nested markings.",
          bubbles: [balloon("creature", "Spark", "*recognition-chirp*", 50, 40, "up")],
        }),
        panel("p14b", {
          description: "Mira reads note (lettered overlay): Resonance Bearer — Ember Route.",
          bubbles: [
            balloon("caption", null, "RESONANCE BEARER: EMBER ROUTE", 50, 22, null, { maxWidthPct: 50 }),
            balloon("speech", "Mira Eggwarden", "Not one accident. Several roads.", 50, 70, "up", { maxWidthPct: 38 }),
          ],
        }),
      ],
      {
        creatures: ["spark"],
        continuity: cont(14, { revelation: "ember-route", spark: { identity: "one-of-routes" } }),
        pageTurn: "Vault crystal.",
      },
    ),
  );
  pages.push(
    pageBase(
      15,
      "Crystal in the Vault",
      "Bramblefox leads to vault; Shellward crystal seen; alarms.",
      "three-stack",
      [
        panel("p15a", {
          description: "Bramblefox leads team through backstage tunnel to artifact vault door with lantern wards.",
          bubbles: [balloon("creature", "Bramblefox", "*this way*", 50, 50, "up")],
        }),
        panel("p15b", {
          description:
            "Vault interior: Shellward sanctuary crystal on warded pedestal — same crystal missing from Issue #2 — glowing soft cyan-gold.",
          bubbles: [
            balloon("narration", null, "Not stolen by hunters. Held under lantern law.", 50, 15, null, {
              maxWidthPct: 50,
            }),
            balloon("creature", "Spark", "*drawn-pulse!*", 55, 70, "up"),
          ],
        }),
        panel("p15c", {
          description: "Alarms flare — cyan ward rings; Seris silhouette at door.",
          bubbles: [
            balloon("sfx", null, "ALARM-CHIME!!!", 50, 40, null),
            balloon("shout", "Seris Vale", "Collection protocol — now!", 50, 75, "up"),
          ],
        }),
      ],
      {
        characters: ["mira-eggwarden", "seris-vale"],
        creatures: ["bramblefox", "spark", "mossprig"],
        continuity: cont(15, { crystal: "shellward-in-circus-vault", alarms: true }),
        pageTurn: "Sabotage battle reveal.",
      },
    ),
  );
  pages.push(
    pageBase(
      16,
      "Sabotage",
      "Grand performance sabotaged; Rift engine overload; controlled companion breaks free.",
      "splash",
      [
        panel("p16a", {
          description:
            "Dramatic splash: central Rift engine under pavilion overloads cyan-amber; Ironmantle (large armored controlled companion) breaks free onstage with glowing Meridian control collar; audience mid-scream; lanterns swinging.",
          bubbles: [
            balloon("sfx", null, "KRRAAACK—OVERLOAD", 50, 18, null),
            balloon("shout", "Crowd", "RUN—!", 70, 35, "down"),
            balloon("narration", null, "The act ends. The trap begins.", 50, 88, null, { maxWidthPct: 50 }),
          ],
        }),
      ],
      {
        creatures: ["ironmantle", "lumenhare", "spark"],
        characters: ["mira-eggwarden", "lanternmaster"],
        continuity: cont(16, { sabotage: true, ironmantle: { status: "berserk-controlled" } }),
        pageTurn: "Panic and shield.",
        atmosphere: "rift",
      },
    ),
  );
  pages.push(
    pageBase(
      17,
      "Living Bulwark",
      "Crowds flee; Mossprig shields civilians; Mira organizes companions.",
      "grid-2x2",
      [
        panel("p17a", {
          description: "Crowds panic fleeing pavilion; Ironmantle attacks blindly.",
          bubbles: [balloon("sfx", null, "STOMP", 50, 50, null)],
        }),
        panel("p17b", {
          description: "Mossprig Living Bulwark dome shields children and vendors; shoulder burn visible.",
          bubbles: [balloon("creature", "Mossprig", "*BULWARK!*", 50, 45, "up")],
        }),
        panel("p17c", {
          description: "Mira points positions — strategy, not panic.",
          bubbles: [
            balloon(
              "speech",
              "Mira Eggwarden",
              "Bramblefox flank. Thornling energy. Spark — with me, not as a weapon.",
              50,
              35,
              "down",
              { maxWidthPct: 45 },
            ),
          ],
        }),
        panel("p17d", {
          description: "Lumenhare Curtain Call illusions draw Ironmantle's strike off civilians.",
          bubbles: [balloon("creature", "Lumenhare", "*curtain!*", 60, 40, "up")],
        }),
      ],
      {
        creatures: ["mossprig", "bramblefox", "thornling", "spark", "lumenhare", "ironmantle"],
        continuity: cont(17, { mossprig: { ability: "Living Bulwark" }, mira: { stance: "battle-strategy" } }),
        pageTurn: "Coordinated battle spread.",
      },
    ),
  );
  pages.push(
    pageBase(
      18,
      "Grand Chaos",
      "Battle spread: Pulse Step, flank, Sprouting Energy, Grand Illusion, Wisplet phases cables.",
      "spread",
      [
        panel("p18a", {
          description:
            "Wide battle spread: Spark Pulse Step blur; Bramblefox vine-flank; Thornling Sprouting Energy; Lumenhare Grand Illusion copies; Wisplet phases binding cables; performers evacuating; Meridian agents attacking from backstage.",
          bubbles: [
            balloon("sfx", null, "PULSE-STEP", 25, 20, null),
            balloon("sfx", null, "ILLUSION×3", 55, 25, null),
            balloon("sfx", null, "phase-chime", 75, 40, null),
            balloon("creature", "Thornling", "*sprout-POW!*", 40, 70, "up"),
            balloon("narration", null, "Consent is a formation. Fear is a stampede.", 50, 90, null, {
              maxWidthPct: 55,
            }),
          ],
        }),
      ],
      {
        creatures: ["spark", "bramblefox", "thornling", "lumenhare", "wisplet", "ironmantle"],
        continuity: cont(18, { battle: "coordinated-circus" }),
        pageTurn: "Collar truth.",
        lettering: "Dense SFX; keep faces clear.",
        atmosphere: "rift",
      },
    ),
  );
  pages.push(
    pageBase(
      19,
      "Not Evil — Collared",
      "Mira realizes creature controlled; Spark approaches despite danger.",
      "three-stack",
      [
        panel("p19a", {
          description: "Close on Ironmantle neck: glowing Meridian control collar; pain in creature eyes.",
          bubbles: [balloon("speech", "Mira Eggwarden", "It's not choosing this.", 50, 30, "down")],
        }),
        panel("p19b", {
          description: "Spark steps forward despite danger; Mira hand half-raised — not a command.",
          bubbles: [balloon("creature", "Spark", "*determined-chirp*", 50, 50, "up")],
        }),
        panel("p19c", {
          description: "Lanternmaster mid-combat misdirection; Seris snarls.",
          bubbles: [balloon("shout", "Seris Vale", "Collar the Riftborn!", 60, 40, "down")],
        }),
      ],
      {
        characters: ["mira-eggwarden", "seris-vale", "lanternmaster"],
        creatures: ["spark", "ironmantle"],
        continuity: cont(19, { ironmantle: { truth: "controlled-not-evil" }, spark: { approaching: true } }),
        pageTurn: "Spark chooses.",
      },
    ),
  );
  pages.push(
    pageBase(
      20,
      "Spark Chooses",
      "Mira refuses to order Spark; Spark chooses; Spark + Lumenhare combine.",
      "two-col",
      [
        panel("p20a", {
          description: "Mira kneels to Spark's eye level — open hands, no order.",
          bubbles: [
            balloon("speech", "Mira Eggwarden", "I won't order you forward. If you go, you choose.", 50, 35, "down", {
              maxWidthPct: 42,
            }),
          ],
        }),
        panel("p20b", {
          description:
            "Spark and Lumenhare combine cyan-gold resonance with indigo-gold Grand Illusion weave around Ironmantle collar.",
          bubbles: [
            balloon("sfx", null, "RESONANCE+ILLUSION", 50, 30, null),
            balloon("creature", "Spark", "*together!*", 35, 70, "up"),
            balloon("creature", "Lumenhare", "*veil!*", 70, 65, "up"),
          ],
        }),
      ],
      {
        creatures: ["spark", "lumenhare", "ironmantle"],
        continuity: cont(20, { spark: { choice: "voluntary-help" }, combo: "resonance+illusion" }),
        pageTurn: "Nira sabotages relay.",
      },
    ),
  );
  pages.push(
    pageBase(
      21,
      "Quiet Betrayal of the Hunt",
      "Nira disables control relay; Bramblefox destroys restraint; Ironmantle freed.",
      "three-stack",
      [
        panel("p21a", {
          description: "Nira Quill in Meridian kit secretly cuts glowing control relay — conflicted face.",
          bubbles: [
            balloon("whisper", "Nira Quill", "Not another Subject One. Not like this.", 50, 40, "up", {
              maxWidthPct: 40,
            }),
          ],
        }),
        panel("p21b", {
          description: "Bramblefox Forest Bond vines shatter exposed restraint collar.",
          bubbles: [
            balloon("sfx", null, "SNAP—VINE", 50, 45, null),
            balloon("creature", "Bramblefox", "*rrRAH!*", 55, 70, "up"),
          ],
        }),
        panel("p21c", {
          description: "Ironmantle collapses then breathes free — collar dead; eyes clear.",
          bubbles: [
            balloon("narration", null, "Freed — not defeated.", 50, 20, null, { maxWidthPct: 40 }),
            balloon("creature", "Ironmantle", "*…safe?*", 50, 70, "up"),
          ],
        }),
      ],
      {
        characters: ["nira-quill"],
        creatures: ["bramblefox", "ironmantle", "spark"],
        continuity: cont(21, { nira: { helpedSecretly: true }, ironmantle: { status: "freed" } }),
        pageTurn: "Action splash retaliation.",
      },
    ),
  );
  pages.push(
    pageBase(
      22,
      "Lanternmaster Unmasked in Battle",
      "Freed creature turns on infiltrators; Lanternmaster combat; infiltrators retreat.",
      "splash",
      [
        panel("p22a", {
          description:
            "Action splash: Ironmantle turns on Meridian agents; Lanternmaster reveals combat skill with staff-lantern; Seris retreats with partial data slate; Spark shielded by Mira and Lumenhare. Damage on pavilion.",
          bubbles: [
            balloon("sfx", null, "CLANG—LANTERN STAFF", 40, 20, null),
            balloon("shout", "Seris Vale", "We have enough for the Lost City team—!", 70, 35, "down", {
              maxWidthPct: 40,
            }),
            balloon("speech", "Lanternmaster", "Exit stage left. Curtain's mine.", 30, 75, "up", { maxWidthPct: 35 }),
          ],
        }),
      ],
      {
        characters: ["lanternmaster", "mira-eggwarden", "seris-vale"],
        creatures: ["ironmantle", "spark", "lumenhare"],
        continuity: cont(22, {
          meridian: { retreatedPartialData: true },
          lanternmaster: { combatRevealed: true },
          spark: { captured: false },
        }),
        pageTurn: "Aftermath truth.",
        atmosphere: "rift",
      },
    ),
  );
  pages.push(
    pageBase(
      23,
      "We Move Them",
      "Aftermath; Lanternmaster admits circus protected Riftborn; crystal protected.",
      "two-col",
      [
        panel("p23a", {
          description: "Aftermath damaged pavilion; caring for Ironmantle; Mira faces Lanternmaster.",
          bubbles: [
            balloon(
              "speech",
              "Lanternmaster",
              "We have moved Riftborn between safe places for generations. Stages make better walls than prisons — sometimes.",
              50,
              25,
              "down",
              { maxWidthPct: 48 },
            ),
          ],
        }),
        panel("p23b", {
          description: "Vault crystal under ward; Spark calm beside it briefly.",
          bubbles: [
            balloon(
              "speech",
              "Lanternmaster",
              "Your sanctuary crystal was never Meridian loot. It was lantern cargo.",
              50,
              30,
              "down",
              { maxWidthPct: 42 },
            ),
            balloon(
              "speech",
              "Mira Eggwarden",
              "Protection and imprisonment share a door. Which side are you on when it closes?",
              50,
              75,
              "up",
              { maxWidthPct: 42 },
            ),
          ],
        }),
      ],
      {
        characters: ["mira-eggwarden", "lanternmaster"],
        creatures: ["spark", "ironmantle"],
        continuity: cont(23, {
          crystal: "confirmed-circus-protection",
          lanternmaster: { admittedRiftbornShelter: true },
        }),
        pageTurn: "Map to Lost City.",
      },
    ),
  );
  pages.push(
    pageBase(
      24,
      "Map of Thresholds",
      "Secret map: Commons, sanctuary, circus, Lost City; pulse under Lost City.",
      "splash",
      [
        panel("p24a", {
          description:
            "Lanternmaster opens secret map: Commons, Shellward Sanctum, Lanternveil Circus, Lost City. Soft pulse under Lost City marker. Mira, Spark, Lumenhare watch.",
          bubbles: [
            balloon("caption", null, "COMMONS · SANCTUM · CIRCUS · LOST CITY", 50, 12, null, { maxWidthPct: 65 }),
            balloon("sfx", null, "pulse…pulse…", 70, 55, null),
            balloon("speech", "Lanternmaster", "The road remembers where hearts still sleep.", 40, 80, "up", {
              maxWidthPct: 40,
            }),
          ],
        }),
      ],
      {
        characters: ["mira-eggwarden", "lanternmaster"],
        creatures: ["spark", "lumenhare"],
        continuity: cont(24, { map: "lost-city-route", lostCity: { pulse: "beginning" } }),
        pageTurn: "Cliffhanger Guardian.",
        atmosphere: "rift",
      },
    ),
  );
  pages.push(
    pageBase(
      25,
      "The Guardian Remembers",
      "Lost City night cliffhanger; towers light; shadow; NEXT THE LOST CITY.",
      "splash",
      [
        panel("p25a", {
          description:
            "Cliffhanger splash: Lost City at night — ancient layered towers lighting one by one cyan-amber; massive shadow beneath ruins; small Mira/Spark silhouette on ridge optional.",
          bubbles: [
            balloon("telepathy", "Beneath the Ruins", "The Guardian remembers.", 50, 28, null, { maxWidthPct: 50 }),
            balloon("sfx", null, "TOWER-LIGHT… TOWER-LIGHT…", 50, 50, null),
            balloon("caption", null, "TO BE CONTINUED", 50, 72, null, { maxWidthPct: 45 }),
            balloon("caption", null, "NEXT: THE LOST CITY", 50, 84, null, { maxWidthPct: 50 }),
          ],
        }),
      ],
      {
        continuity: cont(25, {
          cliffhanger: "guardian-remembers",
          nextIssue: "the-lost-city",
          spark: { bond: "voluntary-with-mira" },
        }),
        pageTurn: "End Issue #3.",
        atmosphere: "rift",
        lighting: "night city awakening",
      },
    ),
  );
  return pages;
}
