"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Moon, Sun, Home } from "lucide-react";

/** Minimal top-corner chrome: theme toggle + context link. Avoids the center where Lumen lives. */
export function SiteChrome() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (() => {
      try {
        return localStorage.getItem("cc-theme") as "light" | "dark" | null;
      } catch {
        return null;
      }
    })();
    const initial =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("cc-theme", next);
    } catch {
      /* ignore */
    }
  };

  const onDashboard = pathname?.startsWith("/dashboard");

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-4 sm:px-6">
      <div className="pointer-events-auto">
        <span className="font-serif text-sm font-semibold tracking-tight text-fg/80">
          Community<span className="text-primary"> Census</span>
        </span>
      </div>
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          onClick={toggle}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          className="grid h-10 w-10 place-items-center rounded-full bg-card/80 text-fg shadow-soft backdrop-blur transition hover:scale-105"
        >
          {theme === "light" ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}
        </button>
        <Link
          href={onDashboard ? "/" : "/dashboard"}
          aria-label={onDashboard ? "Back to check-in" : "Open organizer dashboard"}
          className="grid h-10 w-10 place-items-center rounded-full bg-card/80 text-fg shadow-soft backdrop-blur transition hover:scale-105"
        >
          {onDashboard ? <Home size={17} aria-hidden="true" /> : <BarChart3 size={17} aria-hidden="true" />}
        </Link>
      </div>
    </header>
  );
}
