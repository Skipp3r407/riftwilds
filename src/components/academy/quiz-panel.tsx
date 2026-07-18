"use client";

import { useState } from "react";
import type { AcademyQuizQuestion } from "@/game/academy/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  questions: AcademyQuizQuestion[];
  onResult: (score: number, passed: boolean) => void;
};

export function AcademyQuizPanel({ questions, onResult }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (questions.length === 0) return null;

  const correctCount = questions.filter((q) => {
    const choice = q.choices.find((c) => c.id === answers[q.id]);
    return choice?.correct;
  }).length;
  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= 70;

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-[var(--stroke)] bg-[rgba(12,14,24,0.65)] p-4">
      <p className="font-display text-xs uppercase tracking-[0.18em] text-[var(--cyan)]">
        Quiz
      </p>
      {questions.map((q) => {
        const picked = answers[q.id];
        const correct = q.choices.find((c) => c.correct);
        return (
          <fieldset key={q.id} className="space-y-2">
            <legend className="text-sm text-white">{q.prompt}</legend>
            <div className="space-y-1">
              {q.choices.map((c) => {
                const selected = picked === c.id;
                const show = submitted;
                const isRight = c.correct;
                return (
                  <label
                    key={c.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm",
                      selected
                        ? "border-[var(--cyan)]/60 bg-[rgba(61,231,255,0.1)]"
                        : "border-[var(--stroke)] hover:border-[var(--cyan)]/30",
                      show && isRight && "border-[var(--emerald,#4adf7a)]/50",
                      show && selected && !isRight && "border-[var(--coral)]/50",
                    )}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={c.id}
                      disabled={submitted}
                      checked={selected}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: c.id }))}
                      className="accent-[var(--cyan)]"
                    />
                    <span>{c.label}</span>
                  </label>
                );
              })}
            </div>
            {submitted && picked ? (
              <p className="text-xs text-[var(--text-muted)]">
                {picked === correct?.id ? q.explainCorrect : `Answer: ${correct?.label}. ${q.explainCorrect}`}
              </p>
            ) : null}
          </fieldset>
        );
      })}
      {!submitted ? (
        <button
          type="button"
          className="btn-primary focus-ring text-sm"
          disabled={Object.keys(answers).length < questions.length}
          onClick={() => {
            setSubmitted(true);
            const sc = Math.round(
              (questions.filter((q) => q.choices.find((c) => c.id === answers[q.id])?.correct)
                .length /
                questions.length) *
                100,
            );
            onResult(sc, sc >= 70);
          }}
        >
          Submit quiz
        </button>
      ) : (
        <p className="text-sm text-[var(--amber)]">
          Score {score}% — {passed ? "Passed" : "Try again after reviewing the lesson"}
        </p>
      )}
    </div>
  );
}
