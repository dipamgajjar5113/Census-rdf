"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useRef } from "react";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
  onAnswer: (q: Question, value: string | string[]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function QuestionScreen({
  index,
  direction,
  answers,
  onAnswer,
  onNext,
  onBack,
  onSkip,
}: Props) {
  const reduced = useReducedMotion() ?? false;
  const panel = useRef<HTMLDivElement>(null);
  const q = QUESTIONS[index];
  const value = answers[q.id];
  const answered = Array.isArray(value)
    ? value.length > 0
    : value != null && value !== "";
  const isLast = index === QUESTIONS.length - 1;
  const focusHeading = useCallback(
    (heading: HTMLHeadingElement | null) => {
      if (!heading) return;
      heading.focus({ preventScroll: true });
      // Only mobile follows the document scroll. Desktop keeps its frame still.
      if (
        window.matchMedia("(max-width: 680px)").matches &&
        (index > 0 || direction < 0)
      )
        panel.current?.scrollIntoView({
          block: "start",
          behavior: reduced ? "auto" : "smooth",
        });
    },
    [index, direction, reduced],
  );

  return (
    <div className="question-panel" ref={panel}>
      <section
        className="question-paper"
        data-question={q.id}
        aria-label="Your private check-in"
      >
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={q.id}
            custom={direction}
            initial={reduced ? false : "enter"}
            animate="center"
            exit="exit"
            variants={{
              enter: (dir: number) => ({ opacity: 0, x: dir * 16 }),
              center: { opacity: 1, x: 0 },
              exit: (dir: number) => ({
                opacity: reduced ? 1 : 0,
                x: reduced ? 0 : dir * -12,
              }),
            }}
            transition={{ duration: reduced ? 0 : 0.22 }}
            className="question-body"
          >
            <div className="question-kicker">
              <span>{String(index + 1).padStart(2, "0")}</span>
              {q.title}
            </div>
            <h1 ref={focusHeading} tabIndex={-1} className="question-title">
              {q.prompt}
            </h1>
            {q.help && (
              <p className="question-help" id={`help-${q.id}`}>
                {q.help}
              </p>
            )}
            <div className="question-input">
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
        <div className="question-nav">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={index === 0}
          >
            <ArrowLeft size={16} /> <span>Back</span>
          </Button>
          <div className="question-next-actions">
            {!answered && !isLast && (
              <button type="button" onClick={onSkip} className="skip-question">
                Skip
              </button>
            )}
            <Button size="md" onClick={onNext}>
              {isLast ? "Finish check-in" : "Continue"}
              {isLast ? <Check size={17} /> : <ArrowRight size={17} />}
            </Button>
          </div>
        </div>
      </section>
      <p className="question-reassurance">
        <ShieldCheck size={14} strokeWidth={1.5} /> Your answers are anonymous.
        Every question is optional.
      </p>
    </div>
  );
}
