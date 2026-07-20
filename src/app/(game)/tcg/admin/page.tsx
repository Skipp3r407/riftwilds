import Link from "next/link";
import {
  getTcgRegistry,
  TCG_CARD_FAMILIES,
  TCG_CARD_STATS_V2,
  TCG_EXPANSIONS,
  TCG_FORMATS,
  TCG_LAUNCH_POOL,
  TCG_LIVE_OPS,
} from "@/content/tcg";
import { CONSTRUCTED_RULES } from "@/content/tcg/framework/deck-rules";
import { CRAFT_POLICY } from "@/content/tcg/framework/craft";
import { documentElementMapping } from "@/content/tcg/framework/element-map";
import { CardStudioPanel } from "@/components/tcg/card-studio-panel";
import { RiftPageShell } from "@/components/ui/rift-page-shell";
import { RiftPanel } from "@/components/ui/rift-panel";

/**
 * Live-ops / admin scaffold — read-only snapshot.
 * Auth gate + write tools are TODO before production.
 */
export default function TcgAdminPage() {
  const registry = getTcgRegistry();
  const placeholders = registry.all.filter((c) => c.isPlaceholder).length;
  const elementMap = documentElementMapping();

  return (
    <RiftPageShell mood="atelier" wide>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <header>
          <p className="font-display text-sm tracking-[0.2em] text-[var(--amber)] uppercase">
            Live ops scaffold
          </p>
          <h1 className="mt-1 font-display text-3xl text-[var(--text)]">
            TCG Admin
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
            Read-only framework snapshot. Staff auth and write endpoints are
            TODO. Competitive craft never requires crypto.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link className="text-cyan-300 underline" href="/api/tcg/admin">
              JSON admin API
            </Link>
            <Link className="text-cyan-300 underline" href="/api/tcg/live-ops">
              Live-ops API
            </Link>
            <Link className="text-cyan-300 underline" href="/api/tcg/formats">
              Formats API
            </Link>
            <Link className="text-cyan-300 underline" href="/tcg/deck-builder">
              Deck Atelier
            </Link>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Total cards" value={String(registry.all.length)} />
          <Stat
            label="Competitive"
            value={String(registry.competitive.length)}
          />
          <Stat label="Launch pool" value={String(TCG_LAUNCH_POOL.cardIds.length)} />
          <Stat label="Families" value={String(TCG_CARD_FAMILIES.length)} />
          <Stat label="Expansions" value={String(TCG_EXPANSIONS.length)} />
          <Stat label="Placeholders" value={String(placeholders)} />
          <Stat
            label="Stat overlays v2"
            value={String(Object.keys(TCG_CARD_STATS_V2.overlays ?? {}).length)}
          />
        </div>

        <RiftPanel material="obsidian">
          <CardStudioPanel />
        </RiftPanel>

        <RiftPanel material="obsidian">
          <h2 className="font-display text-lg text-[var(--text)]">Season</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {TCG_LIVE_OPS.seasonName} · {TCG_LIVE_OPS.bannerMessage}
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--text)]">
            {TCG_LIVE_OPS.featuredCards.map((f) => (
              <li key={f.cardId}>
                {f.cardId} — {f.reason}
              </li>
            ))}
          </ul>
        </RiftPanel>

        <RiftPanel material="obsidian">
          <h2 className="font-display text-lg text-[var(--text)]">
            Constructed rules
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Main deck {CONSTRUCTED_RULES.deckSize} + Commander ={" "}
            {CONSTRUCTED_RULES.totalPieces} · {CONSTRUCTED_RULES.f2pCompetitive}
          </p>
          <p className="mt-2 text-xs text-cyan-200/80">
            Craft policy: crypto={String(CRAFT_POLICY.cryptoRequired)} · SOL=
            {String(CRAFT_POLICY.solRequired)} · wagering=
            {String(CRAFT_POLICY.wageringAllowed)}
          </p>
        </RiftPanel>

        <RiftPanel material="obsidian">
          <h2 className="font-display text-lg text-[var(--text)]">Formats</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {TCG_FORMATS.map((f) => (
              <li key={f.id}>
                <strong>{f.name}</strong> ({f.status}) — deck {f.deckSize}
                {f.ranked ? " · ranked" : ""}
              </li>
            ))}
          </ul>
        </RiftPanel>

        <RiftPanel material="obsidian">
          <h2 className="font-display text-lg text-[var(--text)]">
            Element → affinity map
          </h2>
          <div className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
            {elementMap.map((row) => (
              <div key={row.element}>
                <span className="text-[var(--text)]">{row.element}</span>
                {" → "}
                <span className="text-cyan-200">{row.affinity}</span>
              </div>
            ))}
          </div>
        </RiftPanel>

        <RiftPanel material="obsidian">
          <h2 className="font-display text-lg text-[var(--text)]">TODO</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-muted)]">
            <li>Staff session gate before any writes</li>
            <li>PATCH card-stats-v2 overlays from Card Studio</li>
            <li>PATCH featured cards / season banner</li>
            <li>Standard rotation wizard</li>
            <li>Balance watchlist editor</li>
            <li>Craft ledger audit</li>
            <li>Per-format ban list</li>
            <li>Asset pipeline publisher → /assets/cards/&#123;exp&#125;/&#123;slug&#125;/</li>
          </ul>
        </RiftPanel>
      </div>
    </RiftPageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <RiftPanel material="obsidian" padding="sm">
      <p className="text-xs tracking-wide text-[var(--text-muted)] uppercase">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl text-[var(--text)]">{value}</p>
    </RiftPanel>
  );
}
