import { describe, expect, it } from "vitest";
import { parseFeedbackSubmission } from "@/lib/feedback/schema";

describe("parseFeedbackSubmission", () => {
  it("accepts a valid bug report", () => {
    const result = parseFeedbackSubmission({
      kind: "bug",
      title: "Hatch button stuck",
      whatHappened: "Clicked hatch and nothing happened for 30 seconds.",
      stepsToReproduce: "1. Open hatchery\n2. Click Hatch\n3. Wait",
      expected: "Egg should hatch or show an error.",
      actual: "Spinner forever, no egg.",
      severity: "high",
      email: "keeper@example.com",
      website: "",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.honeypotFilled).toBe(false);
      expect(result.data.kind).toBe("bug");
      if (result.data.kind === "bug") {
        expect(result.data.title).toBe("Hatch button stuck");
        expect(result.data.severity).toBe("high");
      }
    }
  });

  it("accepts feedback with category and no email", () => {
    const result = parseFeedbackSubmission({
      kind: "feedback",
      category: "housing",
      message: "Please add more furniture slots for small plots.",
      email: "",
      website: "",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.kind).toBe("feedback");
      if (result.data.kind === "feedback") {
        expect(result.data.category).toBe("housing");
        expect(result.data.email).toBeUndefined();
      }
    }
  });

  it("rejects short bug titles", () => {
    const result = parseFeedbackSubmission({
      kind: "bug",
      title: "Hi",
      whatHappened: "Something broke in the live world when I tried to walk.",
      stepsToReproduce: "1. Enter world\n2. Walk north",
      expected: "I move",
      actual: "I freeze",
      severity: "medium",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message.toLowerCase()).toMatch(/title/);
    }
  });

  it("rejects invalid feedback category", () => {
    const result = parseFeedbackSubmission({
      kind: "feedback",
      category: "not-a-real-category",
      message: "This should fail validation because category is wrong.",
    });
    expect(result.ok).toBe(false);
  });

  it("flags honeypot when website is filled", () => {
    const result = parseFeedbackSubmission({
      kind: "feedback",
      category: "other",
      message: "Looks like a real message but the honeypot is filled.",
      website: "https://spam.example",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.honeypotFilled).toBe(true);
    }
  });

  it("rejects bad optional email", () => {
    const result = parseFeedbackSubmission({
      kind: "feedback",
      category: "ui",
      message: "The inventory grid feels cramped on mobile screens.",
      email: "not-an-email",
    });
    expect(result.ok).toBe(false);
  });
});
