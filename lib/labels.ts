import { QUESTIONS } from "./questions";
import type { CheckinRecord, QuestionId } from "./types";

/** Resolve an option value to its human label for a given question. */
export function labelFor(qid: QuestionId, value: string): string {
  const q = QUESTIONS.find((x) => x.id === qid);
  const opt = q?.options?.find((o) => o.value === value);
  return opt?.label ?? value;
}

/** Build a CSV string of raw records with labels resolved. */
export function recordsToCsv(records: CheckinRecord[]): string {
  const header = [
    "day",
    "stress",
    "sources",
    "stressor",
    "stressor_result",
    "signs",
    "signs_result",
    "coping",
    "goal",
  ];

  const quizResult = (qid: QuestionId, v: string | null) => {
    if (!v) return "skipped";
    const q = QUESTIONS.find((x) => x.id === qid);
    return v === q?.correct ? "correct" : "incorrect";
  };

  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;

  const rows = records.map((r) => {
    const cells = [
      r.day,
      r.stress ? labelFor("stress", r.stress) : "skipped",
      r.sources && r.sources.length
        ? r.sources.map((s) => labelFor("sources", s)).join("; ")
        : "skipped",
      r.stressor ? labelFor("stressor", r.stressor) : "skipped",
      quizResult("stressor", r.stressor),
      r.signs ? labelFor("signs", r.signs) : "skipped",
      quizResult("signs", r.signs),
      r.coping ? labelFor("coping", r.coping) : "skipped",
      r.goal ?? "skipped",
    ];
    return cells.map((c) => esc(String(c))).join(",");
  });

  return [header.join(","), ...rows].join("\n");
}
