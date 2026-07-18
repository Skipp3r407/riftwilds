import Link from "next/link";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { PageHeader } from "@/components/shared/page-header";
import { MemorialGardenClient } from "@/components/spirit/memorial-garden-client";

export const metadata = { title: "Memorials" };

export default function MemorialsPage() {
  const deathOn = featureFlagDefaults.PERMANENT_DEATH_ENABLED;
  const hardcoreOn = featureFlagDefaults.HARDCORE_MODE_ENABLED;

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Remembrance"
        titleSlug="memorials"
        title="Memorial Garden"
        description={
          <>
            Permanent death is{" "}
            <span className="text-[var(--amber)]">
              {deathOn ? "globally enabled" : "off by default"}
            </span>
            . Hardcore opt-in is {hardcoreOn ? "available" : "disabled"}. Memorials honor losses
            without guilt-driven pressure — normal play uses Downed → recovery instead.
          </>
        }
        status={deathOn ? "Death mode on" : "Death off · Hardcore opt-in"}
        statusTone={deathOn ? "danger" : "info"}
      />

      <section className="relative overflow-hidden rounded-2xl border border-[var(--line)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/spirit/memorial-garden.svg"
          alt="Quiet memorial garden with lanterns and statues"
          width={1400}
          height={480}
          className="h-auto w-full object-cover"
        />
      </section>

      <MemorialGardenClient />

      <p className="text-sm text-[var(--muted)]">
        Lost a companion in Hardcore? Their plaque, bond, and memories stay here.{" "}
        <Link href="/spirit-realm" className="text-[var(--cyan)] underline-offset-2 hover:underline">
          Spirit Realm rescues
        </Link>{" "}
        remain for living, Downed Riftlings.
      </p>
    </div>
  );
}
