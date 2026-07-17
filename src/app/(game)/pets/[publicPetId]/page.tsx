import { LiveCarePanel } from "@/components/pets/live-care-panel";

export const metadata = { title: "Pet" };

type Props = { params: Promise<{ publicPetId: string }> };

export default async function PetProfilePage({ params }: Props) {
  const { publicPetId } = await params;
  return <LiveCarePanel publicPetId={publicPetId} />;
}
