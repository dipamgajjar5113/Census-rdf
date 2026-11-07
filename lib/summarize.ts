import type { CheckinRecord, Summary, QuestionId } from "./types";

/** Which questions are counted (non-text). */
const COUNTED: QuestionId[] = ["stress", "sources", "stressor", "signs", "coping"];

/**
 * Aggregate counts-only summary. Runs server-side.
 * Multi-select counts each selected value; skipped = no valid answer.
 */
export function summarize(records: CheckinRecord[]): Summary {
  const summary: Summary = {
    total: records.length,
    goals: 0,
    questions: {},
    updatedAt: new Date().toISOString(),
  };

  for (const q of COUNTED) {
    summary.questions[q] = { counts: {}, skipped: 0, answered: 0 };
  }

  for (const rec of records) {
    for (const q of COUNTED) {
      const qs = summary.questions[q]!;
      const val = rec[q];
      if (q === "sources") {
        const arr = Array.isArray(val) ? val : null;
        if (!arr || arr.length === 0) {
          qs.skipped++;
        } else {
          qs.answered++;
          for (const v of arr) qs.counts[v] = (qs.counts[v] ?? 0) + 1;
        }
      } else {
        const v = val as string | null;
        if (!v) {
          qs.skipped++;
        } else {
          qs.answered++;
          qs.counts[v] = (qs.counts[v] ?? 0) + 1;
        }
      }
    }
    if (rec.goal && rec.goal.trim().length > 0) summary.goals++;
  }

  return summary;
}

export const MIN_CENSUS = 5;
