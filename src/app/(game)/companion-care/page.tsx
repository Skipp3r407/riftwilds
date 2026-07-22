import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { CompanionCareHub } from "@/components/pets/companion-care-hub";

export const metadata = { title: "Companion Care" };

export default function CompanionCarePage() {
  return (
    <div className="space-y-4">
      <PageHeader
        kicker="Outside battle"
        titleSlug="companion-care"
        title="Companion Care"
        description={
          <>
            Hunger, energy, mood, and bond live here — never in your Combat Deck.
            Feed meals from{" "}
            <Link
              href="/inventory"
              className="text-[var(--cyan)] underline-offset-2 hover:underline"
            >
              Inventory
            </Link>{" "}
            (Basic Pet Meal restores hunger, bond, and care XP).
          </>
        }
        actions={
          <>
            <Link href="/inventory" className="btn-primary focus-ring text-sm">
              Inventory
            </Link>
            <Link href="/collection" className="btn-secondary focus-ring text-sm">
              Pet Collection
            </Link>
            <Link href="/tcg/battle" className="btn-secondary focus-ring text-sm">
              Practice Board
            </Link>
          </>
        }
      />
      <CompanionCareHub />
    </div>
  );
}
