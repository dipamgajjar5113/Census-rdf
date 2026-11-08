"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Pause, Play, Sparkles } from "lucide-react";
import {
  Component,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { LUMEN_PALETTE, LUMEN_PREVIEWS } from "@/lib/lumen-visuals";
import { useLumen } from "./LumenProvider";

const LumenCanvas = dynamic(
  () => import("./LumenCanvas").then((m) => m.LumenCanvas),
  { ssr: false },
);
const POKES = [
  "Oh, hello you.",
  "A little squish. A little joy.",
  "I'm right here.",
  "You bring out my glow.",
  "Stay a little. Breathe a little.",
];

class CanvasBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** One persistent canvas: a welcome sculpture that becomes a quiet companion. */
export function Lumen({
  compact = false,
  presentation,
}: {
  compact?: boolean;
  presentation?: "hero" | "companion";
}) {
  const lumen = useLumen();
  const {
    mood,
    expression,
    reaction,
    reactKey,
    pulse,
    speech,
    speechKey,
    stage,
    express,
    react,
    say,
  } = lumen;
  const docked = usePathname()?.startsWith("/dashboard") ?? false;
  const hero = presentation
    ? presentation === "hero"
    : !compact && !docked && stage === "welcome";
  const systemReduced = useReducedMotion() ?? false;
  const [paused, setPaused] = useState(false);
  const reduced = systemReduced || paused;
  const [webgl, setWebgl] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const wrapRef = useRef<HTMLElement>(null);
  const gaze = useRef({ x: 0, y: 0 });
  const depthX = useMotionValue(0);
  const depthY = useMotionValue(0);
  const backX = useSpring(depthX, { stiffness: 48, damping: 24 });
  const backY = useSpring(depthY, { stiffness: 48, damping: 24 });
  const frontX = useTransform(backX, (value) => value * -1.5);
  const frontY = useTransform(backY, (value) => value * -1.5);
  const poke = useRef(0);
  const palette = LUMEN_PALETTE[mood];

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
      setWebgl(Boolean(context));
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setWebgl(false);
    }
  }, []);

  useEffect(() => {
    let visible = true;
    const update = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    if (wrapRef.current) observer.observe(wrapRef.current);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    if (reduced || !active) {
      gaze.current = { x: 0, y: 0 };
      depthX.set(0);
      depthY.set(0);
      return;
    }
    let idle: ReturnType<typeof setTimeout>;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const box = wrapRef.current?.getBoundingClientRect();
      if (!box) return;
      gaze.current.x = Math.max(
        -1,
        Math.min(
          1,
          (event.clientX - box.left - box.width / 2) /
            (window.innerWidth * 0.45),
        ),
      );
      gaze.current.y = Math.max(
        -1,
        Math.min(
          1,
          (event.clientY - box.top - box.height / 2) /
            (window.innerHeight * 0.5),
        ),
      );
      depthX.set(gaze.current.x * -5);
      depthY.set(gaze.current.y * -4);
      clearTimeout(idle);
      idle = setTimeout(() => {
        gaze.current = { x: 0, y: 0 };
        depthX.set(0);
        depthY.set(0);
      }, 2200);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      clearTimeout(idle);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced, active, depthX, depthY]);

  const tap = () => {
    react("squeeze");
    say(POKES[poke.current++ % POKES.length], 3000);
  };

  return (
    <aside
      ref={wrapRef}
      aria-label="Lumen, your check-in companion"
      className={`lumen ${compact ? "lumen--compact" : docked ? "lumen--docked" : hero ? "lumen--hero" : "lumen--companion"}`}
      data-mood={mood}
      data-expression={expression}
      data-paused={reduced}
      data-ready={ready}
      style={
        {
          "--lumen-body": palette.body,
          "--lumen-shadow": palette.shadow,
          "--lumen-glow": palette.glow,
          "--lumen-blush": palette.blush,
        } as CSSProperties
      }
    >
      {hero && (
        <div className="lumen-eyebrow" aria-hidden="true">
          <span className="lumen-live-dot" /> A LITTLE COMPANY ALONG THE WAY
        </div>
      )}
      <div className="lumen-stage">
        <div className="lumen-aura" aria-hidden="true" />
        <motion.div
          className="lumen-wreath-plane"
          style={{ x: reduced ? 0 : backX, y: reduced ? 0 : backY }}
          aria-hidden="true"
        >
          <span className="lumen-wreath" />
        </motion.div>
        <svg
          className="lumen-orbits"
          viewBox="0 0 600 480"
          fill="none"
          aria-hidden="true"
        >
          <ellipse
            cx="300"
            cy="244"
            rx="230"
            ry="142"
            transform="rotate(-31 300 244)"
          />
          <ellipse
            cx="300"
            cy="244"
            rx="231"
            ry="150"
            transform="rotate(36 300 244)"
            strokeDasharray="2 8"
          />
          <path d="M98 180h12m-6-6v12M485 319h12m-6-6v12" />
          <circle cx="440" cy="94" r="3" />
          <circle cx="103" cy="334" r="2" />
        </svg>
        <span className="lumen-floor" aria-hidden="true" />
        <span className="lumen-contact-shadow" aria-hidden="true" />
        <motion.button
          type="button"
          className="lumen-touch"
          style={{ x: reduced ? 0 : frontX, y: reduced ? 0 : frontY }}
          onClick={tap}
          aria-label="Say hello to Lumen"
          title="Give Lumen a little squish"
        >
          <span
            className={`lumen-fallback ${ready ? "lumen-fallback--hidden" : ""}`}
            aria-hidden="true"
          >
            <span className="lumen-fallback-sprout" />
            <span className="lumen-fallback-eye lumen-fallback-eye--left" />
            <span className="lumen-fallback-eye lumen-fallback-eye--right" />
            <span className="lumen-fallback-cheek lumen-fallback-cheek--left" />
            <span className="lumen-fallback-cheek lumen-fallback-cheek--right" />
            <span className="lumen-fallback-mouth" />
          </span>
        </motion.button>
        {webgl && (
          <motion.div
            className="lumen-canvas"
            style={{ x: reduced ? 0 : frontX, y: reduced ? 0 : frontY }}
            aria-hidden="true"
          >
            <CanvasBoundary
              onError={() => {
                setWebgl(false);
                setReady(false);
              }}
            >
              <LumenCanvas
                mood={mood}
                expression={expression}
                reaction={reaction}
                reactKey={reactKey}
                pulse={pulse}
                gaze={gaze}
                reduced={reduced}
                active={active}
                hero={hero}
                onReady={() => setReady(true)}
                onLost={() => {
                  setReady(false);
                  setWebgl(false);
                }}
              />
            </CanvasBoundary>
          </motion.div>
        )}
        {hero && (
          <>
            <span className="lumen-name" aria-hidden="true">
              lumen<span>YOUR LITTLE COMPANION</span>
            </span>
            <span className="lumen-touch-note" aria-hidden="true">
              <Sparkles size={12} /> tap for a little hello
            </span>
            <button
              type="button"
              className="lumen-motion"
              onClick={() => setPaused(!paused)}
              disabled={systemReduced}
              aria-label={
                systemReduced
                  ? "Motion is reduced by your system setting"
                  : paused
                    ? "Play Lumen's motion"
                    : "Pause Lumen's motion"
              }
              aria-pressed={reduced}
            >
              {reduced ? <Play size={13} /> : <Pause size={13} />}
            </button>
          </>
        )}
      </div>
      {!compact && !docked && (
        <div
          className="lumen-speech-slot"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={speech ? speechKey : "rest"}
              initial={{ opacity: 0, y: reduced ? 0 : 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -4 }}
              transition={{ duration: reduced ? 0 : 0.22 }}
              className={`lumen-speech ${!speech ? "lumen-speech--rest" : ""}`}
            >
              {speech ||
                (hero
                  ? "A soft place for every feeling."
                  : "Here with you. One small step at a time.")}
            </motion.p>
          </AnimatePresence>
        </div>
      )}
      {hero && (
        <div className="lumen-mood-explorer">
          <p>Every feeling belongs here. Explore a little.</p>
          <div
            className="lumen-moods"
            role="group"
            aria-label="Explore Lumen's emotions"
          >
            {LUMEN_PREVIEWS.map((preview) => (
              <button
                key={preview.label}
                type="button"
                aria-pressed={
                  mood === preview.mood && expression === preview.expression
                }
                onClick={() =>
                  express({
                    mood: preview.mood,
                    expression: preview.expression,
                    reaction:
                      preview.expression === "tender" ? "soften" : "bloom",
                    say: preview.line,
                    sayMs: 3600,
                  })
                }
              >
                <span
                  style={{ background: LUMEN_PALETTE[preview.mood].body }}
                  aria-hidden="true"
                />
                {preview.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

export function DashboardLumen() {
  const pathname = usePathname();
  return pathname?.startsWith("/dashboard") ? <Lumen compact /> : null;
}
