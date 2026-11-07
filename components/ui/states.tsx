"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Inbox, Loader2, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "./Button";

/** Full-screen centered loading with the brand shimmer. */
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <Loader2 size={28} className="animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-fg">{label}</p>
    </div>
  );
}

/** Skeleton line. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} aria-hidden="true" />;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  offline = false,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  offline?: boolean;
}) {
  const Icon = offline ? WifiOff : AlertTriangle;
  return (
    <motion.div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
    >
      <div className="grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
        <Icon size={24} aria-hidden="true" />
      </div>
      <div>
        <h2 className="font-serif text-xl text-fg">{title}</h2>
        {message && <p className="mt-1 max-w-sm text-sm text-muted-fg">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="soft" size="sm" onClick={onRetry}>
          <RefreshCw size={16} aria-hidden="true" /> Try again
        </Button>
      )}
    </motion.div>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-fg">
        <Inbox size={24} aria-hidden="true" />
      </div>
      <div>
        <h3 className="font-serif text-lg text-fg">{title}</h3>
        {message && <p className="mt-1 max-w-sm text-sm text-muted-fg">{message}</p>}
      </div>
      {action}
    </div>
  );
}
