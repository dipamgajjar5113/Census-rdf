"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Incorrect password. Please try again.");
      }
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-sm flex-col items-center justify-center px-6 pt-28 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full rounded-3xl border border-border bg-card p-7 shadow-soft-lg"
      >
        <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-primary/12 text-primary">
          <Lock size={22} aria-hidden="true" />
        </div>
        <h1 className="font-serif text-2xl tracking-tight text-fg">Organizer access</h1>
        <p className="mt-1 text-sm text-muted-fg">
          The census is password-protected. Enter the organizer password to view
          aggregate results.
        </p>

        <form onSubmit={submit} className="mt-6">
          <label htmlFor="pw" className="mb-1.5 block text-sm font-medium text-fg">
            Password
          </label>
          <input
            id="pw"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "pw-error" : undefined}
            className="w-full rounded-2xl border border-border bg-bg-raised px-4 py-3 text-fg shadow-soft-inset outline-none transition focus:border-primary focus:shadow-glow"
            placeholder="••••••••"
          />
          {error && (
            <p id="pw-error" role="alert" className="mt-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="mt-5 w-full" loading={loading} disabled={!password}>
            {loading ? "Checking…" : "Unlock dashboard"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
