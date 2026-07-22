"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  buildBattleFeedNewestFirst,
  computeMatchFeedSummary,
  filterFeedLines,
  formatDevEventLine,
  type FeedLine,
  type MatchFeedSummary,
  type TcgFeedFilter,
  type TcgFeedIcon,
} from "@/game/tcg/events";
import { cn } from "@/lib/utils/cn";
import { ChevronRight, GripVertical } from "lucide-react";

const FILTERS: { id: TcgFeedFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "combat", label: "Combat" },
  { id: "abilities", label: "Abilities" },
  { id: "cards", label: "Cards" },
  { id: "status", label: "Status" },
  { id: "system", label: "System" },
];

const ICON: Record<TcgFeedIcon, string> = {
  draw: "🔹",
  energy: "⚡",
  summon: "🔹",
  attack: "🔸",
  damage: "🗡",
  heal: "💚",
  death: "💀",
  ability: "✨",
  shield: "🛡",
  buff: "⬆",
  debuff: "⬇",
  phase: "◇",
  victory: "★",
  system: "·",
  card: "🃏",
  rest: "💤",
};

type RawEvent = {
  type: string;
  actorId: string;
  payload: Record<string, unknown>;
};

export function BattleEventFeed({
  events,
  yourSideId,
  sideNames,
  matchStatus,
  onHighlight,
  className,
  compact = false,
  collapsed = false,
  onToggleCollapsed,
  autoHidden = false,
  widthPx,
  onResizeWidth,
}: {
  events: RawEvent[];
  yourSideId: string;
  sideNames?: Record<string, string>;
  matchStatus?: "ACTIVE" | "COMPLETED";
  onHighlight?: (instanceIds: string[]) => void;
  className?: string;
  /** Tighter typography + filters for Battle Mode side rail. */
  compact?: boolean;
  /** User-collapsed rail (icons / title only). */
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  /** Fade during combat VFX; expands on hover. */
  autoHidden?: boolean;
  /** Optional fixed width for the feed column (resizable). */
  widthPx?: number;
  onResizeWidth?: (px: number) => void;
}) {
  const [filter, setFilter] = useState<TcgFeedFilter>("all");
  const [devMode, setDevMode] = useState(false);
  const [expandedCombat, setExpandedCombat] = useState<Record<string, boolean>>(
    {},
  );
  const [hoverReveal, setHoverReveal] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);
  const resizeStart = useRef<{ x: number; w: number } | null>(null);

  const feed = useMemo(
    () =>
      buildBattleFeedNewestFirst(events, {
        yourSideId,
        sideNames,
      }),
    [events, yourSideId, sideNames],
  );

  const visible = useMemo(
    () => filterFeedLines(feed, filter),
    [feed, filter],
  );

  const summary = useMemo(
    () => computeMatchFeedSummary(events, yourSideId),
    [events, yourSideId],
  );

  // Auto-scroll to newest (top) when events grow.
  useEffect(() => {
    if (events.length > prevLenRef.current && scrollerRef.current) {
      scrollerRef.current.scrollTop = 0;
    }
    prevLenRef.current = events.length;
  }, [events.length]);

  // Dev mode: ?battleDev=1 or localStorage riftwilds.battleDev
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.get("battleDev") === "1" || q.get("dev") === "1") {
        setDevMode(true);
        return;
      }
      if (window.localStorage.getItem("riftwilds.battleDev") === "1") {
        setDevMode(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const toggleDev = () => {
    setDevMode((v) => {
      const next = !v;
      try {
        window.localStorage.setItem(
          "riftwilds.battleDev",
          next ? "1" : "0",
        );
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const onResizePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!onResizeWidth || widthPx == null) return;
    e.preventDefault();
    resizeStart.current = { x: e.clientX, w: widthPx };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onResizePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!resizeStart.current || !onResizeWidth) return;
    // Dragging the left grip: moving left grows the feed.
    const delta = resizeStart.current.x - e.clientX;
    onResizeWidth(
      Math.max(140, Math.min(420, resizeStart.current.w + delta)),
    );
  };

  const onResizePointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    resizeStart.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const effectivelyCollapsed =
    collapsed || (autoHidden && !hoverReveal);

  return (
    <div
      className={cn(
        "battle-feed",
        compact && "battle-feed--compact",
        effectivelyCollapsed && "battle-feed--collapsed",
        autoHidden && "battle-feed--auto-hide",
        hoverReveal && autoHidden && "battle-feed--hover-reveal",
        className,
      )}
      data-testid="battle-event-feed"
      style={
        widthPx != null && !effectivelyCollapsed
          ? ({ ["--battle-feed-width" as string]: `${widthPx}px` } as CSSProperties)
          : undefined
      }
      onMouseEnter={() => setHoverReveal(true)}
      onMouseLeave={() => setHoverReveal(false)}
    >
      {onResizeWidth ? (
        <button
          type="button"
          className="battle-feed__resize focus-ring"
          aria-label="Resize event feed"
          title="Drag to resize"
          onPointerDown={onResizePointerDown}
          onPointerMove={onResizePointerMove}
          onPointerUp={onResizePointerUp}
        >
          <GripVertical className="h-3.5 w-3.5" aria-hidden />
        </button>
      ) : null}

      <div className="battle-feed__header">
        <p className="battle-console__panel-title battle-feed__title">
          Event Feed
        </p>
        <div className="battle-feed__header-actions">
          {onToggleCollapsed ? (
            <button
              type="button"
              className="battle-feed__collapse focus-ring"
              onClick={onToggleCollapsed}
              aria-pressed={collapsed}
              title={collapsed ? "Expand event feed" : "Collapse event feed"}
            >
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  !collapsed && "rotate-180",
                )}
                aria-hidden
              />
              <span className="sr-only">
                {collapsed ? "Expand" : "Collapse"} event feed
              </span>
            </button>
          ) : null}
          <button
            type="button"
            className={cn(
              "battle-feed__dev-toggle",
              devMode && "battle-feed__dev-toggle--on",
            )}
            onClick={toggleDev}
            title="Show raw engine events (developer)"
            aria-pressed={devMode}
          >
            Dev
          </button>
        </div>
      </div>

      {!effectivelyCollapsed ? (
        <>
          <div
            className="battle-feed__filters"
            role="tablist"
            aria-label="Event filters"
          >
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={cn(
                  "battle-feed__filter",
                  filter === f.id && "battle-feed__filter--active",
                )}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="battle-console__panel-body battle-feed__body">
            <div
              ref={scrollerRef}
              className="battle-feed__scroll"
              role="log"
              aria-live="polite"
              aria-relevant="additions"
            >
              {matchStatus === "COMPLETED" ? (
                <MatchSummaryCard summary={summary} yourSideId={yourSideId} />
              ) : null}

              {visible.length === 0 ? (
                <div className="battle-feed__empty">No clashes yet…</div>
              ) : (
                visible.map((row, idx) => (
                  <FeedRow
                    key={row.id}
                    row={row}
                    newest={idx === 0}
                    expanded={Boolean(expandedCombat[row.id])}
                    onToggleExpand={() =>
                      setExpandedCombat((m) => ({
                        ...m,
                        [row.id]: !m[row.id],
                      }))
                    }
                    onActivate={() => {
                      if (row.highlightIds?.length) {
                        onHighlight?.(row.highlightIds);
                      }
                    }}
                  />
                ))
              )}
            </div>

            {devMode ? (
              <div
                className="battle-feed__dev"
                data-testid="battle-event-feed-dev"
              >
                <p className="battle-feed__dev-title">Engine console</p>
                <div className="battle-feed__dev-list">
                  {[...events].reverse().map((e, i) => (
                    <div
                      key={`dev-${String(e.payload?.seq ?? i)}-${e.type}`}
                      className="battle-feed__dev-line"
                      title={JSON.stringify(e.payload)}
                    >
                      {formatDevEventLine(e)}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <p className="battle-feed__collapsed-hint">Feed · hover to peek</p>
      )}
    </div>
  );
}

function MatchSummaryCard({
  summary,
  yourSideId,
}: {
  summary: MatchFeedSummary;
  yourSideId: string;
}) {
  const result =
    summary.winnerId == null
      ? "Draw"
      : summary.winnerId === yourSideId
        ? "Victory"
        : "Defeat";
  return (
    <div className="battle-feed__summary" data-testid="battle-feed-summary">
      <p className="battle-feed__summary-title">Match summary · {result}</p>
      <ul className="battle-feed__summary-grid">
        <li>
          <span>Turns</span>
          <strong>{summary.turns}</strong>
        </li>
        <li>
          <span>Damage dealt</span>
          <strong>{summary.damageDealt}</strong>
        </li>
        <li>
          <span>Damage taken</span>
          <strong>{summary.damageTaken}</strong>
        </li>
        <li>
          <span>Healing</span>
          <strong>{summary.healing}</strong>
        </li>
        <li>
          <span>Cards played</span>
          <strong>{summary.cardsPlayed}</strong>
        </li>
        <li>
          <span>Companions lost</span>
          <strong>{summary.companionsLost}</strong>
        </li>
        <li>
          <span>Abilities</span>
          <strong>{summary.abilitiesFired}</strong>
        </li>
      </ul>
    </div>
  );
}

function FeedRow({
  row,
  newest,
  expanded,
  onToggleExpand,
  onActivate,
}: {
  row: FeedLine;
  newest: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onActivate: () => void;
}) {
  if (row.kind === "divider") {
    return (
      <div className="battle-feed__divider" role="separator">
        <span>──────── {row.text} ────────</span>
      </div>
    );
  }

  if (row.kind === "phase") {
    return (
      <div
        className={cn(
          "battle-feed__phase",
          row.yours && "battle-feed__phase--you",
        )}
      >
        {row.text}
      </div>
    );
  }

  if (row.kind === "combat-block" && row.children && row.children.length > 1) {
    return (
      <div
        className={cn(
          "battle-feed__block",
          newest && "battle-feed__row--newest",
          row.flash === "damage" && "battle-feed__row--flash-damage",
        )}
      >
        <button
          type="button"
          className="battle-feed__row battle-feed__row--clickable"
          title={row.tooltip}
          onClick={() => {
            onActivate();
            onToggleExpand();
          }}
        >
          <FeedIcon icon={row.icon} />
          <span className={toneClass(row)}>{row.text}</span>
          <span className="battle-feed__chevron" aria-hidden>
            {expanded ? "▾" : "▸"}
          </span>
        </button>
        {expanded
          ? row.children.map((c) => (
              <button
                key={c.id}
                type="button"
                className={cn(
                  "battle-feed__row battle-feed__row--child",
                  flashClass(c),
                  "battle-feed__row--clickable",
                )}
                title={c.tooltip}
                onClick={onActivate}
              >
                <FeedIcon icon={c.icon} />
                <span className={toneClass(c)}>{c.text}</span>
              </button>
            ))
          : (
              <div className="battle-feed__collapsed">
                {row.children.slice(1).map((c) => (
                  <span key={c.id} className={toneClass(c)}>
                    {ICON[c.icon]} {c.text}
                  </span>
                ))}
              </div>
            )}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "battle-feed__row",
        row.highlightIds?.length && "battle-feed__row--clickable",
        newest && "battle-feed__row--newest",
        flashClass(row),
      )}
      title={row.tooltip}
      onClick={() => {
        if (row.highlightIds?.length) onActivate();
      }}
    >
      <FeedIcon icon={row.icon} />
      <span className={toneClass(row)}>{row.text}</span>
    </button>
  );
}

function FeedIcon({ icon }: { icon: TcgFeedIcon }) {
  return (
    <span className="battle-feed__icon" aria-hidden>
      {ICON[icon]}
    </span>
  );
}

function toneClass(row: FeedLine): string {
  return cn(
    "battle-feed__text",
    row.tone === "you" && "battle-feed__text--you",
    row.tone === "foe" && "battle-feed__text--foe",
    row.tone === "damage" && "battle-feed__text--damage",
    row.tone === "heal" && "battle-feed__text--heal",
    row.tone === "energy" && "battle-feed__text--energy",
    row.tone === "death" && "battle-feed__text--death",
    row.tone === "system" && "battle-feed__text--system",
    row.tone === "phase" && "battle-feed__text--phase",
  );
}

function flashClass(row: FeedLine): string | false {
  if (row.flash === "damage") return "battle-feed__row--flash-damage";
  if (row.flash === "heal") return "battle-feed__row--flash-heal";
  if (row.flash === "energy") return "battle-feed__row--flash-energy";
  if (row.flash === "newest") return "battle-feed__row--newest";
  return false;
}

/** @internal exported for tests */
export function __feedIconMap(): Record<TcgFeedIcon, string> {
  return ICON;
}
