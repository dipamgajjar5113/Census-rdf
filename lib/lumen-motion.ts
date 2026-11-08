import type { LumenExpression, LumenReaction } from "./types";

export interface LumenPose {
  open: number;
  smile: number;
  round: number;
  tilt: number;
  brow: number;
  happy: number;
  energy: number;
  lean: number;
  leafOpen: number;
}

/** Whole-character poses, rather than color-only mood changes. */
export const LUMEN_POSES: Record<LumenExpression, LumenPose> = {
  calm: {
    open: 1,
    smile: 0.055,
    round: 0,
    tilt: -0.025,
    brow: 0.03,
    happy: 0,
    energy: 0.65,
    lean: 0,
    leafOpen: 0.15,
  },
  warm: {
    open: 0.86,
    smile: 0.105,
    round: 0,
    tilt: -0.09,
    brow: 0.13,
    happy: 0,
    energy: 0.6,
    lean: 0.06,
    leafOpen: 0.28,
  },
  tender: {
    open: 0.64,
    smile: 0.018,
    round: 0,
    tilt: 0.12,
    brow: -0.28,
    happy: 0,
    energy: 0.32,
    lean: 0.08,
    leafOpen: -0.18,
  },
  curious: {
    open: 1.12,
    smile: 0.035,
    round: 0.025,
    tilt: -0.15,
    brow: 0.26,
    happy: 0,
    energy: 0.7,
    lean: 0.03,
    leafOpen: 0.42,
  },
  content: {
    open: 0.73,
    smile: 0.105,
    round: 0,
    tilt: 0.035,
    brow: 0.06,
    happy: 0,
    energy: 0.5,
    lean: -0.025,
    leafOpen: 0.28,
  },
  radiant: {
    open: 0.8,
    smile: 0.17,
    round: 0.052,
    tilt: -0.055,
    brow: 0.1,
    happy: 1,
    energy: 0.95,
    lean: -0.04,
    leafOpen: 0.72,
  },
};

/** A short anticipation is followed by a longer, damped recovery. */
export function reactionPose(reaction: LumenReaction, age: number) {
  const t = Math.max(0, age);
  if (t > 3 || reaction === "none")
    return { squash: 0, rise: 0, nod: 0, glow: 0, wave: 0 };
  const anticipation = Math.sin(Math.min(1, t / 0.16) * Math.PI) * 0.035;
  const after = Math.max(0, t - 0.16);
  const settle = Math.sin(after * 10.5) * Math.exp(-after * 3.9);
  const bloom = Math.sin(Math.min(1, after / 1.5) * Math.PI);
  switch (reaction) {
    case "squeeze":
      return {
        squash: anticipation + settle * 0.16,
        rise: -anticipation + settle * 0.045,
        nod: settle * 0.025,
        glow: Math.exp(-after * 2.2) * 0.3,
        wave: Math.exp(-after * 1.7),
      };
    case "nod":
      return {
        squash: settle * 0.018,
        rise: -Math.sin(Math.min(1, t / 0.72) * Math.PI) * 0.045,
        nod: Math.sin(Math.min(1, t / 0.72) * Math.PI) * 0.16,
        glow: 0,
        wave: 0.2 * Math.exp(-t * 3),
      };
    case "soften":
      return {
        squash: Math.sin(Math.min(1, t / 1.65) * Math.PI) * 0.05,
        rise: -Math.sin(Math.min(1, t / 1.65) * Math.PI) * 0.055,
        nod: 0.05 * bloom,
        glow: 0.07 * bloom,
        wave: 0.25 * bloom,
      };
    case "bloom":
      return {
        squash: anticipation - bloom * 0.035,
        rise: bloom * 0.15,
        nod: -0.04 * bloom,
        glow: bloom,
        wave: Math.exp(-after * 1.1),
      };
    default:
      return { squash: 0, rise: 0, nod: 0, glow: 0, wave: 0 };
  }
}

/** No accumulating random state: expressions are repeatable and testable. */
export function blinkOpenness(age: number) {
  if (age < 0 || age > 0.24) return 1;
  // Faster closure and slower reopening give the blink a little weight.
  const phase = age < 0.075 ? age / 0.075 : 1 - (age - 0.075) / 0.165;
  return 1 - Math.sin((Math.max(0, Math.min(1, phase)) * Math.PI) / 2) * 0.97;
}
