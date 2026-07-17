import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Memorials" };

export default function MemorialsPage() {
  return (
    <PageHeader
      kicker="Remembrance"
      titleSlug="memorials"
      title="Memorials"
      description={
        <>
          Permanent death is{" "}
          <span className="text-[var(--amber)]">
            {featureFlagDefaults.PERMANENT_DEATH_ENABLED ? "enabled" : "disabled by default"}
          </span>
          . This space will honor dormant, retired, and memorialized Riftlings with respectful
          language — never guilt-driven pressure.
        </>
      }
      status={featureFlagDefaults.PERMANENT_DEATH_ENABLED ? "Death mode on" : "Death off"}
      statusTone={featureFlagDefaults.PERMANENT_DEATH_ENABLED ? "danger" : "info"}
    />
  );
}
