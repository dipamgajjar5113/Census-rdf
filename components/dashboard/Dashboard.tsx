"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Users,
  Target,
  Brain,
  HeartPulse,
  Download,
  Copy,
  Trash2,
  LogOut,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/states";
import { StatCard } from "./StatCard";
import { BarRow } from "./BarRow";
import { QUESTIONS } from "@/lib/questions";
import { MIN_CENSUS } from "@/lib/summarize";
import { labelFor, recordsToCsv } from "@/lib/labels";
import type { CheckinRecord, QuestionId, Summary } from "@/lib/types";

type Tab = "census" | "details" | "goals";

const TABS: { id: Tab; label: string }[] = [
  { id: "census", label: "Census" },
  { id: "details", label: "Details" },
  { id: "goals", label: "Goals" },
];

export function Dashboard({
  records,
  summary,
  configured,
  onLogout,
  onClear,
}: {
  records: CheckinRecord[];
  summary: Summary;
  configured: boolean;
  onLogout: () => void;
  onClear: () => void;
}) {
  const [tab, setTab] = useState<Tab>("census");
  const [copied, setCopied] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const total = summary.total;
  const enough = total >= MIN_CENSUS;

  // Derived insights
  const insights = useMemo(() => {
    const q = summary.questions;
    const stressorQ = q.stressor;
    const correctStressor = stressorQ?.counts["deadlines"] ?? 0;
    const stressorAnswered = stressorQ?.answered ?? 0;
    const signsQ = q.signs;
    const correctSigns = signsQ?.counts["no"] ?? 0;
    const signsAnswered = signsQ?.answered ?? 0;

    const stress = q.stress?.counts ?? {};
    const high = (stress["4"] ?? 0) + (stress["5"] ?? 0);
    const mod = stress["3"] ?? 0;
    const low = (stress["1"] ?? 0) + (stress["2"] ?? 0);
    const stressTotal = high + mod + low;

    return {
      stressorPct: stressorAnswered ? Math.round((correctStressor / stressorAnswered) * 100) : 0,
      signsPct: signsAnswered ? Math.round((correctSigns / signsAnswered) * 100) : 0,
      highPct: stressTotal ? Math.round((high / stressTotal) * 100) : 0,
      modPct: stressTotal ? Math.round((mod / stressTotal) * 100) : 0,
      lowPct: stressTotal ? Math.round((low / stressTotal) * 100) : 0,
    };
  }, [summary]);

  const exportCsv = () => {
    const csv = recordsToCsv(records);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `community-census-${new Date().toLocaleDateString("en-CA")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCsv = async () => {
    try {
      await navigator.clipboard.writeText(recordsToCsv(records));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pt-24 pb-20 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-fg sm:text-4xl">
            The Census
          </h1>
          <p className="mt-1 text-sm text-muted-fg">
            Aggregate results across everyone who checked in — counts only, never
            individual answers.
            {summary.updatedAt && (
              <span className="ml-1 text-muted-fg/70">
                Updated {new Date(summary.updatedAt).toLocaleString()}
              </span>
            )}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut size={15} aria-hidden="true" /> Sign out
        </Button>
      </div>

      {!configured && (
        <div className="mb-6 rounded-2xl border border-border bg-muted/60 p-4 text-sm text-muted-fg">
          Supabase isn't configured on this deployment, so there are no stored
          responses to show yet. The participant survey still works fully offline.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Users} value={total} label="Check-ins" sub="total responses" delay={0} />
        <StatCard icon={Brain} value={`${insights.stressorPct}%`} label="Identified stressor" sub="quiz 1 correct" delay={0.05} accent />
        <StatCard icon={HeartPulse} value={`${insights.signsPct}%`} label="Signs ≠ diagnosis" sub="quiz 2 correct" delay={0.1} accent />
        <StatCard icon={Target} value={summary.goals} label="Goals set" sub="coping intentions" delay={0.15} />
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 rounded-2xl border border-border bg-card/60 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
            aria-pressed={tab === t.id}
          >
            {tab === t.id && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-xl bg-primary shadow-soft"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className={`relative z-10 ${tab === t.id ? "text-on-primary" : "text-muted-fg"}`}>
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "census" && (
              <CensusPanel enough={enough} total={total} insights={insights} />
            )}
            {tab === "details" && <DetailsPanel summary={summary} />}
            {tab === "goals" && <GoalsPanel records={records} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Data tools */}
      {total > 0 && (
        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <Button variant="soft" size="sm" onClick={exportCsv}>
            <Download size={15} aria-hidden="true" /> Export CSV
          </Button>
          <Button variant="soft" size="sm" onClick={copyCsv}>
            {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            {copied ? "Copied" : "Copy CSV"}
          </Button>
          <div className="ml-auto">
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-destructive">Clear all data?</span>
                <Button variant="danger" size="sm" onClick={() => { onClear(); setConfirmClear(false); }}>
                  Yes, clear
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)} className="text-destructive">
                <Trash2 size={15} aria-hidden="true" /> Clear census
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CensusPanel({
  enough,
  total,
  insights,
}: {
  enough: boolean;
  total: number;
  insights: {
    stressorPct: number;
    signsPct: number;
    highPct: number;
    modPct: number;
    lowPct: number;
  };
}) {
  if (total === 0) {
    return (
      <EmptyState
        title="No check-ins yet"
        message="As people complete the survey, the community census will appear here. Share the check-in link to get started."
      />
    );
  }
  if (!enough) {
    return (
      <EmptyState
        title={`Gathering responses — ${total} of ${MIN_CENSUS}`}
        message={`To protect anonymity in small groups, the census stays hidden until at least ${MIN_CENSUS} people have checked in. ${MIN_CENSUS - total} more to go.`}
      />
    );
  }

  const takeaways = [
    {
      text: `${insights.highPct}% reported high stress (quite a bit or extremely) over the past week.`,
      tone: insights.highPct >= 40 ? "warn" : "neutral",
    },
    {
      text: `${insights.stressorPct}% correctly distinguished the stressor from the stress response.`,
      tone: "good",
    },
    {
      text: `${insights.signsPct}% understood that warning signs alone don't equal a diagnosis.`,
      tone: "good",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-serif text-lg text-fg">Stress distribution</h2>
        <div className="mt-4 space-y-2">
          <BarRow label="High stress" count={insights.highPct} total={100} highlight={false} delay={0} />
          <BarRow label="Moderate" count={insights.modPct} total={100} delay={0.08} />
          <BarRow label="Low stress" count={insights.lowPct} total={100} highlight delay={0.16} />
        </div>
        <p className="mt-2 text-xs text-muted-fg">Shown as share of those who answered the stress question.</p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-serif text-lg text-fg">What this tells us</h2>
        <ul className="mt-3 space-y-3">
          {takeaways.map((t, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-fg">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  t.tone === "good" ? "bg-accent" : t.tone === "warn" ? "bg-destructive" : "bg-primary"
                }`}
                aria-hidden="true"
              />
              <span className="leading-relaxed">{t.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DetailsPanel({ summary }: { summary: Summary }) {
  const counted = QUESTIONS.filter((q) => q.type !== "text");
  if (summary.total === 0) {
    return <EmptyState title="Nothing to break down yet" message="Per-question results appear once responses come in." />;
  }
  return (
    <div className="space-y-5">
      {counted.map((q) => {
        const qs = summary.questions[q.id as QuestionId];
        if (!qs) return null;
        const maxCount = Math.max(1, ...Object.values(qs.counts));
        return (
          <div key={q.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-serif text-base text-fg">{q.prompt}</h3>
            </div>
            <div className="mt-4 space-y-1">
              {q.options!.map((opt, i) => (
                <BarRow
                  key={opt.value}
                  label={labelFor(q.id, opt.value)}
                  count={qs.counts[opt.value] ?? 0}
                  total={maxCount}
                  highlight={q.correct === opt.value}
                  delay={i * 0.04}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-fg">
              {qs.answered} answered · {qs.skipped} skipped
              {q.correct && <span className="ml-1 text-accent">· correct answer highlighted</span>}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function GoalsPanel({ records }: { records: CheckinRecord[] }) {
  const goals = records.map((r) => r.goal).filter((g): g is string => Boolean(g && g.trim()));
  if (goals.length === 0) {
    return <EmptyState title="No coping goals shared yet" message="Anonymous coping goals that participants choose to share will appear here." />;
  }
  return (
    <div className="columns-1 gap-4 sm:columns-2">
      {goals.map((g, i) => (
        <motion.blockquote
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.4) }}
          className="mb-4 break-inside-avoid rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-fg shadow-soft"
        >
          <span className="font-serif text-2xl leading-none text-primary/40">&ldquo;</span>
          <p className="mt-1">{g}</p>
        </motion.blockquote>
      ))}
    </div>
  );
}
