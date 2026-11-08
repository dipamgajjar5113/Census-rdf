import type { Question } from "./types";

/**
 * The fixed 6-question stress check-in.
 * Part survey (how are you doing), part mini-lesson (two quiz questions).
 */
export const QUESTIONS: Question[] = [
  {
    id: "stress",
    type: "scale",
    title: "Stress level",
    prompt: "Over the past 7 days, how stressed have you felt?",
    help: "There's no right answer. Just notice where you are right now.",
    options: [
      { value: "1", label: "Not at all" },
      { value: "2", label: "A little" },
      { value: "3", label: "Moderately" },
      { value: "4", label: "Quite a bit" },
      { value: "5", label: "Extremely" },
      { value: "na", label: "Prefer not to answer" },
    ],
  },
  {
    id: "sources",
    type: "multi",
    title: "Sources",
    prompt: "What's been weighing on you most?",
    help: "Pick up to 3.",
    maxChoices: 3,
    exclusiveValues: ["none", "na"],
    options: [
      { value: "school", label: "School / coursework" },
      { value: "work", label: "Work or money" },
      { value: "health", label: "Health" },
      { value: "family", label: "Family" },
      { value: "relationships", label: "Relationships" },
      { value: "future", label: "The future / uncertainty" },
      { value: "none", label: "Nothing in particular" },
      { value: "na", label: "Prefer not to answer" },
    ],
  },
  {
    id: "stressor",
    type: "single",
    title: "A moment to reflect",
    prompt:
      "Someone has three deadlines this week and feels their heart racing. Which part would you call the stressor?",
    help: "There's no wrong answer — just notice what you think.",
    correct: "deadlines",
    explain:
      "The three deadlines are the stressor — the external demand. The racing heart is the stress response, your body reacting to it. Naming which is which helps you respond to the right thing.",
    options: [
      { value: "deadlines", label: "The three deadlines" },
      { value: "heart", label: "Their racing heart" },
      { value: "feeling", label: "Feeling overwhelmed" },
    ],
  },
  {
    id: "signs",
    type: "single",
    title: "A moment to reflect",
    prompt:
      "Someone has trouble sleeping and feels on edge. Do those signs on their own mean they have an anxiety disorder?",
    help: "Go with your instinct.",
    correct: "no",
    explain:
      "No. Warning signs are worth paying attention to, but signs alone aren't a diagnosis. A disorder is diagnosed by a professional looking at the whole picture over time.",
    options: [
      { value: "yes", label: "Yes, those signs prove it" },
      { value: "no", label: "No, signs alone aren't a diagnosis" },
      { value: "unsure", label: "I'm not sure" },
    ],
  },
  {
    id: "coping",
    type: "single",
    title: "Coping",
    prompt: "Which coping strategy feels most doable for you right now?",
    help: "Each one comes with a tiny way to start.",
    options: [
      {
        value: "breathing",
        label: "Slow breathing",
        howto: "Breathe in for 4, hold for 7, out for 8. Three rounds is enough to shift your body.",
      },
      {
        value: "movement",
        label: "Moving my body",
        howto: "A 10-minute walk counts. Motion changes mood faster than waiting to feel like it.",
      },
      {
        value: "connect",
        label: "Talking to someone",
        howto: "Text one person: \"rough day — can we talk later?\" Naming it out loud lightens it.",
      },
      {
        value: "rest",
        label: "Real rest",
        howto: "Pick one thing to drop today. Protecting sleep is protecting tomorrow's version of you.",
      },
      {
        value: "ground",
        label: "Grounding my senses",
        howto: "Name 5 things you see, 4 you hear, 3 you can touch. It pulls you out of spirals.",
      },
    ],
  },
  {
    id: "goal",
    type: "text",
    title: "Your goal",
    prompt: "What's one small thing you'll try this week?",
    help: "Optional, and completely anonymous. Keep it tiny and kind to yourself.",
    maxLength: 140,
    placeholder: "e.g. Walk after dinner three times…",
  },
];

/** Voluntary-participation notice. */
export const CONSENT =
  "This is voluntary and anonymous. We never collect your name, email, or the time you answered — only your answers and today's date. Skip anything you'd rather not share.";

/** Stress level → a short supportive response. */
export const STRESS_MOOD: Record<string, string> = {
  "1": "That's a steady place to be. Worth protecting.",
  "2": "A little stress is normal — you're managing it.",
  "3": "A moderate load. Checking in like this already helps.",
  "4": "That's a lot to carry. Be gentle with yourself today.",
  "5": "That's really heavy. You deserve support — this is a good first step.",
  na: "That's completely okay.",
};
