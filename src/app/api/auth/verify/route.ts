import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  normalizeWalletAddress,
  verifyEd25519Signature,
} from "@/lib/auth/siws";
import { createUserSession, hashIp } from "@/lib/auth/session";
import { createRequestId } from "@/lib/utils/request-id";
import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { projectConfig } from "@/lib/config/project";

const bodySchema = z.object({
  wallet: z.string().min(32).max(64),
  signature: z.string().min(64),
  message: z.string().min(20),
});

export async function POST(request: NextRequest) {
  const requestId = createRequestId();
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      throw new AppError({
        code: ErrorCodes.VALIDATION,
        message: "Invalid authentication payload",
        requestId,
        status: 400,
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      });
    }

    const wallet = normalizeWalletAddress(parsed.data.wallet);
    const nonceMatch = parsed.data.message.match(/Nonce:\s*(\S+)/);
    const nonce = nonceMatch?.[1];
    if (!nonce) {
      throw new AppError({
        code: ErrorCodes.VALIDATION,
        message: "Authentication message missing nonce",
        requestId,
        status: 400,
      });
    }

    const record = await prisma.authNonce.findUnique({ where: { nonce } });
    if (!record || record.wallet !== wallet) {
      throw new AppError({
        code: ErrorCodes.UNAUTHORIZED,
        message: "Invalid or unknown nonce",
        requestId,
        status: 401,
      });
    }
    if (record.usedAt) {
      throw new AppError({
        code: ErrorCodes.UNAUTHORIZED,
        message: "Nonce already used",
        requestId,
        status: 401,
      });
    }
    if (record.expiresAt < new Date()) {
      throw new AppError({
        code: ErrorCodes.UNAUTHORIZED,
        message: "Nonce expired",
        requestId,
        status: 401,
      });
    }

    const valid = verifyEd25519Signature({
      message: parsed.data.message,
      signatureBase58: parsed.data.signature,
      walletAddress: wallet,
    });
    if (!valid) {
      throw new AppError({
        code: ErrorCodes.SIGNATURE_REJECTED,
        message: "Wallet signature could not be verified",
        requestId,
        status: 401,
      });
    }

    const network = projectConfig.SOLANA_NETWORK;
    const user = await prisma.$transaction(async (tx) => {
      await tx.authNonce.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });

      const existing = await tx.wallet.findUnique({
        where: { address_network: { address: wallet, network } },
        include: { user: true },
      });

      if (!existing) {
        const created = await tx.user.create({
          data: {
            wallets: {
              create: {
                address: wallet,
                network,
                isPrimary: true,
                verifiedAt: new Date(),
                lastSeenAt: new Date(),
              },
            },
            profile: {
              create: {
                displayName: `Keeper-${wallet.slice(0, 4)}`,
              },
            },
            settings: { create: {} },
          },
          include: { wallets: true },
        });
        await tx.user.update({
          where: { id: created.id },
          data: { primaryWalletId: created.wallets[0]?.id },
        });
        return created;
      }

      await tx.wallet.update({
        where: { id: existing.id },
        data: { verifiedAt: new Date(), lastSeenAt: new Date() },
      });
      return existing.user;
    });

    await createUserSession({ userId: user.id, walletAddress: wallet });

    return NextResponse.json({
      requestId,
      ok: true,
      userId: user.id,
      wallet,
      ipHash: hashIp(request.headers.get("x-forwarded-for")),
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.toJSON() }, { status: error.status });
    }
    return NextResponse.json(
      {
        error: {
          code: ErrorCodes.INTERNAL,
          message: "Authentication failed",
          requestId,
          retryable: true,
        },
      },
      { status: 500 },
    );
  }
}
