import { beforeEach, describe, expect, it, vi } from "vitest";
import { guestIdentityFields, isValidGuestToken } from "@/lib/auth/owner-key";
import {
  ensureClientGuestToken,
  GUEST_TOKEN_STORAGE_KEY,
  isValidGuestToken as clientValid,
  readStoredGuestToken,
} from "@/lib/auth/guest-client";
import * as playPolicy from "@/lib/auth/account-play-policy";

describe("guest identity helpers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v);
        },
      },
    });
  });

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
    vi.spyOn(playPolicy, "isGuestGameplayAllowed").mockReturnValue(true);
    expect(guestIdentityFields(true, "abcd1234efgh5678")).toEqual({
      guestToken: "abcd1234efgh5678",
    });
    expect(guestIdentityFields(false, "abcd1234efgh5678")).toEqual({});
    expect(guestIdentityFields(true, "nope")).toEqual({});
  });

  it("mints one stable client guest token for parallel practice starts", () => {
    const a = ensureClientGuestToken();
    const b = ensureClientGuestToken();
    expect(a).toBeTruthy();
    expect(a).toBe(b);
    expect(readStoredGuestToken()).toBe(a);
    expect(window.sessionStorage.getItem(GUEST_TOKEN_STORAGE_KEY)).toBe(a);
  });
});
