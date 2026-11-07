"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Lock, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CONSENT } from "@/lib/questions";

const stagger = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div
      variants={stagger}
      initial={reduced ? false : "hidden"}
      animate="show"
      className="welcome-screen"
    >
      <motion.span
        variants={item}
        className="welcome-eyebrow"
      >
        <span aria-hidden="true" />
        A MOMENT FOR YOU
      </motion.span>

      <motion.h1
        variants={item}
        className="welcome-title"
      >
        Take a moment
        <br />
        <span>to check in.</span>
      </motion.h1>

      <motion.p
        variants={item}
        className="welcome-description"
      >
        The world can wait for two minutes. A little space to notice how
        you feel, find your footing, and take one small step toward yourself.
      </motion.p>

      <motion.div variants={item} className="welcome-action">
        <Button size="lg" onClick={onStart} className="welcome-start">
          Begin check-in
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Button>
      </motion.div>

      <motion.div
        variants={item}
        className="welcome-assurances"
      >
        {[
          { icon: ShieldCheck, label: "Anonymous" },
          { icon: Clock, label: "2 minutes" },
          { icon: Lock, label: "Your own pace" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2"
          >
            <Icon size={14} strokeWidth={1.6} aria-hidden="true" />
            <span>{label}</span>
          </div>
        ))}
      </motion.div>

      <motion.p
        variants={item}
        className="welcome-consent"
      >
        {CONSENT}
      </motion.p>
      <motion.div variants={item} className="welcome-footer">
        <span className="welcome-footer-mark" aria-hidden="true">✳</span>
        <span>Small moments. A kinder community.<small>Community Health Nursing · Health Fair</small></span>
      </motion.div>
    </motion.div>
  );
}
