import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionContext } from "@/lib/auth/session";
import { fetchTokenBalance } from "@/lib/solana/token-balance";
import { prisma } from "@/lib/db/prisma";
import { createRequestId } from "@/lib/utils/request-id";
import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { projectConfig } from "@/lib/config/project";

const querySchema = z.object({
  wallet: z.string().min(32).max(64).optional(),
});

export async function GET(request: NextRequest) {
  const requestId = createRequestId();
  try {
    const session = await getSessionContext();
    const parsed = querySchema.safeParse({
      wallet: request.nextUrl.searchParams.get("wallet") ?? undefined,
    });
    if (!parsed.success) {
      throw new AppError({
        code: ErrorCodes.VALIDATION,
        message: "Invalid wallet",
        requestId,
      });
    }

    const wallet = parsed.data.wallet ?? session?.walletAddress;
    if (!wallet) {
      throw new AppError({
        code: ErrorCodes.WALLET_DISCONNECTED,
        message: "Connect a wallet to check token balance",
        requestId,
        status: 401,
      });
    }

    // Public display allowed; eligibility grants must re-verify server-side at claim time.
    const balance = await fetchTokenBalance({ walletAddress: wallet });

    if (session && session.walletAddress === wallet) {
      await prisma.tokenBalanceSnapshot.create({
        data: {
          userId: session.userId,
          wallet,
          mint: balance.mint,
          amountRaw: balance.amountRaw.toString(),
          decimals: balance.decimals,
          tier: balance.tier,
          slot: balance.slot !== null ? BigInt(balance.slot) : null,
          source: balance.source,
          expiresAt: new Date(Date.now() + 60_000),
        },
      });
      await prisma.playerProfile.updateMany({
        where: { userId: session.userId },
        data: { tokenTier: balance.tier, lastActiveAt: new Date() },
      });
    }

    return NextResponse.json({
      requestId,
      token: {
        name: projectConfig.TOKEN_NAME,
        symbol: projectConfig.TOKEN_SYMBOL,
        mint: balance.mint,
        pumpFunUrl: projectConfig.PUMP_FUN_URL,
      },
      balance: {
        amountRaw: balance.amountRaw.toString(),
        uiAmount: balance.uiAmount,
        decimals: balance.decimals,
        tier: balance.tier,
        slot: balance.slot,
        source: balance.source,
        fetchedAt: balance.fetchedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.toJSON() }, { status: error.status });
    }
    return NextResponse.json(
      {
        error: {
          code: ErrorCodes.TOKEN_BALANCE_UNAVAILABLE,
          message: "Token balance unavailable",
          requestId,
          retryable: true,
        },
      },
      { status: 503 },
    );
  }
}
