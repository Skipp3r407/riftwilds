import type { ActivityFeedItem, CommunityActivityCounts } from "@/lib/community";
import { cn } from "@/lib/utils/cn";

type Props = {
  feed: ActivityFeedItem[];
  activity: CommunityActivityCounts;
};

const CHANNEL_COLOR: Record<ActivityFeedItem["channel"], string> = {
  game: "text-[var(--emerald)]",
  community: "text-[var(--violet)]",
  token: "text-[var(--cyan)]",
};

export function CommunityActivityFeed({ feed, activity }: Props) {
  return (
    <section className="panel space-y-4 p-5" aria-labelledby="activity-feed-heading">
      <div>
        <h2 id="activity-feed-heading" className="font-display text-xl text-white">
          Live activity
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Game events, community milestones, and token metrics side by side.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-4">
        <MiniStat
          label="Holders"
          value={activity.newHolders === null ? "N/A" : String(activity.newHolders)}
        />
        <MiniStat label="Trades" value={String(activity.marketplaceTrades)} />
        <MiniStat label="Eggs hatched" value={String(activity.eggsHatched)} />
        <MiniStat label="Pets evolved" value={String(activity.petsEvolved)} />
      </div>

      <ul className="space-y-2">
        {feed.map((item) => (
          <li
            key={item.id}
            className="rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3 py-2"
          >
            <p className={cn("text-[10px] uppercase tracking-wider", CHANNEL_COLOR[item.channel])}>
              {item.channel}
            </p>
            <p className="font-display text-sm text-white">{item.title}</p>
            <p className="text-xs text-[var(--text-muted)]">{item.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] p-2 text-center">
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <p className="font-display text-white">{value}</p>
    </div>
  );
}
