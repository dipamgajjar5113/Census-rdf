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
    <div>
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
          aria-describedby={`${id}-help`}
          className="w-full resize-none rounded-2xl border border-border bg-card p-4 text-lg leading-relaxed text-fg shadow-soft-inset outline-none transition placeholder:text-muted-fg/60 focus:border-primary focus:shadow-glow"
        />
        <span className="tnum absolute bottom-3 right-4 text-xs text-muted-fg">
          {text.length}/{max}
        </span>
      </div>
      <p id={`${id}-help`} className="mt-2 text-xs text-muted-fg">
        {flagged ? (
          <span className="text-destructive">
            This looks like it might identify you (a name, email, or number). To
            stay anonymous, we'll leave it out — try phrasing it generally.
          </span>
        ) : (
          "Completely optional and anonymous."
        )}
      </p>
    </div>
  );
}
