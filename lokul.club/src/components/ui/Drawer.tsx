"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right" | "bottom";
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: string; // for left/right
}

export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  children,
  footer,
  width = "420px",
}: DrawerProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!mounted || !open) return null;

  const panelStyle: React.CSSProperties =
    side === "bottom" ? { maxHeight: "85vh" } : { width };

  const panelClass =
    side === "left"
      ? "left-0 top-0 h-full"
      : side === "right"
      ? "right-0 top-0 h-full"
      : "left-0 right-0 bottom-0 rounded-t-[6px]";

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className={cn("absolute bg-surface shadow-lg flex flex-col", panelClass)}
        style={panelStyle}
      >
        {title ? (
          <div className="flex items-center justify-between gap-3 p-4 border-b border-border">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
              <X className="size-5" />
            </button>
          </div>
        ) : null}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 p-3 border-t border-border bg-surface-muted">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
