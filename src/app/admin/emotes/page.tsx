import Link from "next/link";
import { EMOTE_CATALOG, STARTER_EMOTE_KEYS } from "@/game/live-world/systems/emotes/catalog";
import { listControllerEmoteStubs } from "@/game/live-world/systems/emotes/controller-stubs";

export const metadata = { title: "Admin · Emotes" };

export default function AdminEmotesPage() {
  const social = EMOTE_CATALOG.filter((e) => e.kind === "social");
  const premium = EMOTE_CATALOG.filter((e) => e.tier !== "free");
  const bindings = listControllerEmoteStubs();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <p className="page-kicker">Ops</p>
      <h1 className="page-title mt-2">Emote tools</h1>
      <p className="page-lede mt-2">
        Shell for catalog review, consent moderation notes, and cosmetic unlock audits. Emotes never
        grant combat, economy, or SOL advantages.
      </p>

      <section className="panel mt-6 p-5">
        <h2 className="font-display text-lg text-white">Catalog snapshot</h2>
        <ul className="mt-3 space-y-1 text-sm text-[var(--text-muted)]">
          <li>Total defs: {EMOTE_CATALOG.length}</li>
          <li>Starter free: {STARTER_EMOTE_KEYS.length}</li>
          <li>Social (consent): {social.length}</li>
          <li>Credits / premium cosmetic: {premium.length}</li>
        </ul>
      </section>

      <section className="panel mt-4 p-5">
        <h2 className="font-display text-lg text-white">Moderation notes</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--text-muted)]">
          <li>Reject any emote that implies combat power or paid advantage.</li>
          <li>Social sync requires mutual consent — auto-expire after 20s.</li>
          <li>Mute/block privacy settings gate incoming requests.</li>
          <li>AI NPC flavor lines must stay family-safe; authored fallbacks are source of truth.</li>
        </ul>
      </section>

      <section className="panel mt-4 p-5">
        <h2 className="font-display text-lg text-white">Controller stubs</h2>
        <ul className="mt-3 space-y-2 text-xs text-[var(--text-dim)]">
          {bindings.map((b) => (
            <li key={b.action}>
              <span className="text-[var(--cyan)]">{b.button}</span> — {b.action}: {b.note}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel mt-4 overflow-auto p-5">
        <h2 className="font-display text-lg text-white">Full catalog</h2>
        <table className="mt-3 w-full text-left text-xs">
          <thead className="text-[var(--text-dim)]">
            <tr>
              <th className="py-1 pr-2">Key</th>
              <th className="py-1 pr-2">Label</th>
              <th className="py-1 pr-2">Kind</th>
              <th className="py-1 pr-2">Tier</th>
              <th className="py-1">Consent</th>
            </tr>
          </thead>
          <tbody>
            {EMOTE_CATALOG.map((e) => (
              <tr key={e.key} className="border-t border-[var(--border)] text-[var(--text-muted)]">
                <td className="py-1 pr-2 font-mono text-[var(--cyan)]">{e.key}</td>
                <td className="py-1 pr-2">
                  {e.glyph} {e.label}
                </td>
                <td className="py-1 pr-2">{e.kind}</td>
                <td className="py-1 pr-2">{e.tier}</td>
                <td className="py-1">{e.requiresConsent ? "yes" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Link href="/admin" className="btn-secondary focus-ring mt-6 inline-flex text-sm">
        Back to admin
      </Link>
    </main>
  );
}
