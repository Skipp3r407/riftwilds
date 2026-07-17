/**
 * Runtime NPC catalog — content lives in src/content/npcs.
 */

export {
  AMBIENT_NPCS,
  NAMED_NPCS,
  NPC_BY_ID,
  NPC_BY_SLUG,
  NPC_CATALOG,
  NPC_CONTENT_CATALOG,
  countAmbientInRegion,
  countNamedInRegion,
  getNpcById,
  getNpcBySlug,
  listNpcsForRegion,
  npcDefaultLines,
  npcsForRegion,
} from "@/content/npcs";

export type { NpcDef, NpcShopDef, DialogueNode, DialogueChoice } from "@/game/npcs/types";
