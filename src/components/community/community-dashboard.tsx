"use client";

import { useCallback, useEffect, useState } from "react";
import { PumpfunChart } from "@/components/community/pumpfun-chart";
import { CommunityStats } from "@/components/community/community-stats";
import { WhaleTracker } from "@/components/community/whale-tracker";
import { MilestoneTracker } from "@/components/community/milestone-tracker";
import { CommunityActivityFeed } from "@/components/community/activity-feed";
import type { CommunityDashboardPayload } from "@/lib/community";

type Props = {
  initial: CommunityDashboardPayload;
};

export function CommunityDashboard({ initial }: Props) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/community/metrics");
      if (!res.ok) return;
      const json = (await res.json()) as CommunityDashboardPayload;
      setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      void refresh();
    }, 60_000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--text-dim)]">
          Refreshed {new Date(data.refreshedAt).toLocaleString()}
        </p>
        <button
          type="button"
          className="btn-secondary focus-ring px-3 py-2 text-sm"
          onClick={() => void refresh()}
          disabled={loading}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <PumpfunChart config={data.config} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CommunityStats market={data.market} />
        <WhaleTracker
          whales={data.whales}
          topHolders={data.topHolders}
          mintConfigured={data.config.configured}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MilestoneTracker milestones={data.milestones} />
        <CommunityActivityFeed feed={data.feed} activity={data.activity} />
      </div>

      <aside className="panel space-y-2 p-5 text-xs text-[var(--text-muted)]">
        {data.disclaimers.map((d) => (
          <p key={d}>{d}</p>
        ))}
      </aside>
    </div>
  );
}
