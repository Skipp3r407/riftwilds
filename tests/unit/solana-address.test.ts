import { describe, expect, it } from "vitest";
import { Keypair } from "@solana/web3.js";
import { isValidSolanaAddress, normalizeSolanaAddress } from "@/lib/solana/address";

describe("isValidSolanaAddress", () => {
  it("accepts a real ed25519 pubkey", () => {
    const address = Keypair.generate().publicKey.toBase58();
    expect(isValidSolanaAddress(address)).toBe(true);
  });

  it("trims whitespace before validating", () => {
    const address = Keypair.generate().publicKey.toBase58();
    expect(isValidSolanaAddress(`  ${address}  `)).toBe(true);
    expect(normalizeSolanaAddress(`  ${address}  `)).toBe(address);
  });

  it("rejects empty and garbage", () => {
    expect(isValidSolanaAddress("")).toBe(false);
    expect(isValidSolanaAddress("not-a-wallet")).toBe(false);
    expect(isValidSolanaAddress("0x1234")).toBe(false);
  });

  it("rejects wrong-length base58", () => {
    expect(isValidSolanaAddress("1111")).toBe(false);
  });
});
