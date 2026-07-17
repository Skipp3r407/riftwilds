import Image from "next/image";
import { resolveTitleSlug, titleAtmospherePath } from "@/lib/assets/title-banners";
import {
  sectionTitleFromLabel,
  sectionTitlePath,
  type SectionTitleSlug,
} from "@/lib/assets/section-titles";
import { cn } from "@/lib/utils/cn";

type StatusTone = "live" | "warn" | "info" | "danger" | "default";

type PageHeaderProps = {
  kicker?: string;
  title: string;
  /** Section slug for atmosphere wallpaper (e.g. "hatchery"). Falls back to title label match. */
  titleSlug?: SectionTitleSlug | string;
  /**
   * @deprecated Wordmark PNGs are no longer rendered in banners; title is always visible HTML.
   * Kept for call-site compatibility.
   */
  titleImageOnly?: boolean;
  description?: React.ReactNode;
  status?: string;
  statusTone?: StatusTone;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  wallpaper?: React.ReactNode;
};

const toneClass: Record<StatusTone, string> = {
  live: "status-chip status-chip--live",
  warn: "status-chip status-chip--warn",
  info: "status-chip status-chip--info",
  danger: "status-chip status-chip--danger",
  default: "status-chip",
};

function TitleAtmosphere({
  slug,
  label,
  className,
}: {
  slug?: string | null;
  label?: string | null;
  className?: string;
}) {
  const src = titleAtmospherePath(slug, label);
  if (!src) return null;

  return (
    <div className={cn("title-atmosphere", className)} aria-hidden>
      <Image
        src={src}
        alt=""
        fill
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, 960px"
        unoptimized
        priority
      />
      <div className="title-atmosphere__scrim" />
    </div>
  );
}

/**
 * Optional stylized wordmark — not used in section banner bands.
 * Prefer HTML `h1` / brand typography for page titles.
 */
export function SectionTitleImage({
  slug,
  label,
  className,
  align = "center",
}: {
  slug?: string | null;
  label?: string | null;
  className?: string;
  /** Horizontal alignment of the wordmark inside its box. */
  align?: "center" | "left";
}) {
  const src = sectionTitlePath(slug) ?? sectionTitleFromLabel(label);
  if (!src) return null;
  const alt = label?.trim() || slug || "Section title";
  return (
    <div
      className={cn(
        "section-title-image",
        align === "center" && "section-title-image--center",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={1469}
        height={505}
        className={cn(
          "section-title-image__img",
          align === "center" ? "object-center" : "object-left",
        )}
        priority
      />
    </div>
  );
}

/**
 * Standalone centered title hero band (marketing pages that don't use PageHeader).
 * Atmosphere + HTML title only — no baked wordmark PNGs.
 * Pass `atmosphere={false}` on surfaces that already have a full-bleed wallpaper composition (e.g. home hero).
 */
export function SectionTitleBand({
  slug,
  label,
  kicker,
  className,
  atmosphere = true,
}: {
  slug?: string | null;
  label?: string | null;
  kicker?: string;
  className?: string;
  atmosphere?: boolean;
}) {
  return (
    <div className={cn("section-title-band", className)}>
      {atmosphere ? <TitleAtmosphere slug={slug} label={label} /> : null}
      <div className="section-title-band__content">
        {kicker ? <p className="page-kicker">{kicker}</p> : null}
        {label ? (
          <h1 className={cn("page-title", kicker ? "mt-2" : undefined)}>{label}</h1>
        ) : null}
      </div>
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  titleSlug,
  titleImageOnly: _titleImageOnly,
  description,
  status,
  statusTone = "info",
  actions,
  children,
  className,
  wallpaper,
}: PageHeaderProps) {
  const atmosphereSlug = resolveTitleSlug(titleSlug, title);
  const hasAtmosphere = Boolean(titleAtmospherePath(titleSlug, title));

  return (
    <header className={cn("panel page-header relative overflow-hidden", className)}>
      {wallpaper}
      <div className={cn("page-header__band", !hasAtmosphere && "page-header__band--plain")}>
        {hasAtmosphere ? (
          <TitleAtmosphere slug={atmosphereSlug ?? titleSlug} label={title} />
        ) : null}
        <div className="page-header__band-content">
          {status ? (
            <span className={cn(toneClass[statusTone], "page-header__status")}>{status}</span>
          ) : null}
          {kicker ? <p className="page-kicker">{kicker}</p> : null}
          <h1 className={cn("page-title", kicker ? "mt-2" : undefined)}>{title}</h1>
        </div>
      </div>

      {description || actions || children ? (
        <div className="page-header__body">
          {description ? <div className="page-lede page-lede--flush">{description}</div> : null}
          {actions ? <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">{actions}</div> : null}
          {children}
        </div>
      ) : null}
    </header>
  );
}

export function StatusChip({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  return <span className={cn(toneClass[tone], className)}>{children}</span>;
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("empty-state", className)}>
      <p className="font-display text-xl text-white">{title}</p>
      {description ? <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
