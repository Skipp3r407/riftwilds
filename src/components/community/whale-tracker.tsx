import type { WhaleEntry } from "@/lib/community";

type Props = {
  whales: WhaleEntry[];
  topHolders: WhaleEntry[];
  mintConfigured: boolean;
};

export function WhaleTracker({ whales, topHolders, mintConfigured }: Props) {
  return (
    <section className="panel space-y-4 p-5" aria-labelledby="whale-tracker-heading">
      <div>
        <h2 id="whale-tracker-heading" className="font-display text-xl text-white">
          Whale tracker
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Anonymized wallets when a holder indexer is connected. Empty means unknown — not fake
          whales.
        </p>
      </div>

      {!mintConfigured ? (
        <p className="text-sm text-[var(--amber)]">Awaiting mint — whale tracker idle.</p>
      ) : whales.length === 0 && topHolders.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">
          Holder indexer not connected yet. Top holders and whales will appear here without
          fabricating balances.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <HolderList title="Whales" entries={whales} />
          <HolderList title="Top holders" entries={topHolders} />
        </div>
      )}
    </section>
  );
}

function HolderList({ title, entries }: { title: string; entries: WhaleEntry[] }) {
  return (
    <div>
      <h3 className="font-display text-sm text-white">{title}</h3>
      <ol className="mt-2 space-y-2 text-sm">
        {entries.map((e) => (
          <li
            key={`${title}-${e.rank}`}
            className="flex justify-between gap-2 border-b border-[var(--stroke)] py-2 text-[var(--text-muted)]"
          >
            <span>
              #{e.rank} {e.walletLabel}
            </span>
            <span className="text-white">
              {e.percentOfSupply !== null ? `${e.percentOfSupply}%` : e.size}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
