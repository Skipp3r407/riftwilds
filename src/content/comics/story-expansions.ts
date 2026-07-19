/**
 * Extra story beats appended before bridge padding.
 * Keeps each issue's middle/late pages unique instead of recycled filler.
 */

import { PAGE_ART, SPLASH } from "@/content/comics/art";
import {
  caption,
  narrate,
  sfx,
  speech,
  thought,
  type Beat,
} from "@/content/comics/page-builder";

export const STORY_EXPANSIONS: Record<string, Beat[]> = {
  "the-first-rift": [
    {
      kind: "dialogue",
      atmosphere: "dawn",
      artSrc: PAGE_ART.regionCommons,
      lines: [
        narrate("Mud took bootprints. The Riftstone took names."),
        speech("Healer", "We can raise walls. Or we can raise Keepers."),
        speech("Elara Venn", "Raise Keepers who know which wall is a cradle."),
        sfx("soft dawn wind"),
      ],
    },
    {
      kind: "scene",
      atmosphere: "day",
      artSrc: PAGE_ART.commonsDusk,
      panels: [
        {
          bubbles: [
            speech("Child", "Will the egg leave if I am scared?"),
            speech("Elara Venn", "Fear is allowed. Force is not."),
          ],
        },
        {
          bubbles: [
            narrate("That was the first Compact law — spoken before ink existed."),
            thought("First Riftling", "…stay…"),
          ],
        },
      ],
    },
    {
      kind: "scene",
      layout: "three-stack",
      atmosphere: "dusk",
      artSrc: PAGE_ART.forest,
      panels: [
        {
          bubbles: [
            narrate("On the seventh night the Fracture roads rearranged again."),
            speech("Scout", "East gate is west. West gate is… soup."),
          ],
        },
        {
          bubbles: [
            speech("Elara Venn", "Then we walk by warmth, not by map."),
            thought("First Riftling", "…warm…"),
          ],
        },
        {
          bubbles: [
            caption("Codex stub: Fracture roads"),
            sfx("path rewrite… hum"),
          ],
        },
      ],
    },
    {
      kind: "dialogue",
      atmosphere: "night",
      artSrc: PAGE_ART.rift,
      lines: [
        narrate("A stranger offered a crown-shard for the egg — bright, legal-looking, wrong."),
        speech("Crown courier", "Name a price. The realm will keep it safer than mud."),
        speech("Elara Venn", "The egg is not inventory. Leave."),
        sfx("shard reject — clink"),
      ],
    },
    {
      kind: "lore",
      title: "Soft Exodus fragment",
      body: "When the Prime tore, living stories fled into shells. First Riftlings are archives that chose caretakers — not weapons that chose masters.",
      atmosphere: "rift",
      artSrc: SPLASH.riftDawn,
    },
    {
      kind: "scene",
      atmosphere: "dawn",
      artSrc: PAGE_ART.commons,
      panels: [
        {
          bubbles: [
            speech("Village elder", "We will call this place Commons — shared ground."),
            speech("Elara Venn", "Shared duty. Shared keeping."),
          ],
        },
        {
          bubbles: [
            narrate("The Riftstone accepted mud, names, and a courier who refused a throne."),
            thought("First Riftling", "…home…"),
          ],
        },
      ],
    },
    {
      kind: "splash",
      title: "Something listens beyond the tear",
      artSrc: SPLASH.shadow,
      artAlt: "Distant void-call beyond the first rift tear",
      atmosphere: "rift",
      narration:
        "As the Commons named itself, a second pulse answered from unmapped dark — not crown, not merchant. Cliffhanger: the Fracture was not finished speaking.",
      isKeyArt: true,
      hotspots: [
        {
          id: "hs-first-rift-cliff",
          label: "Second pulse",
          x: 68,
          y: 22,
          w: 16,
          h: 14,
          codexEntryId: "wl-fracture",
          secretCode: "SECOND-PULSE",
          hint: "A colder cyan blinks once — then waits.",
        },
      ],
    },
    {
      kind: "dialogue",
      atmosphere: "night",
      artSrc: PAGE_ART.timelineAwakening,
      lines: [
        speech("Elara Venn", "We keep what we can see. We prepare for what we cannot."),
        thought("First Riftling", "…listen…"),
        narrate("Issue #1 closes on a promise — and a pulse that will call Spark, Circus, and every Keeper after."),
        caption("Next: Spark's Journey — Compact on the open road"),
      ],
    },
  ],

  "sparks-journey": [
    {
      kind: "dialogue",
      atmosphere: "day",
      artSrc: PAGE_ART.forest,
      lines: [
        narrate("Spark learned three roads: hatchery, fringe, and the space between yes and wait."),
        speech("Mira Eggwarden", "Invitation is a sentence with a period. Do not rush the end."),
        speech("Spark", "yip…"),
        sfx("soft padding on moss"),
      ],
    },
    {
      kind: "scene",
      layout: "three-stack",
      atmosphere: "dusk",
      artSrc: PAGE_ART.regionElderwood,
      panels: [
        {
          bubbles: [
            speech("Market kid", "Make it glow!"),
            thought("Spark", "glow is not a command"),
          ],
        },
        {
          bubbles: [
            speech("Keeper trainee", "Ask. Then wait. Then thank."),
            speech("Spark", "yip!"),
          ],
        },
        {
          bubbles: [
            narrate("Consent traveled farther than any trick."),
            caption("Hatchery Compact — field practice"),
          ],
        },
      ],
    },
    {
      kind: "splash",
      title: "Home is a listener",
      artSrc: SPLASH.sparkPath,
      artAlt: "Glowpup returning along a mossy path at dusk",
      atmosphere: "dusk",
      narration: "Spark returned to the hatchery not as inventory — as a partner who chose the door.",
    },
    {
      kind: "dialogue",
      atmosphere: "night",
      artSrc: PAGE_ART.commons,
      lines: [
        speech("Mira Eggwarden", "You paused when the mote ran. That is Keeper-shaped."),
        speech("Spark", "…yip."),
        narrate("Avatar reward stub: Spark's Path — cosmetics only, never SOL."),
        caption("Issue #2 complete arc — Compact kept."),
      ],
    },
    {
      kind: "lore",
      title: "Invitation grammar",
      body: "Ask. Wait. Thank. Back away if the egg backs away. Credits buy supplies; consent is not priced.",
      atmosphere: "day",
      artSrc: PAGE_ART.forest,
    },
  ],

  "the-traveling-circus": [
    {
      kind: "scene",
      atmosphere: "festival",
      artSrc: PAGE_ART.festival,
      panels: [
        {
          bubbles: [
            speech("Plaza Crier", "Act one: ribbons that remember wind!"),
            sfx("BRASS!"),
          ],
        },
        {
          bubbles: [
            speech("Performer", "Act two: pets who choose the spotlight."),
            thought("Spark", "maybe… later"),
          ],
        },
      ],
    },
    {
      kind: "dialogue",
      atmosphere: "festival",
      artSrc: PAGE_ART.lanternSky,
      lines: [
        narrate("Act three recovered a prop that was never for sale — applause counted as participation."),
        speech("Plaza Crier", "Lost tickets return as honest prizes. No SOL in the hat."),
        speech("Kid", "Again!"),
        caption("World event preview: traveling_circus"),
      ],
    },
    {
      kind: "scene",
      layout: "two-col",
      atmosphere: "night",
      artSrc: SPLASH.circus,
      panels: [
        {
          bubbles: [
            speech("Keeper", "Will the wagons stay?"),
            speech("Plaza Crier", "While the plaza remembers cheer — and Compact."),
          ],
        },
        {
          bubbles: [
            narrate("Lanterns lowered. The event key stayed warm in the ledger of Happening Now."),
            sfx("confetti settle…"),
          ],
        },
      ],
    },
    {
      kind: "lore",
      title: "Honest raffle",
      body: "Circus prizes are Credits cosmetics and community cheer. Secret code CIRCUS-APPLAUSE is a local quest stub, not a server grant.",
      atmosphere: "festival",
      artSrc: PAGE_ART.festival,
    },
  ],

  "the-lost-city": [
    {
      kind: "scene",
      atmosphere: "ruin",
      artSrc: PAGE_ART.layeredRuin,
      panels: [
        {
          bubbles: [
            speech("Pip Courier", "Plaza in sand. Plaza in moss. Same plaza?"),
            speech("Archivist Solen", "Same duty. Annotate climate layers separately."),
          ],
        },
        {
          bubbles: [
            narrate("The Heart shard pulsed when they stopped arguing."),
            thought("Keeper", "Listening is also mapping."),
            sfx("HUM…"),
          ],
        },
      ],
    },
    {
      kind: "dialogue",
      atmosphere: "dusk",
      artSrc: PAGE_ART.rift,
      lines: [
        speech("Gateway echo", "…who keeps the invitation…"),
        speech("Archivist Solen", "We do — with footnotes."),
        speech("Pip Courier", "And snacks."),
        caption("Secret: LAYER-CITY"),
      ],
    },
    {
      kind: "splash",
      title: "Three climates, one promise",
      artSrc: SPLASH.lostCity,
      artAlt: "Layered city Heart glowing under mixed climates",
      atmosphere: "ruin",
      narration: "They left a marker, not a claim. Exploration that preserves is still exploration.",
    },
    {
      kind: "scene",
      layout: "three-stack",
      atmosphere: "night",
      artSrc: PAGE_ART.layeredRuin,
      panels: [
        { bubbles: [speech("Pip Courier", "Satchel says home."), sfx("pack cinch")] },
        { bubbles: [speech("Archivist Solen", "Index says return. Heart says soon.")] },
        { bubbles: [narrate("The map gained a margin note: keep listening.")] },
      ],
    },
    {
      kind: "lore",
      title: "Gateway Heart etiquette",
      body: "Hearts are living cores. Stones are travel shards. Ruins that still hum are not loot tables.",
      atmosphere: "ruin",
      artSrc: PAGE_ART.rift,
    },
  ],

  "the-storm-king": [
    {
      kind: "dialogue",
      atmosphere: "storm",
      artSrc: SPLASH.stormKing,
      lines: [
        speech("Storm King", "Weather does not wait for Compact committees."),
        speech("Elara Venn", "Neither does cruelty wait for an excuse."),
        speech("Voltkit", "zzzt—!"),
        sfx("KRACK"),
      ],
    },
    {
      kind: "scene",
      atmosphere: "storm",
      artSrc: PAGE_ART.regionStorm,
      panels: [
        {
          bubbles: [
            narrate("They dueled with words first — lightning second."),
            thought("Keeper", "I came for a trophy. I found a mirror."),
          ],
        },
        {
          bubbles: [
            speech("Storm King", "Prove kindness can hold a peak."),
            speech("Elara Venn", "Meet us when the clouds clear — Compact stands."),
          ],
        },
      ],
    },
    {
      kind: "splash",
      title: "Kindness on the ridge",
      artSrc: SPLASH.stormKing,
      artAlt: "Storm clearing over highland ridge",
      atmosphere: "dusk",
      narration: "Thunder named a king. The Commons answered with patience — and a rematch date.",
    },
    {
      kind: "dialogue",
      atmosphere: "night",
      artSrc: PAGE_ART.commonsDusk,
      lines: [
        caption("Quest unlock stub: STORM-KINDNESS"),
        speech("Voltkit", "zz…"),
        narrate("Rival ethics stay complicated. Compact law stays clear."),
        speech("Elara Venn", "Bring water when you return. Storms forget thirst."),
      ],
    },
    {
      kind: "lore",
      title: "Foil, not monster",
      body: "Story bible antagonists carry reasons. Force that breaks Compact is still wrong — even when lightning agrees.",
      atmosphere: "storm",
      artSrc: SPLASH.stormKing,
    },
  ],

  "the-merchants-secret": [
    {
      kind: "dialogue",
      atmosphere: "night",
      artSrc: SPLASH.merchant,
      lines: [
        speech("Hooded Merchant", "Heart shards are bright rocks to most buyers."),
        speech("Serae Ledger", "Most buyers are not my problem. You are."),
        sfx("crate creak"),
        caption("Secret: LEDGER-TRUE"),
      ],
    },
    {
      kind: "scene",
      atmosphere: "night",
      artSrc: PAGE_ART.commonsDusk,
      panels: [
        {
          bubbles: [
            narrate("The false seal peeled. The true seal waited underneath — stamped once."),
            speech("Serae Ledger", "Mark the ledger true. Or I mark you public."),
          ],
        },
        {
          bubbles: [
            thought("Keeper", "I came for a bargain. I stayed for a principle."),
            sfx("stamp!"),
          ],
        },
      ],
    },
    {
      kind: "splash",
      title: "Ink over glow",
      artSrc: SPLASH.merchant,
      artAlt: "Night market ledger closed under amber lantern",
      atmosphere: "night",
      narration: "Credits may price supplies. Living cores are not SKUs — and the market remembered.",
    },
    {
      kind: "dialogue",
      atmosphere: "dusk",
      artSrc: PAGE_ART.commons,
      lines: [
        speech("Serae Ledger", "Commerce without consent is just theft with a stall."),
        speech("Hooded Merchant", "…fine. Relist as scrap glass."),
        narrate("The cyan leak dimmed. The ledger glowed honest."),
        caption("Economy ethics — cosmetics & Credits only"),
      ],
    },
    {
      kind: "lore",
      title: "Never sell story consent",
      body: "Website + game economy: cosmetics and Credits. Never SOL for hatch consent, Heart shards, or Compact law.",
      atmosphere: "night",
      artSrc: SPLASH.merchant,
    },
  ],

  "the-great-hunt": [
    {
      kind: "scene",
      atmosphere: "day",
      artSrc: SPLASH.hunt,
      panels: [
        {
          bubbles: [
            speech("Cal Reed", "If you corner it, you failed."),
            speech("Mossprig", "*soft rustle*"),
            sfx("dash!"),
          ],
        },
        {
          bubbles: [
            narrate("Trail light taught reading — not owning."),
            thought("Keeper", "I wanted a trophy. Spark wanted a story."),
          ],
        },
      ],
    },
    {
      kind: "dialogue",
      atmosphere: "dusk",
      artSrc: PAGE_ART.forest,
      lines: [
        speech("Cal Reed", "We saw it. That is enough for the Compact."),
        speech("Mossprig", "*proud rustle*"),
        caption("Quest stub: HUNT-WITNESS"),
        sfx("wind through boughs"),
      ],
    },
    {
      kind: "splash",
      title: "Witness, not conquest",
      artSrc: SPLASH.hunt,
      artAlt: "Luminous quarry light fading into Elderwood dusk",
      atmosphere: "dusk",
      narration: "The quarry left light, not blood. Keepers left footprints that did not chase past the marker.",
    },
    {
      kind: "scene",
      layout: "two-col",
      atmosphere: "dawn",
      artSrc: PAGE_ART.regionElderwood,
      panels: [
        {
          bubbles: [
            speech("Cal Reed", "Report it as witnessed."),
            speech("Keeper", "And thank the trail."),
          ],
        },
        {
          bubbles: [
            narrate("Preservation first. Battle culture later — never as excuse for cruelty."),
            sfx("soft birdcall"),
          ],
        },
      ],
    },
    {
      kind: "lore",
      title: "Hunt culture",
      body: "The Great Hunt teaches world-reading. Cornering a luminous quarry breaks Compact spirit even if no shell cracks.",
      atmosphere: "dawn",
      artSrc: SPLASH.hunt,
    },
  ],

  "the-last-guardian": [
    {
      kind: "dialogue",
      atmosphere: "ruin",
      artSrc: SPLASH.guardian,
      lines: [
        speech("Last Guardian", "WHO KEEPS THE HEART?"),
        speech("Keeper", "We do — if you let us ask first."),
        sfx("STONE GRIND"),
        caption("Restoration is conversation"),
      ],
    },
    {
      kind: "scene",
      atmosphere: "ruin",
      artSrc: PAGE_ART.layeredRuin,
      panels: [
        {
          bubbles: [
            narrate("Moss moved like listening. Cyan veins cooled from alarm to interest."),
            thought("Keeper", "Credits will not buy this answer."),
          ],
        },
        {
          bubbles: [
            speech("Last Guardian", "Then speak when the Celestial call returns."),
            speech("Keeper", "We will — with company, Compact, and care."),
          ],
        },
      ],
    },
    {
      kind: "splash",
      title: "Eyes close gently",
      artSrc: SPLASH.guardian,
      artAlt: "Stone guardian resting again beside Gateway Heart",
      atmosphere: "dusk",
      narration: "The statue sat down like a promise keeping its wording. Restoration without demolition.",
    },
    {
      kind: "dialogue",
      atmosphere: "dusk",
      artSrc: PAGE_ART.rift,
      lines: [
        caption("Present Awakening foreshadow"),
        speech("Last Guardian", "Listen when the call is clean — and when it is not."),
        narrate("Hearts stir; ancient machines restart. Help, or unfinished Activation."),
        sfx("deep silence"),
      ],
    },
    {
      kind: "lore",
      title: "Dialogue over demolition",
      body: "World Restoration is not conquest of ruins. It is patience with what survived the Fracture.",
      atmosphere: "ruin",
      artSrc: SPLASH.guardian,
    },
  ],

  "festival-of-lights": [
    {
      kind: "scene",
      atmosphere: "festival",
      artSrc: PAGE_ART.lanternSky,
      panels: [
        {
          bubbles: [
            speech("Elara Venn", "Release one lantern for someone who cannot stand here yet."),
            speech("Crowd", "For the Soft Exodus."),
            sfx("lantern whoosh"),
          ],
        },
        {
          bubbles: [
            narrate("Names rose with light. The Commons practiced joy on purpose."),
            thought("Keeper", "I came for spectacle. I stayed for names."),
          ],
        },
      ],
    },
    {
      kind: "dialogue",
      atmosphere: "night",
      artSrc: PAGE_ART.festival,
      lines: [
        speech("Plaza Crier", "No SOL in the sky — only light."),
        speech("Elara Venn", "And room for new Keepers under it."),
        caption("Wallpaper unlock stub: Commons Lantern"),
        sfx("cheers"),
      ],
    },
    {
      kind: "splash",
      title: "Joy is Compact",
      artSrc: SPLASH.festival,
      artAlt: "Lanterns filling Commons sky",
      atmosphere: "festival",
      narration: "Bloomtide is practiced kindness with a sky-wide stage. Festivals preview the feeling Keepers will play.",
    },
    {
      kind: "scene",
      layout: "three-stack",
      atmosphere: "night",
      artSrc: PAGE_ART.lanternSky,
      panels: [
        { bubbles: [speech("Kid", "Mine has Grandma's name."), sfx("soft laugh")] },
        { bubbles: [speech("Spark", "yip-yip!")] },
        { bubbles: [narrate("One lantern blinked twice — LIGHTS-KEEP."), caption("Secret kept")] },
      ],
    },
    {
      kind: "lore",
      title: "Bloomtide",
      body: "Seasonal festival narratives live in World Events. Comics preview the feeling — Credits cosmetics, never SOL fireworks.",
      atmosphere: "festival",
      artSrc: PAGE_ART.festival,
    },
  ],

  "the-shadow-beyond": [
    {
      kind: "dialogue",
      atmosphere: "rift",
      artSrc: SPLASH.shadow,
      lines: [
        speech("Spark", "…yip."),
        speech("Keeper", "We do not rush the dark. We listen first."),
        narrate("Something beyond mapped regions calls — help, or unfinished Activation."),
        sfx("void hush"),
      ],
    },
    {
      kind: "scene",
      atmosphere: "rift",
      artSrc: PAGE_ART.regionVoid,
      panels: [
        {
          bubbles: [
            thought("Elara Venn", "If they still choose keeping here, the Commons was worth founding."),
            speech("Distant call", "…keeper…"),
          ],
        },
        {
          bubbles: [
            speech("Keeper", "We are coming — with consent, Compact, and company."),
            sfx("soft portal thrum"),
          ],
        },
      ],
    },
    {
      kind: "splash",
      title: "Threshold, not ending",
      artSrc: PAGE_ART.storyFirstLight,
      artAlt: "Amber hope-light behind Keepers at the rift edge",
      atmosphere: "dawn",
      narration: "Wave one closes with light at your back — the unwritten chapter waits for careful feet.",
      developerNote: "Thanks for reading Legends of the Rift.",
    },
    {
      kind: "dialogue",
      atmosphere: "night",
      artSrc: PAGE_ART.timelineAwakening,
      lines: [
        caption("End of wave one — vote shapes Issue #11 lean"),
        speech("Keeper", "Celestial call or corrupt Heart — we choose with the Commons."),
        speech("Spark", "yip."),
        narrate("Future Expansions foreshadow without spoiling shipped About."),
      ],
    },
    {
      kind: "lore",
      title: "Unwritten on purpose",
      body: "Comics stop at the threshold so players help write what comes next — Present Awakening is a door, not a spoiler dump.",
      atmosphere: "rift",
      artSrc: SPLASH.shadow,
    },
  ],
};

/** Thematic bridge lines when an issue still needs padding to min pages. */
export const BRIDGE_POOLS: Record<
  string,
  Array<{ title: string; narration: string; speech: string; thought: string; sfx: string }>
> = {
  "the-first-rift": [
    {
      title: "Mud and names",
      narration: "Before walls, the Commons was a promise spoken over warm shells.",
      speech: "Carry the egg like a future, not a trophy.",
      thought: "If I rush the naming, I will miss the becoming.",
      sfx: "soft shell-song",
    },
    {
      title: "Crown road refused",
      narration: "Safer roads asked for a price the egg could not pay.",
      speech: "Safer for whom?",
      thought: "A crown that buys consent is still theft.",
      sfx: "boot on wet stone",
    },
    {
      title: "Second pulse foreshadow",
      narration: "Beyond the first tear, something colder practiced waiting.",
      speech: "We keep what we can see.",
      thought: "The Fracture is not finished speaking.",
      sfx: "distant cyan blink",
    },
  ],
  "sparks-journey": [
    {
      title: "Invitation distance",
      narration: "Between hatchery and heart, Spark measured steps in pauses.",
      speech: "If it backs away, you back away. That is Compact.",
      thought: "I wanted a partner. Spark wanted a listener.",
      sfx: "soft padding",
    },
    {
      title: "Market manners",
      narration: "Glow is not a command — applause waited for a yip of yes.",
      speech: "Ask. Then wait. Then thank.",
      thought: "Consent traveled farther than any trick.",
      sfx: "soft market hush",
    },
  ],
  "the-traveling-circus": [
    {
      title: "Between acts",
      narration: "Wagons creaked like laughter remembering its cue.",
      speech: "No SOL in the hat — only cheers and Credits.",
      thought: "Compact law even under spotlights.",
      sfx: "distant brass",
    },
  ],
  "the-lost-city": [
    {
      title: "Margin notes",
      narration: "Maps in the Fracture are promises with footnotes.",
      speech: "Annotate, do not argue with the climate.",
      thought: "Hearts. Stones. Riftstone. Three words, one duty.",
      sfx: "stone settle…",
    },
  ],
  "the-storm-king": [
    {
      title: "After thunder",
      narration: "Peaks keep rivals honest — weather keeps Keepers humble.",
      speech: "Force loses the thing inside the egg.",
      thought: "I came for a duel. I found a debate with lightning.",
      sfx: "distant rumble",
    },
  ],
  "the-merchants-secret": [
    {
      title: "Ledger light",
      narration: "Amber lanterns forgive; cyan leaks do not.",
      speech: "Mark the ledger true.",
      thought: "Living cores are not inventory lines.",
      sfx: "crate settle",
    },
  ],
  "the-great-hunt": [
    {
      title: "Trail manners",
      narration: "Elderwood rewards witnesses more than hunters.",
      speech: "If you corner it, you failed.",
      thought: "The prize is the story we can still tell gently.",
      sfx: "leaf hush",
    },
  ],
  "the-last-guardian": [
    {
      title: "Stone listens",
      narration: "Ruins answer those who ask before they swing.",
      speech: "We keep the Heart if you let us ask first.",
      thought: "Restoration is not a demolition schedule.",
      sfx: "moss drip",
    },
  ],
  "festival-of-lights": [
    {
      title: "Lantern pause",
      narration: "Between releases, the Commons practiced quiet joy.",
      speech: "Release one for someone who cannot stand here yet.",
      thought: "Joy is Compact — practiced, not assumed.",
      sfx: "lantern creak",
    },
  ],
  "the-shadow-beyond": [
    {
      title: "Edge of the map",
      narration: "Amber hope at your back makes the unknown less alone.",
      speech: "We listen first. Then we walk.",
      thought: "The unwritten chapter still wants careful Keepers.",
      sfx: "portal hush",
    },
  ],
};
