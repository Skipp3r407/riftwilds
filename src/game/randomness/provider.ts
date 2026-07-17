import { createHash, randomInt } from "crypto";

export type RandomnessProvider = {
  source: "SERVER_CSPRNG" | "FUTURE_VRF";
  /** Inclusive integer in [min, max]. */
  nextInt(min: number, max: number): number;
  /** Integer in [0, 9999] for hatch rolls. */
  nextRoll(): number;
};

export const serverCsprngProvider: RandomnessProvider = {
  source: "SERVER_CSPRNG",
  nextInt(min, max) {
    return randomInt(min, max + 1);
  },
  nextRoll() {
    return randomInt(0, 10000);
  },
};

/** Interface placeholder for future audited VRF integration. */
export const futureVrfProviderStub: RandomnessProvider = {
  source: "FUTURE_VRF",
  nextInt() {
    throw new Error("VRF provider not configured");
  },
  nextRoll() {
    throw new Error("VRF provider not configured");
  },
};

export function integrityHash(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
