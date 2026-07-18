import { redirect } from "next/navigation";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export const metadata = { title: "Battle" };

/**
 * Legacy /battle entry — Reborn routes to TCG when enabled; Arena remains soft-secondary.
 */
export default function BattlePage() {
  if (featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
    redirect("/tcg/battle");
  }
  redirect("/arena");
}
