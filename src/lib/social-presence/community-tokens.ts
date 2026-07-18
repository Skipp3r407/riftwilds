/**
 * Community Tokens — account-bound, non-transferable, never SOL-purchasable.
 */

import {
  COMMUNITY_TOKENS_DAY_CAP,
  COMMUNITY_TOKENS_WEEK_CAP,
} from "@/lib/social-presence/config";

export type CommunityTokenLedgerEntry = {
  id: string;
  userId: string;
  delta: number;
  balanceAfter: number;
  reason: string;
  requestId: string;
  at: string;
};

export type CommunityShopItem = {
  id: string;
  label: string;
  cost: number;
  category: "emote" | "furniture" | "title" | "toy" | "instrument" | "frame" | "theme";
  cosmeticOnly: true;
};

type TokenStore = {
  balances: Map<string, number>;
  earnedDay: Map<string, { dayKey: string; amount: number }>;
  earnedWeek: Map<string, { weekKey: string; amount: number }>;
  ledger: CommunityTokenLedgerEntry[];
  claimKeys: Set<string>;
  purchases: Set<string>;
};

const globalForCt = globalThis as unknown as { __riftwildsCommunityTokens?: TokenStore };

function store(): TokenStore {
  if (!globalForCt.__riftwildsCommunityTokens) {
    globalForCt.__riftwildsCommunityTokens = {
      balances: new Map(),
      earnedDay: new Map(),
      earnedWeek: new Map(),
      ledger: [],
      claimKeys: new Set(),
      purchases: new Set(),
    };
  }
  return globalForCt.__riftwildsCommunityTokens;
}

export function resetCommunityTokensForTests(): void {
  globalForCt.__riftwildsCommunityTokens = {
    balances: new Map(),
    earnedDay: new Map(),
    earnedWeek: new Map(),
    ledger: [],
    claimKeys: new Set(),
    purchases: new Set(),
  };
}

function dayKey(now: number) {
  return new Date(now).toISOString().slice(0, 10);
}

function weekKey(now: number) {
  const d = new Date(now);
  const onejan = new Date(d.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getUTCDay() + 1) / 7);
  return `${d.getUTCFullYear()}-W${week}`;
}

export const COMMUNITY_SHOP: CommunityShopItem[] = [
  { id: "ct-emote-cheer", label: "Cheer Emote", cost: 8, category: "emote", cosmeticOnly: true },
  { id: "ct-frame-plaza", label: "Plaza Profile Frame", cost: 20, category: "frame", cosmeticOnly: true },
  { id: "ct-campfire-theme", label: "Campfire Theme Ember", cost: 15, category: "theme", cosmeticOnly: true },
  { id: "ct-toy-ball", label: "Riftling Soft Ball", cost: 12, category: "toy", cosmeticOnly: true },
  { id: "ct-title-neighbor", label: "Title: Friendly Neighbor", cost: 25, category: "title", cosmeticOnly: true },
  { id: "ct-furniture-lantern", label: "Window Lantern", cost: 18, category: "furniture", cosmeticOnly: true },
  { id: "ct-instrument-flute", label: "Travel Flute Skin", cost: 22, category: "instrument", cosmeticOnly: true },
];

export function getCommunityTokenBalance(userId: string): number {
  return store().balances.get(userId) ?? 0;
}

export function creditCommunityTokens(params: {
  userId: string;
  amount: number;
  reason: string;
  requestId: string;
  now?: number;
}):
  | { ok: true; balance: number; granted: number; capped: boolean }
  | { ok: false; error: string; message: string; balance: number } {
  const now = params.now ?? Date.now();
  const amount = Math.floor(params.amount);
  if (amount <= 0) {
    return {
      ok: false,
      error: "invalid",
      message: "Amount must be positive.",
      balance: getCommunityTokenBalance(params.userId),
    };
  }
  const s = store();
  if (s.claimKeys.has(params.requestId)) {
    return {
      ok: true,
      balance: getCommunityTokenBalance(params.userId),
      granted: 0,
      capped: false,
    };
  }

  const dk = dayKey(now);
  const wk = weekKey(now);
  const day = s.earnedDay.get(params.userId);
  const week = s.earnedWeek.get(params.userId);
  const dayAmt = day?.dayKey === dk ? day.amount : 0;
  const weekAmt = week?.weekKey === wk ? week.amount : 0;
  const dayRoom = Math.max(0, COMMUNITY_TOKENS_DAY_CAP - dayAmt);
  const weekRoom = Math.max(0, COMMUNITY_TOKENS_WEEK_CAP - weekAmt);
  const granted = Math.min(amount, dayRoom, weekRoom);
  if (granted <= 0) {
    return {
      ok: false,
      error: "cap",
      message: "Community Token daily/weekly cap reached (never SOL).",
      balance: getCommunityTokenBalance(params.userId),
    };
  }

  const bal = (s.balances.get(params.userId) ?? 0) + granted;
  s.balances.set(params.userId, bal);
  s.earnedDay.set(params.userId, { dayKey: dk, amount: dayAmt + granted });
  s.earnedWeek.set(params.userId, { weekKey: wk, amount: weekAmt + granted });
  s.claimKeys.add(params.requestId);
  s.ledger.push({
    id: `ct_${now}`,
    userId: params.userId,
    delta: granted,
    balanceAfter: bal,
    reason: params.reason,
    requestId: params.requestId,
    at: new Date(now).toISOString(),
  });
  return { ok: true, balance: bal, granted, capped: granted < amount };
}

export function purchaseCommunityShopItem(params: {
  userId: string;
  itemId: string;
  now?: number;
}):
  | { ok: true; balance: number; item: CommunityShopItem }
  | { ok: false; error: string; message: string } {
  const item = COMMUNITY_SHOP.find((i) => i.id === params.itemId);
  if (!item) return { ok: false, error: "not_found", message: "Unknown shop item." };
  const key = `${params.userId}:${item.id}`;
  const s = store();
  if (s.purchases.has(key)) {
    return { ok: false, error: "owned", message: "Already owned (cosmetic)." };
  }
  const bal = s.balances.get(params.userId) ?? 0;
  if (bal < item.cost) {
    return { ok: false, error: "insufficient", message: "Not enough Community Tokens." };
  }
  const next = bal - item.cost;
  s.balances.set(params.userId, next);
  s.purchases.add(key);
  s.ledger.push({
    id: `ct_buy_${Date.now()}`,
    userId: params.userId,
    delta: -item.cost,
    balanceAfter: next,
    reason: `shop:${item.id}`,
    requestId: key,
    at: new Date(params.now ?? Date.now()).toISOString(),
  });
  return { ok: true, balance: next, item };
}

export function tokensEarnedToday(userId: string, now = Date.now()): number {
  const day = store().earnedDay.get(userId);
  return day?.dayKey === dayKey(now) ? day.amount : 0;
}
