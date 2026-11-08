"use client";

import { useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Footprints,
  Flower2,
  Lightbulb,
  MessagesSquare,
  Moon,
  Wind,
} from "lucide-react";
import type { Question } from "@/lib/types";

const COPING_ICONS: Record<string, typeof Wind> = {
  breathing: Wind,
  movement: Footprints,
  connect: MessagesSquare,
  rest: Moon,
  ground: Flower2,
};

export function SingleInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string | null;
  onChange: (v: string) => void;
}) {
  const name = useId();
  const reduced = useReducedMotion() ?? false;
  const selected = question.options!.find((option) => option.value === value);
  const note =
    question.correct && selected ? question.explain : selected?.howto;
  return (
    <div>
      <fieldset
        className="choice-list"
        aria-describedby={`help-${question.id}`}
      >
        <legend className="sr-only">{question.prompt}</legend>
        {question.options!.map((option) => {
          const Icon = COPING_ICONS[option.value];
          return (
            <label
              key={option.value}
              className="choice-option"
              data-selected={value === option.value}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
              />
              {Icon && (
                <span className="choice-icon">
                  <Icon size={20} strokeWidth={1.4} />
                </span>
              )}
              <span>{option.label}</span>
              <span className="choice-radio" aria-hidden="true" />
            </label>
          );
        })}
      </fieldset>
      <AnimatePresence mode="wait">
        {note && (
          <motion.div
            key={question.correct ? "reflection" : selected?.value}
            initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: reduced ? 1 : 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            className="reflection-note"
            role="status"
          >
            <Lightbulb size={19} strokeWidth={1.5} />
            <div>
              {question.correct && <strong>A little perspective</strong>}
              <p>{note}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
