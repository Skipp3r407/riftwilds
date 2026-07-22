import { redirect } from "next/navigation";
import { battleHubHref } from "@/lib/tcg/battle-hub";

export const metadata = { title: "Rift Stakes History" };

export default function RiftStakesHistoryRedirectPage() {
  redirect(battleHubHref("stakes", { panel: "history" }));
}
