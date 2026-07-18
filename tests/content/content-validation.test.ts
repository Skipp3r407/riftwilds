import { describe, expect, it } from "vitest";
import { validateGameContent } from "@/lib/content/validate";
import { starterMapGoalRecommendations } from "@/content/map-goals";
import { COMMONS_CONTENT_PACK } from "@/content/regions";

describe("content validation pipeline", () => {
  it("passes core content + commons full pack + 3 starter goals", () => {
    const report = validateGameContent();
    expect(COMMONS_CONTENT_PACK.completeness).toBe("full");
    expect(starterMapGoalRecommendations()).toHaveLength(3);
    expect(report.ok).toBe(true);
    expect(report.stats.mapGoals).toBeGreaterThanOrEqual(3);
    expect(report.stats.regionPacks).toBeGreaterThanOrEqual(12);
  });
});
