"use client";

import type { VerifiedFundingRecord } from "@/lib/rewards/types";
import { lamportsToSolString } from "@/lib/items/lamports";

type Props = {
  funding: VerifiedFundingRecord[];
};

function sourceLabel(source: VerifiedFundingRecord["source"]): string {
  switch (source) {
    case "SHOP_PURCHASE":
      return "Shop / game purchase";
    case "MARKETPLACE_SALE":
      return "Marketplace fee";
    case "CRAFTING_FEE":
      return "Crafting fee";
    case "UPGRADE_FEE":
      return "Upgrade fee";
    case "LISTING_FEE":
      return "Listing fee";
    case "TOKEN_FEE":
      return "Token fee";
    case "GAME_PURCHASE":
      return "Game purchase";
    case "VERIFIED_INJECTOR":
      return "Verified deposit";
    default:
      return source;
  }
}

export function RewardFundingFeed({ funding }: Props) {
  if (funding.length === 0) {
    return (
      <div className="rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] p-3 text-xs text-[var(--text-muted)]">
        No verified vault funding yet. Estimated Pending only rises when deposits are recorded
        server-side.
      </div>
    );
  }

  return (
    <ul className="space-y-2" aria-label="Recent vault funding">
      {funding.map((f) => (
        <li
          key={f.id}
          className="rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3 py-2 text-xs"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-display text-[var(--cyan)]">
              +{lamportsToSolString(BigInt(f.amountLamports))} SOL
            </span>
            <time className="text-[var(--text-muted)]" dateTime={f.createdAt}>
              {new Date(f.createdAt).toLocaleString()}
            </time>
          </div>
          <p className="mt-1 text-[var(--text-muted)]">
            {sourceLabel(f.source)}
            {f.verified ? " · verified" : null}
          </p>
          {f.txSignature ? (
            <p className="mt-1 truncate text-[10px] text-[var(--text-dim)]">
              {f.explorerUrl ? (
                <a
                  href={f.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--cyan)] underline-offset-2 hover:underline"
                >
                  Explorer · {f.txSignature.slice(0, 12)}…
                </a>
              ) : (
                <span>Tx · {f.txSignature.slice(0, 16)}…</span>
              )}
            </p>
          ) : (
            <p className="mt-1 text-[10px] text-[var(--text-dim)]">No explorer tx (local ledger)</p>
          )}
        </li>
      ))}
    </ul>
  );
}
