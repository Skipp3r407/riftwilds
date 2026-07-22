import { existsSync, unlinkSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { saveFeedbackScreenshot } from "@/lib/feedback/screenshots";

/** Minimal 1x1 PNG */
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

describe("saveFeedbackScreenshot", () => {
  it("stores a PNG under public/uploads/feedback and returns a public URL", async () => {
    const file = new File([PNG_1X1], "tiny.png", { type: "image/png" });
    const result = await saveFeedbackScreenshot(file);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.url).toMatch(/^\/uploads\/feedback\/[a-z0-9_]+\.png$/i);
    const diskPath = path.join(process.cwd(), "public", result.url.replace(/^\//, ""));
    expect(existsSync(diskPath)).toBe(true);
    unlinkSync(diskPath);
  });

  it("rejects non-image bytes", async () => {
    const file = new File([Buffer.from("not-an-image")], "fake.png", {
      type: "image/png",
    });
    const result = await saveFeedbackScreenshot(file);
    expect(result.ok).toBe(false);
  });
});
