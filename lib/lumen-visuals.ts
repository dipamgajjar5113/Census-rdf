import type { LumenExpression, LumenMood } from "./types";

/** Shared by the WebGL material, the stage, and the no-WebGL portrait. */
export const LUMEN_PALETTE: Record<
  LumenMood,
  { body: string; shadow: string; glow: string; blush: string }
> = {
  calm: {
    body: "#b8c99b",
    shadow: "#6e8967",
    glow: "#eef1cc",
    blush: "#dfb4a3",
  },
  warm: {
    body: "#e3ba9c",
    shadow: "#b18a6b",
    glow: "#f9e5c6",
    blush: "#d99f92",
  },
  stressed: {
    body: "#d3b1a9",
    shadow: "#a57d79",
    glow: "#f4ddd0",
    blush: "#d9968d",
  },
  bloom: {
    body: "#abcbb5",
    shadow: "#668979",
    glow: "#e3f1d0",
    blush: "#dfb6a3",
  },
  celebrate: {
    body: "#e3cf98",
    shadow: "#ab9768",
    glow: "#fff1c7",
    blush: "#e3b49a",
  },
};

export const LUMEN_PREVIEWS: {
  label: string;
  mood: LumenMood;
  expression: LumenExpression;
  line: string;
}[] = [
  {
    label: "At ease",
    mood: "calm",
    expression: "content",
    line: "Nowhere to rush. I'm here with you.",
  },
  {
    label: "Curious",
    mood: "bloom",
    expression: "curious",
    line: "A little curious about your world.",
  },
  {
    label: "Tender",
    mood: "stressed",
    expression: "tender",
    line: "Every feeling has a place here.",
  },
  {
    label: "Joyful",
    mood: "celebrate",
    expression: "radiant",
    line: "A little light looks good on you.",
  },
];
