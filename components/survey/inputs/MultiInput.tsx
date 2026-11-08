"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  BriefcaseBusiness,
  Check,
  Heart,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Question } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  school: BookOpen,
  work: BriefcaseBusiness,
  health: Heart,
  family: Users,
  relationships: HeartHandshake,
  future: Sparkles,
  none: Leaf,
  na: ShieldCheck,
};

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
  const reduced = useReducedMotion() ?? false;
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
    selected.filter((v) => !exclusive.has(v)).length >= max && max !== Infinity;

  return (
    <div
      role="group"
      aria-label={question.prompt}
      aria-describedby="selection-count"
    >
      <div className="multi-options">
        {question.options!.map((opt) => {
          const isSel = selected.includes(opt.value);
          const blocked = !isSel && atLimit && !exclusive.has(opt.value);
          const Icon = ICONS[opt.value];
          return (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              aria-pressed={isSel}
              data-selected={isSel}
              disabled={blocked}
              whileTap={reduced ? undefined : { scale: blocked ? 1 : 0.98 }}
              className={clsx("multi-option", blocked && "opacity-50")}
            >
              {Icon && (
                <Icon
                  className="multi-icon"
                  size={19}
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
              )}
              <span className="text-[0.95rem] font-medium text-fg">
                {opt.label}
              </span>
              <span
                className={clsx(
                  "ml-auto grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors",
                  isSel
                    ? "border-primary bg-primary text-on-primary"
                    : "border-border",
                )}
                aria-hidden="true"
              >
                {isSel && <Check size={15} strokeWidth={3} />}
              </span>
            </motion.button>
          );
        })}
      </div>
      {max !== Infinity && (
        <p id="selection-count" className="selection-count" aria-live="polite">
          <span>
            {selected.filter((v) => !exclusive.has(v)).length} of {max} selected
          </span>
          {atLimit
            ? "Deselect one to choose another."
            : "Choose what feels true for you."}
        </p>
      )}
    </div>
  );
}
