/**
 * Verified Community Reward Treasury funding injector.
 *
 * Used by settlement hooks and (in development) admin/test tooling.
 * Always runs server-side allocation — clients cannot invent vault credits.
 *
 * Body must include verificationToken matching PET_REWARD_VAULT_VERIFY_TOKEN
 * (or the process default in local/dev).
 */

import { NextResponse } from "next/server";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  fundingSourceFromTransactionType,
  recordVerifiedVaultDeposit,
  VAULT_VERIFICATION_TOKEN,
  type FundingSourceKind,
} from "@/lib/rewards";
import type { RevenueTransactionType } from "@/lib/revenue/types";
import { createRequestId } from "@/lib/utils/request-id";
import { lamportsToSolString } from "@/lib/items/lamports";

const ALLOWED_TYPES: RevenueTransactionType[] = [
  "SHOP_PURCHASE",
  "MARKETPLACE_SALE",
  "CRAFTING_FEE",
  "UPGRADE_FEE",
  "LISTING_FEE",
  "NAME_CHANGE_FEE",
  "INVENTORY_EXPANSION",
  "LOADOUT_SLOT",
  "SEASONAL_PASS",
  "OTHER",
];

export async function POST(req: Request) {
  const requestId = createRequestId();

  if (!featureFlagDefaults.HOLDER_REWARD_VAULT_ENABLED || !featureFlagDefaults.REVENUE_ALLOCATION_ENABLED) {
    return NextResponse.json(
      { requestId, error: "VAULT_OR_ALLOCATION_DISABLED" },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    requestId?: string;
    grossLamports?: string;
    transactionType?: RevenueTransactionType;
    source?: FundingSourceKind;
    txSignature?: string | null;
    network?: string;
    note?: string;
    verificationToken?: string;
  } | null;

  if (!body?.grossLamports || !body.transactionType || !body.verificationToken) {
    return NextResponse.json(
      {
        requestId,
        error: "INVALID_BODY",
        message: "grossLamports, transactionType, and verificationToken are required.",
      },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.includes(body.transactionType)) {
    return NextResponse.json({ requestId, error: "INVALID_TRANSACTION_TYPE" }, { status: 400 });
  }

  let gross: bigint;
  try {
    gross = BigInt(body.grossLamports);
  } catch {
    return NextResponse.json({ requestId, error: "INVALID_LAMPORTS" }, { status: 400 });
  }

  const result = recordVerifiedVaultDeposit({
    requestId: body.requestId ?? requestId,
    grossLamports: gross,
    transactionType: body.transactionType,
    source: body.source ?? fundingSourceFromTransactionType(body.transactionType),
    txSignature: body.txSignature ?? null,
    network: body.network ?? "devnet",
    note: body.note,
    verificationToken: body.verificationToken,
  });

  if (!result.ok) {
    const status = result.reason === "verification_failed" ? 401 : 400;
    return NextResponse.json({ requestId, error: result.reason }, { status });
  }

  return NextResponse.json({
    requestId,
    ok: true,
    funding: result.funding,
    vaultLamports: result.vaultLamports.toString(),
    vaultSol: lamportsToSolString(result.vaultLamports),
    note: "Only the policy vault slice was credited — never the full gross.",
    /** Hint for local tooling — never trust client-supplied tokens in production. */
    verifyTokenHint:
      process.env.NODE_ENV === "production" ? undefined : "Set PET_REWARD_VAULT_VERIFY_TOKEN",
    tokenConfigured: Boolean(process.env.PET_REWARD_VAULT_VERIFY_TOKEN) || VAULT_VERIFICATION_TOKEN.length > 0,
  });
}
