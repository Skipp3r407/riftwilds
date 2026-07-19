import Link from "next/link";
import type { Metadata } from "next";
import { WorldCodexShell } from "@/components/codex/world-codex-shell";
import { ColoringDownloads } from "@/components/coloring/coloring-downloads";
import { SectionTitleBand } from "@/components/shared/page-header";
import { WallpaperDownloads } from "@/components/wallpapers/wallpaper-downloads";
import { WORLD_LORE_ENTRIES } from "@/content/codex/world-lore";

export const metadata: Metadata = {
  title: "World Codex | Riftwilds Lore",
  description:
    "Encyclopedia of Aeryndra and the Riftwilds — Gateway Hearts, Fracture history, twelve regions, affinities, factions, and Keeper legends.",
};

export default function WorldCodexPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <SectionTitleBand slug="world" label="World Codex" kicker="Story Bible" />
      <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)]">
        Living encyclopedia of Aeryndra and the Riftwilds — cosmology, ages, regions, affinities,
        factions, and legends. Species companions live in the{" "}
        <Link href="/codex/riftlings" className="text-[var(--cyan)] underline-offset-2 hover:underline">
          Riftling Codex
        </Link>
        .
      </p>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Prefer cinema?{" "}
        <Link href="/about" className="text-[var(--amber)] underline-offset-2 hover:underline">
          Read the origin story
        </Link>
        .
      </p>

      <WorldCodexShell entries={WORLD_LORE_ENTRIES} />

      <div className="mt-12 space-y-10">
        <ColoringDownloads />
        <WallpaperDownloads />
      </div>
    </div>
  );
}
