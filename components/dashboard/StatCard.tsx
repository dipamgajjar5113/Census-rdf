"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  value,
  label,
  sub,
  delay = 0,
  accent = false,
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  sub?: string;
  delay?: number;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl border border-border bg-card p-5 shadow-soft"
    >
      <div
        className={`mb-3 grid h-10 w-10 place-items-center rounded-2xl ${
          accent ? "bg-accent/15 text-accent" : "bg-primary/12 text-primary"
        }`}
      >
        <Icon size={20} aria-hidden="true" />
      </div>
      <div className="tnum font-serif text-3xl tracking-tight text-fg">{value}</div>
      <div className="mt-0.5 text-sm font-medium text-fg">{label}</div>
      {sub && <div className="mt-1 text-xs text-muted-fg">{sub}</div>}
    </motion.div>
  );
}
