import type { LumenExpression, LumenMood } from "./types";

/** Shared by the WebGL material, the stage, and the no-WebGL portrait. */
export const LUMEN_PALETTE: Record<LumenMood, { body: string; shadow: string; glow: string; blush: string }> = {
  calm: { body: "#bca5ef", shadow: "#7563b9", glow: "#e0cfff", blush: "#f5a6c8" },
  warm: { body: "#efbaad", shadow: "#b474a3", glow: "#ffe2c8", blush: "#ed8b9f" },
  stressed: { body: "#d7a9cb", shadow: "#9768a7", glow: "#fbd6e6", blush: "#e694b7" },
  bloom: { body: "#a7dcca", shadow: "#598f9b", glow: "#d4f9dc", blush: "#e9b8c7" },
  celebrate: { body: "#f0c998", shadow: "#bd8cba", glow: "#fff0ca", blush: "#f1a7b4" },
};

export const LUMEN_PREVIEWS: {
  label: string;
  mood: LumenMood;
  expression: LumenExpression;
  line: string;
}[] = [
  { label: "At ease", mood: "calm", expression: "content", line: "Nowhere to rush. I'm here with you." },
  { label: "Curious", mood: "bloom", expression: "curious", line: "A little curious about your world." },
  { label: "Tender", mood: "stressed", expression: "tender", line: "Every feeling has a place here." },
  { label: "Joyful", mood: "celebrate", expression: "radiant", line: "A little light looks good on you." },
];
