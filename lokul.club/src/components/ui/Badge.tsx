import * as React from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "brand" | "accent" | "success" | "warning" | "danger" | "info";
type Variant = "soft" | "solid" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  variant?: Variant;
  size?: "sm" | "md";
}

const softMap: Record<Tone, string> = {
  neutral: "bg-gray-100 text-gray-700",
  brand: "bg-brand-50 text-brand-700",
  accent: "bg-accent-100 text-accent-700",
  success: "text-[var(--color-success)] bg-[var(--color-success-bg)]",
  warning: "text-[var(--color-warning)] bg-[var(--color-warning-bg)]",
  danger: "text-[var(--color-danger)] bg-[var(--color-danger-bg)]",
  info: "text-[var(--color-info)] bg-[var(--color-info-bg)]",
};

const solidMap: Record<Tone, string> = {
  neutral: "bg-gray-700 text-white",
  brand: "bg-brand-600 text-white",
  accent: "bg-accent-500 text-white",
  success: "text-white bg-[var(--color-success)]",
  warning: "text-white bg-[var(--color-warning)]",
  danger: "text-white bg-[var(--color-danger)]",
  info: "text-white bg-[var(--color-info)]",
};

const outlineMap: Record<Tone, string> = {
  neutral: "border-border text-gray-700",
  brand: "border-brand-300 text-brand-700",
  accent: "border-accent-300 text-accent-700",
  success: "text-[var(--color-success)] border-[var(--color-success)]/30",
  warning: "text-[var(--color-warning)] border-[var(--color-warning)]/30",
  danger: "text-[var(--color-danger)] border-[var(--color-danger)]/30",
  info: "text-[var(--color-info)] border-[var(--color-info)]/30",
};

export function Badge({
  tone = "neutral",
  variant = "soft",
  size = "sm",
  className,
  ...rest
}: BadgeProps) {
  const variantClass =
    variant === "solid" ? solidMap[tone] : variant === "outline" ? `border ${outlineMap[tone]}` : softMap[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[6px] font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        variantClass,
        className
      )}
      {...rest}
    />
  );
}
