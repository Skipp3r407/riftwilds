"use client";

import { aboutChapters } from "@/content/about/riftwilds-origin";
import { cn } from "@/lib/utils/cn";

type Props = {
  activeId?: string;
  className?: string;
};

export function ChapterNavigation({ activeId, className }: Props) {
  return (
    <nav
      aria-label="Story chapters"
      className={cn(
        "sticky top-[4.5rem] z-40 border-b border-[var(--stroke)] bg-[rgba(8,10,16,0.82)] backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 py-2 md:px-6">
        {aboutChapters.map((chapter, index) => {
          const active = activeId === chapter.id;
          return (
            <a
              key={chapter.id}
              href={`#chapter-${chapter.id}`}
              className={cn(
                "focus-ring shrink-0 rounded-md px-3 py-2 text-xs tracking-wide transition-colors md:text-sm",
                active
                  ? "bg-[rgba(61,231,255,0.12)] text-[var(--cyan)]"
                  : "text-[var(--text-muted)] hover:text-white",
              )}
            >
              <span className="font-display mr-1.5 text-[0.65rem] text-[var(--text-dim)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              {chapter.navLabel}
            </a>
          );
        })}
        <a
          href="#how-riftlings-came-to-be"
          className="focus-ring shrink-0 rounded-md px-3 py-2 text-xs tracking-wide text-[var(--text-muted)] transition-colors hover:text-white md:text-sm"
        >
          <span className="font-display mr-1.5 text-[0.65rem] text-[var(--text-dim)]">+</span>
          How They Began
        </a>
      </div>
    </nav>
  );
}
