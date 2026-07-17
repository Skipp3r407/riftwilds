import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  buildSiwsMessage,
  createNonce,
  getNonceExpiry,
  normalizeWalletAddress,
} from "@/lib/auth/siws";
import { createRequestId } from "@/lib/utils/request-id";
import { projectConfig } from "@/lib/config/project";
import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { enforceRateLimit, memoryRateLimiter } from "@/lib/security/rate-limit";

const querySchema = z.object({
  wallet: z.string().min(32).max(64),
});

export async function GET(request: NextRequest) {
  const requestId = createRequestId();
  try {
    const parsed = querySchema.safeParse({
      wallet: request.nextUrl.searchParams.get("wallet"),
    });
    if (!parsed.success) {
      throw new AppError({
        code: ErrorCodes.VALIDATION,
        message: "Invalid wallet address",
        requestId,
        status: 400,
      });
    }

    const wallet = normalizeWalletAddress(parsed.data.wallet);
    const rl = await enforceRateLimit(
      memoryRateLimiter,
      `nonce:${wallet}`,
      10,
      60_000,
    );
    if (!rl.success) {
      throw new AppError({
        code: ErrorCodes.RATE_LIMITED,
        message: "Too many authentication attempts. Try again shortly.",
        requestId,
        status: 429,
        retryable: true,
      });
    }

    const nonce = createNonce();
    const issuedAt = new Date();
    const expiresAt = getNonceExpiry(issuedAt);
    const domain = request.nextUrl.host;
    const chain = projectConfig.SOLANA_NETWORK;

    await prisma.authNonce.create({
      data: {
        wallet,
        nonce,
        requestId,
        domain,
        issuedAt,
        expiresAt,
      },
    });

    const message = buildSiwsMessage({
      domain,
      wallet,
      nonce,
      issuedAt,
      expirationTime: expiresAt,
      requestId,
      chain,
    });

    return NextResponse.json({
      requestId,
      nonce,
      message,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.toJSON() }, { status: error.status });
    }
    return NextResponse.json(
      {
        error: {
          code: ErrorCodes.INTERNAL,
          message: "Unable to issue authentication nonce",
          requestId,
          retryable: true,
        },
      },
      { status: 500 },
    );
  }
}
