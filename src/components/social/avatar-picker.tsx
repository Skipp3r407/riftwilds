"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, useTransition } from "react";
import type { SocialAvatarCatalog, SocialAvatarOption } from "@/lib/social/avatars";
import { brandMarkPath } from "@/lib/assets/paths";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** Called after a successful set so the hub can refresh `me.avatarSrc`. */
  onSelected?: (src: string, key: string) => void;
  className?: string;
};

function OptionButton({
  option,
  selected,
  pending,
  onPick,
}: {
  option: SocialAvatarOption;
  selected: boolean;
  pending: boolean;
  onPick: (key: string) => void;
}) {
  return (
    <button
      type="button"
      disabled={pending || !option.unlocked}
      onClick={() => onPick(option.key)}
      title={option.lockedReason ?? `${option.label}${option.subtitle ? ` — ${option.subtitle}` : ""}`}
      className={cn(
        "focus-ring group flex flex-col items-center gap-1.5 rounded-lg border p-2 text-center transition",
        selected
          ? "border-[var(--cyan)] bg-[rgba(61,231,255,0.12)]"
          : "border-[var(--stroke)] bg-[rgba(0,0,0,0.2)] hover:border-[var(--stroke-strong)]",
        !option.unlocked && "opacity-40",
      )}
      aria-pressed={selected}
      aria-label={`Use ${option.label} as avatar`}
    >
      <span className="relative h-14 w-14 overflow-hidden rounded-full border border-[var(--stroke)] bg-[rgba(8,8,14,0.6)]">
        <Image
          src={option.thumbSrc || option.src}
          alt=""
          fill
          sizes="56px"
          className="object-cover"
          unoptimized
        />
      </span>
      <span className="line-clamp-2 w-full text-[11px] leading-tight text-white">{option.label}</span>
      {option.subtitle ? (
        <span className="line-clamp-1 w-full text-[10px] text-[var(--text-dim)]">{option.subtitle}</span>
      ) : null}
    </button>
  );
}

export function AvatarPicker({ onSelected, className }: Props) {
  const [pending, startTransition] = useTransition();
  const [catalog, setCatalog] = useState<SocialAvatarCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/social/avatars");
        const data = await res.json();
        if (!data.ok) {
          setError(data.message ?? "Could not load avatars.");
          return;
        }
        setCatalog({
          selectedKey: data.selectedKey ?? null,
          selectedSrc: data.selectedSrc ?? brandMarkPath,
          sections: data.sections ?? [],
        });
      } catch {
        setError("Could not load avatars.");
      }
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function pick(key: string) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/social/avatars", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "key", key }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "Could not set avatar.");
        return;
      }
      if (data.catalog) {
        setCatalog(data.catalog as SocialAvatarCatalog);
      } else {
        load();
      }
      setMessage("Avatar updated.");
      if (data.src && data.key) onSelected?.(data.src as string, data.key as string);
    });
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="font-display text-lg text-white">Riftling avatars</h3>
        <p className="mt-1 text-xs text-[var(--text-dim)]">
          Use your owned Riftlings or a starter species portrait. Also shown on friends, PMs, and
          profile.
        </p>
      </div>

      {catalog ? (
        <div className="flex items-center gap-3">
          <span className="relative h-16 w-16 overflow-hidden rounded-full border border-[var(--stroke-strong)]">
            <Image
              src={catalog.selectedSrc || brandMarkPath}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          </span>
          <p className="text-xs text-[var(--text-muted)]">
            Current selection
            {catalog.selectedKey ? (
              <span className="mt-0.5 block font-mono text-[10px] text-[var(--text-dim)]">
                {catalog.selectedKey}
              </span>
            ) : null}
          </p>
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">Loading avatars…</p>
      )}

      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-[var(--cyan)]" role="status">
          {message}
        </p>
      ) : null}

      {catalog?.sections.map((section) => (
        <div key={section.id}>
          <h4 className="font-display text-sm text-white">{section.title}</h4>
          <p className="mt-0.5 text-[11px] text-[var(--text-dim)]">{section.description}</p>
          {section.options.length === 0 ? (
            <p className="mt-2 text-xs text-[var(--text-muted)]">No options in this section yet.</p>
          ) : (
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {section.options.map((option) => (
                <OptionButton
                  key={option.key}
                  option={option}
                  selected={catalog.selectedKey === option.key}
                  pending={pending}
                  onPick={pick}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
