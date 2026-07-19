/**
 * Durable local store for treasury ops.
 * Persists to `.data/treasury-ops/state.json` when filesystem is available;
 * falls back to process-global memory (same pattern as feedback store).
 */

import fs from "node:fs";
import path from "node:path";
import { createSeededState } from "./seed";
import type { TreasuryOpsState } from "./types";

const GLOBAL_KEY = "__riftwildsTreasuryOpsState";
const RELATIVE_STATE_PATH = path.join(".data", "treasury-ops", "state.json");

type GlobalBag = typeof globalThis & {
  [GLOBAL_KEY]?: TreasuryOpsState;
};

function statePath(): string {
  return path.join(process.cwd(), RELATIVE_STATE_PATH);
}

function canUseFs(): boolean {
  try {
    return typeof process !== "undefined" && Boolean(process.cwd?.());
  } catch {
    return false;
  }
}

function readFromDisk(): TreasuryOpsState | null {
  if (!canUseFs()) return null;
  try {
    const p = statePath();
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, "utf8");
    return JSON.parse(raw) as TreasuryOpsState;
  } catch {
    return null;
  }
}

function writeToDisk(state: TreasuryOpsState): void {
  if (!canUseFs()) return;
  try {
    const p = statePath();
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(state, null, 2), "utf8");
  } catch {
    // Demo-safe: memory remains source of truth if disk fails
  }
}

function getMemory(): TreasuryOpsState | undefined {
  return (globalThis as GlobalBag)[GLOBAL_KEY];
}

function setMemory(state: TreasuryOpsState): void {
  (globalThis as GlobalBag)[GLOBAL_KEY] = state;
}

export function loadTreasuryOpsState(): TreasuryOpsState {
  const mem = getMemory();
  if (mem) return mem;

  const disk = readFromDisk();
  if (disk) {
    setMemory(disk);
    return disk;
  }

  const seeded = createSeededState();
  setMemory(seeded);
  writeToDisk(seeded);
  return seeded;
}

export function saveTreasuryOpsState(state: TreasuryOpsState): TreasuryOpsState {
  state.updatedAt = new Date().toISOString();
  setMemory(state);
  writeToDisk(state);
  return state;
}

export function mutateTreasuryOpsState<T>(
  fn: (state: TreasuryOpsState) => T,
): { state: TreasuryOpsState; result: T } {
  const state = loadTreasuryOpsState();
  const result = fn(state);
  saveTreasuryOpsState(state);
  return { state, result };
}

export function resetTreasuryOpsStateForTests(): TreasuryOpsState {
  const seeded = createSeededState();
  setMemory(seeded);
  writeToDisk(seeded);
  return seeded;
}

export function getTreasuryOpsStatePath(): string {
  return statePath();
}
