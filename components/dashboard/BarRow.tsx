"use client";

import { motion, useReducedMotion } from "framer-motion";

/** A single horizontal bar — accessible, with direct value label. */
export function BarRow({
  label,
  count,
  total,
  highlight = false,
  delay = 0,
}: {
  label: string;
  count: number;
  total: number;
  highlight?: boolean;
  delay?: number;
}) {
  const reduced = useReducedMotion() ?? false;
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-32 shrink-0 text-sm text-fg sm:w-40">{label}</div>
      <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-muted">
        <motion.div
          className={`h-full rounded-lg ${highlight ? "bg-accent" : "bg-primary"}`}
          initial={reduced ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="tnum w-20 shrink-0 text-right text-sm text-muted-fg">
        {count} · {Math.round(pct)}%
      </div>
    </div>
  );
}
