/**
 * Global content registries keyed by kind + id.
 * Expansion packs register into these; consumers never hardcode pack internals.
 */

import type {
  ContentEntry,
  ContentKind,
  ExpansionPackManifest,
  RegisteredPack,
} from "@/game/expansion/types";

const packs = new Map<string, RegisteredPack>();
const entriesByKind = new Map<ContentKind, Map<string, ContentEntry>>();
const entriesById = new Map<string, ContentEntry>();

function ensureKind(kind: ContentKind): Map<string, ContentEntry> {
  let map = entriesByKind.get(kind);
  if (!map) {
    map = new Map();
    entriesByKind.set(kind, map);
  }
  return map;
}

export function registerExpansionPack(manifest: ExpansionPackManifest): RegisteredPack {
  const registered: RegisteredPack = {
    ...manifest,
    registeredAt: new Date().toISOString(),
    entryCount: manifest.contentIds.length,
  };
  packs.set(manifest.id, registered);
  return registered;
}

export function registerContent<T>(entry: ContentEntry<T>): void {
  if (entriesById.has(entry.id)) {
    // Idempotent re-register in hot-reload / test environments
    const existing = entriesById.get(entry.id)!;
    if (existing.packId !== entry.packId) {
      throw new Error(
        `Content id collision: ${entry.id} owned by ${existing.packId}, refused ${entry.packId}`,
      );
    }
  }
  const typed = entry as ContentEntry;
  entriesById.set(entry.id, typed);
  ensureKind(entry.kind).set(entry.id, typed);

  const pack = packs.get(entry.packId);
  if (pack && !pack.contentIds.includes(entry.id)) {
    pack.contentIds = [...pack.contentIds, entry.id];
    pack.entryCount = pack.contentIds.length;
  }
}

export function getExpansionPack(id: string): RegisteredPack | undefined {
  return packs.get(id);
}

export function listExpansionPacks(): RegisteredPack[] {
  return [...packs.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getContent<T = unknown>(id: string): ContentEntry<T> | undefined {
  return entriesById.get(id) as ContentEntry<T> | undefined;
}

export function listContentByKind<T = unknown>(kind: ContentKind): ContentEntry<T>[] {
  const map = entriesByKind.get(kind);
  if (!map) return [];
  return [...map.values()] as ContentEntry<T>[];
}

export function countContentByKind(): Partial<Record<ContentKind, number>> {
  const out: Partial<Record<ContentKind, number>> = {};
  for (const [kind, map] of entriesByKind) {
    out[kind] = map.size;
  }
  return out;
}

/** Test helper — clears registries between unit tests. */
export function __resetExpansionRegistryForTests(): void {
  packs.clear();
  entriesByKind.clear();
  entriesById.clear();
}
