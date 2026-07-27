"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

type Tone = "info" | "success" | "warning" | "danger";

interface ToastItem {
  id: string;
  tone: Tone;
  title?: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (t: Omit<ToastItem, "id">) => void;
  success: (msg: string, description?: string) => void;
  error: (msg: string, description?: string) => void;
  warning: (msg: string, description?: string) => void;
  info: (msg: string, description?: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const iconMap = {
  info: <Info className="size-5" style={{ color: "var(--color-info)" }} />,
  success: <CheckCircle2 className="size-5" style={{ color: "var(--color-success)" }} />,
  warning: <AlertTriangle className="size-5" style={{ color: "var(--color-warning)" }} />,
  danger: <AlertCircle className="size-5" style={{ color: "var(--color-danger)" }} />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const remove = React.useCallback((id: string) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (t: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).slice(2);
      const item: ToastItem = { id, duration: 4000, ...t };
      setToasts((cur) => [...cur, item]);
      if (item.duration) setTimeout(() => remove(id), item.duration);
    },
    [remove]
  );

  const api: ToastContextValue = React.useMemo(
    () => ({
      toast,
      success: (msg, d) => toast({ tone: "success", title: msg, description: d }),
      error: (msg, d) => toast({ tone: "danger", title: msg, description: d }),
      warning: (msg, d) => toast({ tone: "warning", title: msg, description: d }),
      info: (msg, d) => toast({ tone: "info", title: msg, description: d }),
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted &&
        createPortal(
          <div className="fixed z-[100] top-4 right-4 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
            {toasts.map((t) => (
              <div
                key={t.id}
                role="status"
                className={cn(
                  "pointer-events-auto flex items-start gap-3 p-3 rounded-[6px] border bg-surface shadow-md animate-in slide-in-from-right"
                )}
              >
                <span className="mt-0.5 shrink-0">{iconMap[t.tone]}</span>
                <div className="flex-1 min-w-0">
                  {t.title ? <div className="text-sm font-semibold text-gray-900">{t.title}</div> : null}
                  {t.description ? <div className="text-xs text-gray-600 mt-0.5">{t.description}</div> : null}
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="text-gray-400 hover:text-gray-600 shrink-0"
                  aria-label="Dismiss"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}
