"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import type { Question } from "@/lib/types";

/**
 * 5-point scale with an escape "prefer not to answer".
 * Keyboard: arrow keys move between options; the group is a radiogroup.
 */
export function ScaleInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string | null;
  onChange: (v: string) => void;
}) {
  const scale = question.options!.filter((o) => o.value !== "na");
  const na = question.options!.find((o) => o.value === "na");

  return (
    <div>
      <div
        role="radiogroup"
        aria-label={question.prompt}
        className="grid grid-cols-5 gap-2 sm:gap-3"
      >
        {scale.map((opt, i) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              role="radio"
              aria-checked={selected}
              aria-label={opt.label}
              onClick={() => onChange(opt.value)}
              className={clsx(
                "group relative flex min-h-[7rem] flex-col items-center justify-end gap-2 rounded-2xl border p-3 text-center transition-all duration-200 ease-soft-out cursor-pointer sm:min-h-[8.5rem]",
                selected
                  ? "border-primary bg-primary/10 shadow-glow"
                  : "border-border bg-card hover:-translate-y-0.5 hover:shadow-soft"
              )}
            >
              <span
                aria-hidden="true"
                className={clsx(
                  "w-full rounded-full transition-all duration-300 ease-soft-out",
                  selected ? "bg-primary" : "bg-primary/25 group-hover:bg-primary/40"
                )}
                style={{ height: `${22 + i * 16}%` }}
              />
              {selected && (
                <motion.span
                  layoutId="scale-dot"
                  className="absolute -top-2 h-3 w-3 rounded-full bg-primary shadow-glow"
                />
              )}
              <span
                className={clsx(
                  "text-xs font-medium leading-tight sm:text-sm",
                  selected ? "text-fg" : "text-muted-fg"
                )}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
      {na && (
        <button
          onClick={() => onChange(na.value)}
          className={clsx(
            "mt-4 w-full rounded-xl border px-4 py-3 text-sm transition cursor-pointer",
            value === na.value
              ? "border-primary bg-primary/10 text-fg"
              : "border-border bg-card/60 text-muted-fg hover:bg-muted"
          )}
          aria-pressed={value === na.value}
        >
          {na.label}
        </button>
      )}
    </div>
  );
}
