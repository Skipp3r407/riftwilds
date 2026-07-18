"use client";

import type { CareJournalEntry } from "@/game/creatures/care-catalog";
import { careActionIconPath } from "@/components/pets/care-action-button";
import Image from "next/image";

export function CareJournal({ entries }: { entries: CareJournalEntry[] }) {
  if (!entries.length) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        Care moments will appear here as you look after your Riftling.
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {entries.map((entry) => (
        <li key={entry.id} className="panel-inset flex gap-3 px-3 py-2.5">
          <Image
            src={careActionIconPath(entry.action)}
            alt=""
            width={28}
            height={28}
            className="mt-0.5 shrink-0"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-white">{entry.label}</p>
              <time className="text-[10px] tabular-nums text-[var(--text-muted)]">
                {new Date(entry.at).toLocaleString()}
              </time>
            </div>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">{entry.note}</p>
            <p className="mt-1 text-[10px] text-[var(--cyan)]">
              +{entry.careXpGained} Care XP
              {entry.creditCost > 0 ? ` · ${entry.creditCost} Credits` : " · Free"}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
