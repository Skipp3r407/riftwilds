import { redirect } from "next/navigation";

export const metadata = { title: "Battle" };

/** Legacy route — Arena is the primary battle surface. */
export default function BattlePage() {
  redirect("/arena");
}
