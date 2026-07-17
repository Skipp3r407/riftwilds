import { describe, expect, it } from "vitest";
import { DEFAULT_ODDS, pickRarityFromRoll, validateOdds, marketplaceFee } from "@/game/economy/hatch-odds";

describe("hatch odds", () => {
  it("validates default odds sum to 100", () => {
    expect(validateOdds(DEFAULT_ODDS)).toBe(true);
  });

  it("maps boundary rolls to expected rarities", () => {
    expect(pickRarityFromRoll(0)).toBe("COMMON");
    expect(pickRarityFromRoll(4199)).toBe("COMMON");
    expect(pickRarityFromRoll(4200)).toBe("UNCOMMON");
    expect(pickRarityFromRoll(9900)).toBe("CELESTIAL");
  });

  it("calculates marketplace fee in integer credits", () => {
    expect(marketplaceFee(10000, 250)).toBe(250);
  });
});
