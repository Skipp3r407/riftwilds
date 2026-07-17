import { choice, defineNpc, node } from "@/game/npcs/factory";
import type { NpcDef } from "@/game/npcs/types";

const T = 32;

/** Riftwild Commons — 10 named functional NPCs. */
export const COMMONS_NAMED: NpcDef[] = [
  defineNpc({
    id: "elara-venn",
    slug: "elara-venn",
    displayName: "Elara Venn",
    shortName: "Elara",
    title: "Founder Historian",
    regionId: "riftwild-commons",
    locationId: "central-plaza",
    x: 30 * T,
    y: 22 * T,
    occupation: "Historian & Riftkeeper founder-figure",
    ageRange: "late 40s",
    pronouns: "she/her",
    personalityTraits: ["calm", "protective", "intelligent", "burdened"],
    biography:
      "Elara guards the earliest surviving records of Riftlings and the Fracture. She greets every new Keeper with measured hope.",
    visualDescription:
      "Weathered explorer with silver-streaked dark hair, steady amber eyes, and a composed bearing shaped by long travel.",
    clothing: "Travel cloak with Elderwood leaf-stitch trim over a navy tunic and reinforced boots",
    accessories: "Gateway-fragment pendant, map satchel, brass record-cylinder",
    colorPalette: ["#1a2438", "#3de7ff", "#ffb84d", "#c8b090"],
    dialogueStyle: "Measured, poetic, never rushed — short sentences that carry weight",
    personalHistory:
      "She walked the Fracture's edge when the Gateways first failed and swore to guide Keepers before ambition outran caution.",
    riftlingRelationship: "Trusted by older Riftlings; often carries a calm Mossback companion nearby",
    questFunction: "Main story introducer — Fracture lore and Keeper purpose",
    shopOrService: "none",
    greetingDialogue: [
      "You found the Commons. Good. The Rift remembers those who arrive with open hands.",
      "I am Elara Venn. Sit with the truth a moment — then choose your first step.",
    ],
    repeatDialogue: [
      "The Fracture still hums under our feet. Walk carefully, Keeper.",
      "Records outlast panic. Come back when you have a discovery worth writing.",
    ],
    questDialogue: [
      "The Fracture split the Gateways — not the world's heart. Keepers stitch what remains.",
      "Visit Archivist Solen. The Codex will teach you names before you need them.",
    ],
    questIds: ["starter-fragments-of-the-past", "starter-first-portal"],
    ambientBehavior: "read",
    dialogueNodes: [
      node(
        "greeting",
        [
          "You found the Commons. Good. The Rift remembers those who arrive with open hands.",
          "I am Elara Venn — historian of the Fracture and keeper of first records.",
        ],
        [
          choice("story", "Tell me about the Fracture", "fracture"),
          choice("quest", "I'm ready for the next task", "quest_offer"),
          choice("bye", "I'll explore a little", undefined, { action: "close" }),
        ],
      ),
      node(
        "fracture",
        [
          "Long ago the Gateways braided every region together. Then the Fracture tore the weave.",
          "Riftlings endured. People forgot how to listen. Keepers exist to remember — and to protect.",
        ],
        [
          choice("codex", "Where do I learn more?", "send_solen"),
          choice("back", "Back", "greeting"),
        ],
      ),
      node(
        "send_solen",
        [
          "Archivist Solen keeps the Codex near the plaza stones. Speak with them, then return.",
        ],
        [
          choice("accept", "I'll find Solen", undefined, {
            action: "accept_quest",
            questId: "starter-fragments-of-the-past",
          }),
          choice("back", "Back", "greeting"),
        ],
      ),
      node(
        "quest_offer",
        [
          "When your companion stands ready and Pip marks your map, I will open the first portal path myself.",
        ],
        [
          choice("portal", "Unlock a region portal", undefined, {
            action: "accept_quest",
            questId: "starter-first-portal",
          }),
          choice("back", "Not yet", "greeting"),
        ],
      ),
    ],
  }),

  defineNpc({
    id: "rowan-vale",
    slug: "rowan-vale",
    displayName: "Keeper Rowan Vale",
    shortName: "Rowan",
    title: "New-Player Guide",
    regionId: "riftwild-commons",
    locationId: "central-plaza",
    x: 34 * T,
    y: 24 * T,
    occupation: "Orientation guide",
    ageRange: "early 20s",
    pronouns: "they/them",
    personalityTraits: ["friendly", "encouraging", "energetic"],
    biography:
      "Rowan welcomes every new Keeper to the Commons and teaches the basics before anyone gets lost in the plaza buzz.",
    visualDescription:
      "Bright-eyed guide with wind-tossed auburn hair, freckles, and an open stance that invites questions.",
    clothing: "Cyan-trimmed keeper vest, soft scarf, practical trousers, light boots",
    accessories: "Whistle charm, orientation clipboard, small rift-lantern",
    colorPalette: ["#3de7ff", "#1a2438", "#ffb84d", "#e8f7ff"],
    dialogueStyle: "Upbeat, clear coaching — lots of 'you've got this'",
    personalHistory: "Grew up running errands across the Commons and never stopped talking to strangers.",
    riftlingRelationship: "Bonded to a playful Sparkkit that mirrors their energy",
    questFunction: "Teaches movement, interaction, HUD, and first task",
    shopOrService: "none",
    greetingDialogue: [
      "Hey! Welcome to Riftwild Commons — I'm Rowan Vale.",
      "WASD or arrows to move, Shift to run, E to talk. Ready for your first task?",
    ],
    repeatDialogue: [
      "Need a refresher? Move, talk, listen. The plaza teaches the rest.",
      "Elara is by the monument when you're ready for the bigger story.",
    ],
    questIds: ["starter-awakening"],
    ambientBehavior: "look_around",
    dialogueNodes: [
      node(
        "greeting",
        [
          "Hey! Welcome to Riftwild Commons — I'm Rowan Vale, your orientation keeper.",
          "WASD or arrows move you. Hold Shift to run. Press E near someone to talk.",
        ],
        [
          choice("hud", "What am I looking at?", "hud"),
          choice("quest", "Give me my first task", "quest"),
          choice("bye", "Thanks — I'll practice moving", undefined, { action: "close" }),
        ],
      ),
      node(
        "hud",
        [
          "Status bar up top shows where you are. The prompt near your feet means someone is close enough to talk.",
          "Your companion follows you once you've bonded a Riftling. For now, explore and say hello.",
        ],
        [choice("quest", "I'm ready for a task", "quest"), choice("back", "Back", "greeting")],
      ),
      node(
        "quest",
        [
          "First task: stretch your legs, talk to me properly, then find Elara Venn near the Riftstone monument.",
          "She's the historian. She'll set your story in motion.",
        ],
        [
          choice("accept", "Accept: Awakening in the Commons", undefined, {
            action: "accept_quest",
            questId: "starter-awakening",
          }),
          choice("later", "Maybe in a minute", undefined, { action: "close" }),
        ],
      ),
    ],
  }),

  defineNpc({
    id: "mira-shellbright",
    slug: "mira-shellbright",
    displayName: "Mira Shellbright",
    shortName: "Mira",
    title: "Hatchery Caretaker",
    regionId: "riftwild-commons",
    locationId: "hatchery-zone",
    x: 10 * T,
    y: 12 * T,
    occupation: "Hatchery caretaker",
    ageRange: "mid 30s",
    pronouns: "she/her",
    personalityTraits: ["warm", "patient", "protective"],
    biography:
      "Mira tends every egg that rests in the Commons Hatchery and guides Keepers through their first hatch and bond.",
    visualDescription:
      "Soft features, honey-brown hair in a practical braid, kind eyes that miss nothing around incubators.",
    clothing: "Cream apron over teal caretaker robes, protective gloves tucked at the belt",
    accessories: "Egg-shaped charms, incubator thermometer, soft nest cloth",
    colorPalette: ["#f2e6d4", "#3a8fd4", "#ffb84d", "#1a2438"],
    dialogueStyle: "Gentle coaching, nursery-calm, precise about egg care",
    personalHistory: "Lost an early clutch to neglect elsewhere — now overprotects every shell in her care.",
    riftlingRelationship: "Speaks to eggs as if they already understand; bonded to a serene Nestglow",
    questFunction: "First hatch + bond quests; egg guidance",
    shopOrService: "Hatchery supplies shop",
    shopId: "shop-mira-hatchery",
    serviceIds: ["hatch-assist"],
    greetingDialogue: [
      "Quiet steps near the nests, please. I'm Mira Shellbright.",
      "Eggs listen to patience more than volume.",
    ],
    repeatDialogue: [
      "Warmth, timing, and a steady keeper — that's a hatch.",
      "Come back if your companion needs a soft landing.",
    ],
    shopDialogue: ["I keep beginner care kits stocked. Soft currency only for now."],
    questIds: ["starter-waiting-heart", "starter-new-bond"],
    ambientBehavior: "tend_eggs",
    dialogueNodes: [
      node(
        "greeting",
        [
          "Quiet steps near the nests, please. I'm Mira Shellbright.",
          "Ready to meet a waiting heart — or need supplies?",
        ],
        [
          choice("hatch", "Help me hatch my first Riftling", "hatch_quest"),
          choice("bond", "I hatched — help me bond", "bond_quest"),
          choice("shop", "Show hatchery supplies", undefined, {
            action: "open_shop",
            shopId: "shop-mira-hatchery",
          }),
          choice("bye", "I'll be careful", undefined, { action: "close" }),
        ],
      ),
      node(
        "hatch_quest",
        [
          "Visit the Hatchery, inspect a starter egg, gather a little mossmeal, then hatch with care.",
          "I'll mark the steps. Your first Riftling is waiting.",
        ],
        [
          choice("accept", "Accept: A Waiting Heart", undefined, {
            action: "accept_quest",
            questId: "starter-waiting-heart",
          }),
          choice("back", "Back", "greeting"),
        ],
      ),
      node(
        "bond_quest",
        [
          "Name them. Open their profile. Feed or care once. Then equip them as your active companion.",
          "A bond is a promise — keep it small and daily at first.",
        ],
        [
          choice("accept", "Accept: A New Bond", undefined, {
            action: "accept_quest",
            questId: "starter-new-bond",
          }),
          choice("back", "Back", "greeting"),
        ],
      ),
    ],
  }),

  defineNpc({
    id: "bram-ironroot",
    slug: "bram-ironroot",
    displayName: "Bram Ironroot",
    shortName: "Bram",
    title: "Commons Blacksmith",
    regionId: "riftwild-commons",
    locationId: "craft-zone",
    x: 10 * T,
    y: 26 * T,
    occupation: "Blacksmith & equipment crafter",
    ageRange: "50s",
    pronouns: "he/him",
    personalityTraits: ["strong", "welcoming", "practical"],
    biography:
      "Bram runs the Crafting Workshop forge and teaches Keepers that good tools outlast loud courage.",
    visualDescription:
      "Broad-shouldered smith with soot-dusted beard, warm brown skin, and forge-bright eyes.",
    clothing: "Heavy leather apron over charcoal shirt, reinforced bracers, iron-toed boots",
    accessories: "Rift-tempered hammer, tongs, ore pouch",
    colorPalette: ["#c07040", "#2a2a30", "#ffb84d", "#8a9aaa"],
    dialogueStyle: "Gruff warmth, short craft metaphors",
    personalHistory: "Tempered steel through three Gateway winters and still refuses cheap shortcuts.",
    riftlingRelationship: "Keeps a sturdy Stonepaw near the bellows for heat-sensing",
    questFunction: "Crafting intro and ore gathering",
    shopOrService: "Basic tools & repair kits",
    shopId: "shop-bram-forge",
    serviceIds: ["craft-basic-tool"],
    greetingDialogue: [
      "Forge is hot. Mind your sleeves. Name's Bram Ironroot.",
      "Bring ore or wood and we'll make something honest.",
    ],
    repeatDialogue: ["Hammer sings when the metal's ready. Don't rush the quench."],
    shopDialogue: ["Tools and kits — demo credits until the exchange goes live."],
    questIds: ["starter-tools-of-the-keeper"],
    ambientBehavior: "forge",
    dialogueNodes: [
      node(
        "greeting",
        [
          "Forge is hot. Mind your sleeves. Name's Bram Ironroot.",
          "Need a beginner tool, or ready to craft one yourself?",
        ],
        [
          choice("quest", "Teach me to craft", "craft_quest"),
          choice("shop", "Browse forge goods", undefined, {
            action: "open_shop",
            shopId: "shop-bram-forge",
          }),
          choice("craft", "Craft a training claw", undefined, {
            action: "open_service",
            serviceId: "craft-basic-tool",
          }),
          choice("bye", "Later, Bram", undefined, { action: "close" }),
        ],
      ),
      node(
        "craft_quest",
        [
          "Gather ore or wood from the outer markers, then craft a beginner tool at my bench.",
          "A Keeper without a tool is just a tourist.",
        ],
        [
          choice("accept", "Accept: Tools of the Keeper", undefined, {
            action: "accept_quest",
            questId: "starter-tools-of-the-keeper",
          }),
          choice("back", "Back", "greeting"),
        ],
      ),
    ],
  }),

  defineNpc({
    id: "tessa-windmere",
    slug: "tessa-windmere",
    displayName: "Tessa Windmere",
    shortName: "Tessa",
    title: "Trading-Post Manager",
    regionId: "riftwild-commons",
    locationId: "market-zone",
    x: 12 * T,
    y: 38 * T,
    occupation: "Merchant",
    ageRange: "30s",
    pronouns: "she/her",
    personalityTraits: ["sharp", "fair", "chatty"],
    biography:
      "Tessa runs the beginner stalls at Rift Exchange and explains buying, selling, and delivery work.",
    visualDescription:
      "Quick smile, wind-swept chestnut curls, ink-stained fingers from ledger work.",
    clothing: "Layered merchant coat with amber buttons, scarf, market-practical skirt-trousers",
    accessories: "Abacus charm, price slate, coin pouch",
    colorPalette: ["#4adf7a", "#ffb84d", "#1a2438", "#f0e0c8"],
    dialogueStyle: "Marketplace brisk — friendly but numbers-first",
    personalHistory: "Grew the Exchange from a single stall after the Fracture disrupted trade routes.",
    riftlingRelationship: "A clever Bundlefox counts stock with her",
    questFunction: "Marketplace intro and delivery hooks",
    shopOrService: "Beginner supplies",
    shopId: "shop-tessa-exchange",
    greetingDialogue: [
      "Rift Exchange — fair prices, clear labels. I'm Tessa Windmere.",
      "Soft currency for now. No mystery boxes. Ever.",
    ],
    repeatDialogue: ["Need supplies? Ledger's open until the lanterns dim."],
    shopDialogue: ["Beginner packs and care snacks — take what you need."],
    ambientBehavior: "organize_goods",
    dialogueNodes: [
      node(
        "greeting",
        [
          "Rift Exchange — fair prices, clear labels. I'm Tessa Windmere.",
          "Buying and selling keeps Keepers moving. Want to browse?",
        ],
        [
          choice("shop", "Open shop", undefined, {
            action: "open_shop",
            shopId: "shop-tessa-exchange",
          }),
          choice("tips", "How does trading work?", "tips"),
          choice("bye", "Just browsing", undefined, { action: "close" }),
        ],
      ),
      node(
        "tips",
        [
          "Buy what you know you need. Sell surplus materials. Listings stay soft-currency until marketplace flags go live.",
          "Never chase guaranteed profit talk — we don't sell that here.",
        ],
        [choice("shop", "Show me goods", undefined, { action: "open_shop", shopId: "shop-tessa-exchange" }), choice("back", "Back", "greeting")],
      ),
    ],
  }),

  defineNpc({
    id: "archivist-solen",
    slug: "archivist-solen",
    displayName: "Archivist Solen",
    shortName: "Solen",
    title: "Codex Keeper",
    regionId: "riftwild-commons",
    locationId: "central-plaza",
    x: 36 * T,
    y: 20 * T,
    occupation: "Codex archivist",
    ageRange: "ageless adult",
    pronouns: "they/them",
    personalityTraits: ["curious", "precise", "dry humor"],
    biography:
      "Solen maintains the Riftling Codex and records every verified discovery a Keeper brings home.",
    visualDescription:
      "Tall, ink-smudged scholar with pale violet eyes and hair tied in a precise knot.",
    clothing: "Layered archive robes with cyan thread diagrams, soft indoor boots",
    accessories: "Floating page-clip, monocle lens, catalog quill",
    colorPalette: ["#9b7bff", "#3de7ff", "#1a2438", "#e8e0ff"],
    dialogueStyle: "Academic, lightly sardonic, loves exact names",
    personalHistory: "Claims to have cataloged species before some Keepers were born — and might be telling the truth.",
    riftlingRelationship: "A quiet Inkling rides their shoulder and underlines entries",
    questFunction: "Codex access and lore quests",
    shopOrService: "Codex unlock service",
    shopId: "shop-solen-codex",
    serviceIds: ["open-codex"],
    greetingDialogue: [
      "The Codex is awake. I am Archivist Solen.",
      "Bring discoveries. I will give them proper names.",
    ],
    repeatDialogue: ["Ink dries slower than rumor. Bring evidence."],
    shopDialogue: ["Field journals and index seals — tools for Keepers who write things down."],
    questIds: ["starter-fragments-of-the-past"],
    ambientBehavior: "read",
    dialogueNodes: [
      node(
        "greeting",
        [
          "The Codex is awake. I am Archivist Solen.",
          "Elara sends most newcomers. Shall we open an index — or stock a journal?",
        ],
        [
          choice("codex", "Open the Codex", undefined, {
            action: "open_service",
            serviceId: "open-codex",
          }),
          choice("shop", "Codex supplies", undefined, {
            action: "open_shop",
            shopId: "shop-solen-codex",
          }),
          choice("lore", "What should I record first?", "lore"),
          choice("bye", "I'll return with notes", undefined, { action: "close" }),
        ],
      ),
      node(
        "lore",
        [
          "Start with your first hatch. Species, affinity, temperament. Then the region you walk next.",
          "The Fracture scattered knowledge — we stitch it back one entry at a time.",
        ],
        [choice("back", "Back", "greeting")],
      ),
    ],
  }),

  defineNpc({
    id: "captain-orren",
    slug: "captain-orren",
    displayName: "Captain Orren",
    shortName: "Orren",
    title: "Guard Captain",
    regionId: "riftwild-commons",
    locationId: "training-yard",
    x: 42 * T,
    y: 14 * T,
    occupation: "Commons guard captain",
    ageRange: "40s",
    pronouns: "he/him",
    personalityTraits: ["stern", "fair", "protective"],
    biography:
      "Orren drills Keepers on safe combat outside the plaza and keeps the outer woods from surprising newcomers.",
    visualDescription:
      "Squared jaw, scar across one brow, iron-gray hair cropped short, posture like a closed gate.",
    clothing: "Navy guard coat with amber rank braid, reinforced greaves",
    accessories: "Practice baton, whistle, patrol ledger",
    colorPalette: ["#1a2438", "#ffb84d", "#8b93a7", "#3de7ff"],
    dialogueStyle: "Military brevity — clear orders, rare praise",
    personalHistory: "Held the plaza line during a void-flare year and never stopped counting exits.",
    riftlingRelationship: "Partners with a vigilant Watchhound on night rounds",
    questFunction: "First combat encounter outside Commons",
    shopOrService: "none",
    greetingDialogue: [
      "Captain Orren. Outer woods are not a playground.",
      "If your companion is ready, we run a controlled first engagement.",
    ],
    repeatDialogue: ["Patrol routes change with weather. Check before you swagger."],
    questIds: ["starter-first-steps-together"],
    ambientBehavior: "patrol",
    dialogueNodes: [
      node(
        "greeting",
        [
          "Captain Orren. Outer woods are not a playground.",
          "Bond a companion first. Then we teach you how not to panic.",
        ],
        [
          choice("quest", "I'm ready for first combat", "combat_quest"),
          choice("tips", "Any warnings?", "tips"),
          choice("bye", "Understood", undefined, { action: "close" }),
        ],
      ),
      node(
        "tips",
        [
          "Stay near cooled paths. Strike, collect, return. No glory hunts on day one.",
        ],
        [choice("quest", "Start the patrol lesson", "combat_quest"), choice("back", "Back", "greeting")],
      ),
      node(
        "combat_quest",
        [
          "Travel to the outer woods marker, defeat a beginner rift-slime, collect the drop, return to me.",
          "Controlled. Short. Survivable.",
        ],
        [
          choice("accept", "Accept: First Steps Together", undefined, {
            action: "accept_quest",
            questId: "starter-first-steps-together",
          }),
          choice("back", "Back", "greeting"),
        ],
      ),
    ],
  }),

  defineNpc({
    id: "nyla-brook",
    slug: "nyla-brook",
    displayName: "Nyla Brook",
    shortName: "Nyla",
    title: "Recovery Healer",
    regionId: "riftwild-commons",
    locationId: "recovery",
    x: 44 * T,
    y: 42 * T,
    occupation: "Healer",
    ageRange: "late 20s",
    pronouns: "she/her",
    personalityTraits: ["empathetic", "steady", "practical"],
    biography:
      "Nyla staffs the Recovery Center and teaches Keepers that rest is part of courage.",
    visualDescription:
      "Soft green eyes, freckled cheeks, hair pinned with herb sprigs, calm hands.",
    clothing: "Pale mint healer robes with cyan sash, clean apron",
    accessories: "Herb pouch, crystal vial belt, soft bandage roll",
    colorPalette: ["#60d0c0", "#e8f7ff", "#4adf7a", "#1a2438"],
    dialogueStyle: "Soothing clinic voice with firm boundaries",
    personalHistory: "Trained in Spirit Marsh methods adapted for Commons safety rules.",
    riftlingRelationship: "A gentle Bloomling assists with calming anxious hatchlings",
    questFunction: "Healing supplies and herb gathering",
    shopOrService: "Healing supplies",
    shopId: "shop-nyla-recovery",
    serviceIds: ["restore-companion"],
    greetingDialogue: [
      "Recovery Center — no permanent harm in the Commons. I'm Nyla Brook.",
      "Tired companions rest here. Pride can wait outside.",
    ],
    repeatDialogue: ["Hydrate. Feed. Rest. Then try again."],
    shopDialogue: ["Salves and snacks — better than stubbornness."],
    ambientBehavior: "mix_remedies",
    dialogueNodes: [
      node(
        "greeting",
        [
          "Recovery Center — no permanent harm in the Commons. I'm Nyla Brook.",
          "Need a restore, or supplies for the road?",
        ],
        [
          choice("heal", "Restore my companion", undefined, {
            action: "open_service",
            serviceId: "restore-companion",
          }),
          choice("shop", "Healing supplies", undefined, {
            action: "open_shop",
            shopId: "shop-nyla-recovery",
          }),
          choice("bye", "We're fine today", undefined, { action: "close" }),
        ],
      ),
    ],
  }),

  defineNpc({
    id: "pip-gearwhistle",
    slug: "pip-gearwhistle",
    displayName: "Pip Gearwhistle",
    shortName: "Pip",
    title: "Inventor & Technician",
    regionId: "riftwild-commons",
    locationId: "portal-circle",
    x: 28 * T,
    y: 10 * T,
    occupation: "Gateway technician",
    ageRange: "20s",
    pronouns: "he/him",
    personalityTraits: ["inventive", "scattered", "brilliant"],
    biography:
      "Pip maintains Commons gateway markers and teaches Keepers how map pins unlock safer travel.",
    visualDescription:
      "Goggles forever on forehead, grease smudge on cheek, wild grin, wiry frame.",
    clothing: "Tool-vest over mustard shirt, mismatched gloves, reinforced kneepads",
    accessories: "Whistling multitool, sparking gauge, map-marker pistons",
    colorPalette: ["#ffb84d", "#3de7ff", "#2a2a30", "#c07040"],
    dialogueStyle: "Rapid tinkerer talk with sudden clarity",
    personalHistory: "Obsessed with Alloy Ruins schematics since childhood — still hasn't finished 'just one more' prototype.",
    riftlingRelationship: "A clockwork-curious Gearling nests in his toolkit",
    questFunction: "Map marker / gateway repair quest",
    shopOrService: "Gadget odds & ends",
    shopId: "shop-pip-gadgets",
    greetingDialogue: [
      "Pip Gearwhistle — if it hums, I probably poked it.",
      "Portals hate loose screws. Markers hate missing Keepers.",
    ],
    repeatDialogue: ["Don't kick the resonators. They kick back. Metaphorically. Mostly."],
    shopDialogue: ["Spare dials and marker pins — demo priced."],
    questIds: ["starter-map-and-marker"],
    ambientBehavior: "repair",
    dialogueNodes: [
      node(
        "greeting",
        [
          "Pip Gearwhistle — if it hums, I probably poked it.",
          "Need a map marker lesson before Elara opens your first portal path?",
        ],
        [
          choice("quest", "Teach me markers", "marker_quest"),
          choice("shop", "Any gadgets?", undefined, {
            action: "open_shop",
            shopId: "shop-pip-gadgets",
          }),
          choice("bye", "Don't explode anything", undefined, { action: "close" }),
        ],
      ),
      node(
        "marker_quest",
        [
          "Place a practice marker at the plaza waypoint, then confirm the portal circle readout.",
          "When that sings green, Elara can authorize your first region step.",
        ],
        [
          choice("accept", "Accept: Map and Marker", undefined, {
            action: "accept_quest",
            questId: "starter-map-and-marker",
          }),
          choice("back", "Back", "greeting"),
        ],
      ),
    ],
  }),

  defineNpc({
    id: "rook-emberfall",
    slug: "rook-emberfall",
    displayName: "Rook Emberfall",
    shortName: "Rook",
    title: "Arena Coordinator",
    regionId: "riftwild-commons",
    locationId: "arena-zone",
    x: 52 * T,
    y: 12 * T,
    occupation: "Arena coordinator",
    ageRange: "30s",
    pronouns: "he/him",
    personalityTraits: ["competitive", "fair", "motivating"],
    biography:
      "Rook runs Training Yard challenges and explains Arena rules without wagering nonsense.",
    visualDescription:
      "Athletic build, ember-red hair tied back, confident smirk, battle-calloused hands.",
    clothing: "Arena jacket with cyan piping, light training armor plates",
    accessories: "Whistle, score slate, sparring wrap",
    colorPalette: ["#d48a3a", "#3de7ff", "#1a2438", "#ff5a5a"],
    dialogueStyle: "Coach energy — loud when needed, clear on rules",
    personalHistory: "Retired from exhibition spars to keep new Keepers from learning the hard way alone.",
    riftlingRelationship: "Sparring partner is a fiery Cinderpup that loves dummies",
    questFunction: "Training battle challenges",
    shopOrService: "Training consumables",
    shopId: "shop-rook-arena",
    serviceIds: ["training-spar"],
    greetingDialogue: [
      "Rook Emberfall — Training Yard's open. No wagering. Ever.",
      "Warm up on dummies before you chase ranked glory.",
    ],
    repeatDialogue: ["Form first. Flash later."],
    shopDialogue: ["Bandages and spar snacks — keep it clean."],
    ambientBehavior: "train",
    dialogueNodes: [
      node(
        "greeting",
        [
          "Rook Emberfall — Training Yard's open. No wagering. Ever.",
          "Want a spar tip, supplies, or a practice bout pointer?",
        ],
        [
          choice("spar", "Point me to training", undefined, {
            action: "open_service",
            serviceId: "training-spar",
          }),
          choice("shop", "Training supplies", undefined, {
            action: "open_shop",
            shopId: "shop-rook-arena",
          }),
          choice("bye", "Catch you after drills", undefined, { action: "close" }),
        ],
      ),
    ],
  }),
];
