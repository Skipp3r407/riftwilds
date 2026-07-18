import { describe, expect, it } from "vitest";
import { runCreditPlaythrough } from "@/lib/credits/playthrough";

describe("Credits economic playthrough", () => {
  it("earns and spends Credits with AI grants blocked", () => {
    const report = runCreditPlaythrough("test-playthrough");
    expect(report.passed).toBe(true);
    expect(report.earned).toBeGreaterThan(0);
    expect(report.spent).toBeGreaterThan(0);
    expect(report.finalBalance).toBeGreaterThan(0);
    const ai = report.steps.find((s) => s.step === "ai_grant_blocked");
    expect(ai?.ok).toBe(true);
  });
});
