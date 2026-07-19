import Link from "next/link";

export function MarketplaceComingStub(props: {
  title: string;
  blurb: string;
  ideas?: string[];
}) {
  return (
    <section className="panel space-y-4 p-6">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--amber)]">Coming / scaffold</p>
      <h2 className="font-display text-xl text-white">{props.title}</h2>
      <p className="text-sm text-[var(--text-muted)]">{props.blurb}</p>
      {props.ideas?.length ? (
        <ul className="space-y-1 text-sm text-[var(--text-muted)]">
          {props.ideas.map((i) => (
            <li key={i}>• {i}</li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap gap-2 pt-2">
        <Link href="/marketplace" className="btn-primary focus-ring text-sm">
          Back to marketplace
        </Link>
        <Link href="/exchange" className="btn-secondary focus-ring text-sm">
          Rift Exchange
        </Link>
      </div>
    </section>
  );
}
