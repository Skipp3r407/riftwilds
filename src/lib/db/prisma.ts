import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaUrl?: string;
};

function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/**
 * Reuse a single client across hot reloads and serverless invocations.
 * Recreate when DATABASE_URL changes so a Neon switch isn't stuck on an
 * old localhost client after module re-evaluation.
 */
const databaseUrl = process.env.DATABASE_URL ?? "";
if (!globalForPrisma.prisma || globalForPrisma.prismaUrl !== databaseUrl) {
  void globalForPrisma.prisma?.$disconnect().catch(() => undefined);
  globalForPrisma.prisma = createClient();
  globalForPrisma.prismaUrl = databaseUrl;
}

export const prisma = globalForPrisma.prisma;
