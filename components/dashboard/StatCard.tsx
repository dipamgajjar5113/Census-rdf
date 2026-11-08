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
      className="stat-card"
      data-accent={accent}
    >
      <div className="stat-icon">
        <Icon size={20} aria-hidden="true" />
      </div>
      <div className="stat-value tnum">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </motion.div>
  );
}
