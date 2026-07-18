import { z } from "zod";

export const FEEDBACK_CATEGORIES = [
  "gameplay",
  "ui",
  "art",
  "comics",
  "housing",
  "economy",
  "other",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const BUG_SEVERITIES = ["low", "medium", "high", "critical"] as const;

export type BugSeverity = (typeof BUG_SEVERITIES)[number];

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  gameplay: "Gameplay",
  ui: "UI / UX",
  art: "Art / visuals",
  comics: "Comics / story",
  housing: "Housing / homestead",
  economy: "Economy / shop",
  other: "Other",
};

export const BUG_SEVERITY_LABELS: Record<BugSeverity, string> = {
  low: "Low — minor annoyance",
  medium: "Medium — workaround exists",
  high: "High — blocks a feature",
  critical: "Critical — crash / data loss",
};

const optionalEmail = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().trim().email("That doesn’t look like a valid email.").max(254).optional(),
);

const optionalText = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(max).optional(),
  );

const honeypot = z.preprocess(
  (v) => (v == null ? "" : String(v)),
  z.string().max(200),
);

export const bugReportSchema = z.object({
  kind: z.literal("bug"),
  title: z.string().trim().min(3, "Give the bug a short title.").max(120),
  whatHappened: z
    .string()
    .trim()
    .min(10, "Describe what happened (at least a sentence).")
    .max(4000),
  stepsToReproduce: z
    .string()
    .trim()
    .min(5, "List steps so we can try to reproduce it.")
    .max(4000),
  expected: z.string().trim().min(3, "What did you expect?").max(2000),
  actual: z.string().trim().min(3, "What actually happened?").max(2000),
  browserDevice: optionalText(240),
  severity: z.enum(BUG_SEVERITIES),
  screenshotNote: optionalText(1000),
  email: optionalEmail,
  pageUrl: optionalText(500),
  website: honeypot,
  source: optionalText(80),
});

export const ideaFeedbackSchema = z.object({
  kind: z.literal("feedback"),
  category: z.enum(FEEDBACK_CATEGORIES),
  message: z
    .string()
    .trim()
    .min(10, "Share a bit more detail (at least a sentence).")
    .max(4000),
  email: optionalEmail,
  pageUrl: optionalText(500),
  website: honeypot,
  source: optionalText(80),
});

export const feedbackSubmissionSchema = z.discriminatedUnion("kind", [
  bugReportSchema,
  ideaFeedbackSchema,
]);

export type BugReportInput = z.infer<typeof bugReportSchema>;
export type IdeaFeedbackInput = z.infer<typeof ideaFeedbackSchema>;
export type FeedbackSubmissionInput = z.infer<typeof feedbackSubmissionSchema>;

/** Client/server shared parse — returns field errors for forms. */
export function parseFeedbackSubmission(raw: unknown):
  | { ok: true; data: FeedbackSubmissionInput; honeypotFilled: boolean }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> } {
  const result = feedbackSubmissionSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[]>;
    const first =
      Object.values(fieldErrors).flat()[0] ??
      result.error.issues[0]?.message ??
      "Check the form and try again.";
    return { ok: false, message: first, fieldErrors };
  }
  const honeypotFilled = Boolean(result.data.website && result.data.website.length > 0);
  return { ok: true, data: result.data, honeypotFilled };
}
