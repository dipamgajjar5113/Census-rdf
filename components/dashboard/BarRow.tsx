"use client";

import { motion, useReducedMotion } from "framer-motion";

/** A single horizontal bar — accessible, with direct value label. */
export function BarRow({
  label,
  count,
  total,
  highlight = false,
  delay = 0,
  percentageOnly = false,
}: {
  label: string;
  count: number;
  total: number;
  highlight?: boolean;
  delay?: number;
  percentageOnly?: boolean;
}) {
  const reduced = useReducedMotion() ?? false;
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="bar-row">
      <div className="bar-label">{label}</div>
      <div className="bar-value tnum">
        {percentageOnly ? `${count}%` : `${count} · ${Math.round(pct)}%`}
      </div>
      <div className="bar-track">
        <motion.div
          className="bar-fill"
          data-highlight={highlight}
          initial={reduced ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
