/** Deterministic PRNG from battle seed + counter (works in Node and browsers). */

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createSeededRng(seed: string) {
  let state = hashSeed(seed) || 1;
  const nextUint = () => {
    // Mulberry32
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) % 10000;
  };
  return {
    nextBps(): number {
      return nextUint();
    },
    nextRangeBps(minBps: number, maxBps: number): number {
      const span = maxBps - minBps;
      return minBps + (nextUint() % (span + 1));
    },
  };
}

export type SeededRng = ReturnType<typeof createSeededRng>;
