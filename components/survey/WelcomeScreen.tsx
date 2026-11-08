"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  Leaf,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CONSENT } from "@/lib/questions";

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div
      className="welcome-screen"
      initial={reduced ? false : "hidden"}
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
    >
      <div className="welcome-intro">
        <motion.p variants={item} className="eyebrow">
          <span /> YOUR MOMENT OF CALM
        </motion.p>
        <motion.h1 variants={item} className="welcome-title">
          Take a breath.
          <br />
          <em>Come back to you.</em>
        </motion.h1>
        <motion.p variants={item} className="welcome-description">
          You don’t have to have it all figured out. A few gentle questions to
          notice what’s on your mind, with a little company along the way.
        </motion.p>
      </div>
      <div className="welcome-details">
        <motion.div variants={item} className="welcome-action">
          <Button size="lg" onClick={onStart} className="welcome-start">
            Begin my check-in <ArrowRight size={18} strokeWidth={1.5} />
          </Button>
          <span>No sign-up. Just a moment for you.</span>
        </motion.div>
        <motion.div variants={item} className="welcome-assurances">
          <span>
            <ShieldCheck size={16} strokeWidth={1.5} /> Completely anonymous
          </span>
          <span>
            <Clock3 size={16} strokeWidth={1.5} /> About 2 minutes
          </span>
          <span>
            <Leaf size={16} strokeWidth={1.5} /> Skip any question
          </span>
        </motion.div>
        <motion.div
          variants={item}
          className="welcome-journey"
          aria-label="What to expect"
        >
          {[
            { number: "01", title: "Notice", detail: "How are you, really?" },
            { number: "02", title: "Reflect", detail: "A fresh perspective." },
            { number: "03", title: "Care", detail: "One small step." },
          ].map((step) => (
            <div key={step.number}>
              <span>{step.number}</span>
              <strong>{step.title}</strong>
              <small>{step.detail}</small>
            </div>
          ))}
        </motion.div>
        <motion.div variants={item} className="welcome-privacy">
          <details>
            <summary>
              <ShieldCheck size={15} strokeWidth={1.4} /> Your privacy, in plain
              words <ChevronDown size={14} />
            </summary>
            <p>{CONSENT}</p>
          </details>
          <p>
            <Sparkles size={13} /> A reflection, never a diagnosis.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
