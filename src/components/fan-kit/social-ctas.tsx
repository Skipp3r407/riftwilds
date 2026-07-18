import { projectConfig } from "@/lib/config/project";

type SocialKey = "DISCORD_URL" | "TWITTER_URL" | "TELEGRAM_URL";

const SOCIALS: { key: SocialKey; label: string; blurb: string }[] = [
  { key: "DISCORD_URL", label: "Discord", blurb: "Keeper hangouts & festival nights" },
  { key: "TWITTER_URL", label: "X / Twitter", blurb: "Comic drops & world updates" },
  { key: "TELEGRAM_URL", label: "Telegram", blurb: "Quick signals for the community" },
];

function isLive(url: string) {
  return Boolean(url) && url !== "COMING_SOON";
}

export function SocialCtas() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {SOCIALS.map((s) => {
        const url = projectConfig[s.key];
        const live = isLive(url);
        if (live) {
          return (
            <a
              key={s.key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="panel focus-ring block p-4 transition hover:border-[var(--cyan)]"
            >
              <p className="font-display text-sm text-white">{s.label}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{s.blurb}</p>
              <p className="mt-3 text-xs text-[var(--cyan)]">Join →</p>
            </a>
          );
        }
        return (
          <div
            key={s.key}
            className="panel p-4 opacity-90"
            aria-label={`${s.label} coming soon`}
          >
            <p className="font-display text-sm text-white">{s.label}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{s.blurb}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[var(--amber)]">
              Link soon
            </p>
          </div>
        );
      })}
    </div>
  );
}
