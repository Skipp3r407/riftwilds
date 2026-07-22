import { redirect } from "next/navigation";
import { battleHubHref } from "@/lib/tcg/battle-hub";

export const metadata = { title: "Rift Stakes" };

/** Legacy lobby URL → Battle Hub · Rift Stakes tab */
export default function RiftStakesPage() {
  redirect(battleHubHref("stakes"));
}
