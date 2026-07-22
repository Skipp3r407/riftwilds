import { redirect } from "next/navigation";
import { battleHubHref } from "@/lib/tcg/battle-hub";

export const metadata = { title: "Rift Stakes Treasury" };

export default function RiftStakesTreasuryRedirectPage() {
  redirect(battleHubHref("stakes", { panel: "treasury" }));
}
