/**
 * Browser helpers for the authoritative Credits ledger APIs.
 * Credits ≠ SOL. Never invent balances client-side after a failed sync.
 */

export type CreditsBalanceResponse = {
  ok?: boolean;
  balance: number;
  userId?: string;
  authenticated?: boolean;
  disclaimer?: string;
  recent?: { delta: number; reason: string; createdAt: string }[];
  error?: string;
  message?: string;
};

export type CreditsActionResponse = {
  ok: boolean;
  balance: number;
  message: string;
  error?: string;
  entryId?: string;
  disclaimer?: string;
};

const DEMO_USER_KEY = "riftwilds-credits-demo-user";

export function getDemoCreditsUserId(): string {
  if (typeof window === "undefined") return "demo-keeper";
  try {
    const existing = localStorage.getItem(DEMO_USER_KEY);
    if (existing && existing.length >= 4) return existing;
    const id = `keeper-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(DEMO_USER_KEY, id);
    return id;
  } catch {
    return "demo-keeper";
  }
}

export async function fetchCreditsBalance(
  demoUser = getDemoCreditsUserId(),
): Promise<CreditsBalanceResponse> {
  const res = await fetch(`/api/credits/balance?demoUser=${encodeURIComponent(demoUser)}`, {
    credentials: "same-origin",
  });
  const json = (await res.json()) as CreditsBalanceResponse;
  if (!res.ok || json.ok === false) {
    return { ok: false, balance: 0, error: json.error ?? "balance_failed" };
  }
  return { ...json, ok: true };
}

export async function postCreditsAction(body: {
  action: string;
  demoUser?: string;
  requestId?: string;
  [key: string]: unknown;
}): Promise<CreditsActionResponse> {
  const res = await fetch("/api/economy/credits-action", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      demoUser: body.demoUser ?? getDemoCreditsUserId(),
      ...body,
    }),
  });
  const json = (await res.json()) as CreditsActionResponse;
  if (!res.ok || json.ok === false) {
    return {
      ok: false,
      balance: typeof json.balance === "number" ? json.balance : 0,
      message: json.message ?? json.error ?? "action_failed",
      error: json.error,
    };
  }
  return {
    ok: true,
    balance: json.balance ?? 0,
    message: json.message ?? "",
    entryId: json.entryId,
    disclaimer: json.disclaimer,
  };
}

export async function syncQuestCredits(
  questKey: string,
  amount?: number,
): Promise<CreditsActionResponse> {
  return postCreditsAction({
    action: "quest_complete",
    questKey,
    amount,
    requestId: `quest:${getDemoCreditsUserId()}:${questKey}`,
  });
}

export async function syncNpcShopBuy(
  shopId: string,
  itemId: string,
): Promise<CreditsActionResponse> {
  return postCreditsAction({
    action: "npc_shop_buy",
    shopId,
    itemId,
  });
}
