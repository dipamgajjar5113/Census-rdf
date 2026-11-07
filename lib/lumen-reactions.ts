import type {
  Answer,
  LumenExpression,
  LumenMood,
  LumenReaction,
  Question,
} from "./types";

export interface LumenBeat {
  mood?: LumenMood;
  expression?: LumenExpression;
  reaction?: LumenReaction;
  say?: string;
  sayMs?: number;
  /** turn the in-place breathing guide on/off */
}

/**
 * How Lumen responds, emotionally, to a chosen answer.
 * Tone: warm, attentive, unhurried — a companion that listens,
 * never a cheerleader, never a judge.
 */
export function reactionForAnswer(
  q: Question,
  value: string | string[],
  answers: Answer,
  index: number
): LumenBeat {
  // Reflection questions — never right/wrong.
  if (q.correct) {
    return {
      mood: "calm",
      expression: "curious",
      reaction: "nod",
      say: pick([
        "Thanks for sitting with that.",
        "Mm. Here's a thought.",
        "I like how you think.",
      ]),
      sayMs: 3200,
    };
  }

  switch (q.id) {
    case "stress": {
      const s = value as string;
      if (s === "5")
        return {
          mood: "stressed",
          expression: "tender",
          reaction: "soften",
          say: "That's a lot to carry. I'm right here.",
          sayMs: 4200,
        };
      if (s === "4")
        return {
          mood: "warm",
          expression: "tender",
          reaction: "soften",
          say: "Thank you for being honest with me.",
        };
      if (s === "3")
        return { mood: "warm", expression: "warm", reaction: "nod", say: "A middling week. That's okay." };
      if (s === "1" || s === "2")
        return { mood: "calm", expression: "content", reaction: "bloom", say: "I'm glad you're steady." };
      return { mood: "calm", expression: "calm", reaction: "nod", say: "That's completely okay." };
    }

    case "sources": {
      const arr = value as string[];
      if (arr.includes("none"))
        return { mood: "calm", expression: "content", reaction: "nod" };
      if (arr.length >= 3)
        return { mood: "warm", expression: "tender", reaction: "soften", say: "That's a full plate." };
      return { mood: "calm", expression: "curious", reaction: "nod" };
    }

    case "coping": {
      return {
        mood: "bloom",
        expression: "content",
        reaction: "bloom",
        say: pick(["That's a lovely choice.", "A kind thing to try.", "Ooh — I like that one."]),
      };
    }

    default:
      return { mood: "calm", expression: "content", reaction: "nod" };
  }
}

/** Expression Lumen holds while viewing a question (before answering). */
export function restingBeatFor(q: Question, answers: Answer): LumenBeat {
  if (q.correct) return { mood: "calm", expression: "curious" };
  // Coping & goal are the "turning toward care" half — Lumen eases, breathing off.
  if (q.id === "coping") return { mood: "calm", expression: "warm" };
  if (q.id === "goal") return { mood: "calm", expression: "content" };
  if (answers.stress === "5") return { mood: "stressed", expression: "tender" };
  if (answers.stress === "4") return { mood: "warm", expression: "warm" };
  return { mood: "calm", expression: "calm" };
}

export const WELCOME_BEAT: LumenBeat = {
  mood: "calm",
  expression: "content",
  reaction: "squeeze",
  say: "Hi — I'm Lumen. I'll stay with you.",
  sayMs: 3800,
};

export const THANKS_BEAT: LumenBeat = {
  mood: "celebrate",
  expression: "radiant",
  reaction: "bloom",
  say: "You did it. I'm proud of you.",
  sayMs: 4400,
 
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
