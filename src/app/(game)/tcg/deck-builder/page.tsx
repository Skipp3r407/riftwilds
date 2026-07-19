import { DeckBuilder } from "@/components/tcg/deck-builder";

export const metadata = { title: "Deck Atelier" };

export default function TcgDeckBuilderPage() {
  return (
    <main className="relative min-h-[70vh]">
      <DeckBuilder />
    </main>
  );
}
