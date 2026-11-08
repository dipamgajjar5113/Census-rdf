"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Leaf,
  Moon,
  Sun,
  Home,
  LayoutDashboard,
} from "lucide-react";

export function SiteChrome() {
  const pathname = usePathname();
  const onDashboard = pathname?.startsWith("/dashboard");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("cc-theme");
    } catch {
      /* Storage is optional. */
    }
    const initial = stored === "dark" ? "dark" : "light";
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
      /* Storage is optional. */
    }
  };

  return (
    <header className="site-header">
      <Link
        href="/"
        className="site-brand"
        aria-label="Stress Management — home"
      >
        <span className="site-brand-icon">
          <Leaf size={23} strokeWidth={1.25} />
        </span>
        <span>
          Stress <em>Management</em>
          <small>THE COMMUNITY CHECK-IN</small>
        </span>
      </Link>
      <span className="header-note">
        <span /> Rooted in care. Here for you.
      </span>
      <nav className="header-actions" aria-label="Site navigation">
        <button
          type="button"
          onClick={toggle}
          className="theme-toggle"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? (
            <Moon size={17} strokeWidth={1.6} />
          ) : (
            <Sun size={17} strokeWidth={1.6} />
          )}
        </button>
        <Link
          href={onDashboard ? "/" : "/dashboard"}
          className="organizer-link"
          aria-label={
            onDashboard ? "Back to check-in" : "Open organizer dashboard"
          }
        >
          <span className="organizer-mobile-icon" aria-hidden="true">
            {onDashboard ? (
              <Home size={18} strokeWidth={1.6} />
            ) : (
              <LayoutDashboard size={18} strokeWidth={1.6} />
            )}
          </span>
          {onDashboard ? <Home size={15} /> : null}
          <span>{onDashboard ? "Check-in" : "For organizers"}</span>
          <ArrowUpRight size={15} strokeWidth={1.5} />
        </Link>
      </nav>
    </header>
  );
}
