import { describe, expect, it } from "vitest";
import { guestIdentityFields, isValidGuestToken } from "@/lib/auth/owner-key";
import { isValidGuestToken as clientValid } from "@/lib/auth/guest-client";

describe("guest identity helpers", () => {
  it("accepts compact alphanumeric guest tokens", () => {
    expect(isValidGuestToken("abcd1234efgh5678")).toBe(true);
    expect(clientValid("abcd1234efgh5678")).toBe(true);
  });

  it("rejects empty, short, or unsafe tokens", () => {
    expect(isValidGuestToken("")).toBe(false);
    expect(isValidGuestToken("short")).toBe(false);
    expect(isValidGuestToken("bad token!!")).toBe(false);
    expect(isValidGuestToken(null)).toBe(false);
  });

  it("only exposes guestToken for guest sessions", () => {
    expect(guestIdentityFields(true, "abcd1234efgh5678")).toEqual({
      guestToken: "abcd1234efgh5678",
    });
    expect(guestIdentityFields(false, "abcd1234efgh5678")).toEqual({});
    expect(guestIdentityFields(true, "nope")).toEqual({});
  });
});
