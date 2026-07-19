import Link from "next/link";
import { SoundscapeMount } from "@/components/audio/soundscape-mount";
import { projectConfig } from "@/lib/config/project";
import { EmptyState, PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Collection" };

export default function CollectionPage() {
  return (
    <div className="space-y-6">
      <SoundscapeMount mode="collection" fadeMs={750} />
      <PageHeader
        kicker="Codex"
        titleSlug="collection"
        title="Collection"
        description={`Your living ${projectConfig.CREATURE_NAME_PLURAL}, favorites, and discovery progress.`}
      />
      <EmptyState
        title="No Riftlings yet"
        description="Hatch your first egg in the Hatchery to start your collection. Open your profile to see pets from this session."
        imageSrc="/assets/ui/empty-states/pets.png"
        imageAlt="Empty nest waiting for a Riftling egg"
        imageSize="hero"
        className="min-h-[22rem] px-6 py-10 sm:min-h-[24rem] sm:px-10 sm:py-12"
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/hatchery" className="btn-primary focus-ring text-sm">
              Open Hatchery
            </Link>
            <Link href="/profile" className="btn-secondary focus-ring text-sm">
              Keeper profile
            </Link>
          </div>
        }
      />
    </div>
  );
}
