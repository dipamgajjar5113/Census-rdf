"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Leaf,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react";
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
    <main className="organizer-access">
      <section className="access-story" aria-labelledby="access-title">
        <p className="eyebrow">
          <Leaf size={16} strokeWidth={1.4} /> THE COMMUNITY CENSUS
        </p>
        <h1 id="access-title">
          A little insight.
          <br />
          <em>A lot of care.</em>
        </h1>
        <p className="access-description">
          Every check-in is a small part of a bigger picture. See how your
          community is feeling, and help make room for what they need.
        </p>
        <div className="access-principles">
          <div>
            <ShieldCheck size={20} strokeWidth={1.4} />
            <span>
              Private by design
              <small>Anonymous answers. Shared understanding.</small>
            </span>
          </div>
          <div>
            <Users size={20} strokeWidth={1.4} />
            <span>
              A view of the whole
              <small>Community insights, thoughtfully gathered.</small>
            </span>
          </div>
        </div>
      </section>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="access-card"
      >
        <div className="access-card-heading">
          <span className="access-lock">
            <LockKeyhole size={23} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span>FOR ORGANIZERS</span>
        </div>
        <h2>Welcome back.</h2>
        <p className="access-card-description">
          Enter your organizer password to open the community census.
        </p>

        <form onSubmit={submit} className="access-form">
          <label htmlFor="pw">Organizer password</label>
          <input
            id="pw"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "pw-error" : undefined}
            className="access-password"
            placeholder="Enter your password"
            required
          />
          {error && (
            <p
              id="pw-error"
              role="alert"
              className="mt-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="access-submit"
            loading={loading}
            disabled={!password}
          >
            {loading ? "Checking…" : "Unlock dashboard"}
            {!loading && <ArrowRight size={17} strokeWidth={1.5} />}
          </Button>
        </form>
        <p className="access-privacy">
          <ShieldCheck size={15} strokeWidth={1.5} /> A protected space for
          community insights.
        </p>
      </motion.div>
    </main>
  );
}
