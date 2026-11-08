"use client";

import { QUESTIONS } from "@/lib/questions";

export function ProgressRail({
  index,
  answeredCount,
  onJump,
}: {
  index: number;
  answeredCount: number;
  onJump: (i: number) => void;
}) {
  return (
    <nav className="progress-rail" aria-label="Survey progress">
      <div className="progress-caption">
        <span>
          Your check-in{" "}
          <span className="sr-only">
            {answeredCount} {answeredCount === 1 ? "question" : "questions"}{" "}
            answered.
          </span>
        </span>
        <span>
          <strong>{String(index + 1).padStart(2, "0")}</strong> /{" "}
          {String(QUESTIONS.length).padStart(2, "0")}
        </span>
      </div>
      <div className="progress-segments">
        {QUESTIONS.map((q, i) => (
          <button
            key={q.id}
            type="button"
            disabled={i > index}
            onClick={() => onJump(i)}
            aria-current={i === index ? "step" : undefined}
            aria-label={`Question ${i + 1}: ${q.title}${i < index ? ", revisit" : i === index ? ", current" : ""}`}
            data-complete={i < index}
          >
            <span />
          </button>
        ))}
      </div>
      <div className="progress-phases" aria-hidden="true">
        <span data-active={index < 2}>01 Notice</span>
        <span data-active={index >= 2 && index < 4}>02 Reflect</span>
        <span data-active={index >= 4}>03 Care</span>
      </div>
    </nav>
  );
}
