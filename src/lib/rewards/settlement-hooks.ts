/**
 * Settlement hooks — call from shop / marketplace fee paths after a payment
 * is verified server-side. Never invoke from untrusted browser math.
 */

import {
  fundingSourceFromTransactionType,
  recordVerifiedVaultDeposit,
  VAULT_VERIFICATION_TOKEN,
} from "@/lib/rewards/vault-store";
import type { FundingSourceKind } from "@/lib/rewards/types";
import type { RevenueTransactionType } from "@/lib/revenue/types";

export function fundPetRewardVaultFromVerifiedSettlement(params: {
  requestId: string;
  grossLamports: bigint;
  transactionType: RevenueTransactionType;
  source?: FundingSourceKind;
  txSignature?: string | null;
  network?: string;
  note?: string;
}) {
  return recordVerifiedVaultDeposit({
    requestId: params.requestId,
    grossLamports: params.grossLamports,
    transactionType: params.transactionType,
    source: params.source ?? fundingSourceFromTransactionType(params.transactionType),
    txSignature: params.txSignature ?? null,
    network: params.network ?? "devnet",
    note: params.note,
    verificationToken: VAULT_VERIFICATION_TOKEN,
  });
}
