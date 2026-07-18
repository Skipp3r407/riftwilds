import { describe, expect, it } from "vitest";
import {
  filterLeaderboardEntries,
  getDemoLeaderboard,
  scoreForTab,
  winRatePercent,
  CURRENT_SEASON_ID,
} from "@/lib/leaderboards/demo-data";

describe("TCG leaderboard ladder", () => {
  it("ranks by rift points on the primary tab", () => {
    const raw = getDemoLeaderboard({ seasonId: CURRENT_SEASON_ID, timeRange: "season" });
    expect(raw[0]!.riftPoints).toBeGreaterThan(0);
    const ranked = filterLeaderboardEntries(raw, {
      tab: "rift",
      affinity: "ALL",
      query: "",
    });
    expect(ranked[0]!.rank).toBe(1);
    expect(scoreForTab(ranked[0]!, "rift")).toBe(ranked[0]!.riftPoints);
    expect(scoreForTab(ranked[0]!, "rift")).toBeGreaterThanOrEqual(
      scoreForTab(ranked[1]!, "rift"),
    );
  });

  it("exposes win rate and binder scores", () => {
    const raw = getDemoLeaderboard({ seasonId: CURRENT_SEASON_ID, timeRange: "season" });
    const entry = raw[0]!;
    expect(winRatePercent(entry)).toBeGreaterThan(0);
    expect(entry.binderCards).toBeGreaterThan(0);
    expect(scoreForTab(entry, "collection")).toBe(entry.binderCards);
  });

  it("keeps legacy arena scores secondary", () => {
    const raw = getDemoLeaderboard({ seasonId: CURRENT_SEASON_ID, timeRange: "season" });
    const entry = raw[3]!;
    expect(scoreForTab(entry, "arena")).toBe(entry.arenaPoints);
    expect(entry.riftPoints).toBeGreaterThan(entry.arenaPoints);
  });
});
