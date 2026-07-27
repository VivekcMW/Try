"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ invalid, className, rows = 4, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "w-full rounded-[6px] border bg-surface px-3 py-2 text-sm text-gray-900 outline-none",
          "placeholder:text-gray-400 transition-colors resize-y",
          "focus:ring-2 focus:ring-brand-100 focus:border-brand-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          invalid
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
            : "border-border",
          className
        )}
        {...rest}
      />
    );
  }
);
