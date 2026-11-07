"use client";

import { useCallback, useEffect, useState } from "react";
import { LoginGate } from "@/components/dashboard/LoginGate";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { LoadingState, ErrorState } from "@/components/ui/states";
import type { CheckinRecord, Summary } from "@/lib/types";

type State =
  | { phase: "checking" }
  | { phase: "locked" }
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; records: CheckinRecord[]; summary: Summary; configured: boolean };

export default function DashboardPage() {
  const [state, setState] = useState<State>({ phase: "checking" });

  const load = useCallback(async () => {
    setState({ phase: "loading" });
    try {
      const res = await fetch("/api/admin/checkins", { cache: "no-store" });
      if (res.status === 401) {
        setState({ phase: "locked" });
        return;
      }
      if (!res.ok) {
        setState({ phase: "error", message: "Couldn't load the census data." });
        return;
      }
      const data = await res.json();
      setState({
        phase: "ready",
        records: data.records ?? [],
        summary: data.summary,
        configured: data.configured ?? true,
      });
    } catch {
      setState({ phase: "error", message: "Network error. Check your connection and retry." });
    }
  }, []);

  // On mount, probe session (a GET either returns data or 401 → locked).
  useEffect(() => {
    load();
  }, [load]);

  const logout = useCallback(async () => {
    await fetch("/api/auth", { method: "DELETE" });
    setState({ phase: "locked" });
  }, []);

  const clear = useCallback(async () => {
    await fetch("/api/admin/checkins", { method: "DELETE" });
    load();
  }, [load]);

  if (state.phase === "checking" || state.phase === "loading") {
    return <LoadingState label="Opening the census…" />;
  }
  if (state.phase === "locked") {
    return <LoginGate onSuccess={load} />;
  }
  if (state.phase === "error") {
    return <ErrorState message={state.message} onRetry={load} />;
  }

  return (
    <Dashboard
      records={state.records}
      summary={state.summary}
      configured={state.configured}
      onLogout={logout}
      onClear={clear}
    />
  );
}
