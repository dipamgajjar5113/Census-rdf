"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Inbox,
  Loader2,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { Button } from "./Button";

/** Full-screen centered loading with the brand shimmer. */
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-emblem">
        <Loader2 size={24} className="animate-spin" aria-hidden="true" />
      </span>
      <p>{label}</p>
      <span className="loading-caption">
        A LITTLE SPACE FOR THE BIGGER PICTURE
      </span>
    </div>
  );
}

/** Skeleton line. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`skeleton rounded-xl ${className}`} aria-hidden="true" />
  );
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
      className="error-state"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
    >
      <div className="state-icon state-icon--error">
        <Icon size={24} aria-hidden="true" />
      </div>
      <div>
        <h2>{title}</h2>
        {message && <p>{message}</p>}
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
    <div className="empty-state">
      <div className="state-icon">
        <Inbox size={24} aria-hidden="true" />
      </div>
      <div>
        <h3>{title}</h3>
        {message && <p>{message}</p>}
      </div>
      {action}
    </div>
  );
}
