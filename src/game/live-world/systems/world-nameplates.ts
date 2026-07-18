/**
 * In-world hub / POI / NPC nameplate layout.
 * Distance fade + deterministic collision offsets (no random jitter).
 */

export type NameplateKind =
  | "hub"
  | "poi"
  | "portal"
  | "gateway"
  | "building"
  | "landmark"
  | "npc";

export type NameplateInput = {
  id: string;
  kind: NameplateKind;
  /** Desired label center in world space. */
  anchorX: number;
  anchorY: number;
  /** Approximate label bounds in world units (pre-zoom). */
  width: number;
  height: number;
  /** Optional base opacity multiplier (e.g. premium plaques). */
  baseAlpha?: number;
};

export type NameplateLayout = {
  id: string;
  x: number;
  y: number;
  alpha: number;
  visible: boolean;
  offsetY: number;
};

export type NameplateSolveState = {
  /** Smoothed vertical offsets keyed by id. */
  offsetY: Map<string, number>;
};

const KIND_PRIORITY: Record<NameplateKind, number> = {
  hub: 100,
  portal: 90,
  gateway: 85,
  poi: 70,
  landmark: 60,
  building: 50,
  npc: 40,
};

/** Fade bands by kind — hubs/portals stay readable farther out. */
const FADE_BANDS: Record<
  NameplateKind,
  { near: number; mid: number; far: number }
> = {
  hub: { near: 110, mid: 200, far: 300 },
  poi: { near: 95, mid: 170, far: 250 },
  portal: { near: 120, mid: 210, far: 320 },
  gateway: { near: 120, mid: 210, far: 320 },
  building: { near: 85, mid: 150, far: 220 },
  landmark: { near: 90, mid: 160, far: 240 },
  npc: { near: 72, mid: 140, far: 200 },
};

const MAX_VISIBLE = 12;
const STACK_STEP = 14;
const MAX_STACK_STEPS = 8;
const PAD = 4;
/** Soft follow so offsets don't pop frame-to-frame. */
const OFFSET_LERP = 0.28;

export function createNameplateSolveState(): NameplateSolveState {
  return { offsetY: new Map() };
}

export function nameplatePriority(kind: NameplateKind): number {
  return KIND_PRIORITY[kind];
}

export function distanceFadeAlpha(
  kind: NameplateKind,
  distance: number,
  baseAlpha = 1,
): number {
  const band = FADE_BANDS[kind];
  let t: number;
  if (distance <= band.near) t = 0.95;
  else if (distance <= band.mid) t = 0.55;
  else if (distance <= band.far) t = 0.22;
  else t = 0;
  return Math.min(1, Math.max(0, t * baseAlpha));
}

function overlaps(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return (
    Math.abs(ax - bx) * 2 < aw + bw + PAD &&
    Math.abs(ay - by) * 2 < ah + bh + PAD
  );
}

type Candidate = NameplateInput & {
  distance: number;
  alpha: number;
  priority: number;
};

/**
 * Resolve screen/world overlaps with alternating vertical stacks.
 * Closer + higher-priority labels keep their anchors; others step aside.
 */
export function solveNameplateLayout(params: {
  playerX: number;
  playerY: number;
  labels: NameplateInput[];
  state?: NameplateSolveState;
  maxVisible?: number;
}): { layouts: NameplateLayout[]; state: NameplateSolveState } {
  const state = params.state ?? createNameplateSolveState();
  const maxVisible = params.maxVisible ?? MAX_VISIBLE;

  const candidates: Candidate[] = [];
  for (const label of params.labels) {
    const dx = label.anchorX - params.playerX;
    const dy = label.anchorY - params.playerY;
    const distance = Math.hypot(dx, dy);
    const alpha = distanceFadeAlpha(label.kind, distance, label.baseAlpha ?? 1);
    if (alpha <= 0.05) continue;
    candidates.push({
      ...label,
      distance,
      alpha,
      priority: nameplatePriority(label.kind),
    });
  }

  candidates.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (a.distance !== b.distance) return a.distance - b.distance;
    return a.id.localeCompare(b.id);
  });

  const kept = candidates.slice(0, maxVisible);
  const placed: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    alpha: number;
    targetOffsetY: number;
  }[] = [];

  for (let i = 0; i < kept.length; i++) {
    const c = kept[i]!;
    let offsetY = 0;
    let placedX = c.anchorX;
    let placedY = c.anchorY;

    const collides = (x: number, y: number) =>
      placed.some((p) =>
        overlaps(x, y, c.width, c.height, p.x, p.y, p.w, p.h),
      );

    if (collides(placedX, placedY)) {
      // Deterministic fan: odd indices prefer up, even prefer down, then expand.
      const dir0 = i % 2 === 0 ? -1 : 1;
      let found = false;
      for (let step = 1; step <= MAX_STACK_STEPS && !found; step++) {
        for (const dir of [dir0, -dir0]) {
          const tryY = c.anchorY + dir * step * STACK_STEP;
          if (!collides(c.anchorX, tryY)) {
            offsetY = dir * step * STACK_STEP;
            placedY = tryY;
            found = true;
            break;
          }
        }
      }
      // Last resort: push further on the preferred side so it never sits on top.
      if (!found) {
        offsetY = dir0 * (MAX_STACK_STEPS + 1) * STACK_STEP;
        placedY = c.anchorY + offsetY;
        // Slight horizontal nudge keyed by id hash — stable, not random.
        let hash = 0;
        for (let k = 0; k < c.id.length; k++) {
          hash = (hash * 31 + c.id.charCodeAt(k)) | 0;
        }
        placedX = c.anchorX + ((hash % 5) - 2) * 10;
      }
    }

    const prev = state.offsetY.get(c.id) ?? offsetY;
    const smoothed = prev + (offsetY - prev) * OFFSET_LERP;
    state.offsetY.set(c.id, smoothed);
    const y = c.anchorY + smoothed;

    placed.push({
      id: c.id,
      x: placedX,
      y,
      w: c.width,
      h: c.height,
      alpha: c.alpha,
      targetOffsetY: smoothed,
    });
  }

  // Drop stale offset state for labels that are gone / faded out.
  const live = new Set(placed.map((p) => p.id));
  for (const key of state.offsetY.keys()) {
    if (!live.has(key)) state.offsetY.delete(key);
  }

  // Hide overflow candidates that lost the cap (still registered, just not shown).
  const layouts: NameplateLayout[] = placed.map((p) => ({
    id: p.id,
    x: p.x,
    y: p.y,
    alpha: p.alpha,
    visible: true,
    offsetY: p.targetOffsetY,
  }));

  for (const c of candidates.slice(maxVisible)) {
    layouts.push({
      id: c.id,
      x: c.anchorX,
      y: c.anchorY,
      alpha: 0,
      visible: false,
      offsetY: state.offsetY.get(c.id) ?? 0,
    });
  }

  return { layouts, state };
}

/** Classify a world object label for fade / priority. */
export function classifyWorldLabel(params: {
  type: string;
  label?: string | null;
  interactive?: boolean;
  hubLabels?: ReadonlySet<string>;
}): NameplateKind {
  const label = (params.label ?? "").trim().toLowerCase();
  if (params.hubLabels?.has(label)) return "hub";
  if (params.type === "portal") return "portal";
  if (params.type === "gateway") return "gateway";
  if (params.type === "waypoint") return "poi";
  if (params.type === "npc") return "npc";
  if (params.type === "landmark") return "landmark";
  if (params.type === "building") {
    if (params.interactive) return "hub";
    if (
      /plaza|market|inn|hatchery|guild|forge|academy|archive|camp|safe/i.test(
        params.label ?? "",
      )
    ) {
      return "hub";
    }
    return "building";
  }
  return "poi";
}
