// ---- Core domain types (per core.md) ----

export type QuestionType = "scale" | "multi" | "single" | "text";

export interface Option {
  value: string;
  label: string;
  /** Optional practical "how to" tip (coping strategies). */
  howto?: string;
}

export interface Question {
  id: QuestionId;
  type: QuestionType;
  /** Short title shown in progress / dashboard. */
  title: string;
  /** The spoken-voice prompt. */
  prompt: string;
  /** Optional supporting line under the prompt. */
  help?: string;
  options?: Option[];
  /** For multi-select. */
  maxChoices?: number;
  /** Values that clear all others when chosen (exclusive). */
  exclusiveValues?: string[];
  /** For quiz questions — the correct value. */
  correct?: string;
  /** Teaching explanation shown after a quiz answer. */
  explain?: string;
  /** For text questions. */
  maxLength?: number;
  placeholder?: string;
}

export type QuestionId =
  | "stress"
  | "sources"
  | "stressor"
  | "signs"
  | "coping"
  | "goal";

/** One participant's answers. Any field null = skipped. */
export interface Answer {
  stress: string | null;
  sources: string[] | null;
  stressor: string | null;
  signs: string | null;
  coping: string | null;
  goal: string | null;
}

/** The record stored per visit. */
export interface CheckinRecord extends Answer {
  id: string;
  v: 2;
  day: string; // YYYY-MM-DD, local en-CA
}

// ---- Summary / aggregate types ----
export interface QuestionSummary {
  counts: Record<string, number>;
  skipped: number;
  answered: number;
}

export interface Summary {
  total: number;
  goals: number;
  questions: Partial<Record<QuestionId, QuestionSummary>>;
  updatedAt?: string;
}

export type SyncStatus = "ok" | "pending" | "offline" | "busy" | "error";
export type SurveyView = "welcome" | "question" | "thanks";

/** Color/energy state the companion (Lumen) reflects. */
export type LumenMood = "calm" | "warm" | "stressed" | "bloom" | "celebrate";

/**
 * Lumen's inner state — "a living light that listens".
 * Drives the eyes, brows, smile, posture, and the pearl's color/energy.
 */
export type LumenExpression =
  | "calm" // at rest, softly attentive
  | "warm" // leaning in, caring
  | "tender" // eye half-closed, holding space for heavy feeling
  | "curious" // looking up, reflecting
  | "content" // gentle happy, eye curved
  | "radiant"; // completion glow

/** One-shot body reaction. */
export type LumenReaction =
  | "squeeze" // squishy poke on tap
  | "nod" // soft acknowledging dip
  | "soften" // squish inward, empathy
  | "bloom" // warm expansion of light
  | "none";
