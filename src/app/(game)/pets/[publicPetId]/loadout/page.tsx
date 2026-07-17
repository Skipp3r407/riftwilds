import { PetLoadoutEditor } from "@/components/items/pet-loadout";
import Link from "next/link";

export const metadata = { title: "Pet loadout" };

type Props = { params: Promise<{ publicPetId: string }> };

export default async function PetLoadoutPage({ params }: Props) {
  const { publicPetId } = await params;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.24em] text-[var(--cyan)]">
            Equipment
          </p>
          <h1 className="font-display text-3xl text-white">Loadout</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/inventory" className="btn-secondary focus-ring text-sm">
            Inventory
          </Link>
          <Link href="/arena/loadout" className="btn-secondary focus-ring text-sm">
            Arena loadout
          </Link>
        </div>
      </div>
      <PetLoadoutEditor publicPetId={publicPetId} />
    </div>
  );
}
