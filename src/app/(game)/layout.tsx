import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/shared/site-header";
import { MobileGameNav } from "@/components/game/mobile-nav";
import { GameSidebar } from "@/components/game/game-sidebar";
import { RouteWallpaper } from "@/components/shared/route-wallpaper";
import { HudAtmosphere } from "@/components/shared/hud-atmosphere";
import { resolveGameplayGate } from "@/lib/auth/account-gate";

/**
 * Server gate for all (game) routes — NO ACCOUNT = NO GAMEPLAY.
 * Edge middleware checks cookie presence; this validates session + account status.
 *
 * Do not call cookies().set() here — Next.js only allows cookie writes in
 * Server Actions / Route Handlers. Mutating cookies in this layout throws and
 * surfaces as the "Rift turbulence" error page (see /api/auth/logout?next=).
 */
export default async function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gate = await resolveGameplayGate({ returnUrl: "/play" });

  if (gate.ok === false) {
    if (gate.decision.clearSession) {
      redirect(
        `/api/auth/logout?next=${encodeURIComponent(gate.decision.redirectTo)}`,
      );
    }
    redirect(gate.decision.redirectTo);
  }

  return (
    <>
      <RouteWallpaper />
      <HudAtmosphere />
      <div className="relative z-[1] flex min-h-full flex-1 flex-col">
        <SiteHeader variant="game" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-1 gap-5 px-4 pb-24 pt-5 md:px-6 md:pb-10 lg:gap-6">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 surface-grid opacity-50"
            aria-hidden
          />
          <GameSidebar />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
        <MobileGameNav />
      </div>
    </>
  );
}
