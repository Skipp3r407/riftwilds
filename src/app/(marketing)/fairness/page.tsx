import { SectionTitleBand } from "@/components/shared/page-header";

export const metadata = { title: "Fairness" };

export default function FairnessPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <SectionTitleBand slug="fairness" label="Fairness" kicker="Integrity" />
      <div className="panel mt-6 space-y-4 p-6 text-sm text-[var(--text-muted)]">
        <p>
          Hatch results use{" "}
          <strong className="text-white">
            server-authoritative cryptographically secure randomness (CSPRNG)
          </strong>
          . This is centralized game randomness for MVP — clearly labeled, logged, and never decided
          solely on the client.
        </p>
        <p>
          Every hatch roll stores: user, egg, time, randomness source, roll value, odds version,
          creature, rarity, integrity hash, and request ID.
        </p>
        <p>
          Architecture includes a provider interface for future migration to an audited on-chain VRF.
        </p>
      </div>
    </div>
  );
}
