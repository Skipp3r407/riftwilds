import { HelpCenter } from "@/components/help";
import { PageHeader, StatusChip } from "@/components/shared/page-header";

export const metadata = {
  title: "Help",
  description:
    "Riftwilds Keeper Help — how to play Rift Battles, Rift Energy, binder, packs, quests, and Credits. SOL is never required for core play.",
};

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Keeper Guide"
        titleSlug="academy"
        title="Help"
        description={
          <>
            Learn Rift Battles first: energy, binder, decks, packs, and quests. Credits power the shop
            and marketplace — SOL is optional and never required for core play.
          </>
        }
        status="TCG first"
        statusTone="live"
        actions={<StatusChip tone="info">NO WALLET NEEDED</StatusChip>}
      />
      <HelpCenter />
    </div>
  );
}
