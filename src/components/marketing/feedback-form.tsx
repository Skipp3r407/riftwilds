"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  BUG_SEVERITIES,
  BUG_SEVERITY_LABELS,
  FEEDBACK_CATEGORIES,
  FEEDBACK_CATEGORY_LABELS,
  type BugSeverity,
  type FeedbackCategory,
} from "@/lib/feedback/schema";
import {
  FEEDBACK_SCREENSHOT_MAX_BYTES,
  FEEDBACK_SCREENSHOT_MAX_COUNT,
  FEEDBACK_SCREENSHOT_MIME,
} from "@/lib/feedback/screenshot-limits";

type Tab = "bug" | "feedback";
type Status = "idle" | "loading" | "ok" | "error";

type LocalScreenshot = {
  id: string;
  file: File;
  previewUrl: string;
};

const inputClass =
  "focus-ring w-full rounded-[var(--radius-md)] border border-[var(--stroke)] bg-[rgba(10,12,16,0.65)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--text-dim)]";

const labelClass = "mb-1.5 block text-xs font-medium text-[var(--text-muted)]";

const ACCEPT = FEEDBACK_SCREENSHOT_MIME.join(",");
const MAX_MB = Math.round(FEEDBACK_SCREENSHOT_MAX_BYTES / (1024 * 1024));

function revokeAll(shots: LocalScreenshot[]) {
  for (const s of shots) URL.revokeObjectURL(s.previewUrl);
}

export function FeedbackForm({ source = "feedback-page" }: { source?: string }) {
  const [tab, setTab] = useState<Tab>("bug");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bug fields
  const [title, setTitle] = useState("");
  const [whatHappened, setWhatHappened] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [browserDevice, setBrowserDevice] = useState("");
  const [severity, setSeverity] = useState<BugSeverity>("medium");
  const [screenshotNote, setScreenshotNote] = useState("");
  const [screenshots, setScreenshots] = useState<LocalScreenshot[]>([]);
  const [shotError, setShotError] = useState<string | null>(null);
  const [bugEmail, setBugEmail] = useState("");

  // Feedback fields
  const [category, setCategory] = useState<FeedbackCategory>("gameplay");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [ideaEmail, setIdeaEmail] = useState("");

  // Honeypot
  const [website, setWebsite] = useState("");
  const screenshotsRef = useRef(screenshots);
  screenshotsRef.current = screenshots;

  useEffect(() => {
    return () => revokeAll(screenshotsRef.current);
  }, []);

  const clearScreenshots = () => {
    setScreenshots((prev) => {
      revokeAll(prev);
      return [];
    });
    setShotError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetBug = () => {
    setTitle("");
    setWhatHappened("");
    setStepsToReproduce("");
    setExpected("");
    setActual("");
    setBrowserDevice("");
    setSeverity("medium");
    setScreenshotNote("");
    clearScreenshots();
    setBugEmail("");
  };

  const resetIdea = () => {
    setCategory("gameplay");
    setFeedbackMessage("");
    setIdeaEmail("");
  };

  const addScreenshots = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setShotError(null);

    const incoming = Array.from(fileList);
    const room = FEEDBACK_SCREENSHOT_MAX_COUNT - screenshots.length;
    if (room <= 0) {
      setShotError(`You can attach up to ${FEEDBACK_SCREENSHOT_MAX_COUNT} screenshots.`);
      return;
    }

    const next: LocalScreenshot[] = [];
    for (const file of incoming.slice(0, room)) {
      const mime = (file.type || "").toLowerCase();
      if (!(FEEDBACK_SCREENSHOT_MIME as readonly string[]).includes(mime)) {
        setShotError("Screenshots must be PNG, JPG, or WebP.");
        continue;
      }
      if (file.size > FEEDBACK_SCREENSHOT_MAX_BYTES) {
        setShotError(`Each screenshot must be under ${MAX_MB}MB.`);
        continue;
      }
      next.push({
        id: `${file.name}_${file.size}_${file.lastModified}_${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (incoming.length > room) {
      setShotError(`Only ${FEEDBACK_SCREENSHOT_MAX_COUNT} screenshots allowed — extra files were skipped.`);
    }

    if (next.length > 0) {
      setScreenshots((prev) => [...prev, ...next]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeScreenshot = (id: string) => {
    setScreenshots((prev) => {
      const target = prev.find((s) => s.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((s) => s.id !== id);
    });
    setShotError(null);
  };

  const uploadScreenshots = async (): Promise<string[] | null> => {
    if (screenshots.length === 0) return [];
    const form = new FormData();
    for (const shot of screenshots) form.append("files", shot.file, shot.file.name);
    const res = await fetch("/api/feedback/upload", {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as {
      ok?: boolean;
      urls?: string[];
      message?: string;
    };
    if (!res.ok || !data.ok || !Array.isArray(data.urls)) {
      setStatus("error");
      setMessage(data.message ?? "Couldn’t upload screenshots — try again.");
      return null;
    }
    return data.urls;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);
    setShotError(null);

    const pageUrl = typeof window !== "undefined" ? window.location.href : undefined;

    let screenshotUrls: string[] = [];
    if (tab === "bug") {
      const uploaded = await uploadScreenshots();
      if (uploaded == null) return;
      screenshotUrls = uploaded;
    }

    const body =
      tab === "bug"
        ? {
            kind: "bug" as const,
            title,
            whatHappened,
            stepsToReproduce,
            expected,
            actual,
            browserDevice,
            severity,
            screenshotNote,
            screenshotUrls,
            email: bugEmail,
            pageUrl,
            website,
            source,
          }
        : {
            kind: "feedback" as const,
            category,
            message: feedbackMessage,
            email: ideaEmail,
            pageUrl,
            website,
            source,
          };

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.message ?? "Could not send that yet — try again in a moment.");
        return;
      }
      setStatus("ok");
      setMessage(data.message ?? "Thanks — we received your report.");
      if (tab === "bug") resetBug();
      else resetIdea();
      setWebsite("");
    } catch {
      setStatus("error");
      setMessage("Network hiccup — try again in a moment.");
    }
  };

  const canAddMore = screenshots.length < FEEDBACK_SCREENSHOT_MAX_COUNT;

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Report type"
        className="flex flex-wrap gap-2 border-b border-[var(--stroke)] pb-3"
      >
        {(
          [
            { id: "bug" as const, label: "Bug report" },
            { id: "feedback" as const, label: "Feedback / idea" },
          ] as const
        ).map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              id={`feedback-tab-${t.id}`}
              onClick={() => {
                setTab(t.id);
                setStatus("idle");
                setMessage(null);
              }}
              className={
                active
                  ? "focus-ring rounded-[var(--radius-md)] border border-[var(--cyan)]/40 bg-[rgba(61,231,255,0.1)] px-4 py-2 text-sm text-[var(--cyan)]"
                  : "focus-ring rounded-[var(--radius-md)] border border-[var(--stroke)] px-4 py-2 text-sm text-[var(--text-muted)] hover:text-white"
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <form
        onSubmit={onSubmit}
        className="relative space-y-4"
        aria-labelledby={`feedback-tab-${tab}`}
      >
        {/* Honeypot — hidden from humans */}
        <div
          className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
          aria-hidden
        >
          <label htmlFor="feedback-website">Website</label>
          <input
            id="feedback-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {tab === "bug" ? (
          <div role="tabpanel" className="space-y-4">
            <div>
              <label htmlFor="bug-title" className={labelClass}>
                Title
              </label>
              <input
                id="bug-title"
                required
                minLength={3}
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short summary of the bug"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="bug-what" className={labelClass}>
                What happened
              </label>
              <textarea
                id="bug-what"
                required
                minLength={10}
                maxLength={4000}
                rows={3}
                value={whatHappened}
                onChange={(e) => setWhatHappened(e.target.value)}
                placeholder="Describe the problem in your own words"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="bug-steps" className={labelClass}>
                Steps to reproduce
              </label>
              <textarea
                id="bug-steps"
                required
                minLength={5}
                maxLength={4000}
                rows={3}
                value={stepsToReproduce}
                onChange={(e) => setStepsToReproduce(e.target.value)}
                placeholder={"1. Go to…\n2. Click…\n3. See error…"}
                className={inputClass}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="bug-expected" className={labelClass}>
                  Expected
                </label>
                <textarea
                  id="bug-expected"
                  required
                  minLength={3}
                  maxLength={2000}
                  rows={2}
                  value={expected}
                  onChange={(e) => setExpected(e.target.value)}
                  placeholder="What should have happened"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="bug-actual" className={labelClass}>
                  Actual
                </label>
                <textarea
                  id="bug-actual"
                  required
                  minLength={3}
                  maxLength={2000}
                  rows={2}
                  value={actual}
                  onChange={(e) => setActual(e.target.value)}
                  placeholder="What actually happened"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="bug-browser" className={labelClass}>
                  Browser / device <span className="text-[var(--text-dim)]">(optional)</span>
                </label>
                <input
                  id="bug-browser"
                  maxLength={240}
                  value={browserDevice}
                  onChange={(e) => setBrowserDevice(e.target.value)}
                  placeholder="e.g. Chrome 126 on Windows 11"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="bug-severity" className={labelClass}>
                  Severity
                </label>
                <select
                  id="bug-severity"
                  required
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as BugSeverity)}
                  className={inputClass}
                >
                  {BUG_SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {BUG_SEVERITY_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <span className={labelClass} id={`${fileInputId}-label`}>
                Screenshots{" "}
                <span className="text-[var(--text-dim)]">
                  (optional · up to {FEEDBACK_SCREENSHOT_MAX_COUNT} · PNG/JPG/WebP · {MAX_MB}MB each)
                </span>
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  id={fileInputId}
                  type="file"
                  accept={ACCEPT}
                  multiple
                  disabled={!canAddMore || status === "loading"}
                  aria-labelledby={`${fileInputId}-label`}
                  onChange={(e) => addScreenshots(e.target.files)}
                  className="sr-only"
                />
                <label
                  htmlFor={fileInputId}
                  className={
                    canAddMore && status !== "loading"
                      ? "focus-ring inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--stroke)] bg-[rgba(10,12,16,0.65)] px-3 py-2 text-sm text-[var(--text-muted)] hover:border-[var(--cyan)]/40 hover:text-white"
                      : "inline-flex cursor-not-allowed items-center gap-2 rounded-[var(--radius-md)] border border-[var(--stroke)] bg-[rgba(10,12,16,0.4)] px-3 py-2 text-sm text-[var(--text-dim)] opacity-60"
                  }
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                    className="shrink-0 text-[var(--cyan)]"
                  >
                    <path
                      d="M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5M12 4v11m0 0 3.5-3.5M12 15l-3.5-3.5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {screenshots.length === 0 ? "Add screenshots" : "Add more"}
                </label>
                {screenshots.length > 0 && (
                  <button
                    type="button"
                    onClick={clearScreenshots}
                    disabled={status === "loading"}
                    className="focus-ring text-xs text-[var(--text-dim)] underline-offset-2 hover:text-white hover:underline disabled:opacity-50"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {screenshots.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-3" aria-label="Screenshot previews">
                  {screenshots.map((shot, index) => (
                    <li
                      key={shot.id}
                      className="relative h-24 w-24 overflow-hidden rounded-[var(--radius-md)] border border-[var(--stroke)] bg-[rgba(10,12,16,0.8)]"
                    >
                      {/* object URL preview — not next/image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={shot.previewUrl}
                        alt={`Screenshot ${index + 1} preview`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(shot.id)}
                        disabled={status === "loading"}
                        aria-label={`Remove screenshot ${index + 1}`}
                        className="focus-ring absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md border border-[var(--stroke)] bg-[rgba(8,12,20,0.88)] text-xs text-white hover:border-[var(--amber)] disabled:opacity-50"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {shotError && (
                <p className="mt-2 text-xs text-[var(--amber)]" role="status">
                  {shotError}
                </p>
              )}

              <label htmlFor="bug-screenshot-note" className={`${labelClass} mt-3`}>
                Screenshot note <span className="text-[var(--text-dim)]">(optional)</span>
              </label>
              <textarea
                id="bug-screenshot-note"
                maxLength={1000}
                rows={2}
                value={screenshotNote}
                onChange={(e) => setScreenshotNote(e.target.value)}
                placeholder="Anything we should notice in the screenshots?"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="bug-email" className={labelClass}>
                Contact email <span className="text-[var(--text-dim)]">(optional)</span>
              </label>
              <input
                id="bug-email"
                type="email"
                autoComplete="email"
                maxLength={254}
                value={bugEmail}
                onChange={(e) => setBugEmail(e.target.value)}
                placeholder="you@realm.mail — only if you want a follow-up"
                className={inputClass}
              />
            </div>
          </div>
        ) : (
          <div role="tabpanel" className="space-y-4">
            <div>
              <label htmlFor="idea-category" className={labelClass}>
                Category
              </label>
              <select
                id="idea-category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                className={inputClass}
              >
                {FEEDBACK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {FEEDBACK_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="idea-message" className={labelClass}>
                Your idea or feedback
              </label>
              <textarea
                id="idea-message"
                required
                minLength={10}
                maxLength={4000}
                rows={5}
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="What would make Riftwilds better?"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="idea-email" className={labelClass}>
                Contact email <span className="text-[var(--text-dim)]">(optional)</span>
              </label>
              <input
                id="idea-email"
                type="email"
                autoComplete="email"
                maxLength={254}
                value={ideaEmail}
                onChange={(e) => setIdeaEmail(e.target.value)}
                placeholder="you@realm.mail — only if you want a follow-up"
                className={inputClass}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-primary focus-ring text-sm disabled:opacity-60"
          >
            {status === "loading"
              ? "Sending…"
              : tab === "bug"
                ? "Submit bug report"
                : "Send feedback"}
          </button>
          <p className="text-xs text-[var(--text-dim)]">No wallet or SOL required.</p>
        </div>

        {message && (
          <p
            className={
              status === "ok" ? "text-sm text-[var(--emerald)]" : "text-sm text-[var(--amber)]"
            }
            role="status"
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
