"use client";
import * as React from "react";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
type Size = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const sizeMap: Record<Size, string> = {
  xs: "h-7 px-2.5 text-xs gap-1",
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

const variantMap: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-xs focus-visible:ring-brand-300",
  secondary:
    "bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200 focus-visible:ring-brand-200",
  outline:
    "border border-border bg-surface text-gray-700 hover:bg-surface-muted hover:text-gray-900 focus-visible:ring-brand-200",
  ghost:
    "text-gray-700 hover:bg-surface-muted hover:text-gray-900 focus-visible:ring-brand-200",
  destructive:
    "text-white hover:opacity-90 focus-visible:ring-rose-300 shadow-xs",
  link:
    "text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline px-0 h-auto",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading,
      leftIcon,
      rightIcon,
      fullWidth,
      className,
      children,
      disabled,
      style,
      ...rest
    },
    ref
  ) {
    const isDestructive = variant === "destructive";
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-[6px] font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
          "disabled:opacity-50 disabled:pointer-events-none",
          sizeMap[size],
          variantMap[variant],
          fullWidth && "w-full",
          className
        )}
        style={{
          ...(isDestructive ? { background: "var(--color-danger)" } : null),
          ...style,
        }}
        {...rest}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);
