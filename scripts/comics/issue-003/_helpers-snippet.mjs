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
    `Characters: ${(opts.characters || ["cal-reed"]).join(", ")}. Creatures: ${(opts.creatures || []).join(", ")}.`,
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
    characters: opts.characters || ["cal-reed"],
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

