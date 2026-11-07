"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { QUESTIONS } from "@/lib/questions";

/**
 * Segmented progress indicator. Completed segments fill with the accent
 * (reward), current segment pulses. Dots are clickable to jump back.
 */
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
    <div className="w-full">
      <div className="flex items-center gap-1.5" role="list" aria-label="Survey progress">
        {QUESTIONS.map((q, i) => {
          const done = i < index;
          const current = i === index;
          return (
            <button
              key={q.id}
              role="listitem"
              onClick={() => i <= index && onJump(i)}
              disabled={i > index}
              aria-label={`Question ${i + 1}: ${q.title}${done ? " (done)" : current ? " (current)" : ""}`}
              className={clsx(
                "relative h-1.5 flex-1 overflow-hidden rounded-full transition-colors",
                i <= index ? "cursor-pointer" : "cursor-default",
                done ? "bg-accent/30" : "bg-muted"
              )}
            >
              <motion.span
                className={clsx(
                  "absolute inset-y-0 left-0 rounded-full",
                  done ? "bg-accent" : "bg-primary"
                )}
                initial={false}
                animate={{ width: done ? "100%" : current ? "45%" : "0%" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-fg">
        <span className="font-medium">
          Question {index + 1} of {QUESTIONS.length}
        </span>
        <span className="tnum">{Math.round((answeredCount / QUESTIONS.length) * 100)}% answered</span>
      </div>
    </div>
  );
}
