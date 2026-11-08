"use client";

import { useId } from "react";
import { looksIdentifying } from "@/lib/identity-filter";
import type { Question } from "@/lib/types";

export function TextInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string | null;
  onChange: (v: string) => void;
}) {
  const id = useId();
  const max = question.maxLength ?? 140;
  const text = value ?? "";
  const flagged = text.trim().length > 0 && looksIdentifying(text);

  return (
    <div className="goal-input">
      <label htmlFor={id} className="sr-only">
        {question.prompt}
      </label>
      <div className="relative">
        <textarea
          id={id}
          value={text}
          onChange={(e) => onChange(e.target.value.slice(0, max))}
          maxLength={max}
          rows={3}
          placeholder={question.placeholder}
          aria-describedby={`${id}-help ${id}-count`}
          aria-invalid={flagged}
          className="goal-textarea"
        />
        <span id={`${id}-count`} className="goal-character-count tnum">
          {text.length}/{max}
        </span>
      </div>
      <p
        id={`${id}-help`}
        className="goal-help"
        role={flagged ? "alert" : undefined}
      >
        {flagged ? (
          <span className="text-destructive">
            This looks like it might identify you (a name, email, or number). To
            stay anonymous, we'll leave it out — try phrasing it generally.
          </span>
        ) : (
          "A tiny goal is enough. Please leave out names and contact details."
        )}
      </p>
    </div>
  );
}
