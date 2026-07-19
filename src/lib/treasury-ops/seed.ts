import {
  TREASURY_OPS_STATE_VERSION,
  createDefaultRules,
  createDefaultSettings,
  createDefaultWallets,
} from "./config";
import type {
  IncomingTransaction,
  TreasuryOpsState,
  WalletBalance,
} from "./types";

function id(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Seed sample revenue so local dashboards are not empty. */
export function createSeededState(): TreasuryOpsState {
  const now = new Date();
  const iso = now.toISOString();
  const settings = createDefaultSettings(iso);
  const wallets = createDefaultWallets(settings.projectTreasuryAddress, iso);
  const rules = createDefaultRules(wallets, iso);
  const project = wallets.find((w) => w.role === "PROJECT_TREASURY")!;

  const sampleSources: IncomingTransaction["sourceKey"][] = [
    "pumpfun_creator_fees",
    "marketplace_fees",
    "battle_pass",
    "cosmetic_shop",
    "nft_royalties",
    "arena_tournament_fees",
    "donations",
    "sponsored_events",
  ];

  const incoming: IncomingTransaction[] = sampleSources.map((sourceKey, i) => {
    const created = new Date(now.getTime() - (i + 1) * 3_600_000).toISOString();
    const amount = BigInt((i + 1) * 25_000_000); // 0.025 → 0.2 SOL
    return {
      id: id("in"),
      sourceKey,
      category: sourceKey,
      asset: "SOL",
      amountLamports: amount.toString(),
      senderAddress: `SEED_SENDER_${i}`,
      recipientAddress: project.address,
      txSignature: `seed_sig_${sourceKey}_${i}`,
      idempotencyKey: `seed:${sourceKey}:${i}`,
      confirmations: 32,
      status: "VERIFIED",
      verifiedAt: created,
      metadata: { seeded: true, note: "Demo ingest — not on-chain" },
      createdAt: created,
      updatedAt: created,
    };
  });

  // Leave project treasury with undistributed seed balance
  const seedTreasuryLamports = incoming.reduce(
    (s, tx) => s + BigInt(tx.amountLamports),
    0n,
  );

  const balances: WalletBalance[] = wallets.map((w) => ({
    walletId: w.id,
    asset: "SOL" as const,
    balanceRaw: w.role === "PROJECT_TREASURY" ? seedTreasuryLamports.toString() : "0",
    updatedAt: iso,
    verified: false,
    isDemo: true,
  }));

  // Small RIFT demo balance on project treasury
  balances.push({
    walletId: project.id,
    asset: "RIFT",
    balanceRaw: "0",
    updatedAt: iso,
    verified: false,
    isDemo: true,
  });

  return {
    version: TREASURY_OPS_STATE_VERSION,
    settings,
    wallets,
    rules,
    ruleHistory: [],
    balances,
    incoming,
    processed: [],
    distributions: [],
    pendingDistributions: [],
    failed: [],
    approvals: [],
    auditLogs: [
      {
        id: id("taudit"),
        createdAt: iso,
        actorId: "system",
        action: "treasury_ops_seeded",
        entityType: "system",
        entityId: "treasury_ops",
        requestId: null,
        metadata: { incomingCount: incoming.length },
      },
    ],
    reports: [],
    notifications: [
      {
        id: id("note"),
        createdAt: iso,
        level: "info",
        title: "Treasury ops ready (demo)",
        body: "Seed revenue loaded. Monitoring + distribution run in demo-simulated mode until keys and real-transfer flags are enabled.",
        read: false,
      },
    ],
    seenSignatures: incoming.map((t) => t.txSignature!).filter(Boolean),
    seededAt: iso,
    updatedAt: iso,
  };
}
