import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  BATTLE_FEED_COLLAPSED_KEY,
  BATTLE_INTEL_COLLAPSED_KEY,
  matchesPortraitBattleLayout,
  PORTRAIT_BATTLE_LAYOUT_MQ,
  readBattleFeedCollapsedForViewport,
  readBattleIntelCollapsedForViewport,
} from "@/lib/tcg/battle-layout-prefs";

function stubStorage() {
  const store = new Map<string, string>();
  const api = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
  };
  vi.stubGlobal("window", {
    localStorage: api,
    matchMedia: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
  vi.stubGlobal("localStorage", api);
  return store;
}

describe("portrait battle layout prefs", () => {
  let store: Map<string, string>;

  beforeEach(() => {
    store = stubStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("soft-collapses intel/feed on portrait when unset", () => {
    expect(readBattleIntelCollapsedForViewport(true)).toBe(true);
    expect(readBattleFeedCollapsedForViewport(true)).toBe(true);
    expect(readBattleIntelCollapsedForViewport(false)).toBe(false);
    expect(readBattleFeedCollapsedForViewport(false)).toBe(false);
  });

  it("honors explicit expand/collapse prefs", () => {
    store.set(BATTLE_INTEL_COLLAPSED_KEY, "0");
    store.set(BATTLE_FEED_COLLAPSED_KEY, "1");
    expect(readBattleIntelCollapsedForViewport(true)).toBe(false);
    expect(readBattleFeedCollapsedForViewport(true)).toBe(true);
    store.set(BATTLE_INTEL_COLLAPSED_KEY, "1");
    store.set(BATTLE_FEED_COLLAPSED_KEY, "0");
    expect(readBattleIntelCollapsedForViewport(false)).toBe(true);
    expect(readBattleFeedCollapsedForViewport(false)).toBe(false);
  });

  it("exposes a portrait media query string", () => {
    expect(PORTRAIT_BATTLE_LAYOUT_MQ).toContain("orientation: portrait");
    expect(typeof matchesPortraitBattleLayout()).toBe("boolean");
  });
});
