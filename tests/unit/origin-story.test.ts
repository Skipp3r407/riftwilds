import { describe, expect, it } from "vitest";
import {
  ORIGIN_STORY_SEEN_COOKIE,
  ORIGIN_STORY_SEEN_VALUE,
  hasSeenOriginStoryCookie,
} from "@/lib/origin-story";

describe("origin story first-visit gate", () => {
  it("uses a stable cookie name for middleware + client", () => {
    expect(ORIGIN_STORY_SEEN_COOKIE).toBe("riftwilds-seen-origin-story");
    expect(ORIGIN_STORY_SEEN_VALUE).toBe("1");
  });

  it("treats only the explicit seen value as dismissed", () => {
    expect(hasSeenOriginStoryCookie("1")).toBe(true);
    expect(hasSeenOriginStoryCookie(undefined)).toBe(false);
    expect(hasSeenOriginStoryCookie(null)).toBe(false);
    expect(hasSeenOriginStoryCookie("0")).toBe(false);
    expect(hasSeenOriginStoryCookie("yes")).toBe(false);
  });
});
