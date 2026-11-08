"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import type { Question } from "@/lib/types";

const STONE_COLORS = ["#dbe4ca", "#dee1bb", "#e9dbb8", "#e6c6ac", "#dfb6aa"];

export function ScaleInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string | null;
  onChange: (v: string) => void;
}) {
  const name = useId();
  const options = question.options!.filter((option) => option.value !== "na");
  const preferNot = question.options!.find((option) => option.value === "na");
  return (
    <fieldset
      className="feeling-input"
      aria-describedby={`help-${question.id}`}
    >
      <legend className="sr-only">{question.prompt}</legend>
      <div className="feeling-options">
        {options.map((option, i) => (
          <label
            className="feeling-option"
            key={option.value}
            data-selected={value === option.value}
          >
            <input
              className="sr-only"
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span className="feeling-number" aria-hidden="true">
              0{i + 1}
            </span>
            <svg
              viewBox="0 0 64 64"
              fill="none"
              className="feeling-face"
              aria-hidden="true"
            >
              <path
                d="M56 31c1 15-9 25-24 26C17 58 6 49 7 33 6 18 16 7 30 7c16-1 27 9 26 24Z"
                fill={STONE_COLORS[i]}
              />
              {i < 2 ? (
                <path d="M20 28q3-4 6 0m13 0q3-4 6 0" />
              ) : (
                <>
                  <path d="M23 27v3m18-3v3" />
                  <path
                    d={
                      i === 4
                        ? "m19 20 8 3m10 0 8-3"
                        : i === 3
                          ? "m20 23 6-2m12 0 6 2"
                          : ""
                    }
                  />
                </>
              )}
              <path
                d={
                  i === 0
                    ? "M24 37q8 10 16 0"
                    : i === 1
                      ? "M26 38q6 5 12 0"
                      : i === 2
                        ? "M27 39h10"
                        : i === 3
                          ? "M26 41q6-5 12 0"
                          : "M25 42q7-8 14 0"
                }
              />
            </svg>
            <span className="feeling-label">{option.label}</span>
            <span className="feeling-check" aria-hidden="true">
              {value === option.value && <Check size={12} strokeWidth={2.5} />}
            </span>
          </label>
        ))}
      </div>
      <div className="feeling-spectrum" aria-hidden="true">
        <span>A little lighter</span>
        <span>A lot to carry</span>
      </div>
      {preferNot && (
        <label
          className="prefer-option"
          data-selected={value === preferNot.value}
        >
          <input
            type="radio"
            name={name}
            value={preferNot.value}
            checked={value === preferNot.value}
            onChange={() => onChange(preferNot.value)}
          />
          {preferNot.label}
        </label>
      )}
    </fieldset>
  );
}
