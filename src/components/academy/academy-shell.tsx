"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Search,
  Star,
  Trophy,
} from "lucide-react";
import { InteractiveLesson } from "@/components/academy/interactive-lesson";
import { AcademyQuizPanel } from "@/components/academy/quiz-panel";
import { AcademyVideoPlayer } from "@/components/academy/video-player";
import {
  ACADEMY_ACHIEVEMENTS,
  ACADEMY_FAQ,
  ALL_LESSONS,
  BEGINNER_LESSON_IDS,
  CATEGORY_LABELS,
  PATH_LABELS,
  academyHref,
  computePathPercent,
  dismissOnboardingBanner,
  evaluateAchievements,
  getLesson,
  getLessonProgress,
  loadAcademyProgress,
  markInteractiveDone,
  markLessonCompleted,
  markLessonViewed,
  markQuizResult,
  relatedLessons,
  searchAcademy,
  toggleFavorite,
  unlockAchievement,
  claimReward,
  type AcademyCategory,
  type AcademyLesson,
  type AcademyPath,
  type AcademyProgressState,
} from "@/game/academy";
import { cn } from "@/lib/utils/cn";

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

type FilterMode = "all" | "beginner" | "advanced" | "favorites" | "recent" | "completed";

export function AcademyShell() {
  const mounted = useMounted();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonParam = searchParams.get("lesson");
  const tabParam = searchParams.get("tab");
  const faqParam = searchParams.get("faq");
  const practiceMode = searchParams.get("practice") === "1";

  const [progress, setProgress] = useState<AcademyProgressState>(() =>
    createClientSafeProgress(),
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [pathFilter, setPathFilter] = useState<AcademyPath | "all">("all");
  const [category, setCategory] = useState<AcademyCategory | "all">("all");
  const [showFaq, setShowFaq] = useState(tabParam === "faq");

  const activeLesson = useMemo(() => {
    if (lessonParam) return getLesson(lessonParam) ?? ALL_LESSONS[0];
    return ALL_LESSONS[0];
  }, [lessonParam]);

  useEffect(() => {
    if (!mounted) return;
    setProgress(loadAcademyProgress());
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !activeLesson) return;
    setProgress((p) => markLessonViewed(p, activeLesson.id));
  }, [mounted, activeLesson?.id]);

  useEffect(() => {
    setShowFaq(tabParam === "faq");
  }, [tabParam]);

  useEffect(() => {
    if (!mounted) return;
    const unlocked = evaluateAchievements(progress);
    if (unlocked.length !== progress.achievements.length) {
      let next = progress;
      for (const id of unlocked) {
        if (!next.achievements.includes(id)) {
          next = unlockAchievement(next, id);
        }
      }
      setProgress(next);
    }
  }, [mounted, progress]);

  const selectLesson = useCallback(
    (lesson: AcademyLesson) => {
      setShowFaq(false);
      router.replace(academyHref(lesson.id, { practice: practiceMode }), { scroll: false });
    },
    [router, practiceMode],
  );

  const hits = useMemo(() => (query.trim() ? searchAcademy(query) : []), [query]);

  const filteredLessons = useMemo(() => {
    let list = ALL_LESSONS;
    if (pathFilter !== "all") list = list.filter((l) => l.path === pathFilter);
    if (category !== "all") list = list.filter((l) => l.category === category);
    if (filter === "beginner") list = list.filter((l) => l.difficulty === "beginner");
    if (filter === "advanced") list = list.filter((l) => l.difficulty === "advanced");
    if (filter === "favorites") {
      list = list.filter((l) => progress.favorites.includes(l.id));
    }
    if (filter === "recent") {
      list = progress.recent
        .map((id) => getLesson(id))
        .filter((l): l is AcademyLesson => Boolean(l));
    }
    if (filter === "completed") {
      list = list.filter((l) => {
        const s = getLessonProgress(progress, l.id).status;
        return s === "completed" || s === "quiz_passed";
      });
    }
    return list;
  }, [pathFilter, category, filter, progress]);

  const beginnerPct = computePathPercent(progress, BEGINNER_LESSON_IDS);
  const lessonProg = activeLesson
    ? getLessonProgress(progress, activeLesson.id)
    : null;
  const related = activeLesson ? relatedLessons(activeLesson) : [];

  const onInteractiveComplete = useCallback(() => {
    if (!activeLesson) return;
    setProgress((p) => markInteractiveDone(p, activeLesson.id));
  }, [activeLesson]);

  const categories = useMemo(() => {
    const set = new Set(ALL_LESSONS.map((l) => l.category));
    return [...set];
  }, []);

  return (
    <div className="space-y-4">
      {!progress.onboardingBannerDismissed ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--cyan)]/30 bg-[rgba(61,231,255,0.08)] px-4 py-3">
          <div>
            <p className="font-display text-sm text-[var(--cyan)]">New Keeper?</p>
            <p className="text-xs text-[var(--text-muted)]">
              Start the Beginner Path — SOL is never required for basic gameplay.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary focus-ring text-xs"
              onClick={() => {
                const first = getLesson("b01-welcome");
                if (first) selectLesson(first);
              }}
            >
              Start Beginner Path
            </button>
            <button
              type="button"
              className="btn-secondary focus-ring text-xs"
              onClick={() => setProgress((p) => dismissOnboardingBanner(p))}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_240px]">
        {/* Left rail */}
        <aside className="panel space-y-3 p-3 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-[var(--text-dim)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lessons, NPCs, keys…"
              className="focus-ring w-full rounded border border-[var(--stroke)] bg-[var(--bg-elevated)] py-2 pl-8 pr-2 text-sm text-white placeholder:text-[var(--text-dim)]"
              aria-label="Search Academy"
            />
          </label>

          {hits.length > 0 ? (
            <ul className="space-y-1 border-b border-[var(--stroke)] pb-3">
              {hits.slice(0, 8).map((h) => (
                <li key={`${h.kind}-${h.id}`}>
                  <Link
                    href={h.href}
                    className="block rounded px-2 py-1.5 text-xs hover:bg-[rgba(61,231,255,0.08)]"
                    onClick={() => setQuery("")}
                  >
                    <span className="text-[10px] uppercase tracking-wider text-[var(--amber)]">
                      {h.kind}
                    </span>
                    <span className="block text-[var(--text)]">{h.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-wrap gap-1">
            {(
              [
                ["all", "All"],
                ["beginner", "Beginner"],
                ["advanced", "Advanced"],
                ["favorites", "Favorites"],
                ["recent", "Recent"],
                ["completed", "Done"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider",
                  filter === id
                    ? "border-[var(--cyan)] text-[var(--cyan)]"
                    : "border-[var(--stroke)] text-[var(--text-dim)]",
                )}
                onClick={() => setFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-dim)]">
              Path
            </p>
            {(["all", "beginner", "advanced", "curriculum"] as const).map((p) => (
              <button
                key={p}
                type="button"
                className={cn(
                  "block w-full rounded px-2 py-1 text-left text-xs",
                  pathFilter === p
                    ? "bg-[rgba(61,231,255,0.12)] text-[var(--cyan)]"
                    : "text-[var(--text-muted)] hover:text-white",
                )}
                onClick={() => setPathFilter(p)}
              >
                {p === "all" ? "All paths" : PATH_LABELS[p]}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-dim)]">
              Category
            </p>
            <button
              type="button"
              className={cn(
                "block w-full rounded px-2 py-1 text-left text-xs",
                category === "all"
                  ? "bg-[rgba(255,184,77,0.1)] text-[var(--amber)]"
                  : "text-[var(--text-muted)]",
              )}
              onClick={() => setCategory("all")}
            >
              All categories
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={cn(
                  "block w-full rounded px-2 py-1 text-left text-xs",
                  category === c
                    ? "bg-[rgba(255,184,77,0.1)] text-[var(--amber)]"
                    : "text-[var(--text-muted)] hover:text-white",
                )}
                onClick={() => setCategory(c)}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded border px-2 py-2 text-left text-xs",
              showFaq
                ? "border-[var(--cyan)] text-[var(--cyan)]"
                : "border-[var(--stroke)] text-[var(--text-muted)]",
            )}
            onClick={() => {
              setShowFaq(true);
              router.replace("/academy?tab=faq", { scroll: false });
            }}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Searchable FAQ
          </button>

          <ul className="space-y-0.5 border-t border-[var(--stroke)] pt-2">
            {filteredLessons.map((lesson) => {
              const st = getLessonProgress(progress, lesson.id).status;
              const fav = progress.favorites.includes(lesson.id);
              const active = activeLesson?.id === lesson.id && !showFaq;
              return (
                <li key={lesson.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-start gap-2 rounded px-2 py-1.5 text-left text-xs",
                      active
                        ? "bg-[rgba(61,231,255,0.14)] text-white"
                        : "text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.03)] hover:text-white",
                    )}
                    onClick={() => selectLesson(lesson)}
                  >
                    <span className="mt-0.5 shrink-0">
                      {st === "completed" || st === "quiz_passed" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-[var(--cyan)]" />
                      ) : fav ? (
                        <Star className="h-3.5 w-3.5 text-[var(--amber)]" />
                      ) : (
                        <span className="inline-block h-3.5 w-3.5 rounded-full border border-[var(--stroke)]" />
                      )}
                    </span>
                    <span>
                      <span className="block font-medium">{lesson.title}</span>
                      <span className="text-[10px] text-[var(--text-dim)]">
                        {PATH_LABELS[lesson.path]} · {lesson.etaMinutes}m
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Center */}
        <main className="panel min-h-[28rem] p-4 md:p-6">
          {showFaq ? (
            <FaqView
              focusId={faqParam}
              query={query}
              onOpenLesson={(id) => {
                const l = getLesson(id);
                if (l) selectLesson(l);
              }}
            />
          ) : activeLesson ? (
            <LessonView
              lesson={activeLesson}
              progress={lessonProg!}
              favorited={progress.favorites.includes(activeLesson.id)}
              practiceMode={practiceMode}
              rewardsClaimed={progress.rewardsClaimed}
              onToggleFavorite={() =>
                setProgress((p) => toggleFavorite(p, activeLesson.id))
              }
              onInteractiveComplete={onInteractiveComplete}
              onQuiz={(score, passed) => {
                setProgress((p) => markQuizResult(p, activeLesson.id, score, passed));
                if (passed) {
                  setProgress((p) => markLessonCompleted(p, activeLesson.id));
                }
              }}
              onComplete={() => {
                setProgress((p) => markLessonCompleted(p, activeLesson.id));
                for (const r of activeLesson.rewards ?? []) {
                  setProgress((p) => claimReward(p, r.id));
                }
              }}
            />
          ) : null}
        </main>

        {/* Right rail */}
        <aside className="panel space-y-4 p-3 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.18em] text-[var(--cyan)]">
              Progress
            </p>
            <p className="mt-1 font-display text-2xl text-white">{beginnerPct}%</p>
            <p className="text-[11px] text-[var(--text-muted)]">Beginner Path complete</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/40">
              <div
                className="h-full rounded-full bg-[var(--grad-cta)]"
                style={{ width: `${beginnerPct}%` }}
              />
            </div>
          </div>

          {activeLesson && !showFaq ? (
            <>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Clock className="h-3.5 w-3.5 text-[var(--amber)]" />
                ETA ~{activeLesson.etaMinutes} min
              </div>
              {lessonProg?.lastViewedAt ? (
                <p className="text-[10px] text-[var(--text-dim)]">
                  Last viewed {new Date(lessonProg.lastViewedAt).toLocaleString()}
                </p>
              ) : null}
              {activeLesson.rewards?.length ? (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--amber)]">
                    Rewards
                  </p>
                  <ul className="mt-1 space-y-1 text-xs text-[var(--text-muted)]">
                    {activeLesson.rewards.map((r) => (
                      <li key={r.id}>
                        {r.label}
                        {r.amount ? ` (+${r.amount})` : ""}
                        {progress.rewardsClaimed.includes(r.id) ? " · claimed" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {activeLesson.tips?.length ? (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--cyan)]">
                    Tips
                  </p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-[var(--text-muted)]">
                    {activeLesson.tips.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {activeLesson.shortcuts?.length ? (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
                    Shortcuts
                  </p>
                  <ul className="mt-1 space-y-1 text-xs text-[var(--amber)]">
                    {activeLesson.shortcuts.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {related.length ? (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
                    Related
                  </p>
                  <ul className="mt-1 space-y-1">
                    {related.map((r) => (
                      <li key={r.id}>
                        <button
                          type="button"
                          className="text-left text-xs text-[var(--cyan)] hover:underline"
                          onClick={() => selectLesson(r)}
                        >
                          {r.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : null}

          <div>
            <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[var(--amber)]">
              <Trophy className="h-3 w-3" /> Achievements
            </p>
            <ul className="mt-2 space-y-1.5">
              {ACADEMY_ACHIEVEMENTS.map((a) => {
                const unlocked = progress.achievements.includes(a.id);
                return (
                  <li
                    key={a.id}
                    className={cn(
                      "rounded border px-2 py-1.5 text-[11px]",
                      unlocked
                        ? "border-[var(--amber)]/40 text-[var(--amber)]"
                        : "border-[var(--stroke)] text-[var(--text-dim)]",
                    )}
                  >
                    <span className="font-medium">{a.label}</span>
                    <span className="block text-[10px] opacity-80">{a.description}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function createClientSafeProgress(): AcademyProgressState {
  return {
    version: 1,
    lessons: {},
    favorites: [],
    recent: [],
    achievements: [],
    rewardsClaimed: [],
    onboardingBannerDismissed: false,
  };
}

function LessonView({
  lesson,
  progress,
  favorited,
  practiceMode,
  rewardsClaimed,
  onToggleFavorite,
  onInteractiveComplete,
  onQuiz,
  onComplete,
}: {
  lesson: AcademyLesson;
  progress: ReturnType<typeof getLessonProgress>;
  favorited: boolean;
  practiceMode: boolean;
  rewardsClaimed: string[];
  onToggleFavorite: () => void;
  onInteractiveComplete: () => void;
  onQuiz: (score: number, passed: boolean) => void;
  onComplete: () => void;
}) {
  return (
    <article>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-[10px] uppercase tracking-[0.2em] text-[var(--cyan)]">
            {PATH_LABELS[lesson.path]} · {CATEGORY_LABELS[lesson.category]}
          </p>
          <h2 className="mt-1 font-display text-2xl text-white md:text-3xl">
            {lesson.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{lesson.summary}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="focus-ring rounded border border-[var(--stroke)] p-2"
            aria-label={favorited ? "Remove favorite" : "Add favorite"}
            onClick={onToggleFavorite}
          >
            <Star
              className={cn(
                "h-4 w-4",
                favorited ? "fill-[var(--amber)] text-[var(--amber)]" : "text-[var(--text-dim)]",
              )}
            />
          </button>
          <button
            type="button"
            className="btn-primary focus-ring text-xs"
            disabled={progress.status === "completed"}
            onClick={onComplete}
          >
            {progress.status === "completed" ? "Completed" : "Mark complete"}
          </button>
        </div>
      </div>

      {lesson.media?.map((m) => (
        <figure key={m.src} className="relative mt-4 overflow-hidden rounded-lg border border-[var(--stroke)]">
          <div className="relative aspect-[16/9] w-full bg-[var(--bg-navy)]">
            <Image
              src={m.src}
              alt={m.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
              loading={m.priority ? "eager" : "lazy"}
              unoptimized
            />
          </div>
          {m.caption ? (
            <figcaption className="px-3 py-2 text-xs text-[var(--text-dim)]">
              {m.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}

      {lesson.videoEmbed ? (
        <div className="mt-4">
          <AcademyVideoPlayer
            src={lesson.videoEmbed.src}
            title={lesson.videoEmbed.title}
            captionsUrl={lesson.videoEmbed.captionsUrl}
            autoPlay={false}
          />
        </div>
      ) : null}

      <div className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--text-muted)]">
        {lesson.body.map((para) => (
          <p key={para.slice(0, 48)}>{para}</p>
        ))}
      </div>

      {lesson.interactive?.length ? (
        <InteractiveLesson
          steps={lesson.interactive}
          onComplete={onInteractiveComplete}
          practiceMode={practiceMode}
        />
      ) : null}

      {lesson.quiz?.length ? (
        <AcademyQuizPanel questions={lesson.quiz} onResult={onQuiz} />
      ) : null}

      {lesson.rewards?.some((r) => rewardsClaimed.includes(r.id)) ? (
        <p className="mt-4 flex items-center gap-2 text-xs text-[var(--amber)]">
          <GraduationCap className="h-4 w-4" />
          One-time Academy rewards claimed for this lesson.
        </p>
      ) : null}
    </article>
  );
}

function FaqView({
  focusId,
  query,
  onOpenLesson,
}: {
  focusId: string | null;
  query: string;
  onOpenLesson: (id: string) => void;
}) {
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ACADEMY_FAQ;
    return ACADEMY_FAQ.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.keywords.some((k) => k.includes(q)),
    );
  }, [query]);

  return (
    <div>
      <h2 className="font-display text-2xl text-white">Academy FAQ</h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Searchable answers — use the left search box to filter.
      </p>
      <ul className="mt-6 space-y-4">
        {list.map((f) => (
          <li
            key={f.id}
            id={f.id}
            className={cn(
              "rounded-lg border border-[var(--stroke)] p-4",
              focusId === f.id && "border-[var(--cyan)]/50 bg-[rgba(61,231,255,0.06)]",
            )}
          >
            <h3 className="font-display text-base text-white">{f.question}</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{f.answer}</p>
            {f.relatedLessonIds?.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {f.relatedLessonIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className="text-xs text-[var(--cyan)] underline"
                    onClick={() => onOpenLesson(id)}
                  >
                    {getLesson(id)?.title ?? id}
                  </button>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
