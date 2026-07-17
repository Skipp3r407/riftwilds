import { SiteHeader } from "@/components/shared/site-header";
import { MobileGameNav } from "@/components/game/mobile-nav";
import { GameSidebar } from "@/components/game/game-sidebar";
import { RouteWallpaper } from "@/components/shared/route-wallpaper";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteWallpaper />
      <div className="relative z-[1] flex min-h-full flex-1 flex-col">
        <SiteHeader variant="game" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-1 gap-5 px-4 pb-24 pt-5 md:px-6 md:pb-10 lg:gap-6">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 surface-grid opacity-40"
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
