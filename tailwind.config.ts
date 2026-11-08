import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — mapped to CSS variables so dark mode / theming is centralized.
        primary: "rgb(var(--c-primary) / <alpha-value>)",
        "primary-soft": "rgb(var(--c-primary-soft) / <alpha-value>)",
        "on-primary": "rgb(var(--c-on-primary) / <alpha-value>)",
        secondary: "rgb(var(--c-secondary) / <alpha-value>)",
        accent: "rgb(var(--c-accent) / <alpha-value>)",
        "on-accent": "rgb(var(--c-on-accent) / <alpha-value>)",
        bg: "rgb(var(--c-bg) / <alpha-value>)",
        "bg-raised": "rgb(var(--c-bg-raised) / <alpha-value>)",
        fg: "rgb(var(--c-fg) / <alpha-value>)",
        card: "rgb(var(--c-card) / <alpha-value>)",
        "card-fg": "rgb(var(--c-card-fg) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        "muted-fg": "rgb(var(--c-muted-fg) / <alpha-value>)",
        border: "rgb(var(--c-border) / <alpha-value>)",
        destructive: "rgb(var(--c-destructive) / <alpha-value>)",
        "on-destructive": "rgb(var(--c-on-destructive) / <alpha-value>)",
        ring: "rgb(var(--c-ring) / <alpha-value>)",
      },
      fontFamily: {
        serif: ["var(--font-lora)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "22px",
        "3xl": "30px",
      },
      boxShadow: {
        // Soft "quiet depth" — multi-directional, low-contrast but on real surfaces.
        soft: "0 1px 2px rgb(50 63 42 / 0.03), 0 8px 24px -8px rgb(50 63 42 / 0.09)",
        "soft-lg":
          "0 2px 4px rgb(50 63 42 / 0.03), 0 24px 64px -20px rgb(50 63 42 / 0.16)",
        "soft-inset": "inset 1px 2px 5px rgb(50 63 42 / 0.04)",
        glow: "0 0 0 1px rgb(var(--c-ring) / 0.25), 0 8px 30px -6px rgb(var(--c-primary) / 0.35)",
      },
      transitionTimingFunction: {
        "soft-out": "cubic-bezier(0.22, 1, 0.36, 1)",
        "soft-in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
