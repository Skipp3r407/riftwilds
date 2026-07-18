import { cn } from "@/lib/utils/cn";

type SkeletonProps = {
  className?: string;
  /** Optional label for assistive tech when the skeleton represents a loading region. */
  label?: string;
};

/** Soft cyan shimmer placeholder for loading / empty chrome. */
export function Skeleton({ className, label = "Loading" }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton", className)}
      role="status"
      aria-busy="true"
      aria-label={label}
    />
  );
}

export function SkeletonBlock({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2.5", className)} aria-hidden>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={cn(
            "skeleton h-3",
            i === lines - 1 ? "w-2/3" : "w-full",
          )}
        />
      ))}
    </div>
  );
}
