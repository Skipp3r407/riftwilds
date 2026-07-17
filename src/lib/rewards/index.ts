export * from "@/lib/rewards/types";
export * from "@/lib/rewards/inactive-reasons";
export * from "@/lib/rewards/events";
export {
  VAULT_VERIFICATION_TOKEN,
  registerPetForRewards,
  setPetRewardSelection,
  recordVerifiedVaultDeposit,
  closeCurrentEpoch,
  claimPetRewards,
  getPetRewardVaultView,
  getRecentFunding,
  getCurrentEpochState,
  getWalletClaimBalance,
  flagsFromPetCondition,
  fundingSourceFromTransactionType,
  setCommunityActivitySnapshot,
  getCommunityActivitySnapshot,
  recordCommunityMarketplaceTrade,
  recordCommunityEggHatched,
  recordCommunityPetEvolved,
  __resetPetRewardVault,
  __debugVaultState,
} from "@/lib/rewards/vault-store";
export type { RegisterPetInput } from "@/lib/rewards/vault-store";
export { fundPetRewardVaultFromVerifiedSettlement } from "@/lib/rewards/settlement-hooks";
