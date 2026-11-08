"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useMobileLayout } from "@/lib/mobile-layout";

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
  const mobile = useMobileLayout();
  const reduced = useReducedMotion() ?? false;
  const instant = mobile || reduced;
  return (
    <motion.div
      initial={instant ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: instant ? 0 : 0.45,
        delay: instant ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
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
