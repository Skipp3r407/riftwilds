import Image from "next/image";
import Link from "next/link";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { sectionUiThumbPath } from "@/lib/assets/paths";
import { PageHeader, StatusChip } from "@/components/shared/page-header";
import { getHomesteadExpansionModel } from "@/game/housing/catalog";

export const metadata = { title: "Homestead" };

export default function HomesteadPage() {
  const model = getHomesteadExpansionModel();
  /** Keep original 12 shell rooms primary; observatory is expansion preview. */
  const shellRooms = model.rooms.filter((r) => r.roomKey !== "observatory-nook");
  const expansionRooms = model.rooms.filter((r) => r.roomKey === "observatory-nook");

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Personal base"
        titleSlug="homestead"
        title="Rift Homesteads"
        description="Personal homes for pets, farms, crafting rooms, and decorations. Friends visit with permission."
        status={featureFlagDefaults.HOMESTEADS_ENABLED ? "Open" : "Phase 6 shell"}
        statusTone={featureFlagDefaults.HOMESTEADS_ENABLED ? "live" : "warn"}
        actions={
          <>
            <Link href="/housing" className="btn-primary focus-ring text-sm">
              Player Housing
            </Link>
            <Link href="/neighborhoods" className="btn-secondary focus-ring text-sm">
              Neighborhoods
            </Link>
            <Link href="/api/housing/catalog" className="btn-secondary focus-ring text-sm">
              Housing catalog API
            </Link>
          </>
        }
      />
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shellRooms.map((room) => (
          <div key={room.roomKey} className="panel group overflow-hidden">
            <div className="section-card-thumb border-b border-[rgba(61,231,255,0.12)]">
              <Image
                src={sectionUiThumbPath("homestead", room.roomKey)}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="section-card-thumb__img"
                unoptimized
              />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-white">{room.name}</h2>
                <StatusChip tone="warn">Locked</StatusChip>
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)]">{room.unlockHint}</p>
              <p className="mt-1 text-[10px] text-[var(--text-dim)]">
                {[
                  room.supportsFarming ? "farming" : null,
                  room.supportsTrophies ? "trophies" : null,
                  room.supportsGuest ? "visits" : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "core room"}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Housing expansion data</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {model.furniture.length} furniture defs · {model.farmPlots.length} farm plots · visit
          policies: {model.visitPolicies.join(", ")}. Layout editor deferred until{" "}
          <code className="text-[var(--cyan)]">HOMESTEADS_ENABLED</code>.
        </p>
        {expansionRooms.length > 0 ? (
          <ul className="mt-3 space-y-1 text-xs text-[var(--text-dim)]">
            {expansionRooms.map((r) => (
              <li key={r.roomKey}>
                Preview room: {r.name} — {r.unlockHint}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
