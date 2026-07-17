import Link from "next/link";
import { PetCarePanel, RewardDisclaimer, EconomySummary } from "@/components/economy";
import { PetRewardStatus } from "@/components/revenue";
import { GameImage } from "@/components/assets/game-image";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Riftling ${id}` };
}

export default async function CreatureProfilePage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <header className="panel grid gap-6 p-6 md:grid-cols-[200px_1fr]">
        <div className="flex items-center justify-center rounded-xl bg-[rgba(7,11,22,0.55)] p-4">
          <GameImage
            src="/assets/placeholders/creature-cindercub-profile.svg"
            alt="Creature artwork"
            width={180}
            height={180}
          />
        </div>
        <div>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-[var(--cyan)]">
            Creature profile · Demo shell
          </p>
          <h1 className="font-display mt-2 text-3xl text-white">Riftling #{id}</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Species, affinities, battle record, and ownership history load when creature data is
            linked. Care and reward eligibility use server time.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/collection" className="btn-secondary focus-ring text-sm">
              Collection
            </Link>
            <Link href="/marketplace" className="btn-secondary focus-ring text-sm">
              List for sale
            </Link>
            <Link href="/economy#pet-eligibility" className="btn-secondary focus-ring text-sm">
              Eligibility rules
            </Link>
          </div>
          <RewardDisclaimer className="mt-4" />
        </div>
      </header>

      <PetCarePanel petName={`Riftling #${id}`} rewardEligible={null} />

      <PetRewardStatus petName={`Riftling #${id}`} publicPetId={id} />

      <EconomySummary variant="compact" />
    </div>
  );
}
