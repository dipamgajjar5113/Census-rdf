"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  ArrowRight,
  Check,
  CloudOff,
  Leaf,
  RefreshCw,
  Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { STRESS_MOOD } from "@/lib/questions";
import { looksIdentifying } from "@/lib/identity-filter";
import type { Answer, SyncStatus } from "@/lib/types";

const SYNC_COPY: Record<SyncStatus, string> = {
  ok: "Your anonymous check-in is saved.",
  pending: "Saved on this device. Waiting to sync.",
  offline: "Saved on this device. We’ll sync when you’re online.",
  busy: "Saving your check-in…",
  error: "Saved on this device. We’ll try syncing again.",
};

export function ThanksScreen({
  answers,
  status,
  onRetry,
  onRestart,
}: {
  answers: Answer;
  status: SyncStatus;
  onRetry: () => void;
  onRestart: () => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    title.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, [reduced]);
  const moodLine = answers.stress ? STRESS_MOOD[answers.stress] : null;
  const goal =
    answers.goal && !looksIdentifying(answers.goal) ? answers.goal : null;
  return (
    <motion.section
      className="thanks-screen"
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.45 }}
      aria-labelledby="thanks-title"
    >
      <div className="thanks-seal" aria-hidden="true">
        <Sprout size={33} strokeWidth={1.25} />
        <span>A MOMENT WELL SPENT</span>
      </div>
      <p className="eyebrow">A SMALL STEP IS STILL A STEP</p>
      <h1 ref={title} id="thanks-title" tabIndex={-1} className="thanks-title">
        You made room
        <br />
        <em>for yourself.</em>
      </h1>
      <p className="thanks-description">
        Thank you for checking in. Your anonymous answers help us understand and
        care for our community.
      </p>
      {moodLine && (
        <div className="thanks-affirmation">
          <Leaf size={20} strokeWidth={1.3} />
          <p>{moodLine}</p>
        </div>
      )}
      {goal && (
        <div className="goal-keepsake">
          <p>One little intention</p>
          <blockquote>“{goal}”</blockquote>
          <span>Small is a lovely place to start.</span>
        </div>
      )}
      <div className="thanks-sync" role="status" aria-live="polite">
        {status === "offline" || status === "error" ? (
          <CloudOff size={16} />
        ) : status === "ok" ? (
          <Check size={16} />
        ) : (
          <RefreshCw
            size={16}
            className={status === "busy" ? "animate-spin" : ""}
          />
        )}
        <span>{SYNC_COPY[status]}</span>
        {(status === "error" || status === "pending") && (
          <button type="button" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
      <div className="thanks-restart">
        <p>Ready for the next person?</p>
        <Button variant="soft" onClick={onRestart}>
          Start a new check-in <ArrowRight size={16} />
        </Button>
      </div>
    </motion.section>
  );
}
