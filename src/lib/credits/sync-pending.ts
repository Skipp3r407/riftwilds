/**
 * Flush Live World pending quest Credits to the authoritative ledger.
 */

import {
  loadLivePlayState,
  mirrorCreditsBalance,
  saveLivePlayState,
  takePendingCreditGrants,
} from "@/game/npcs/play-state";
import { syncQuestCredits, fetchCreditsBalance, getDemoCreditsUserId } from "@/lib/credits/client";

export async function flushPendingQuestCredits(): Promise<number> {
  const state = loadLivePlayState();
  const grants = takePendingCreditGrants(state);
  saveLivePlayState(state);
  let balance = state.demoCredits;
  for (const g of grants) {
    const res = await syncQuestCredits(g.questKey, g.amount);
    if (res.ok) balance = res.balance;
  }
  if (grants.length === 0) {
    const bal = await fetchCreditsBalance(getDemoCreditsUserId());
    if (bal.ok) balance = bal.balance;
  }
  const next = loadLivePlayState();
  mirrorCreditsBalance(next, balance);
  saveLivePlayState(next);
  return balance;
}
