import type {
  AmbientBehavior,
  DialogueNode,
  NpcDef,
  NpcKind,
  NpcSchedule,
} from "@/game/npcs/types";

const STYLE =
  "Premium fantasy adventure character art for original Riftwilds IP, stylized detailed illustration, strong silhouette, navy cyan amber accents, soft layered shading, no text watermark logo, no copyrighted franchise characters";

export type NpcSeed = {
  id: string;
  slug: string;
  displayName: string;
  shortName: string;
  title: string;
  kind?: NpcKind;
  regionId: string;
  locationId: string;
  x: number;
  y: number;
  occupation: string;
  faction?: string;
  species?: string;
  ageRange: string;
  pronouns: string;
  personalityTraits: string[];
  biography: string;
  visualDescription: string;
  clothing: string;
  accessories: string;
  colorPalette: string[];
  dialogueStyle: string;
  personalHistory: string;
  riftlingRelationship: string;
  questFunction: string;
  shopOrService: string;
  greetingDialogue: string[];
  repeatDialogue: string[];
  questDialogue?: string[];
  shopDialogue?: string[];
  relationshipDialogue?: string[];
  dialogueNodes: DialogueNode[];
  questIds?: string[];
  shopId?: string;
  serviceIds?: string[];
  ambientBehavior?: AmbientBehavior;
  facingBehavior?: NpcDef["facingBehavior"];
  voiceStyle?: string;
  presentDuring?: NpcSchedule["presentDuring"];
  wanderRadius?: number;
};

function assetBase(regionId: string, slug: string) {
  return `/assets/npcs/${regionId}/${slug}`;
}

function buildPrompts(seed: NpcSeed) {
  const base = `${STYLE}. Character: ${seed.displayName}, ${seed.title}, ${seed.species ?? "human"}, ${seed.ageRange}, ${seed.pronouns}. Appearance: ${seed.visualDescription}. Clothing: ${seed.clothing}. Accessories: ${seed.accessories}. Palette: ${seed.colorPalette.join(", ")}.`;
  return {
    portrait: `${base} Bust portrait, shoulders up, facing camera slightly, expressive face, soft vignette background matching region ${seed.regionId}.`,
    fullBody: `${base} Full-body standing pose, feet visible, clear silhouette, slight three-quarter view, empty or soft gradient ground, regional environment hint.`,
    thumbnail: `${base} Tight head-and-shoulders icon, centered face, simple dark gradient background, readable at small size.`,
    sprite: `${base} Game character reference sheet, front idle pose plus walk cycle concept, clean edges, consistent proportions, soft shadow, suitable for 2D game sprite adaptation.`,
  };
}

export function defineNpc(seed: NpcSeed): NpcDef {
  const now = "2026-07-17T00:00:00.000Z";
  const base = assetBase(seed.regionId, seed.slug);
  const prompts = buildPrompts(seed);
  return {
    id: seed.id,
    slug: seed.slug,
    displayName: seed.displayName,
    shortName: seed.shortName,
    title: seed.title,
    kind: seed.kind ?? "named",
    regionId: seed.regionId,
    locationId: seed.locationId,
    coordinates: { x: seed.x, y: seed.y },
    spawnConditions: ["always"],
    schedule: {
      presentDuring: seed.presentDuring ?? ["dawn", "day", "dusk", "night"],
      homeX: seed.x,
      homeY: seed.y,
      wanderRadius: seed.wanderRadius ?? 24,
    },
    occupation: seed.occupation,
    faction: seed.faction ?? "riftkeepers",
    species: seed.species ?? "human",
    ageRange: seed.ageRange,
    pronouns: seed.pronouns,
    personalityTraits: seed.personalityTraits,
    biography: seed.biography,
    visualDescription: seed.visualDescription,
    clothing: seed.clothing,
    accessories: seed.accessories,
    colorPalette: seed.colorPalette,
    dialogueStyle: seed.dialogueStyle,
    personalHistory: seed.personalHistory,
    riftlingRelationship: seed.riftlingRelationship,
    questFunction: seed.questFunction,
    shopOrService: seed.shopOrService,
    greetingDialogue: seed.greetingDialogue,
    repeatDialogue: seed.repeatDialogue,
    questDialogue: seed.questDialogue ?? [],
    shopDialogue: seed.shopDialogue ?? [],
    relationshipDialogue: seed.relationshipDialogue ?? [],
    dialogueNodes: seed.dialogueNodes,
    storyFlags: [],
    questIds: seed.questIds ?? [],
    shopId: seed.shopId,
    serviceIds: seed.serviceIds ?? [],
    reputationRequirements: {},
    animationSet: seed.ambientBehavior ?? "idle",
    portraitAsset: `${base}/portrait.webp`,
    fullBodyAsset: `${base}/full-body.webp`,
    spriteAsset: `${base}/sprite-sheet.webp`,
    thumbnailAsset: `${base}/thumbnail.webp`,
    voiceStyle: seed.voiceStyle ?? "warm mid",
    ambientBehavior: seed.ambientBehavior ?? "idle",
    interactionRadius: 56,
    facingBehavior: seed.facingBehavior ?? "face_player",
    active: true,
    artStatus: "placeholder",
    imagePrompts: prompts,
    createdAt: now,
    updatedAt: now,
  };
}

export function choice(
  id: string,
  label: string,
  next?: string,
  extra?: {
    action?:
      | "accept_quest"
      | "turn_in_quest"
      | "open_shop"
      | "open_service"
      | "close";
    questId?: string;
    shopId?: string;
    serviceId?: string;
  },
) {
  return { id, label, next, ...extra };
}

export function node(id: string, lines: string[], choices?: DialogueNode["choices"]): DialogueNode {
  return { id, lines, choices };
}
