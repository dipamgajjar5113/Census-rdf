"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Lightbulb } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Question } from "@/lib/types";

/**
 * Single-select. When `question.correct` is set it's a gentle reflection:
 * after choosing, it shares one warm teaching note — the same for everyone,
 * never pass/fail. Also surfaces coping "howto" tips.
 */
export function SingleInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string | null;
  onChange: (v: string) => void;
}) {
  const isReflection = Boolean(question.correct);
  const answered = value != null;
  const selectedOpt = question.options!.find((o) => o.value === value);
  const revealRef = useRef<HTMLDivElement>(null);

  // When an explanation/tip appears, gently bring it into view within the stage.
  useEffect(() => {
    if ((isReflection && answered) || selectedOpt?.howto) {
      const t = window.setTimeout(() => {
        revealRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 180);
      return () => window.clearTimeout(t);
    }
  }, [isReflection, answered, selectedOpt?.howto, value]);

  return (
    <div>
      <div
        role="radiogroup"
        aria-label={question.prompt}
        className="flex flex-col gap-2.5"
      >
        {question.options!.map((opt) => {
          const isSel = value === opt.value;
          // Reflection questions: after answering, gently emphasise the helpful
          // answer in accent — but NEVER mark anything "wrong". No red, no X.
          const gentleHighlight =
            isReflection && answered && opt.value === question.correct;

          return (
            <motion.button
              key={opt.value}
              role="radio"
              aria-checked={isSel}
              onClick={() => onChange(opt.value)}
              whileTap={{ scale: 0.98 }}
              className={clsx(
                "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 ease-soft-out cursor-pointer",
                isSel
                  ? "border-primary bg-primary/10 shadow-soft"
                  : gentleHighlight
                  ? "border-accent/60 bg-accent/5"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-soft"
              )}
            >
              <span
                className={clsx(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
                  isSel
                    ? "border-primary bg-primary text-on-primary"
                    : gentleHighlight
                    ? "border-accent text-accent"
                    : "border-border"
                )}
                aria-hidden="true"
              >
                {isSel && <span className="h-2.5 w-2.5 rounded-full bg-on-primary" />}
                {!isSel && gentleHighlight && <Check size={14} strokeWidth={3} />}
              </span>
              <span className="text-[0.95rem] font-medium text-fg">{opt.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Reflection insight — same warm note for everyone, never pass/fail */}
      <AnimatePresence>
        {isReflection && answered && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-3 rounded-2xl bg-muted/70 p-4 text-sm text-fg">
              <Lightbulb size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              <p className="leading-relaxed">
                <span className="font-semibold">A way to think about it — </span>
                {question.explain}
              </p>
            </div>
          </motion.div>
        )}

        {/* Coping howto tip */}
        {!isReflection && selectedOpt?.howto && (
          <motion.div
            key={selectedOpt.value}
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-3 rounded-2xl bg-accent/10 p-4 text-sm text-fg">
              <Lightbulb size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              <p className="leading-relaxed">{selectedOpt.howto}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* scroll sentinel — keeps the revealed explanation/tip in view */}
      <div ref={revealRef} aria-hidden="true" />
    </div>
  );
}
