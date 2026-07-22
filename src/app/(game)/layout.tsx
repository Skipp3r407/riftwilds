import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/shared/site-header";
import { MobileGameNav } from "@/components/game/mobile-nav";
import { GameSidebar } from "@/components/game/game-sidebar";
import { GameShellChrome } from "@/components/game/game-shell-chrome";
import { LevelUpCelebration } from "@/components/progression/level-up-celebration";
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
      <GameShellChrome
        header={<SiteHeader variant="game" />}
        sidebar={<GameSidebar />}
        mobileNav={<MobileGameNav />}
      >
        {children}
      </GameShellChrome>
      <LevelUpCelebration />
    </>
  );
}
