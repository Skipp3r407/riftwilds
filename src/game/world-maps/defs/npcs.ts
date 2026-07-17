/** NPC dialogue catalog — positions live on blueprints. Backed by content/npcs. */

import {
  NAMED_NPCS,
  NPC_BY_ID as CONTENT_BY_ID,
  NPC_CATALOG as CONTENT_NPC_CATALOG,
  npcDefaultLines,
} from "@/content/npcs";

export type NpcCatalogEntry = {
  id: string;
  name: string;
  role: string;
  defaultLines: string[];
};

/** Legacy shape used by blueprint helpers + asset manifest. */
export const NPC_CATALOG: NpcCatalogEntry[] = CONTENT_NPC_CATALOG.map((n) => ({
  id: n.id,
  name: n.displayName,
  role: n.occupation,
  defaultLines: npcDefaultLines(n),
}));

export const NPC_BY_ID = Object.fromEntries(
  NPC_CATALOG.map((n) => [n.id, n]),
) as Record<string, NpcCatalogEntry>;

export function resolveNpcCatalogId(id: string): NpcCatalogEntry | undefined {
  if (NPC_BY_ID[id]) return NPC_BY_ID[id];
  const content = CONTENT_BY_ID[id];
  if (!content) return undefined;
  return {
    id: content.id,
    name: content.displayName,
    role: content.occupation,
    defaultLines: npcDefaultLines(content),
  };
}

export const KEY_COMMONS_NPC_IDS = NAMED_NPCS.filter(
  (n) => n.regionId === "riftwild-commons",
).map((n) => n.id);
