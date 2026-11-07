"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { LumenExpression, LumenMood, LumenReaction, SurveyView } from "@/lib/types";

interface LumenState {
  stage: SurveyView;
  mood: LumenMood;
  expression: LumenExpression;
  /** 0..1 — how far through the survey, drives calming over time. */
  progress: number;
  /** increments to trigger a one-shot ripple on the orb. */
  pulse: number;
  /** increments to trigger a one-shot body reaction. */
  reactKey: number;
  reaction: LumenReaction;
  /** a short line Lumen "says"; null = quiet. */
  speech: string | null;
  speechKey: number;
}

interface Beat {
  mood?: LumenMood;
  expression?: LumenExpression;
  reaction?: LumenReaction;
  say?: string;
  sayMs?: number;
}

interface LumenApi extends LumenState {
  setStage: (stage: SurveyView) => void;
  setMood: (m: LumenMood) => void;
  setExpression: (e: LumenExpression) => void;
  setProgress: (p: number) => void;
  ripple: () => void;
  react: (r: LumenReaction) => void;
  say: (text: string, ms?: number) => void;
  /** full emotional beat in one call. */
  express: (opts: Beat) => void;
  bloom: () => void;
}

const LumenContext = createContext<LumenApi | null>(null);

export function LumenProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LumenState>({
    stage: "welcome",
    mood: "calm",
    expression: "calm",
    progress: 0,
    pulse: 0,
    reactKey: 0,
    reaction: "none",
    speech: null,
    speechKey: 0,
  });
  const prevMood = useRef<LumenMood>("calm");
  const speechTimer = useRef<number | null>(null);
  const bloomTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (speechTimer.current) window.clearTimeout(speechTimer.current);
    if (bloomTimer.current) window.clearTimeout(bloomTimer.current);
  }, []);

  const setStage = useCallback((stage: SurveyView) => {
    setState((s) => s.stage === stage ? s : { ...s, stage });
  }, []);

  const setMood = useCallback((mood: LumenMood) => {
    setState((s) => {
      prevMood.current = s.mood === "bloom" ? prevMood.current : s.mood;
      return { ...s, mood };
    });
  }, []);

  const setExpression = useCallback((expression: LumenExpression) => {
    setState((s) => ({ ...s, expression }));
  }, []);

  const setProgress = useCallback((progress: number) => {
    const next = Math.max(0, Math.min(1, progress));
    setState((s) => s.progress === next ? s : { ...s, progress: next });
  }, []);

  const ripple = useCallback(() => {
    setState((s) => ({ ...s, pulse: s.pulse + 1 }));
  }, []);

  const react = useCallback((reaction: LumenReaction) => {
    setState((s) => ({ ...s, reaction, reactKey: s.reactKey + 1 }));
  }, []);

  const say = useCallback((text: string, ms = 3200) => {
    if (speechTimer.current) window.clearTimeout(speechTimer.current);
    setState((s) => ({ ...s, speech: text, speechKey: s.speechKey + 1 }));
    speechTimer.current = window.setTimeout(() => {
      setState((s) => ({ ...s, speech: null }));
    }, ms);
  }, []);

  const express = useCallback(
    (opts: Beat) => {
      if (opts.mood) setMood(opts.mood);
      setState((s) => ({
        ...s,
        expression: opts.expression ?? s.expression,
        reaction: opts.reaction ?? s.reaction,
        reactKey: opts.reaction ? s.reactKey + 1 : s.reactKey,
      }));
      if (opts.say) say(opts.say, opts.sayMs);
    },
    [setMood, say]
  );

  const bloom = useCallback(() => {
    if (bloomTimer.current) window.clearTimeout(bloomTimer.current);
    setState((s) => {
      prevMood.current = s.mood;
      return {
        ...s,
        mood: "bloom",
        pulse: s.pulse + 1,
        reaction: "bloom",
        reactKey: s.reactKey + 1,
      };
    });
    bloomTimer.current = window.setTimeout(() => {
      setState((s) => ({ ...s, mood: prevMood.current }));
    }, 1600);
  }, []);

  const api = useMemo<LumenApi>(
    () => ({
      ...state,
      setStage,
      setMood,
      setExpression,
      setProgress,
      ripple,
      react,
      say,
      express,
      bloom,
    }),
    [state, setStage, setMood, setExpression, setProgress, ripple, react, say, express, bloom]
  );

  return <LumenContext.Provider value={api}>{children}</LumenContext.Provider>;
}

export function useLumen(): LumenApi {
  const ctx = useContext(LumenContext);
  if (!ctx) throw new Error("useLumen must be used within LumenProvider");
  return ctx;
}
