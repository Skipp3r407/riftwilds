import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { RouteWallpaper } from "@/components/shared/route-wallpaper";
import { HudAtmosphere } from "@/components/shared/hud-atmosphere";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteWallpaper />
      <HudAtmosphere />
      <div className="relative z-[1] flex min-h-full flex-1 flex-col">
        <SiteHeader variant="marketing" />
        <main className="relative flex-1">{children}</main>
        <SiteFooter />
      </div>
    </>
  );
}
