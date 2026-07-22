/**
 * Competitive deck / playstyle tags for Riftwilds TCG cards.
 * Orthogonal to board role (tank/assassin/…) — used by curve tools, AI, and docs.
 */

export const TCG_CURVE_TAGS = [
  "Tempo",
  "Combo",
  "Support",
  "Starter",
  "Finisher",
  "Ramp",
  "Removal",
  "Control",
  "Utility",
] as const;

export type TcgCurveTag = (typeof TCG_CURVE_TAGS)[number];

const TAG_SET = new Set<string>(TCG_CURVE_TAGS);

export function isTcgCurveTag(value: string): value is TcgCurveTag {
  return TAG_SET.has(value);
}

export function normalizeCurveTags(tags: readonly string[] | undefined): TcgCurveTag[] {
  if (!tags?.length) return [];
  const out: TcgCurveTag[] = [];
  const seen = new Set<string>();
  for (const raw of tags) {
    const t = raw.trim();
    if (!isTcgCurveTag(t) || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/** Derive curve tags when authors omit them. */
export function deriveCurveTags(input: {
  energyCost: number;
  type: string;
  rarity: string;
  attack?: number | null;
  health?: number | null;
  keywords?: readonly string[];
  rulesText?: string;
  role?: string | null;
}): TcgCurveTag[] {
  const tags = new Set<TcgCurveTag>();
  const cost = Math.max(0, input.energyCost);
  const kw = new Set((input.keywords ?? []).map((k) => k.toLowerCase()));
  const text = (input.rulesText ?? "").toLowerCase();
  const role = (input.role ?? "").toLowerCase();
  const atk = input.attack ?? 0;

  if (cost === 0 || cost === 1) tags.add("Starter");
  if (cost <= 2 && (input.type === "companion" || input.type === "creature")) {
    tags.add("Tempo");
  }
  if (cost >= 5 || atk >= 5 || role === "finisher") tags.add("Finisher");
  if (
    kw.has("draw") ||
    text.includes("draw") ||
    role === "utility" ||
    cost === 0
  ) {
    tags.add("Utility");
  }
  if (kw.has("heal") || text.includes("heal") || role === "support" || role === "healer") {
    tags.add("Support");
  }
  if (
    text.includes("deal") ||
    text.includes("destroy") ||
    kw.has("corrupt") ||
    role === "controller" ||
    role === "disruptor"
  ) {
    if (input.type === "spell" || input.type === "trap") tags.add("Removal");
  }
  if (role === "controller" || kw.has("ward") || kw.has("guardian")) {
    tags.add("Control");
  }
  if (
    text.includes("energy") ||
    kw.has("empower") ||
    role === "energy_generator" ||
    role === "ramp"
  ) {
    tags.add("Ramp");
  }
  if (text.includes("echo") || kw.has("echo") || text.includes("combo")) {
    tags.add("Combo");
  }
  if (tags.size === 0) tags.add("Utility");
  return [...tags];
}
