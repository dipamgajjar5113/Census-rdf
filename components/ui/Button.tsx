"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "accent" | "ghost" | "soft" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary shadow-soft hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0",
  accent:
    "bg-accent text-on-accent shadow-soft hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0",
  soft: "bg-card text-card-fg shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 border border-border",
  ghost: "bg-transparent text-fg hover:bg-muted",
  danger: "bg-destructive text-on-destructive shadow-soft hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "min-h-[44px] px-4 py-2.5 text-sm rounded-full",
  md: "min-h-12 px-6 py-3 text-[0.95rem] rounded-full",
  lg: "min-h-14 px-7 py-4 text-base rounded-full",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      className,
      children,
      disabled,
      ...rest
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        "group relative inline-flex select-none items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-200 ease-soft-out",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-soft",
        "cursor-pointer",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading && (
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  ),
);

Button.displayName = "Button";
