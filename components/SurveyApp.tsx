"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WelcomeScreen } from "./survey/WelcomeScreen";
import { QuestionScreen } from "./survey/QuestionScreen";
import { ThanksScreen } from "./survey/ThanksScreen";
import { useLumen } from "./lumen/LumenProvider";
import { QUESTIONS } from "@/lib/questions";
import { enqueue, flushQueue } from "@/lib/queue";
import {
  reactionForAnswer,
  restingBeatFor,
  WELCOME_BEAT,
  THANKS_BEAT,
} from "@/lib/lumen-reactions";
import type {
  Answer,
  CheckinRecord,
  Question,
  SurveyView,
  SyncStatus,
} from "@/lib/types";

const EMPTY: Answer = {
  stress: null,
  sources: null,
  stressor: null,
  signs: null,
  coping: null,
  goal: null,
};

export function SurveyApp() {
  const lumen = useLumen();
  const [view, setView] = useState<SurveyView>("welcome");
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [answers, setAnswers] = useState<Answer>(EMPTY);
  const [status, setStatus] = useState<SyncStatus>("busy");
  const visitId = useRef<string>("");

  // one anonymous id per session + Lumen's first hello
  useEffect(() => {
    visitId.current =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const t = window.setTimeout(() => lumen.express(WELCOME_BEAT), 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const answeredCount = useMemo(
    () =>
      QUESTIONS.filter((q) => {
        const v = answers[q.id];
        return q.id === "sources"
          ? Array.isArray(v) && v.length > 0
          : v != null && v !== "";
      }).length,
    [answers]
  );

  // Drive Lumen's progress as the user moves through.
  useEffect(() => {
    lumen.setStage(view);
    if (view === "question") {
      lumen.setProgress(index / (QUESTIONS.length - 1));
    } else if (view === "thanks") {
      lumen.setProgress(1);
    } else {
      lumen.setProgress(0);
    }
  }, [index, view, lumen.setProgress, lumen.setStage]);

  // When the viewed question changes, Lumen settles into a resting expression
  // for that question (thinking on quizzes, gently worried if stress was high).
  const lastRestKey = useRef<string>("");
  useEffect(() => {
    if (view !== "question") return;
    const q = QUESTIONS[index];
    const key = `${index}`;
    if (lastRestKey.current === key) return;
    lastRestKey.current = key;
    const beat = restingBeatFor(q, answers);
    lumen.express(beat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, view]);

  const handleAnswer = useCallback(
    (q: Question, value: string | string[]) => {
      const next = { ...answers, [q.id]: value } as Answer;
      setAnswers(next);
      lumen.express(reactionForAnswer(q, value, next, index));
    },
    [answers, index, lumen.express]
  );

  const doSync = useCallback(async () => {
    setStatus("busy");
    const result = await flushQueue();
    setStatus(result);
  }, []);

  const submit = useCallback(async () => {
    const record: CheckinRecord = {
      id: visitId.current,
      v: 2,
      day: new Date().toLocaleDateString("en-CA"),
      ...answers,
    };
    enqueue(record);
    lumen.express(THANKS_BEAT);
    setView("thanks");
    await doSync();
  }, [answers, doSync, lumen]);

  // Keep the latest submit in a ref so goNext can call it without re-binding.
  const submitRef = useRef(submit);
  submitRef.current = submit;

  const goNext = useCallback(() => {
    if (index < QUESTIONS.length - 1) {
      setDirection(1);
      setIndex((i) => i + 1);
    } else {
      submitRef.current();
    }
  }, [index]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const skip = useCallback(() => {
    // leave the answer null and advance
    goNext();
  }, [goNext]);

  const jump = useCallback((i: number) => {
    setDirection(i < index ? -1 : 1);
    setIndex(i);
  }, [index]);

  // Re-sync on reconnect.
  useEffect(() => {
    const online = () => doSync();
    const offline = () => setStatus("offline");
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, [doSync]);

  const restart = useCallback(() => {
    setAnswers(EMPTY);
    setIndex(0);
    setDirection(1);
    setView("welcome");
    lastRestKey.current = "";
    lumen.express({ mood: "calm", expression: "content", reaction: "squeeze", say: "Round two? I'm ready.", sayMs: 2600 });
    visitId.current =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }, [lumen]);

  return (
    <main className="relative">
      <AnimatePresence mode="wait">
        {view === "welcome" && (
          <motion.div key="welcome" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <WelcomeScreen
              onStart={() => {
                setView("question");
                setIndex(0);
                lastRestKey.current = "";
                lumen.express({ expression: "content", reaction: "squeeze", say: "Here we go — one at a time." , sayMs: 2400 });
              }}
            />
          </motion.div>
        )}

        {view === "question" && (
          <motion.div key="question" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <QuestionScreen
              index={index}
              direction={direction}
              answers={answers}
              answeredCount={answeredCount}
              onAnswer={handleAnswer}
              onNext={goNext}
              onBack={goBack}
              onSkip={skip}
              onJump={jump}
            />
          </motion.div>
        )}

        {view === "thanks" && (
          <motion.div key="thanks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <ThanksScreen
              answers={answers}
              status={status}
              onRetry={doSync}
              onRestart={restart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
