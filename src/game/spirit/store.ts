/**
 * In-memory Spirit / Memorial / Insurance / Recovery audit store (Phase 1).
 * Mirrors hatchery / loyalty globalThis pattern.
 */

import { defaultHardcoreOptIn } from "@/game/spirit/hardcore";
import { defaultMemorialGarden } from "@/game/spirit/memorial";
import type {
  InsurancePolicy,
  LegendaryAncestor,
  MemorialGarden,
  MemorialRecord,
  RecoveryHistoryEntry,
  SpiritRecord,
} from "@/game/spirit/types";
import type { SpiritQuestProgress } from "@/game/spirit/quests";

type SpiritMaps = {
  records: Map<string, SpiritRecord>;
  history: RecoveryHistoryEntry[];
  memorials: Map<string, MemorialRecord>;
  gardens: Map<string, MemorialGarden>;
  ancestors: Map<string, LegendaryAncestor>;
  insurance: Map<string, InsurancePolicy>;
  questProgress: Map<string, SpiritQuestProgress>;
  processedRequestIds: Set<string>;
  solPoolLamports: number;
};

function maps(): SpiritMaps {
  const g = globalThis as unknown as { __riftwildsSpirit?: SpiritMaps };
  if (!g.__riftwildsSpirit) {
    g.__riftwildsSpirit = {
      records: new Map(),
      history: [],
      memorials: new Map(),
      gardens: new Map(),
      ancestors: new Map(),
      insurance: new Map(),
      questProgress: new Map(),
      processedRequestIds: new Set(),
      solPoolLamports: 5_000_000_000, // 5 SOL demo pool
    };
  }
  return g.__riftwildsSpirit;
}

export function resetSpiritStoreForTests(): void {
  const g = globalThis as unknown as { __riftwildsSpirit?: SpiritMaps };
  g.__riftwildsSpirit = undefined;
}

export function getSpiritRecord(petPublicId: string): SpiritRecord | null {
  return maps().records.get(petPublicId) ?? null;
}

export function saveSpiritRecord(record: SpiritRecord): void {
  maps().records.set(record.petPublicId, record);
}

export function ensureSpiritRecord(params: {
  petPublicId: string;
  ownerKey: string;
  level?: number;
  bond?: number;
}): SpiritRecord {
  const existing = getSpiritRecord(params.petPublicId);
  if (existing) return existing;
  const now = new Date().toISOString();
  const record: SpiritRecord = {
    petPublicId: params.petPublicId,
    ownerKey: params.ownerKey,
    lifeState: "HEALTHY",
    downedAt: null,
    countdownEndsAt: null,
    pausedMs: 0,
    maintenancePaused: false,
    hardcore: defaultHardcoreOptIn(),
    activeQuestId: null,
    questLocked: false,
    level: params.level ?? 1,
    bondAtDown: params.bond ?? 0,
    insurancePolicyId: null,
    memorialId: null,
    ancestorId: null,
    equipmentSnapshotIds: [],
    updatedAt: now,
    version: 1,
  };
  saveSpiritRecord(record);
  return record;
}

export function appendRecoveryHistory(entry: RecoveryHistoryEntry): void {
  maps().history.unshift(entry);
  if (maps().history.length > 5000) maps().history.length = 5000;
}

export function listRecoveryHistory(petPublicId?: string, limit = 50): RecoveryHistoryEntry[] {
  const rows = petPublicId
    ? maps().history.filter((h) => h.petPublicId === petPublicId)
    : maps().history;
  return rows.slice(0, limit);
}

export function hasProcessedRequestId(requestId: string): boolean {
  return maps().processedRequestIds.has(requestId);
}

export function markProcessedRequestId(requestId: string): void {
  maps().processedRequestIds.add(requestId);
}

export function getSolRecallPoolLamports(): number {
  return maps().solPoolLamports;
}

export function setSolRecallPoolLamports(n: number): void {
  maps().solPoolLamports = Math.max(0, n);
}

export function saveMemorial(m: MemorialRecord): void {
  maps().memorials.set(m.id, m);
}

export function getMemorial(id: string): MemorialRecord | null {
  return maps().memorials.get(id) ?? null;
}

export function listMemorialsForOwner(ownerKey: string): MemorialRecord[] {
  return [...maps().memorials.values()].filter((m) => m.ownerKey === ownerKey);
}

export function getOrCreateGarden(ownerKey: string): MemorialGarden {
  const existing = maps().gardens.get(ownerKey);
  if (existing) return existing;
  const garden = defaultMemorialGarden(ownerKey);
  maps().gardens.set(ownerKey, garden);
  return garden;
}

export function saveGarden(garden: MemorialGarden): void {
  maps().gardens.set(garden.ownerKey, garden);
}

export function saveAncestor(a: LegendaryAncestor): void {
  maps().ancestors.set(a.id, a);
}

export function listAncestorsForOwner(ownerKey: string): LegendaryAncestor[] {
  return [...maps().ancestors.values()].filter((a) => a.ownerKey === ownerKey);
}

export function saveInsurance(p: InsurancePolicy): void {
  maps().insurance.set(p.id, p);
}

export function getInsurance(id: string): InsurancePolicy | null {
  return maps().insurance.get(id) ?? null;
}

export function getInsuranceForPet(petPublicId: string): InsurancePolicy | null {
  return (
    [...maps().insurance.values()].find(
      (p) => p.petPublicId === petPublicId || p.petPublicId === null,
    ) ?? null
  );
}

export function saveQuestProgress(p: SpiritQuestProgress): void {
  maps().questProgress.set(`${p.petPublicId}:${p.questId}`, p);
}

export function getQuestProgress(petPublicId: string, questId: string): SpiritQuestProgress | null {
  return maps().questProgress.get(`${petPublicId}:${questId}`) ?? null;
}
