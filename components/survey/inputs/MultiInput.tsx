"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Question } from "@/lib/types";

/**
 * Multi-select, pick up to maxChoices. Exclusive values (None / Prefer not)
 * clear the rest. Over-limit selections are blocked with a gentle shake.
 */
export function MultiInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string[] | null;
  onChange: (v: string[]) => void;
}) {
  const selected = value ?? [];
  const max = question.maxChoices ?? Infinity;
  const exclusive = new Set(question.exclusiveValues ?? []);

  const toggle = (optValue: string) => {
    const isExclusive = exclusive.has(optValue);
    if (selected.includes(optValue)) {
      onChange(selected.filter((v) => v !== optValue));
      return;
    }
    if (isExclusive) {
      onChange([optValue]); // clears everything else
      return;
    }
    // choosing a normal value clears any exclusive one
    const withoutExclusive = selected.filter((v) => !exclusive.has(v));
    if (withoutExclusive.length >= max) return; // at limit
    onChange([...withoutExclusive, optValue]);
  };

  const atLimit =
    selected.filter((v) => !exclusive.has(v)).length >= max &&
    max !== Infinity;

  return (
    <div>
      <div className="flex flex-col gap-2.5">
        {question.options!.map((opt) => {
          const isSel = selected.includes(opt.value);
          const blocked = !isSel && atLimit && !exclusive.has(opt.value);
          return (
            <motion.button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              aria-pressed={isSel}
              disabled={blocked}
              whileTap={{ scale: blocked ? 1 : 0.98 }}
              className={clsx(
                "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 ease-soft-out cursor-pointer",
                isSel
                  ? "border-primary bg-primary/10 shadow-soft"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-soft",
                blocked && "cursor-not-allowed opacity-45 hover:border-border hover:shadow-none"
              )}
            >
              <span
                className={clsx(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition-colors",
                  isSel ? "border-primary bg-primary text-on-primary" : "border-border"
                )}
                aria-hidden="true"
              >
                {isSel && <Check size={15} strokeWidth={3} />}
              </span>
              <span className="text-[0.95rem] font-medium text-fg">{opt.label}</span>
            </motion.button>
          );
        })}
      </div>
      {max !== Infinity && (
        <p className="mt-3 text-center text-xs text-muted-fg" aria-live="polite">
          {selected.filter((v) => !exclusive.has(v)).length} of {max} selected
        </p>
      )}
    </div>
  );
}
