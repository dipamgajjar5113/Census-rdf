"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  ChartNoAxesCombined,
  ListFilter,
  Sprout,
  Leaf,
  Info,
  LockKeyhole,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/states";
import { StatCard } from "./StatCard";
import { BarRow } from "./BarRow";
import { QUESTIONS } from "@/lib/questions";
import { MIN_CENSUS } from "@/lib/summarize";
import { labelFor, recordsToCsv } from "@/lib/labels";
import { useMobileLayout } from "@/lib/mobile-layout";
import type { CheckinRecord, QuestionId, Summary } from "@/lib/types";

type Tab = "census" | "details" | "goals";

const TABS = [
  { id: "census", label: "Overview", icon: ChartNoAxesCombined },
  { id: "details", label: "Breakdown", icon: ListFilter },
  { id: "goals", label: "Intentions", icon: Sprout },
] as const;

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
  const mobile = useMobileLayout();
  const reduced = useReducedMotion() ?? false;
  const instant = mobile || reduced;

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
      stressorPct: stressorAnswered
        ? Math.round((correctStressor / stressorAnswered) * 100)
        : 0,
      signsPct: signsAnswered
        ? Math.round((correctSigns / signsAnswered) * 100)
        : 0,
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
    <main className="dashboard-shell">
      {/* Header */}
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">
            <Leaf size={15} strokeWidth={1.4} /> THE COMMUNITY CENSUS
          </p>
          <h1>
            A picture of <em>our community.</em>
          </h1>
          <p className="dashboard-description">
            Small check-ins, shared understanding. A thoughtful view of how
            everyone is feeling.
          </p>
          {summary.updatedAt && (
            <p className="dashboard-updated">
              <span className="lumen-live-dot" />
              Updated {new Date(summary.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <Button
          variant="soft"
          size="sm"
          onClick={onLogout}
          aria-label="Sign out of the organizer dashboard"
        >
          <LogOut size={15} aria-hidden="true" /> Sign out
        </Button>
      </div>

      {!configured && (
        <div className="dashboard-notice" role="status">
          <Info size={19} strokeWidth={1.5} aria-hidden="true" />
          <p>
            Response collection isn’t connected yet. Participants can still
            complete a check-in and save their answers on this device.
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="dashboard-stats">
        <StatCard
          icon={Users}
          value={total}
          label="Check-ins"
          sub="total responses"
          delay={0}
        />
        <StatCard
          icon={Brain}
          value={`${insights.stressorPct}%`}
          label="Identified stressor"
          sub="quiz 1 correct"
          delay={0.05}
          accent
        />
        <StatCard
          icon={HeartPulse}
          value={`${insights.signsPct}%`}
          label="Signs ≠ diagnosis"
          sub="quiz 2 correct"
          delay={0.1}
          accent
        />
        <StatCard
          icon={Target}
          value={summary.goals}
          label="Goals set"
          sub="coping intentions"
          delay={0.15}
        />
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs" role="group" aria-label="Census views">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="dashboard-tab"
            aria-pressed={tab === t.id}
          >
            {tab === t.id && (
              <motion.span
                layoutId="tab-pill"
                className="dashboard-tab-pill"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="dashboard-tab-label">
              <t.icon size={17} strokeWidth={1.6} aria-hidden="true" />
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="dashboard-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={instant ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: instant ? 1 : 0, y: instant ? 0 : -8 }}
            transition={{ duration: instant ? 0 : 0.25 }}
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
        <div className="dashboard-data-tools">
          <Button variant="soft" size="sm" onClick={exportCsv}>
            <Download size={15} aria-hidden="true" /> Export CSV
          </Button>
          <Button variant="soft" size="sm" onClick={copyCsv}>
            {copied ? (
              <Check size={15} aria-hidden="true" />
            ) : (
              <Copy size={15} aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy CSV"}
          </Button>
          <div className="ml-auto">
            {confirmClear ? (
              <div className="data-clear-confirmation flex items-center gap-2">
                <span className="text-sm text-destructive">
                  Clear all data?
                </span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    onClear();
                    setConfirmClear(false);
                  }}
                >
                  Yes, clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmClear(true)}
                className="text-destructive"
              >
                <Trash2 size={15} aria-hidden="true" /> Clear census
              </Button>
            )}
          </div>
        </div>
      )}
      <footer className="dashboard-footer">
        <ShieldNotice /> Community care starts with listening.
      </footer>
    </main>
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
    <div className="census-panels">
      <section className="dashboard-panel">
        <p className="panel-eyebrow">HOW WE’RE FEELING</p>
        <h2>Stress distribution</h2>
        <div className="dashboard-chart">
          <BarRow
            label="High stress"
            count={insights.highPct}
            total={100}
            highlight={false}
            delay={0}
            percentageOnly
          />
          <BarRow
            label="Moderate"
            count={insights.modPct}
            total={100}
            delay={0.08}
            percentageOnly
          />
          <BarRow
            label="Low stress"
            count={insights.lowPct}
            total={100}
            highlight
            delay={0.16}
            percentageOnly
          />
        </div>
        <p className="panel-footnote">
          Share of participants who answered the stress question.
        </p>
      </section>

      <section className="dashboard-panel dashboard-panel--insights">
        <p className="panel-eyebrow">A LITTLE PERSPECTIVE</p>
        <h2>What this tells us</h2>
        <ul className="dashboard-takeaways">
          {takeaways.map((t, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-fg">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  t.tone === "good"
                    ? "bg-accent"
                    : t.tone === "warn"
                      ? "bg-destructive"
                      : "bg-primary"
                }`}
                aria-hidden="true"
              />
              <span className="leading-relaxed">{t.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function DetailsPanel({ summary }: { summary: Summary }) {
  const counted = QUESTIONS.filter((q) => q.type !== "text");
  if (summary.total === 0) {
    return (
      <EmptyState
        title="Nothing to break down yet"
        message="Per-question results appear once responses come in."
      />
    );
  }
  return (
    <div className="dashboard-breakdown">
      {counted.map((q) => {
        const qs = summary.questions[q.id as QuestionId];
        if (!qs) return null;
        const maxCount = Math.max(1, ...Object.values(qs.counts));
        return (
          <section key={q.id} className="dashboard-panel">
            <p className="panel-eyebrow">{q.title}</p>
            <h2>{q.prompt}</h2>
            <div className="dashboard-chart">
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
            <p className="panel-footnote">
              {qs.answered} answered · {qs.skipped} skipped
              {q.correct && (
                <span className="ml-1 text-accent">
                  · correct answer highlighted
                </span>
              )}
            </p>
          </section>
        );
      })}
    </div>
  );
}

function GoalsPanel({ records }: { records: CheckinRecord[] }) {
  const mobile = useMobileLayout();
  const reduced = useReducedMotion() ?? false;
  const instant = mobile || reduced;
  const goals = records
    .map((r) => r.goal)
    .filter((g): g is string => Boolean(g && g.trim()));
  if (goals.length === 0) {
    return (
      <EmptyState
        title="No coping goals shared yet"
        message="Anonymous coping goals that participants choose to share will appear here."
      />
    );
  }
  return (
    <div className="dashboard-goals">
      {goals.map((g, i) => (
        <motion.blockquote
          key={i}
          initial={instant ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: instant ? 0 : 0.4,
            delay: instant ? 0 : Math.min(i * 0.03, 0.4),
          }}
          className="dashboard-goal"
        >
          <Sprout size={20} strokeWidth={1.4} aria-hidden="true" />
          <p>{g}</p>
          <span>ONE SMALL INTENTION</span>
        </motion.blockquote>
      ))}
    </div>
  );
}

function ShieldNotice() {
  return (
    <span className="dashboard-privacy">
      <LockKeyhole size={14} strokeWidth={1.5} aria-hidden="true" /> Anonymous
      by design.
    </span>
  );
}
