"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, CloudOff, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { STRESS_MOOD } from "@/lib/questions";
import type { Answer, SyncStatus } from "@/lib/types";

const SYNC_COPY: Record<SyncStatus, { label: string; tone: string }> = {
  ok: { label: "Saved securely", tone: "text-accent" },
  pending: { label: "Saved — syncing when online", tone: "text-primary" },
  offline: { label: "Saved on this device · offline", tone: "text-muted-fg" },
  busy: { label: "Saving…", tone: "text-muted-fg" },
  error: { label: "Saved locally · will retry", tone: "text-muted-fg" },
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

  const moodLine = answers.stress ? STRESS_MOOD[answers.stress] : null;
  const goal = answers.goal;
  const sync = SYNC_COPY[status];

  const container = {
    hidden: { opacity: 1 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div
      variants={container}
      initial={reduced ? false : "hidden"}
      animate="show"
      className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center px-6 pt-44 pb-16 text-center sm:pt-48"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
        className="relative mb-6 grid h-20 w-20 place-items-center rounded-full bg-accent text-on-accent shadow-glow"
      >
        <Check size={38} strokeWidth={3} aria-hidden="true" />
        {!reduced &&
          [...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-accent"
              initial={{ opacity: 1, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                x: Math.cos((i / 6) * Math.PI * 2) * 60,
                y: Math.sin((i / 6) * Math.PI * 2) * 60,
              }}
              transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            />
          ))}
      </motion.div>

      <motion.h1
        variants={item}
        className="font-serif text-4xl tracking-tight text-fg"
      >
        Thank you.
      </motion.h1>

      <motion.p
        variants={item}
        className="mt-3 text-base leading-relaxed text-muted-fg"
      >
        Your answers joined the community census — anonymously. Checking in is
        a real act of self-care.
      </motion.p>

      {moodLine && (
        <motion.div
          variants={item}
          className="mt-6 w-full rounded-2xl border border-border bg-card/70 p-4 text-sm text-fg backdrop-blur"
        >
          {moodLine}
        </motion.div>
      )}

      {goal && (
        <motion.div
          variants={item}
          className="mt-3 flex w-full items-start gap-3 rounded-2xl bg-primary/10 p-4 text-left text-sm text-fg"
        >
          <Sparkles size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="font-semibold">Your goal this week</p>
            <p className="mt-0.5 text-muted-fg">&ldquo;{goal}&rdquo;</p>
          </div>
        </motion.div>
      )}

      {/* sync status */}
      <div className="mt-6 flex items-center gap-2 text-sm" aria-live="polite">
        {status === "offline" || status === "error" ? (
          <CloudOff size={16} className={sync.tone} aria-hidden="true" />
        ) : (
          <span className={`h-2 w-2 rounded-full ${status === "ok" ? "bg-accent" : "bg-primary"}`} aria-hidden="true" />
        )}
        <span className={sync.tone}>{sync.label}</span>
        {(status === "error" || status === "pending") && (
          <button onClick={onRetry} className="ml-1 inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline">
            <RefreshCw size={13} aria-hidden="true" /> retry
          </button>
        )}
      </div>

      <Button variant="ghost" size="sm" onClick={onRestart} className="mt-8">
        Start a new check-in
      </Button>
    </motion.div>
  );
}
