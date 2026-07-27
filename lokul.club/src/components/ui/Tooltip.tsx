"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

interface TooltipProps {
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  children: React.ReactElement;
  delay?: number;
}

const sideClass = {
  top: "bottom-full mb-1.5 left-1/2 -translate-x-1/2",
  bottom: "top-full mt-1.5 left-1/2 -translate-x-1/2",
  left: "right-full mr-1.5 top-1/2 -translate-y-1/2",
  right: "left-full ml-1.5 top-1/2 -translate-y-1/2",
};

export function Tooltip({ content, side = "top", children, delay = 200 }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
  };

  return (
    <span className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {open ? (
        <span
          role="tooltip"
          className={cn(
            "absolute z-50 whitespace-nowrap rounded-[6px] bg-gray-900 px-2 py-1 text-xs text-white shadow-md pointer-events-none",
            sideClass[side]
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
