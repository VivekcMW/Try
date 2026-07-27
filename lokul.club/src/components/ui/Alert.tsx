"use client";
import * as React from "react";
import { cn } from "@/lib/cn";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

type Tone = "info" | "success" | "warning" | "danger";

interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: Tone;
  title?: React.ReactNode;
  onClose?: () => void;
  icon?: React.ReactNode;
}

const toneMap: Record<Tone, { bg: string; text: string; icon: React.ReactNode }> = {
  info: { bg: "var(--color-info-bg)", text: "var(--color-info)", icon: <Info className="size-5" /> },
  success: { bg: "var(--color-success-bg)", text: "var(--color-success)", icon: <CheckCircle2 className="size-5" /> },
  warning: { bg: "var(--color-warning-bg)", text: "var(--color-warning)", icon: <AlertTriangle className="size-5" /> },
  danger: { bg: "var(--color-danger-bg)", text: "var(--color-danger)", icon: <AlertCircle className="size-5" /> },
};

export function Alert({ tone = "info", title, icon, onClose, children, className, ...rest }: AlertProps) {
  const t = toneMap[tone];
  return (
    <div
      role="alert"
      className={cn("flex items-start gap-3 rounded-[6px] border p-3 text-sm", className)}
      style={{ background: t.bg, borderColor: `color-mix(in srgb, ${t.text} 25%, transparent)`, color: t.text }}
      {...rest}
    >
      <span className="mt-0.5 shrink-0">{icon ?? t.icon}</span>
      <div className="flex-1 min-w-0">
        {title ? <div className="font-semibold mb-0.5">{title}</div> : null}
        {children ? <div className="opacity-90">{children}</div> : null}
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="opacity-70 hover:opacity-100 shrink-0"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
