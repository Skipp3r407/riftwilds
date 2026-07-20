import { redirect } from "next/navigation";
import { resolveGameplayGate } from "@/lib/auth/account-gate";

/** Comics require a signed-in account (marketing hub stays public). */
export default async function ComicsAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gate = await resolveGameplayGate({ returnUrl: "/comics" });
  if (gate.ok === false) {
    // Cookie writes are illegal in Server Component layouts — clear via route handler.
    if (gate.decision.clearSession) {
      redirect(
        `/api/auth/logout?next=${encodeURIComponent(gate.decision.redirectTo)}`,
      );
    }
    redirect(gate.decision.redirectTo);
  }
  return children;
}
