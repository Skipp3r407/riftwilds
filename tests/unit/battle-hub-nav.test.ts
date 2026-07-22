import { describe, expect, it } from "vitest";
import {
  BATTLE_HUB_MODES,
  battleHubHref,
  isBattleHubMode,
  parseBattleHubMode,
  RIFT_STAKES_REDIRECT_MAP,
  shouldOpenPracticeBoard,
} from "@/lib/tcg/battle-hub";
import { primaryNav, sidebarNavGroups } from "@/lib/config/nav";

describe("battle hub IA", () => {
  it("exposes six modes including stakes", () => {
    expect(BATTLE_HUB_MODES).toEqual([
      "practice",
      "casual",
      "ranked",
      "ai",
      "tournament",
      "stakes",
    ]);
    expect(isBattleHubMode("stakes")).toBe(true);
    expect(parseBattleHubMode("nope")).toBe("practice");
  });

  it("builds hub URLs without leaving /tcg/battle", () => {
    expect(battleHubHref()).toBe("/tcg/battle");
    expect(battleHubHref("stakes")).toBe("/tcg/battle?mode=stakes");
    expect(battleHubHref("stakes", { panel: "treasury" })).toBe(
      "/tcg/battle?mode=stakes&panel=treasury",
    );
  });

  it("opens practice board for invite and board flags", () => {
    expect(shouldOpenPracticeBoard({ invite: "ABC" })).toBe(true);
    expect(shouldOpenPracticeBoard({ board: "1" })).toBe(true);
    expect(shouldOpenPracticeBoard({})).toBe(false);
  });

  it("maps legacy rift-stakes URLs into the hub", () => {
    const lobby = RIFT_STAKES_REDIRECT_MAP.find((r) => r.from === "/rift-stakes");
    expect(lobby?.to).toBe("/tcg/battle?mode=stakes");
    const match = RIFT_STAKES_REDIRECT_MAP.find((r) => r.from === "/rift-stakes/match");
    expect(match?.to).toBe("/rift-stakes/match");
  });

  it("keeps Rift Stakes out of primary sidebar catalog", () => {
    expect(primaryNav.some((l) => l.href === "/rift-stakes")).toBe(false);
    const play = sidebarNavGroups.find((g) => g.id === "play");
    expect(play?.items.some((i) => i.href === "/tcg/battle")).toBe(true);
    expect(play?.items.some((i) => i.href === "/rift-stakes")).toBe(false);
    expect(sidebarNavGroups.map((g) => g.id)).toEqual([
      "play",
      "cards",
      "world",
      "collection",
      "market",
      "community",
      "treasury",
    ]);
  });
});
