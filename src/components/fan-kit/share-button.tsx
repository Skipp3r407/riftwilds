"use client";

import { useState } from "react";
import { absoluteUrl, shareOrCopy } from "@/lib/share/native-share";
import { cn } from "@/lib/utils/cn";

type Props = {
  title: string;
  text?: string;
  path: string;
  className?: string;
  label?: string;
};

export function ShareButton({ title, text, path, className, label = "Share" }: Props) {
  const [status, setStatus] = useState<"idle" | "shared" | "copied" | "failed">("idle");

  return (
    <button
      type="button"
      className={cn("btn-secondary focus-ring text-sm", className)}
      onClick={async () => {
        const result = await shareOrCopy({
          title,
          text,
          url: absoluteUrl(path),
        });
        if (result === "shared") setStatus("shared");
        else if (result === "copied") setStatus("copied");
        else if (result === "failed") setStatus("failed");
        window.setTimeout(() => setStatus("idle"), 1800);
      }}
    >
      {status === "shared"
        ? "Shared"
        : status === "copied"
          ? "Link copied"
          : status === "failed"
            ? "Try again"
            : label}
    </button>
  );
}

export function CopyLinkButton({ path, className }: { path: string; className?: string }) {
  return <ShareButton title="Riftwilds" path={path} label="Copy link" className={className} />;
}
