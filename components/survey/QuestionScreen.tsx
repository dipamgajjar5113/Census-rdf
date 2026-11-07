"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressRail } from "./ProgressRail";
import { ScaleInput } from "./inputs/ScaleInput";
import { MultiInput } from "./inputs/MultiInput";
import { SingleInput } from "./inputs/SingleInput";
import { TextInput } from "./inputs/TextInput";
import { QUESTIONS } from "@/lib/questions";
import type { Answer, Question } from "@/lib/types";

interface Props {
  index: number;
  direction: 1 | -1;
  answers: Answer;
  answeredCount: number;
  onAnswer: (q: Question, value: string | string[]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onJump: (i: number) => void;
}

function hasAnswer(q: Question, answers: Answer): boolean {
  const v = answers[q.id];
  if (q.id === "sources") return Array.isArray(v) && v.length > 0;
  return v != null && v !== "";
}

export function QuestionScreen({
  index,
  direction,
  answers,
  answeredCount,
  onAnswer,
  onNext,
  onBack,
  onSkip,
  onJump,
}: Props) {
  const reduced = useReducedMotion() ?? false;
  const q = QUESTIONS[index];
  const answered = hasAnswer(q, answers);
  const isLast = index === QUESTIONS.length - 1;

  // Enter advances when an answer exists.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && answered) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== "TEXTAREA") {
          e.preventDefault();
          onNext();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answered, onNext]);

  const dist = reduced ? 0 : 32;
  const hidden = reduced ? 1 : 0; // reduced motion: never fade content out
  const variants = {
    enter: (dir: number) => ({ opacity: hidden, y: dir > 0 ? dist : -dist }),
    center: { opacity: 1, y: 0 },
    exit: (dir: number) => ({ opacity: hidden, y: dir > 0 ? -dist : dist }),
  };

  return (
    // Fixed full-height column: progress (top) · stage (middle, fixed envelope) · nav (bottom).
    // Nothing in the top or bottom zones moves between questions.
    <div className="mx-auto flex h-[100dvh] w-full max-w-xl flex-col px-6 pt-48 pb-5 sm:pt-52 sm:pb-7">
      <div className="mb-6 shrink-0">
        <ProgressRail index={index} answeredCount={answeredCount} onJump={onJump} />
      </div>

      {/* The stage has a consistent height; content is top-aligned so the prompt
          sits in the same place every question. Long content scrolls INSIDE
          the stage — it never pushes the nav bar. */}
      <div className="relative min-h-0 flex-1">
        <div className="scroll-fade h-full overflow-y-auto overflow-x-hidden pr-1">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={q.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="pb-2"
            >
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                {q.title}
              </p>
              <h2 className="font-serif text-[1.6rem] leading-snug tracking-tight text-fg sm:text-[2rem]">
                {q.prompt}
              </h2>
              {q.help && <p className="mt-2 text-sm text-muted-fg">{q.help}</p>}

              <div className="mt-6">
                {q.type === "scale" && (
                  <ScaleInput
                    question={q}
                    value={answers.stress}
                    onChange={(v) => onAnswer(q, v)}
                  />
                )}
                {q.type === "multi" && (
                  <MultiInput
                    question={q}
                    value={answers.sources}
                    onChange={(v) => onAnswer(q, v)}
                  />
                )}
                {q.type === "single" && (
                  <SingleInput
                    question={q}
                    value={answers[q.id] as string | null}
                    onChange={(v) => onAnswer(q, v)}
                  />
                )}
                {q.type === "text" && (
                  <TextInput
                    question={q}
                    value={answers.goal}
                    onChange={(v) => onAnswer(q, v)}
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Nav — fixed slot. Skip keeps its space (visibility toggles) so the row never reflows. */}
      <div className="mt-5 flex shrink-0 items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={index === 0}
          className="shrink-0"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            aria-hidden={answered}
            tabIndex={answered ? -1 : 0}
            className={answered ? "pointer-events-none opacity-0" : ""}
          >
            <SkipForward size={16} aria-hidden="true" /> Skip
          </Button>
          <Button
            variant={isLast ? "accent" : "primary"}
            size="md"
            onClick={onNext}
          >
            {isLast ? "Finish" : answered ? "Next" : "Continue"}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
