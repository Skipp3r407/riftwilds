import { SectionTitleBand } from "@/components/shared/page-header";
import { CommunityDashboard } from "@/components/community/community-dashboard";
import { getCommunityDashboard } from "@/lib/community";
import { projectConfig } from "@/lib/config/project";
import Link from "next/link";

export const metadata = {
  title: `Community · ${projectConfig.PROJECT_NAME}`,
  description:
    "Pump.fun community dashboard, milestones, and Community Reward Treasury framing for Riftwilds.",
};

export default async function CommunityPage() {
  const dashboard = await getCommunityDashboard();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <SectionTitleBand slug="community" label="Community" kicker="Pump.fun · ecosystem" />
      <p className="page-lede mt-4">
        Follow token metrics, community milestones, and live Riftwilds activity. Own a Riftling to
        unlock the Pet Reward system — rewards are ecosystem treasury distributions, not automatic
        SOL from buying the coin.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/token" className="btn-secondary focus-ring text-sm">
          Token access
        </Link>
        <Link href="/economy" className="btn-secondary focus-ring text-sm">
          Economy & treasury
        </Link>
        {dashboard.config.pumpFunUrl ? (
          <a
            href={dashboard.config.pumpFunUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary focus-ring text-sm"
          >
            Open Pump.fun
          </a>
        ) : null}
      </div>

      <div className="mt-8">
        <CommunityDashboard initial={dashboard} />
      </div>
    </div>
  );
}
