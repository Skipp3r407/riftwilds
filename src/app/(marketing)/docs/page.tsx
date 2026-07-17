import Image from "next/image";
import { SectionTitleBand } from "@/components/shared/page-header";
import { projectConfig } from "@/lib/config/project";

export const metadata = { title: "Docs" };

const UI_MOCKUPS = [
  { section: "Home / Hero hub", file: "home-hero-starcraft-ui.png" },
  { section: "Play dashboard", file: "play-dashboard-starcraft-ui.png" },
  { section: "Hatchery", file: "hatchery-starcraft-ui.png" },
  { section: "Creatures / Codex", file: "creatures-codex-starcraft-ui.png" },
  { section: "Collection", file: "collection-starcraft-ui.png" },
  { section: "World map", file: "world-map-starcraft-ui.png" },
  { section: "Live World", file: "live-world-starcraft-ui.png" },
  { section: "Arena / Battle HUD", file: "arena-battle-starcraft-ui.png" },
  { section: "Marketplace", file: "marketplace-starcraft-ui.png" },
  { section: "Shop", file: "shop-starcraft-ui.png" },
  { section: "Inventory", file: "inventory-starcraft-ui.png" },
  { section: "Guilds", file: "guilds-starcraft-ui.png" },
  { section: "Homestead", file: "homestead-starcraft-ui.png" },
  { section: "Economy", file: "economy-starcraft-ui.png" },
  { section: "Token", file: "token-starcraft-ui.png" },
  { section: "Profile", file: "profile-starcraft-ui.png" },
  { section: "Fairness", file: "fairness-starcraft-ui.png" },
  { section: "Transparency", file: "transparency-starcraft-ui.png" },
  { section: "Quests", file: "quests-starcraft-ui.png" },
  { section: "Leaderboards", file: "leaderboards-starcraft-ui.png" },
] as const;

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <SectionTitleBand slug="docs" label="Docs" kicker="Knowledge base" />
      <div id="gameplay" className="panel mt-8 max-w-3xl space-y-4 p-6 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-xl text-white">Gameplay overview</h2>
        <p>
          {projectConfig.PROJECT_NAME} combines a meme-coin landing experience with a real
          creature-collecting game: hatch, care, explore, battle, and trade original Riftlings.
        </p>
        <h2 className="font-display text-xl text-white">Developer setup</h2>
        <p>
          See the repository README for environment variables, Prisma migrations, seeding, and
          deployment. Architecture details live in <code>docs/ARCHITECTURE.md</code>.
        </p>
      </div>

      <section id="ui-mockups" className="mt-12">
        <p className="page-kicker">Design references</p>
        <h2 className="page-title mt-2 text-2xl">StarCraft-like UI mockups</h2>
        <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)]">
          Static HUD concept art for each major screen (RTS command aesthetic). Original Riftwilds
          branding only — not live product UI. Files live under{" "}
          <code className="text-[var(--cyan)]">public/assets/ui/mockups/</code>.
        </p>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {UI_MOCKUPS.map((item) => (
            <li key={item.file} className="panel overflow-hidden">
              <a
                href={`/assets/ui/mockups/${item.file}`}
                target="_blank"
                rel="noreferrer"
                className="block focus-ring"
              >
                <Image
                  src={`/assets/ui/mockups/${item.file}`}
                  alt={`${item.section} Riftwilds UI mockup`}
                  width={1280}
                  height={720}
                  className="aspect-video w-full object-cover"
                />
                <div className="border-t border-white/10 px-4 py-3">
                  <p className="font-display text-sm text-white">{item.section}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{item.file}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
