import { redirect } from "next/navigation";
import { battleHubHref } from "@/lib/tcg/battle-hub";

export const metadata = { title: "Rift Stakes Leaderboard" };

export default function RiftStakesLeaderboardRedirectPage() {
  redirect(battleHubHref("stakes", { panel: "leaderboard" }));
}
