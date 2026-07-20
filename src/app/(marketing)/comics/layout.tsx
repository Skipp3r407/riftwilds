import { redirect } from "next/navigation";
import {
  clearGameplayCookies,
  resolveGameplayGate,
} from "@/lib/auth/account-gate";
import { destroySession } from "@/lib/auth/session";

/** Comics require a signed-in account (marketing hub stays public). */
export default async function ComicsAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gate = await resolveGameplayGate({ returnUrl: "/comics" });
  if (gate.ok === false) {
    if (gate.decision.clearSession) {
      await destroySession();
      await clearGameplayCookies();
    }
    redirect(gate.decision.redirectTo);
  }
  return children;
}
