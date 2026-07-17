import { choice, defineNpc, node } from "@/game/npcs/factory";
import type { NpcDef } from "@/game/npcs/types";

const T = 32;

type AmbientSeed = {
  id: string;
  name: string;
  regionId: string;
  col: number;
  row: number;
  role: string;
  line: string;
  behavior?: Parameters<typeof defineNpc>[0]["ambientBehavior"];
  kind?: "ambient" | "guard" | "ambient_riftling";
};

function ambient(seed: AmbientSeed): NpcDef {
  return defineNpc({
    id: seed.id,
    slug: seed.id,
    displayName: seed.name,
    shortName: seed.name.split(" ")[0] ?? seed.name,
    title: seed.role,
    kind: seed.kind ?? "ambient",
    regionId: seed.regionId,
    locationId: "ambient",
    x: seed.col * T,
    y: seed.row * T,
    occupation: seed.role,
    ageRange: "adult",
    pronouns: "they/them",
    personalityTraits: ["local", "busy"],
    biography: `${seed.name} lives and works around ${seed.regionId}.`,
    visualDescription: `Varied ${seed.role} with regional clothing accents.`,
    clothing: "Regional everyday wear with navy/cyan accents",
    accessories: "Simple tools of their trade",
    colorPalette: ["#1a2438", "#3de7ff", "#ffb84d"],
    dialogueStyle: "Short ambient chatter",
    personalHistory: "A familiar face in the settlement.",
    riftlingRelationship:
      seed.kind === "ambient_riftling"
        ? "This is an ambient companion Riftling"
        : "Sometimes accompanied by a small Riftling",
    questFunction: "Atmosphere",
    shopOrService: "none",
    greetingDialogue: [seed.line],
    repeatDialogue: [seed.line],
    ambientBehavior: seed.behavior ?? "idle",
    wanderRadius: 40,
    dialogueNodes: [
      node("greeting", [seed.line], [
        choice("bye", "Take care", undefined, { action: "close" }),
      ]),
    ],
  });
}

/** Commons density: 8+ ambient citizens, 3+ guards, 3+ ambient Riftlings. */
const COMMONS_AMBIENT: AmbientSeed[] = [
  { id: "amb-plaza-singer", name: "Lark Quinn", regionId: "riftwild-commons", col: 30, row: 18, role: "Street singer", line: "Got a coin for a Gateway ballad?", behavior: "look_around" },
  { id: "amb-courier", name: "Dash Pell", regionId: "riftwild-commons", col: 24, row: 26, role: "Courier", line: "Parcels before portals — that's the rule.", behavior: "pace" },
  { id: "amb-gardener", name: "Ivy Moss", regionId: "riftwild-commons", col: 50, row: 20, role: "Gardener", line: "Feeding Grove likes quiet feet.", behavior: "idle" },
  { id: "amb-student", name: "Cal Reed", regionId: "riftwild-commons", col: 38, row: 22, role: "Codex student", line: "Solen said I'd understand page three eventually.", behavior: "read" },
  { id: "amb-cook", name: "Pot Wren", regionId: "riftwild-commons", col: 20, row: 30, role: "Plaza cook", line: "Warm bowls for tired Keepers!", behavior: "organize_goods" },
  { id: "amb-kid", name: "Bean Little", regionId: "riftwild-commons", col: 34, row: 28, role: "Child", line: "Can your Riftling do a flip?", behavior: "look_around" },
  { id: "amb-fisher-citizen", name: "Reed Catch", regionId: "riftwild-commons", col: 26, row: 40, role: "Hobby fisher", line: "Pond fish prefer quiet company.", behavior: "fish" },
  { id: "amb-vendor", name: "Sela Bright", regionId: "riftwild-commons", col: 14, row: 36, role: "Stall helper", line: "Tessa's ledger never lies.", behavior: "organize_goods" },
  { id: "amb-builder", name: "Tor Hammerlight", regionId: "riftwild-commons", col: 8, row: 22, role: "Builder", line: "Bram's forge keeps our hinges honest.", behavior: "repair" },
  { id: "guard-north", name: "Guard Hessel", regionId: "riftwild-commons", col: 32, row: 16, role: "Plaza guard", line: "Keep weapons sheathed in the plaza.", behavior: "patrol", kind: "guard" },
  { id: "guard-west", name: "Guard Marn", regionId: "riftwild-commons", col: 18, row: 24, role: "Plaza guard", line: "Outer woods are east of patience.", behavior: "patrol", kind: "guard" },
  { id: "guard-south", name: "Guard Vela", regionId: "riftwild-commons", col: 40, row: 30, role: "Plaza guard", line: "Report trouble to Captain Orren.", behavior: "patrol", kind: "guard" },
  { id: "rift-amb-1", name: "Spark Companion", regionId: "riftwild-commons", col: 28, row: 24, role: "Ambient Riftling", line: "*curious chirp*", behavior: "look_around", kind: "ambient_riftling" },
  { id: "rift-amb-2", name: "Moss Companion", regionId: "riftwild-commons", col: 48, row: 18, role: "Ambient Riftling", line: "*content rumble*", behavior: "idle", kind: "ambient_riftling" },
  { id: "rift-amb-3", name: "Ember Companion", regionId: "riftwild-commons", col: 50, row: 14, role: "Ambient Riftling", line: "*warm crackle*", behavior: "pace", kind: "ambient_riftling" },
];

const REGION_AMBIENT: AmbientSeed[] = [
  // Ember (4+)
  { id: "amb-ember-scout", name: "Ash Runner", regionId: "ember-crater", col: 10, row: 10, role: "Camp runner", line: "Water skins first — then crystals.", behavior: "pace" },
  { id: "amb-ember-miner", name: "Coal Tip", regionId: "ember-crater", col: 40, row: 12, role: "Crystal digger", line: "Don't dig where the ground glows wrong.", behavior: "idle" },
  { id: "amb-ember-cook", name: "Soot Pot", regionId: "ember-crater", col: 8, row: 6, role: "Camp cook", line: "Ashcakes are better than they sound.", behavior: "organize_goods" },
  { id: "amb-ember-guard", name: "Heat Guard Rin", regionId: "ember-crater", col: 14, row: 8, role: "Camp guard", line: "Pyra's perimeter — stay inside it.", behavior: "patrol", kind: "guard" },
  // Coast (4+)
  { id: "amb-coast-dock", name: "Dockhand Jib", regionId: "moonwater-coast", col: 10, row: 12, role: "Dockhand", line: "Lines tight before the tide turns.", behavior: "repair" },
  { id: "amb-coast-kid", name: "Shell Pip", regionId: "moonwater-coast", col: 20, row: 30, role: "Beach child", line: "I found a pearl that wasn't!", behavior: "look_around" },
  { id: "amb-coast-net", name: "Netty", regionId: "moonwater-coast", col: 24, row: 34, role: "Netter", line: "Finn taught me the quiet cast.", behavior: "fish" },
  { id: "amb-coast-guard", name: "Harbor Guard", regionId: "moonwater-coast", col: 6, row: 8, role: "Harbor guard", line: "No diving past the marked buoys.", behavior: "patrol", kind: "guard" },
  // Elderwood (4+)
  { id: "amb-wood-farmer", name: "Plot Kee", regionId: "elderwood-forest", col: 38, row: 8, role: "Farmer", line: "Mossmeal grows if you ask politely.", behavior: "idle" },
  { id: "amb-wood-singer", name: "Leaf Song", regionId: "elderwood-forest", col: 14, row: 20, role: "Trail singer", line: "Trees like soft songs.", behavior: "look_around" },
  { id: "amb-wood-herbal", name: "Bud Jun", regionId: "elderwood-forest", col: 22, row: 8, role: "Herb apprentice", line: "Elden says smell before you pick.", behavior: "mix_remedies" },
  { id: "amb-wood-guard", name: "Grove Guard", regionId: "elderwood-forest", col: 10, row: 6, role: "Grove guard", line: "Sylvi's rules: no fire, no trampling.", behavior: "patrol", kind: "guard" },
];

export const AMBIENT_NPCS: NpcDef[] = [...COMMONS_AMBIENT, ...REGION_AMBIENT].map(ambient);
